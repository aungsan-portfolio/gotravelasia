// api/_lib/cheapPrices.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

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

export async function handleCheapPrices(
    req: VercelRequest,
    res: VercelResponse,
    params: Record<string, string>
): Promise<void> {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    if (!token) {
        res.status(500).json({ error: "API token not configured" });
        return;
    }

    const origin = String(params.origin || "RGN");
    const currency = String(params.currency || "thb");
    const cacheKey = `cheap-${origin}-${currency}`;

    const cached = getCached(cacheKey);
    if (cached) {
        res.status(200).json(cached);
        return;
    }

    try {
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
            res.status(502).json({ error: "Upstream API error" });
            return;
        }

        const data = await response.json();
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
        res.status(200).json(result);
    } catch (error) {
        console.error("Cheap prices error:", error);
        res.status(500).json({ error: "Failed to fetch cheap prices" });
    }
}
