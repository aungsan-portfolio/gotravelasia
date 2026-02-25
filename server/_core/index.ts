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

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const GEMINI_RATE_LIMIT_MAX_REQUESTS = 10;
const GEMINI_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const geminiRateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(req: express.Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.ip || "unknown";
}

function enforceGeminiRateLimit(req: express.Request, res: express.Response): boolean {
  const now = Date.now();
  const ip = getClientIp(req);
  const existingEntry = geminiRateLimitStore.get(ip);

  if (!existingEntry || now >= existingEntry.resetAt) {
    geminiRateLimitStore.set(ip, { count: 1, resetAt: now + GEMINI_RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existingEntry.count >= GEMINI_RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: "Rate limit exceeded. Please try again later.",
      limitation: "Per-process in-memory limiter; counts are not shared across multiple server instances.",
    });
    return false;
  }

  existingEntry.count += 1;
  geminiRateLimitStore.set(ip, existingEntry);
  return true;
}

const GENERAL_RATE_LIMIT_MAX_REQUESTS = 100;
const GENERAL_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const generalRateLimitStore = new Map<string, RateLimitEntry>();

function enforceGeneralRateLimit(req: express.Request, res: express.Response, endpointKey: string): boolean {
  const now = Date.now();
  const key = `${endpointKey}:${getClientIp(req)}`;
  const existingEntry = generalRateLimitStore.get(key);

  if (!existingEntry || now >= existingEntry.resetAt) {
    generalRateLimitStore.set(key, { count: 1, resetAt: now + GENERAL_RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existingEntry.count >= GENERAL_RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existingEntry.resetAt - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return false;
  }

  existingEntry.count += 1;
  generalRateLimitStore.set(key, existingEntry);
  return true;
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

  const handleGeminiProxy = async (req: express.Request, res: express.Response) => {
    try {
      if (!enforceGeminiRateLimit(req, res) || !enforceGeneralRateLimit(req, res, "gemini")) {
        return;
      }

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
              generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 },
            }),
          });

          if (response.status === 429) continue;
          if (!response.ok) continue;

          const data = await response.json();
          res.json(data);
          return;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError || new Error("All models failed");
    } catch (error) {
      console.error("Chat proxy error:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  };

  // Gemini Chat Proxy (POST only)
  app.post("/api/gemini", handleGeminiProxy);
  app.post("/api/chat", handleGeminiProxy);

  app.get("/api/calendar-prices", async (req, res) => {
    try {
      if (!enforceGeneralRateLimit(req, res, "calendar-prices")) {
        return;
      }
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

      res.set("Cache-Control", "public, max-age=3600");
      res.json({ success: true, data: merged, currency: cur });
    } catch (error) {
      console.error("Calendar prices error:", error);
      res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
  });


  app.get("/sitemap.xml", (_req, res) => {
    const baseUrl = process.env.VITE_SITE_URL || "https://www.gotravelasia.com";
    const routes = [
      "/", "/blog", "/contact", "/privacy", "/terms", "/flights/results",
      "/thailand/bangkok", "/thailand/chiang-mai", "/thailand/phuket", "/thailand/krabi", "/thailand/pai", "/thailand/chiang-rai",
    ];

    const urls = routes.map((route) => `<url><loc>${baseUrl}${route}</loc></url>`).join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xml);
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
