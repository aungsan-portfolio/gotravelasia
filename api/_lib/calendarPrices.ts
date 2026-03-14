// api/_lib/calendarPrices.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export async function handleCalendarPrices(
    req: VercelRequest,
    res: VercelResponse,
    params: Record<string, string>
): Promise<void> {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    if (!token) {
        res.status(500).json({ error: "API token not configured" });
        return;
    }

    const { origin, destination, month, currency = "thb" } = params;

    if (!origin || !destination || !month) {
        res.status(400).json({ error: "Missing required params: origin, destination, month" });
        return;
    }

    const cur = String(currency || "thb");
    const orig = String(origin);
    const dest = String(destination);
    const mo = String(month); // "YYYY-MM"

    // Calculate next month for second panel
    const [yr, mn] = mo.split("-").map(Number);
    const nextDate = new Date(yr, mn, 1); // month is 0-indexed, so mn is already next
    const nextMo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

    try {
        const [v3Mo1, v3Mo2, calendarData, matrixData] = await Promise.allSettled([
            fetch(
                `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
                    token, origin: orig, destination: dest,
                    departure_at: mo, sorting: "price", limit: "30",
                    one_way: "true", currency: cur,
                })}`,
                { signal: AbortSignal.timeout(8000) }
            ).then(r => r.ok ? r.json() : null),

            fetch(
                `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
                    token, origin: orig, destination: dest,
                    departure_at: nextMo, sorting: "price", limit: "30",
                    one_way: "true", currency: cur,
                })}`,
                { signal: AbortSignal.timeout(8000) }
            ).then(r => r.ok ? r.json() : null),

            fetch(
                `https://api.travelpayouts.com/v1/prices/calendar?${new URLSearchParams({
                    token, origin: orig, destination: dest, month: mo,
                    calendar_type: "departure_date", currency: cur,
                })}`,
                { signal: AbortSignal.timeout(8000) }
            ).then(r => r.ok ? r.json() : null),

            fetch(
                `https://api.travelpayouts.com/v2/prices/month-matrix?${new URLSearchParams({
                    token, origin: orig, destination: dest, month: mo, currency: cur,
                })}`,
                { signal: AbortSignal.timeout(8000) }
            ).then(r => r.ok ? r.json() : null),
        ]);

        const merged: Record<string, any> = {};

        function addPrice(dateStr: string, price: number, entry: any) {
            if (!dateStr || price <= 0) return;
            if (!merged[dateStr] || price < merged[dateStr].price) {
                merged[dateStr] = { ...entry, price };
            }
        }

        for (const v3Result of [v3Mo1, v3Mo2]) {
            const arr = v3Result.status === "fulfilled" && v3Result.value?.data;
            if (Array.isArray(arr)) {
                for (const e of arr) {
                    const dateStr = e.departure_at?.split("T")[0];
                    addPrice(dateStr, e.price || 0, {
                        origin: e.origin || orig,
                        destination: e.destination || dest,
                        airline: e.airline || "",
                        departure_at: e.departure_at,
                        return_at: e.return_at || "",
                        transfers: e.transfers ?? 0,
                        flight_number: e.flight_number || "",
                    });
                }
            }
        }

        const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
        if (cal && typeof cal === "object" && !Array.isArray(cal)) {
            for (const [dateStr, entry] of Object.entries(cal)) {
                const e = entry as any;
                addPrice(dateStr, e.price || 0, e);
            }
        }

        const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
        if (Array.isArray(matrix)) {
            for (const e of matrix) {
                addPrice(e.depart_date, e.value || e.price || 0, {
                    origin: e.origin || orig,
                    destination: e.destination || dest,
                    price: e.value || e.price || 0,
                    airline: e.airline || e.gate || "",
                    departure_at: e.departure_at || `${e.depart_date}T00:00:00`,
                    return_at: e.return_date ? `${e.return_date}T00:00:00` : "",
                    transfers: e.number_of_changes ?? 0,
                });
            }
        }

        res.status(200).json({
            success: true,
            data: merged,
            currency: cur,
        });
    } catch (error) {
        console.error("Calendar prices error:", error);
        res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
}
