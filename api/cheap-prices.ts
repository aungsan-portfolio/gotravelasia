import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory cache for the serverless function (lives as long as the lambda is warm)
const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key: string) {
    const entry = cache.get(key);
    if (entry && entry.expiresAt > Date.now()) return entry.data;
    cache.delete(key);
    return null;
}

function setCache(key: string, data: any) {
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS just in case
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const token = process.env.TRAVELPAYOUTS_TOKEN;
        if (!token) {
            return res.status(500).json({ error: "API token not configured" });
        }

        const origin = String(req.query.origin || "RGN");
        const currency = String(req.query.currency || "usd");
        const cacheKey = `cheap-${origin}-${currency}`;

        const cached = getCached(cacheKey);
        if (cached) {
            res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
            return res.status(200).json(cached);
        }

        const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
            token,
            origin,
            currency,
            limit: "30",
            sorting: "price",
            market: "th",
            unique: "false"
        })}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error("Upstream API error:", response.status, await response.text());
            return res.status(502).json({ error: "Upstream API error" });
        }

        const data = await response.json();

        // The V3 API returns a flat array of deals.
        // We must map it back into the nested dictionary format the frontend `useMultiCheapDeals` expects:
        // { "DEST": { "0": { price, airline, departure_at, number_of_changes } } }
        const mappedData: Record<string, Record<string, any>> = {};

        if (data.success && Array.isArray(data.data)) {
            data.data.forEach((deal: any, index: number) => {
                const dest = deal.destination;
                if (!mappedData[dest]) {
                    mappedData[dest] = {};
                }
                mappedData[dest][String(index)] = {
                    price: deal.price,
                    airline: deal.airline,
                    departure_at: deal.departure_at,
                    number_of_changes: deal.transfers,
                    flight_number: deal.flight_number
                };
            });
        }

        const result = { success: true, data: mappedData, currency };

        setCache(cacheKey, result);

        res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
        return res.status(200).json(result);

    } catch (error) {
        console.error("Cheap prices error:", error);
        return res.status(500).json({ error: "Failed to fetch cheap prices" });
    }
}
