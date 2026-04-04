import fs from "fs";
import path from "path";
import { searchFlightOffers } from "./amadeusService.js";
import { addPrice, CalendarEntry } from "../../shared/flights/calendarLogic.js";
import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";
import { getLiveFxRate } from "../../shared/utils/liveFx.js";
import { getCached, setCache } from "./cache.js";

type BotRoute = {
    origin: string;
    destination: string;
    date: string;
    price: number;
    airline_code?: string;
    airline?: string;
    transfers?: number;
    flight_num?: string;
};

async function fetchAmadeusCalendarPrices(
    origin: string,
    destination: string,
    month: string,
    currency: string = "usd"
): Promise<Record<string, CalendarEntry>> {
    try {
        const [year, mon] = month.split("-").map(Number);
        const daysInMonth = new Date(year, mon, 0).getDate();
        const sampleDays = [5, 15, Math.min(25, daysInMonth)].filter((d) => d <= daysInMonth);

        const sampleResults = await Promise.allSettled(
            sampleDays.map(async (day) => {
                const departureDate = `${year}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const offers = await searchFlightOffers(origin, destination, departureDate, {
                    currencyCode: currency.toUpperCase(),
                    max: 3,
                    nonStop: false,
                });

                const cheapest = offers?.[0];
                if (!cheapest) return null;

                const price = Number.parseFloat(cheapest.price?.total || "0");
                if (!Number.isFinite(price) || price <= 0) return null;

                const segments = cheapest.itineraries?.[0]?.segments || [];
                return {
                    date: departureDate,
                    price,
                    airline: cheapest.validatingAirlineCodes?.[0] || "",
                    transfers: Math.max(0, segments.length - 1),
                };
            })
        );

        const samplePrices = sampleResults
            .filter((r): r is PromiseFulfilledResult<{ date: string; price: number; airline: string; transfers: number } | null> => r.status === "fulfilled")
            .map((r) => r.value)
            .filter((v): v is { date: string; price: number; airline: string; transfers: number } => !!v && v.price > 0);

        if (!samplePrices.length) return {};

        const result: Record<string, CalendarEntry> = {};

        for (const sp of samplePrices) {
            result[sp.date] = {
                price: sp.price,
                origin,
                destination,
                airline: sp.airline,
                departure_at: `${sp.date}T00:00:00`,
                transfers: sp.transfers,
                is_amadeus: true,
                is_estimated_amadeus: false,
            };
        }

        for (const sp of samplePrices) {
            const spDate = new Date(`${sp.date}T00:00:00`);
            for (let offset = -3; offset <= 3; offset++) {
                if (offset === 0) continue;

                const nearby = new Date(spDate);
                nearby.setDate(nearby.getDate() + offset);
                if (nearby.getMonth() + 1 !== mon || nearby.getFullYear() !== year) continue;

                const nearbyKey = `${year}-${String(mon).padStart(2, "0")}-${String(nearby.getDate()).padStart(2, "0")}`;
                if (result[nearbyKey] && !result[nearbyKey].is_estimated_amadeus) continue;

                const variance = 1 + (Math.abs(offset) * 0.02) * (offset > 0 ? 1 : -1);
                result[nearbyKey] = {
                    price: Math.round(sp.price * variance * 100) / 100,
                    origin,
                    destination,
                    airline: sp.airline,
                    departure_at: `${nearbyKey}T00:00:00`,
                    transfers: sp.transfers,
                    is_amadeus: true,
                    is_estimated_amadeus: true,
                };
            }
        }

        return result;
    } catch {
        return {};
    }
}

function getBotJsonCandidatePaths(): string[] {
    const cwd = process.cwd();
    const maybeLambdaRoot = process.env.LAMBDA_TASK_ROOT || "/var/task";

    return [
        path.join(cwd, "client", "public", "data", "flight_data.json"),
        path.join(cwd, "public", "data", "flight_data.json"),
        path.join(maybeLambdaRoot, "client", "public", "data", "flight_data.json"),
        path.join(maybeLambdaRoot, "public", "data", "flight_data.json"),
    ];
}

async function loadBotRoutes(): Promise<BotRoute[]> {
    for (const p of getBotJsonCandidatePaths()) {
        if (!fs.existsSync(p)) continue;
        const json = JSON.parse(fs.readFileSync(p, "utf-8"));
        if (Array.isArray(json?.routes)) return json.routes as BotRoute[];
    }

    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        try {
            const response = await fetch(`https://${vercelUrl}/data/flight_data.json`, { signal: AbortSignal.timeout(3000) });
            if (response.ok) {
                const json = await response.json();
                if (Array.isArray(json?.routes)) return json.routes as BotRoute[];
            }
        } catch {
            // ignore remote fallback errors
        }
    }

    return [];
}

export async function handleCalendarPrices(
    req: any,
    res: any,
    params: Record<string, string>
): Promise<void> {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    if (!token) {
        res.status(500).json({ error: "API token not configured" });
        return;
    }

    const { month, currency = "usd" } = params;
    const normalized = normalizeSearchParams(params);

    const orig = normalized.origin;
    const dest = normalized.destination;
    const mo = String(month);
    const cur = String(currency || "usd");

    if (!orig || !dest || !mo) {
        res.status(400).json({ error: "Missing required params: origin, destination, month" });
        return;
    }

    const cacheKey = `cal-${orig}-${dest}-${mo}-${cur}`;
    const cached = await getCached(cacheKey);
    if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.status(200).json(cached);
        return;
    }

    const [yr, mn] = mo.split("-").map(Number);
    const nextDate = new Date(yr, mn, 1);
    const nextMo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

    const tp = (queryParams: Record<string, string>, base: string) =>
        fetch(`${base}?${new URLSearchParams({ token, ...queryParams })}`, { signal: AbortSignal.timeout(8000) })
            .then((r) => (r.ok ? r.json() : null));

    try {
        const [v3Mo1, v3Mo2, calendarData, matrixData, amadeusMo1, amadeusMo2, fxQuote] = await Promise.allSettled([
            tp({ origin: orig, destination: dest, departure_at: mo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
            tp({ origin: orig, destination: dest, departure_at: nextMo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
            tp({ origin: orig, destination: dest, month: mo, calendar_type: "departure_date", currency: cur }, "https://api.travelpayouts.com/v1/prices/calendar"),
            tp({ origin: orig, destination: dest, month: mo, currency: cur }, "https://api.travelpayouts.com/v2/prices/month-matrix"),
            fetchAmadeusCalendarPrices(orig, dest, mo, cur),
            fetchAmadeusCalendarPrices(orig, dest, nextMo, cur),
            getLiveFxRate(cur, "THB"),
        ]);

        const merged: Record<string, CalendarEntry> = {};

        // 1. Primary Priority: Travelpayouts V3
        for (const result of [v3Mo1, v3Mo2]) {
            const arr = result.status === "fulfilled" && result.value?.data;
            if (Array.isArray(arr)) {
                for (const e of arr) {
                    addPrice(merged, e.departure_at?.split("T")[0], e.price || 0, {
                        origin: e.origin || orig,
                        destination: e.destination || dest,
                        currency: cur,
                        airline: e.airline || "",
                        departure_at: e.departure_at,
                        return_at: e.return_at || "",
                        transfers: e.transfers ?? 0,
                        flight_number: e.flight_number || "",
                    }, "v3");
                }
            }
        }

        // 2. Secondary Priority: Bot Data
        const botRoutes = await loadBotRoutes();
        for (const r of botRoutes) {
            if (r.origin !== orig || r.destination !== dest) continue;
            const dateStr = r.date;
            if (dateStr && (dateStr.startsWith(mo) || dateStr.startsWith(nextMo))) {
                addPrice(merged, dateStr, r.price || 0, {
                    origin: r.origin,
                    destination: r.destination,
                    currency: cur,
                    airline: r.airline_code || r.airline || "",
                    departure_at: `${r.date}T00:00:00`,
                    transfers: r.transfers || 0,
                    flight_number: r.flight_num || "",
                }, "bot");
            }
        }

        // 3. Tertiary Priority: Legacy Travelpayouts (Calendar/Matrix)
        const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
        if (cal && typeof cal === "object" && !Array.isArray(cal)) {
            for (const [dateStr, entry] of Object.entries(cal)) {
                const e = entry as CalendarEntry;
                e.currency = cur;
                addPrice(merged, dateStr, e.price || 0, e, "legacy");
            }
        }

        const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
        if (Array.isArray(matrix)) {
            for (const e of matrix) {
                addPrice(merged, e.depart_date, e.value || e.price || 0, {
                    origin: e.origin || orig,
                    destination: e.destination || dest,
                    currency: cur,
                    airline: e.airline || e.gate || "",
                    departure_at: e.departure_at || `${e.depart_date}T00:00:00`,
                    return_at: e.return_date ? `${e.return_date}T00:00:00` : "",
                    transfers: e.number_of_changes ?? 0,
                }, "legacy");
            }
        }

        // 4. Quaternary Priority (Fallback): Amadeus
        for (const result of [amadeusMo1, amadeusMo2]) {
            const data = result.status === "fulfilled" ? result.value : null;
            if (data && typeof data === "object") {
                for (const [dateStr, entry] of Object.entries(data as Record<string, CalendarEntry>)) {
                    entry.currency = cur;
                    addPrice(merged, dateStr, entry.price || 0, entry, "amadeus");
                }
            }
        }

        const fx = fxQuote.status === "fulfilled" ? fxQuote.value : {
            baseCurrency: cur.toUpperCase(), quoteCurrency: "THB", rate: cur.toUpperCase() === "THB" ? 1 : 34, source: "fallback_static", asOf: null
        };

        const result = {
            success: true,
            data: merged,
            currency: cur,
            fx,
        };

        await setCache(cacheKey, result);
        res.status(200).json(result);
    } catch (error) {
        console.error("Calendar prices error:", error);
        res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
}
