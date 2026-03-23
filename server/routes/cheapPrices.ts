import { Router } from "express";
import { rateLimit, calendarRateLimits } from "../middleware/rateLimit.js";
import { getCached, setCache } from "../utils/cache.js";

const router = Router();

router.get("/", rateLimit(calendarRateLimits, 60, 15 * 60 * 1000, "Too many requests"),
  async (req, res) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) { res.status(500).json({ error: "API token not configured" }); return; }

      const origin   = String(req.query.origin   || "RGN");
      const currency = String(req.query.currency || "usd");
      const cacheKey = `cheap-${origin}-${currency}`;
      const cached   = getCached(cacheKey);
      if (cached) { res.set("Cache-Control", "public, max-age=1800"); res.json(cached); return; }

      const response = await fetch(
        `https://api.travelpayouts.com/v1/prices/cheap?${new URLSearchParams({ token, origin, currency, page: "1" })}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!response.ok) { res.status(502).json({ error: "Upstream API error" }); return; }

      const data   = await response.json();
      const result = { success: true, data: data.data || {}, currency };
      setCache(cacheKey, result);
      res.set("Cache-Control", "public, max-age=1800");
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cheap prices" });
    }
  }
);

export default router;
