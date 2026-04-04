// api/_lib/specialOffers.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";

const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function handleSpecialOffers(
    req: any,
    res: any,
    params: Record<string, string>
): Promise<void> {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    if (!token) {
        res.status(500).json({ error: "Missing token" });
        return;
    }

    const normalized = normalizeSearchParams(params);
    const origin = normalized.origin || "RGN";
    const currency = String(params.currency || "thb");
    const cacheKey = `special-offers-${origin}-${currency}`;

    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        res.status(200).json(cached.data);
        return;
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

    try {
        let offers = await fetchOffers(origin);

        if (offers.length < 4) {
            const fallbacks = ["BKK", "KUL", "SIN", "DMK"];
            for (const fb of fallbacks) {
                if (fb === origin) continue;
                if (offers.length >= 4) break;
                const moreOffers = await fetchOffers(fb);
                offers = [...offers, ...moreOffers];
            }
        }

        const result = { success: true, data: offers };
        cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL });
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal error" });
    }
}
