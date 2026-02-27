import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import fs from "fs";
import path from "path";
import { fetchAmadeusCalendarPrices } from "./amadeus";

// ─── Rate Limiting ───
type RateLimitWindow = { count: number; resetAt: number };
const chatRateLimits = new Map<string, RateLimitWindow>();
const calendarRateLimits = new Map<string, RateLimitWindow>();

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  return req.ip || req.socket.remoteAddress || "unknown";
}

function rateLimit(
  store: Map<string, RateLimitWindow>, max: number, windowMs: number, msg: string
): express.RequestHandler {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const existing = store.get(ip);
    if (!existing || existing.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (existing.count >= max) {
      res.status(429).json({ error: msg });
      return;
    }
    existing.count++;
    next();
  };
}

// ─── Sitemap ───
const SITE_URL = process.env.VITE_SITE_URL || "https://gotravel-asia.vercel.app";
const SITEMAP_ROUTES = [
  "/", "/flights/results", "/privacy-policy", "/terms-of-service",
  "/destination/bangkok", "/destination/chiang-mai", "/destination/phuket", "/destination/krabi",
];

function buildSitemapXml() {
  const now = new Date().toISOString();
  const urls = SITEMAP_ROUTES.map(r => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${now}</lastmod></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Sitemap for SEO
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(buildSitemapXml());
  });

  // Gemini Chat Proxy (rate limited: 10 req/hr per IP)
  app.post("/api/chat", rateLimit(chatRateLimits, 10, 60 * 60 * 1000, "Rate limit exceeded. Try again in one hour."), async (req, res) => {
    try {
      const { contents } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.status(500).json({ error: "Server misconfiguration: API key missing" });
        return;
      }

      if (!contents) {
        res.status(400).json({ error: "Missing contents" });
        return;
      }

      // Try flash first, then flash-lite (fallback logic can be here or simplified)
      // For now, simple implementation with one model, or keep the retry logic here if preferred.
      // Let's implement the loop here for robustness.
      const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

      let lastError = null;

      for (const model of MODELS) {
        try {
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024,
              },
            }),
          });

          if (response.status === 429) {
            console.log(`Rate limited on ${model}, trying next...`);
            continue;
          }

          if (!response.ok) {
            console.error(`Gemini ${model} error (${response.status}):`, await response.text());
            continue;
          }

          const data = await response.json();
          res.json(data);
          return; // Success
        } catch (err) {
          console.error(`Gemini ${model} exception:`, err);
          lastError = err;
        }
      }

      throw lastError || new Error("All models failed");

    } catch (error) {
      console.error("Chat proxy error:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  // ─── In-memory cache (Upgrade 2) ───
  const priceCache = new Map<string, { data: any; expiresAt: number }>();
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  function getCached(key: string) {
    const entry = priceCache.get(key);
    if (entry && entry.expiresAt > Date.now()) return entry.data;
    priceCache.delete(key);
    return null;
  }
  function setCache(key: string, data: any) {
    priceCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
  }

  // ─── Cheap Prices API (Upgrade 1) ───
  app.get("/api/cheap-prices", rateLimit(calendarRateLimits, 60, 15 * 60 * 1000, "Too many requests"), async (req, res) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) { res.status(500).json({ error: "API token not configured" }); return; }

      const origin = String(req.query.origin || "RGN");
      const currency = String(req.query.currency || "usd");
      const cacheKey = `cheap-${origin}-${currency}`;
      const cached = getCached(cacheKey);
      if (cached) { res.set("Cache-Control", "public, max-age=1800"); res.json(cached); return; }

      const response = await fetch(
        `https://api.travelpayouts.com/v1/prices/cheap?${new URLSearchParams({
          token, origin, currency, page: "1",
        })}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!response.ok) { res.status(502).json({ error: "Upstream API error" }); return; }
      const data = await response.json();
      const result = { success: true, data: data.data || {}, currency };
      setCache(cacheKey, result);
      res.set("Cache-Control", "public, max-age=1800");
      res.json(result);
    } catch (error) {
      console.error("Cheap prices error:", error);
      res.status(500).json({ error: "Failed to fetch cheap prices" });
    }
  });

  app.get("/api/calendar-prices", rateLimit(calendarRateLimits, 100, 15 * 60 * 1000, "Too many requests"), async (req, res) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) {
        res.status(500).json({ error: "API token not configured" });
        return;
      }

      const { origin, destination, month, currency } = req.query;
      if (!origin || !destination || !month) {
        res.status(400).json({ error: "Missing required params: origin, destination, month" });
        return;
      }

      const cur = String(currency || "usd");
      const orig = String(origin);
      const dest = String(destination);
      const mo = String(month);

      // Check cache first (Upgrade 2)
      const calCacheKey = `cal-${orig}-${dest}-${mo}-${cur}`;
      const calCached = getCached(calCacheKey);
      if (calCached) { res.set("Cache-Control", "public, max-age=3600"); res.json(calCached); return; }

      // Calculate next month for second panel
      const [yr, mn] = mo.split("-").map(Number);
      const nextDate = new Date(yr, mn, 1);
      const nextMo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

      // Fetch from 4 Travelpayouts endpoints + Amadeus in parallel for maximum coverage
      const [v3Mo1, v3Mo2, calendarData, matrixData, amadeusMo1, amadeusMo2] = await Promise.allSettled([
        fetch(
          `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
            token, origin: orig, destination: dest,
            departure_at: mo, sorting: "price", limit: "30",
            one_way: "true", currency: cur,
          })}`,
          { signal: AbortSignal.timeout(8000) }
        ).then(r => r.ok ? r.json() : null),

        fetch(
          `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
            token, origin: orig, destination: dest,
            departure_at: nextMo, sorting: "price", limit: "30",
            one_way: "true", currency: cur,
          })}`,
          { signal: AbortSignal.timeout(8000) }
        ).then(r => r.ok ? r.json() : null),

        fetch(
          `https://api.travelpayouts.com/v1/prices/calendar?${new URLSearchParams({
            token, origin: orig, destination: dest, month: mo,
            calendar_type: "departure_date", currency: cur,
          })}`,
          { signal: AbortSignal.timeout(8000) }
        ).then(r => r.ok ? r.json() : null),

        fetch(
          `https://api.travelpayouts.com/v2/prices/month-matrix?${new URLSearchParams({
            token, origin: orig, destination: dest, month: mo, currency: cur,
          })}`,
          { signal: AbortSignal.timeout(8000) }
        ).then(r => r.ok ? r.json() : null),

        // Amadeus: current month
        fetchAmadeusCalendarPrices(orig, dest, mo, cur),

        // Amadeus: next month
        fetchAmadeusCalendarPrices(orig, dest, nextMo, cur),
      ]);

      const merged: Record<string, any> = {};

      const addPrice = (dateStr: string, price: number, entry: any, fromBot: boolean = false, fromAmadeus: boolean = false) => {
        if (!dateStr || price <= 0) return;

        const current = merged[dateStr];
        if (!current) {
          merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: fromAmadeus };
        } else {
          // Priority: Amadeus > Bot > API (Travelpayouts)
          if (fromAmadeus && !current.is_amadeus) {
            // Amadeus always wins over non-Amadeus
            merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: fromAmadeus };
          } else if (fromAmadeus && current.is_amadeus && price < current.price) {
            // Both Amadeus: take cheaper
            merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: fromAmadeus };
          } else if (!fromAmadeus && !current.is_amadeus) {
            // Neither is Amadeus: use existing bot > API priority
            if (fromBot && !current.is_bot_data) {
              merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: false };
            } else if (fromBot === !!current.is_bot_data && price < current.price) {
              merged[dateStr] = { ...entry, price, is_bot_data: fromBot, is_amadeus: false };
            }
          }
        }
      }

      // 0. Inject Amadeus Data (Highest Priority)
      for (const amadeusResult of [amadeusMo1, amadeusMo2]) {
        const data = amadeusResult.status === "fulfilled" ? amadeusResult.value : null;
        if (data && typeof data === "object") {
          for (const [dateStr, entry] of Object.entries(data as Record<string, any>)) {
            addPrice(dateStr, entry.price || 0, entry, false, true);
          }
        }
      }

      // 1. Inject Bot Data (Secondary Source)
      try {
        const botDataPath = path.join(process.cwd(), "client", "public", "data", "flight_data.json");
        if (fs.existsSync(botDataPath)) {
          const raw = fs.readFileSync(botDataPath, "utf-8");
          const botData = JSON.parse(raw);
          if (botData.routes && Array.isArray(botData.routes)) {
            for (const r of botData.routes) {
              if (r.origin === orig && r.destination === dest) {
                const dateStr = r.date;
                // Only load if it's the requested month or next month
                if (dateStr && (dateStr.startsWith(mo) || dateStr.startsWith(nextMo))) {
                  addPrice(dateStr, r.price || 0, {
                    origin: r.origin,
                    destination: r.destination,
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
      } catch (err) {
        console.error("Error loading bot json data:", err);
      }

      for (const v3Result of [v3Mo1, v3Mo2]) {
        const arr = v3Result.status === "fulfilled" && v3Result.value?.data;
        if (Array.isArray(arr)) {
          for (const e of arr) {
            const dateStr = e.departure_at?.split("T")[0];
            addPrice(dateStr, e.price || 0, {
              origin: e.origin || orig, destination: e.destination || dest,
              airline: e.airline || "", departure_at: e.departure_at,
              return_at: e.return_at || "", transfers: e.transfers ?? 0,
              flight_number: e.flight_number || "",
            });
          }
        }
      }

      const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
      if (cal && typeof cal === "object" && !Array.isArray(cal)) {
        for (const [dateStr, entry] of Object.entries(cal)) {
          const e = entry as any;
          addPrice(dateStr, e.price || 0, e);
        }
      }

      const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
      if (Array.isArray(matrix)) {
        for (const e of matrix) {
          addPrice(e.depart_date, e.value || e.price || 0, {
            origin: e.origin || orig, destination: e.destination || dest,
            price: e.value || e.price || 0, airline: e.airline || e.gate || "",
            departure_at: e.departure_at || `${e.depart_date}T00:00:00`,
            return_at: e.return_date ? `${e.return_date}T00:00:00` : "",
            transfers: e.number_of_changes ?? 0,
          });
        }
      }

      const calResult = { success: true, data: merged, currency: cur };
      setCache(calCacheKey, calResult);
      res.set("Cache-Control", "public, max-age=3600");
      res.json(calResult);
    } catch (error) {
      console.error("Calendar prices error:", error);
      res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
