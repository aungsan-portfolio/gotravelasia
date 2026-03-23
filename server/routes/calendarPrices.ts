import { Router }  from "express";
import path        from "path";
import fs          from "fs";
import { rateLimit, calendarRateLimits } from "../middleware/rateLimit.js";
import { getCached, setCache }           from "../utils/cache.js";
import { fetchAmadeusCalendarPrices }    from "../_core/amadeus.js";

const router = Router();

function addPrice(
  merged: Record<string, any>, dateStr: string, price: number, entry: any,
  fromBot = false, fromAmadeus = false
): void {
  if (!dateStr || price <= 0) return;
  const current = merged[dateStr];
  if (!current) {
    merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: fromAmadeus };
    return;
  }
  if (fromAmadeus && !current.is_amadeus) {
    merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: fromAmadeus };
  } else if (fromAmadeus && current.is_amadeus && price < current.price) {
    merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: fromAmadeus };
  } else if (!fromAmadeus && !current.is_amadeus) {
    if (fromBot && !current.is_bot_data) {
      merged[dateStr] = { ...entry, price, is_bot_data: true, is_amadeus: false };
    } else if (fromBot === !!current.is_bot_data && price < current.price) {
      merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: false };
    }
  }
}

router.get("/", rateLimit(calendarRateLimits, 100, 15 * 60 * 1000, "Too many requests"),
  async (req, res) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) { res.status(500).json({ error: "API token not configured" }); return; }

      const { origin, destination, month, currency } = req.query;
      if (!origin || !destination || !month) {
        res.status(400).json({ error: "Missing required params: origin, destination, month" }); return;
      }

      const cur  = String(currency || "usd");
      const orig = String(origin);
      const dest = String(destination);
      const mo   = String(month);

      const cacheKey = `cal-${orig}-${dest}-${mo}-${cur}`;
      const cached   = getCached(cacheKey);
      if (cached) { res.set("Cache-Control", "public, max-age=3600"); res.json(cached); return; }

      const [yr, mn] = mo.split("-").map(Number);
      const nextDate = new Date(yr, mn, 1);
      const nextMo   = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

      const tp = (params: Record<string, string>, base: string) =>
        fetch(`${base}?${new URLSearchParams({ token, ...params })}`, { signal: AbortSignal.timeout(8000) })
          .then((r) => (r.ok ? r.json() : null));

      const [v3Mo1, v3Mo2, calendarData, matrixData, amadeusMo1, amadeusMo2] =
        await Promise.allSettled([
          tp({ origin: orig, destination: dest, departure_at: mo,     sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
          tp({ origin: orig, destination: dest, departure_at: nextMo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
          tp({ origin: orig, destination: dest, month: mo, calendar_type: "departure_date", currency: cur }, "https://api.travelpayouts.com/v1/prices/calendar"),
          tp({ origin: orig, destination: dest, month: mo, currency: cur }, "https://api.travelpayouts.com/v2/prices/month-matrix"),
          fetchAmadeusCalendarPrices(orig, dest, mo,     cur),
          fetchAmadeusCalendarPrices(orig, dest, nextMo, cur),
        ]);

      const merged: Record<string, any> = {};

      // Priority 1 — Amadeus
      for (const result of [amadeusMo1, amadeusMo2]) {
        const data = result.status === "fulfilled" ? result.value : null;
        if (data && typeof data === "object") {
          for (const [dateStr, entry] of Object.entries(data as Record<string, any>)) {
            addPrice(merged, dateStr, entry.price || 0, entry, false, true);
          }
        }
      }

      // Priority 2 — Bot JSON
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
                    airline: r.airline_code || r.airline || "",
                    departure_at: `${r.date}T00:00:00`,
                    transfers: r.transfers || 0,
                    flight_number: r.flight_num || "",
                  }, true);
                }
              }
            }
          }
        }
      } catch (err) { console.error("Bot JSON load error:", err); }

      // Priority 3 — Travelpayouts v3
      for (const result of [v3Mo1, v3Mo2]) {
        const arr = result.status === "fulfilled" && result.value?.data;
        if (Array.isArray(arr)) {
          for (const e of arr) {
            addPrice(merged, e.departure_at?.split("T")[0], e.price || 0, {
              origin: e.origin || orig, destination: e.destination || dest,
              airline: e.airline || "", departure_at: e.departure_at,
              return_at: e.return_at || "", transfers: e.transfers ?? 0,
              flight_number: e.flight_number || "",
            });
          }
        }
      }

      // Priority 4 — Calendar API
      const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
      if (cal && typeof cal === "object" && !Array.isArray(cal)) {
        for (const [dateStr, entry] of Object.entries(cal)) {
          const e = entry as any;
          addPrice(merged, dateStr, e.price || 0, e);
        }
      }

      // Priority 5 — Month Matrix
      const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
      if (Array.isArray(matrix)) {
        for (const e of matrix) {
          addPrice(merged, e.depart_date, e.value || e.price || 0, {
            origin: e.origin || orig, destination: e.destination || dest,
            price: e.value || e.price || 0, airline: e.airline || e.gate || "",
            departure_at: e.departure_at || `${e.depart_date}T00:00:00`,
            return_at: e.return_date ? `${e.return_date}T00:00:00` : "",
            transfers: e.number_of_changes ?? 0,
          });
        }
      }

      const result = { success: true, data: merged, currency: cur };
      setCache(cacheKey, result);
      res.set("Cache-Control", "public, max-age=3600");
      res.json(result);
    } catch (error) {
      console.error("Calendar prices error:", error);
      res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
  }
);

export default router;
