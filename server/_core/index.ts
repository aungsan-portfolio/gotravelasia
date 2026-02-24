import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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

  // Gemini Chat Proxy
  app.post("/api/chat", async (req, res) => {
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

  app.get("/api/calendar-prices", async (req, res) => {
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

      // Fetch from multiple endpoints in parallel for maximum data coverage
      const [calendarData, matrixData, v3Data] = await Promise.allSettled([
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

        fetch(
          `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
            token, origin: orig, destination: dest,
            departure_at: mo, currency: cur, sorting: "price",
          })}`,
          { signal: AbortSignal.timeout(8000) }
        ).then(r => r.ok ? r.json() : null),
      ]);

      // Merge all results: keep cheapest price per date
      const merged: Record<string, any> = {};

      const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
      if (cal && typeof cal === "object" && !Array.isArray(cal)) {
        for (const [dateStr, entry] of Object.entries(cal)) {
          const e = entry as any;
          if (e.price > 0) {
            if (!merged[dateStr] || e.price < merged[dateStr].price) {
              merged[dateStr] = { ...e };
            }
          }
        }
      }

      const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
      if (Array.isArray(matrix)) {
        for (const entry of matrix) {
          const dateStr = entry.depart_date;
          const price = entry.value || entry.price || 0;
          if (dateStr && price > 0) {
            if (!merged[dateStr] || price < merged[dateStr].price) {
              merged[dateStr] = {
                origin: entry.origin || orig, destination: entry.destination || dest,
                price, airline: entry.airline || entry.gate || "",
                departure_at: entry.departure_at || `${dateStr}T00:00:00`,
                return_at: entry.return_date ? `${entry.return_date}T00:00:00` : "",
                transfers: entry.number_of_changes ?? 0,
              };
            }
          }
        }
      }

      const v3 = v3Data.status === "fulfilled" && v3Data.value?.data;
      if (Array.isArray(v3)) {
        for (const entry of v3) {
          const dateStr = entry.departure_at?.split("T")[0];
          const price = entry.price || 0;
          if (dateStr && price > 0) {
            if (!merged[dateStr] || price < merged[dateStr].price) {
              merged[dateStr] = {
                origin: entry.origin || orig, destination: entry.destination || dest,
                price, airline: entry.airline || "",
                departure_at: entry.departure_at || `${dateStr}T00:00:00`,
                return_at: entry.return_at || "",
                transfers: entry.transfers ?? 0,
                flight_number: entry.flight_number || "",
              };
            }
          }
        }
      }

      res.set("Cache-Control", "public, max-age=3600");
      res.json({ success: true, data: merged, currency: cur });
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
