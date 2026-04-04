import { Router }  from "express";
import path        from "path";
import fs          from "fs";
import { rateLimit } from "../middleware/rateLimit.js";
import { getCached, setCache }           from "../utils/cache.js";
import { fetchAmadeusCalendarPrices }    from "../_core/amadeus.js";

const router = Router();

import { addPrice, CalendarEntry } from "../../shared/flights/calendarLogic.js";
import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";
import { getLiveFxRate } from "../../shared/utils/liveFx.js";

router.get("/", rateLimit("calendar", 100, 15 * 60 * 1000, "Too many requests"),
  async (req: any, res: any) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) { res.status(500).json({ error: "API token not configured" }); return; }

      const { month, currency } = req.query;
      const normalized = normalizeSearchParams(req.query);
      
      const orig = normalized.origin;
      const dest = normalized.destination;
      const mo   = String(month);
      const cur  = String(currency || "usd");

      if (!orig || !dest || !mo) {
        res.status(400).json({ error: "Missing required params: origin, destination, month" }); return;
      }

      const cacheKey = `cal-${orig}-${dest}-${mo}-${cur}`;
      const cached   = await getCached(cacheKey);
      if (cached) { res.set("Cache-Control", "public, max-age=3600"); res.json(cached); return; }

      const [yr, mn] = mo.split("-").map(Number);
      const nextDate = new Date(yr, mn, 1);
      const nextMo   = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

      const tp = (params: Record<string, string>, base: string) =>
        fetch(`${base}?${new URLSearchParams({ token, ...params })}`, { signal: AbortSignal.timeout(8000) })
          .then((r) => (r.ok ? r.json() : null));

      const [v3Mo1, v3Mo2, calendarData, matrixData, amadeusMo1, amadeusMo2, fxQuote] =
        await Promise.allSettled([
          tp({ origin: orig, destination: dest, departure_at: mo,     sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
          tp({ origin: orig, destination: dest, departure_at: nextMo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
          tp({ origin: orig, destination: dest, month: mo, calendar_type: "departure_date", currency: cur }, "https://api.travelpayouts.com/v1/prices/calendar"),
          tp({ origin: orig, destination: dest, month: mo, currency: cur }, "https://api.travelpayouts.com/v2/prices/month-matrix"),
          fetchAmadeusCalendarPrices(orig, dest, mo,     cur),
          fetchAmadeusCalendarPrices(orig, dest, nextMo, cur),
          getLiveFxRate(cur, "THB"),
        ]);

      const merged: Record<string, CalendarEntry> = {};

      // 1. Primary Priority: Travelpayouts V3
      for (const result of [v3Mo1, v3Mo2]) {
        const arr = result.status === "fulfilled" && result.value?.data;
        if (Array.isArray(arr)) {
          for (const e of arr) {
            addPrice(merged, e.departure_at?.split("T")[0], e.price || 0, {
              origin: e.origin || orig, destination: e.destination || dest,
              currency: cur,
              airline: e.airline || "", departure_at: e.departure_at,
              return_at: e.return_at || "", transfers: e.transfers ?? 0,
              flight_number: e.flight_number || "",
            }, "v3");
          }
        }
      }

      // 2. Secondary Priority: Bot JSON
      try {
        const botPath = path.join(process.cwd(), "client", "public", "data", "flight_data.json");
        if (fs.existsSync(botPath)) {
          const botData = JSON.parse(fs.readFileSync(botPath, "utf-8"));
          if (Array.isArray(botData.routes)) {
            for (const r of botData.routes) {
              if (r.origin === orig && r.destination === dest) {
                const dateStr = r.date;
                if (dateStr && (dateStr.startsWith(mo) || dateStr.startsWith(nextMo))) {
                  addPrice(merged, dateStr, r.price || 0, {
                    origin: r.origin, destination: r.destination,
                    currency: cur,
                    airline: r.airline_code || r.airline || "",
                    departure_at: `${r.date}T00:00:00`,
                    transfers: r.transfers || 0,
                    flight_number: r.flight_num || "",
                  }, "bot");
                }
              }
            }
          }
        }
      } catch (err) { console.error("Bot JSON load error:", err); }

      // 3. Tertiary Priority: Legacy Travelpayouts (Calendar/Matrix)
      const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
      if (cal && typeof cal === "object" && !Array.isArray(cal)) {
        for (const [dateStr, entry] of Object.entries(cal)) {
          const e = entry as CalendarEntry;
          e.currency = cur;
          addPrice(merged, dateStr, e.price || 0, e, "legacy");
        }
      }

      const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
      if (Array.isArray(matrix)) {
        for (const e of matrix) {
          addPrice(merged, e.depart_date, e.value || e.price || 0, {
            origin: e.origin || orig, destination: e.destination || dest,
            currency: cur,
            airline: e.airline || e.gate || "",
            departure_at: e.departure_at || `${e.depart_date}T00:00:00`,
            return_at: e.return_date ? `${e.return_date}T00:00:00` : "",
            transfers: e.number_of_changes ?? 0,
          }, "legacy");
        }
      }

      // 4. Quaternary Priority (Fallback): Amadeus
      for (const result of [amadeusMo1, amadeusMo2]) {
        const data = result.status === "fulfilled" ? result.value : null;
        if (data && typeof data === "object") {
          for (const [dateStr, entry] of Object.entries(data as Record<string, CalendarEntry>)) {
            entry.currency = cur;
            addPrice(merged, dateStr, entry.price || 0, entry, "amadeus");
          }
        }
      }

      const fx = fxQuote.status === "fulfilled" ? fxQuote.value : {
        baseCurrency: cur.toUpperCase(), quoteCurrency: "THB", rate: cur.toUpperCase() === "THB" ? 1 : 34, source: "fallback_static", asOf: null
      };

      const result = { success: true, data: merged, currency: cur, fx };
      await setCache(cacheKey, result);
      res.set("Cache-Control", "public, max-age=3600");
      res.json(result);
    } catch (error) {
      console.error("Calendar prices error:", error);
      res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
  }
);

export default router;
