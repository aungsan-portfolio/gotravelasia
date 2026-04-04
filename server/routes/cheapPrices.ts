import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import { getCached, setCache } from "../utils/cache.js";
import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";
import { getLiveFxRate } from "../../shared/utils/liveFx.js";

const router = Router();

router.get("/", rateLimit("cheap", 60, 15 * 60 * 1000, "Too many requests"),
  async (req: any, res: any) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) { res.status(500).json({ error: "API token not configured" }); return; }

      const normalized = normalizeSearchParams(req.query);
      const origin   = normalized.origin || "RGN";
      const currency = String(req.query.currency || "thb");
      const cacheKey = `cheap-${origin}-${currency}`;
      
      const cached   = await getCached(cacheKey);
      if (cached) { res.set("Cache-Control", "public, max-age=1800"); res.json(cached); return; }

      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
          token,
          origin,
          currency,
          limit: "30",
          sorting: "price",
          market: "th",
          unique: "false"
      })}`;

      const fxPromise = getLiveFxRate(currency, "THB");
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const fx = await fxPromise;
      if (!response.ok) { res.status(502).json({ error: "Upstream API error" }); return; }

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

      const result = { success: true, data: mappedData, currency, fx };
      await setCache(cacheKey, result);
      res.set("Cache-Control", "public, max-age=1800");
      res.json(result);
    } catch (error) {
      console.error("Cheap prices error:", error);
      res.status(500).json({ error: "Failed to fetch cheap prices" });
    }
  }
);

export default router;
