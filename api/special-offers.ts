import type { VercelRequest, VercelResponse } from '@vercel/node';

const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour for special offers

function parseRequest(req: VercelRequest) {
    const host = req.headers.host || "localhost:3000";
    const protocol = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
    const requestUrl = new URL(req.url || "/", `${protocol}://${host}`);
    return Object.fromEntries(requestUrl.searchParams.entries());
}

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

        const query = parseRequest(req);
        const origin = String(query.origin || req.query.origin || "RGN");
        const currency = String(query.currency || req.query.currency || "usd");
        const cacheKey = `special-offers-${origin}-${currency}`;

        const cached = cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            res.setHeader("Cache-Control", "public, s-maxage=3600");
            return res.status(200).json(cached.data);
        }

        const fetchOffers = async (orig: string) => {
            const url = `https://api.travelpayouts.com/aviasales/v3/get_special_offers?` + new URLSearchParams({
                token,
                origin: orig,
                currency,
                locale: "en"
            });
            const res = await fetch(url);
            if (!res.ok) return [];
            const data = await res.json();
            return data.data || [];
        };

        let offers = await fetchOffers(origin);

        // Fallback to nearby hubs if not enough special offers
        if (offers.length < 4) {
            const fallbacks = ["BKK", "KUL", "SIN", "DMK"];
            for (const fb of fallbacks) {
                if (fb === origin) continue;
                if (offers.length >= 4) break;

                const moreOffers = await fetchOffers(fb);
                // merge and deduplicate if necessary, though origin is different
                offers = [...offers, ...moreOffers];
            }
        }

        const result = { success: true, data: offers };

        cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL });

        res.setHeader("Cache-Control", "public, s-maxage=3600");
        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
}
