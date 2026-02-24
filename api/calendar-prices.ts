export default async function handler(req: any, res: any) {
    try {
        const token = process.env.TRAVELPAYOUTS_TOKEN;
        if (!token) {
            return res.status(500).json({ error: "API token not configured" });
        }

        const { origin, destination, month, currency } = req.query;
        if (!origin || !destination || !month) {
            return res.status(400).json({ error: "Missing required params: origin, destination, month" });
        }

        const cur = String(currency || "usd");
        const orig = String(origin);
        const dest = String(destination);
        const mo = String(month);

        // Fetch from multiple endpoints in parallel for maximum data coverage
        const [calendarData, matrixData, v3Data] = await Promise.allSettled([
            // 1) v1/prices/calendar - primary endpoint
            fetch(
                `https://api.travelpayouts.com/v1/prices/calendar?${new URLSearchParams({
                    token, origin: orig, destination: dest, month: mo,
                    calendar_type: "departure_date", currency: cur,
                })}`,
                { signal: AbortSignal.timeout(8000) }
            ).then(r => r.ok ? r.json() : null),

            // 2) v2/prices/month-matrix - returns data from different gates (Trip.com, etc.)
            fetch(
                `https://api.travelpayouts.com/v2/prices/month-matrix?${new URLSearchParams({
                    token, origin: orig, destination: dest, month: mo, currency: cur,
                })}`,
                { signal: AbortSignal.timeout(8000) }
            ).then(r => r.ok ? r.json() : null),

            // 3) aviasales/v3/prices_for_dates - newest API with additional coverage
            fetch(
                `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
                    token, origin: orig, destination: dest,
                    departure_at: mo, currency: cur, sorting: "price",
                })}`,
                { signal: AbortSignal.timeout(8000) }
            ).then(r => r.ok ? r.json() : null),
        ]);

        // Merge all results into a unified data map: { "YYYY-MM-DD": { price, origin, destination, ... } }
        const merged: Record<string, any> = {};

        // Process v1/calendar data (object keyed by date)
        const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
        if (cal && typeof cal === "object" && !Array.isArray(cal)) {
            for (const [dateStr, entry] of Object.entries(cal)) {
                const e = entry as any;
                if (e.price > 0) {
                    if (!merged[dateStr] || e.price < merged[dateStr].price) {
                        merged[dateStr] = { ...e };
                    }
                }
            }
        }

        // Process v2/month-matrix data (array of objects with depart_date)
        const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
        if (Array.isArray(matrix)) {
            for (const entry of matrix) {
                const dateStr = entry.depart_date;
                const price = entry.value || entry.price || 0;
                if (dateStr && price > 0) {
                    if (!merged[dateStr] || price < merged[dateStr].price) {
                        merged[dateStr] = {
                            origin: entry.origin || orig,
                            destination: entry.destination || dest,
                            price,
                            airline: entry.airline || entry.gate || "",
                            departure_at: entry.departure_at || `${dateStr}T00:00:00`,
                            return_at: entry.return_date ? `${entry.return_date}T00:00:00` : "",
                            transfers: entry.number_of_changes ?? 0,
                        };
                    }
                }
            }
        }

        // Process v3/prices_for_dates data (array of objects with departure_at)
        const v3 = v3Data.status === "fulfilled" && v3Data.value?.data;
        if (Array.isArray(v3)) {
            for (const entry of v3) {
                const dateStr = entry.departure_at?.split("T")[0];
                const price = entry.price || 0;
                if (dateStr && price > 0) {
                    if (!merged[dateStr] || price < merged[dateStr].price) {
                        merged[dateStr] = {
                            origin: entry.origin || orig,
                            destination: entry.destination || dest,
                            price,
                            airline: entry.airline || "",
                            departure_at: entry.departure_at || `${dateStr}T00:00:00`,
                            return_at: entry.return_at || "",
                            transfers: entry.transfers ?? 0,
                            flight_number: entry.flight_number || "",
                        };
                    }
                }
            }
        }

        res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
        return res.status(200).json({
            success: true,
            data: merged,
            currency: cur,
        });
    } catch (error) {
        console.error("Calendar prices error:", error);
        return res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
}
