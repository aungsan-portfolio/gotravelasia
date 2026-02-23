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

        const params = new URLSearchParams({
            token,
            origin: String(origin),
            destination: String(destination),
            month: String(month),
            calendar_type: "departure_date",
            currency: String(currency || "usd"),
        });

        const apiUrl = `https://api.travelpayouts.com/v1/prices/calendar?${params.toString()}`;
        const response = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Travelpayouts calendar API error (${response.status}):`, text);
            return res.status(response.status).json({ error: "Upstream API error", status: response.status });
        }

        const data = await response.json();
        res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
        return res.status(200).json(data);
    } catch (error) {
        console.error("Calendar prices error:", error);
        return res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
}
