import type { VercelRequest, VercelResponse } from '@vercel/node';

const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour for special offers

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const token = process.env.TRAVELPAYOUTS_TOKEN;
        if (!token) return res.status(500).json({ error: "Missing token" });

        const origin = String(req.query.origin || "RGN");
        const currency = String(req.query.currency || "usd");
        const cacheKey = `special-offers-${origin}-${currency}`;

        const cached = cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            res.setHeader("Cache-Control", "public, s-maxage=3600");
            return res.status(200).json(cached.data);
        }

        const url = `https://api.travelpayouts.com/aviasales/v3/get_special_offers?` + new URLSearchParams({
            token,
            origin,
            currency,
            locale: "en"
        });

        const response = await fetch(url);
        if (!response.ok) return res.status(502).json({ error: "Upstream error" });

        const data = await response.json();
        const result = { success: true, data: data.data || [] };

        cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL });

        res.setHeader("Cache-Control", "public, s-maxage=3600");
        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
}
