import Amadeus from "amadeus";

// Singleton Amadeus client — initialized lazily
let client: InstanceType<typeof Amadeus> | null = null;
let initFailed = false;

function getClient(): InstanceType<typeof Amadeus> | null {
    if (initFailed) return null;
    if (client) return client;

    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.warn("[Amadeus] Credentials not configured, skipping");
        initFailed = true;
        return null;
    }

    try {
        client = new Amadeus({
            clientId,
            clientSecret,
            hostname: process.env.AMADEUS_HOSTNAME || "test",
        });
        console.log("[Amadeus] Client initialized successfully");
        return client;
    } catch (err) {
        console.error("[Amadeus] Init failed:", err);
        initFailed = true;
        return null;
    }
}

// In-memory cache: key = "origin-dest-month" → { data, timestamp }
const cache = new Map<string, { data: Record<string, any>; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch cheapest flight prices for SAMPLE DATES in a month from Amadeus.
 * Uses only 3 queries per month (days 5, 15, 25) to stay fast,
 * then spreads results to nearby dates as estimates.
 *
 * Returns a map of date → { price, airline, ... } compatible with calendar-prices merge.
 * On any error, returns {} (graceful degradation).
 */
export async function fetchAmadeusCalendarPrices(
    origin: string,
    destination: string,
    month: string, // "YYYY-MM"
    currency: string = "USD"
): Promise<Record<string, any>> {
    const amadeus = getClient();
    if (!amadeus) return {};

    const cacheKey = `${origin}-${destination}-${month}-${currency}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        console.log(`[Amadeus] Cache hit: ${cacheKey}`);
        return cached.data;
    }

    try {
        const [year, mon] = month.split("-").map(Number);
        const daysInMonth = new Date(year, mon, 0).getDate();

        // Sample 3 dates per month: day 5, 15, 25 (or last day)
        const sampleDays = [5, 15, Math.min(25, daysInMonth)];
        const sampleDates = sampleDays
            .filter(d => d <= daysInMonth)
            .map(d => `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`);

        // Query all sample dates in parallel (only 3 calls!)
        const results = await Promise.allSettled(
            sampleDates.map(async (departureDate) => {
                try {
                    const response = await amadeus.shopping.flightOffersSearch.get({
                        originLocationCode: origin,
                        destinationLocationCode: destination,
                        departureDate,
                        adults: 1,
                        currencyCode: currency.toUpperCase(),
                        nonStop: false,
                        max: 3, // Get top 3 cheapest for better price range
                    });

                    if (response?.data?.length > 0) {
                        const offer = response.data[0]; // Cheapest
                        const price = parseFloat(offer.price?.total || "0");
                        const airline = offer.validatingAirlineCodes?.[0] || "";
                        const segments = offer.itineraries?.[0]?.segments || [];
                        const transfers = Math.max(0, segments.length - 1);

                        return {
                            date: departureDate,
                            price,
                            airline,
                            transfers,
                            currencyCode: offer.price?.currency || currency.toUpperCase(),
                        };
                    }
                    return null;
                } catch (err: any) {
                    // Don't log 400 errors (normal for unavailable dates)
                    if (err?.response?.statusCode !== 400) {
                        console.warn(`[Amadeus] ${departureDate}:`, err?.response?.result?.errors?.[0]?.detail || err.message);
                    }
                    return null;
                }
            })
        );

        // Collect successful sample prices
        const samplePrices: { date: string; price: number; airline: string; transfers: number }[] = [];
        for (const r of results) {
            if (r.status === "fulfilled" && r.value && r.value.price > 0) {
                samplePrices.push(r.value);
            }
        }

        if (samplePrices.length === 0) {
            console.log(`[Amadeus] No prices found for ${origin}→${destination} (${month})`);
            cache.set(cacheKey, { data: {}, ts: Date.now() });
            return {};
        }

        // Build result: real sample dates + interpolated nearby dates
        const result: Record<string, any> = {};
        const avgPrice = samplePrices.reduce((s, p) => s + p.price, 0) / samplePrices.length;

        // Add real sample dates
        for (const sp of samplePrices) {
            result[sp.date] = {
                price: sp.price,
                origin,
                destination,
                airline: sp.airline,
                departure_at: `${sp.date}T00:00:00`,
                transfers: sp.transfers,
                is_amadeus: true,
            };
        }

        // Interpolate: fill nearby dates (±3 days from each sample) with estimated prices
        for (const sp of samplePrices) {
            const spDate = new Date(sp.date + "T00:00:00");
            for (let offset = -3; offset <= 3; offset++) {
                if (offset === 0) continue; // Skip the sample date itself
                const nearby = new Date(spDate);
                nearby.setDate(nearby.getDate() + offset);

                // Only if still in the same month
                if (nearby.getMonth() + 1 !== mon || nearby.getFullYear() !== year) continue;

                const nearbyKey = `${year}-${String(mon).padStart(2, "0")}-${String(nearby.getDate()).padStart(2, "0")}`;
                if (result[nearbyKey]) continue; // Don't overwrite real data

                // Add slight price variation (±5%)
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

        const realCount = samplePrices.length;
        const totalCount = Object.keys(result).length;
        console.log(`[Amadeus] ${origin}→${destination} (${month}): ${realCount} real + ${totalCount - realCount} interpolated = ${totalCount} prices`);

        cache.set(cacheKey, { data: result, ts: Date.now() });
        return result;
    } catch (error: any) {
        console.error("[Amadeus] Fetch error:", error?.response?.result?.errors?.[0]?.detail || error.message);
        return {};
    }
}
