import type { VercelRequest, VercelResponse } from "@vercel/node";

// ── Middleware / shared utils ────────────────────────────────────────────────
import { rateLimitMiddleware } from "./_lib/rateLimit";
import { logRequest } from "./_lib/logger";

// ── Route handlers ───────────────────────────────────────────────────────────
import handleFlights from "./_handlers/flights";
import handleAuth from "./_handlers/auth";
import handleDestinationLanding from "./_handlers/destination-landing";
import handleGeo from "./_handlers/geo";
import handleNewsletter from "./_handlers/newsletter";
import handlePriceAlertsSub from "./_handlers/priceAlertsSubscribe";
import handleCronCheckAlerts from "./_handlers/cronCheckPriceAlerts";
import handleCronSendAlerts from "./_handlers/cronSendAlerts";

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://gotravel-asia.vercel.app",
  "https://gotravelasia.com",
  "https://www.gotravelasia.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin ?? "";

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}

// ── Types ────────────────────────────────────────────────────────────────────
type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

type Route = {
  prefix: string;
  handler: Handler;
};

// ── Route table ──────────────────────────────────────────────────────────────
const routes: Route[] = [
  // Cron first
  { prefix: "/api/cron/check-price-alerts", handler: handleCronCheckAlerts },
  { prefix: "/api/cron/send-alerts", handler: handleCronSendAlerts },

  // Feature routes
  { prefix: "/api/flights", handler: handleFlights },
  { prefix: "/api/auth", handler: handleAuth },
  { prefix: "/api/destination-landing", handler: handleDestinationLanding },
  { prefix: "/api/geo", handler: handleGeo },
  { prefix: "/api/newsletter", handler: handleNewsletter },
  { prefix: "/api/price-alerts", handler: handlePriceAlertsSub },
];

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startedAt = Date.now();
  const pathname = (req.url ?? "/").split("?")[0];

  try {
    // 1) log
    logRequest(req);

    // 2) CORS
    if (setCors(req, res)) {
      return;
    }

    // 3) rate limit
    if (rateLimitMiddleware(req, res)) {
      return;
    }

    // 4) route dispatch
    for (const route of routes) {
      if (pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)) {
        await route.handler(req, res);

        if (!res.headersSent) {
          res.status(204).end();
        }

        return;
      }
    }

    // 5) 404
    res.status(404).json({
      error: "Not Found",
      message: `No handler for ${pathname}`,
      availableRoutes: routes.map((r) => r.prefix),
    });
  } catch (error) {
    console.error("[api/index] Unhandled error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        path: pathname,
      });
    }
  } finally {
    const durationMs = Date.now() - startedAt;
    console.log(
      JSON.stringify({
        scope: "api.index",
        path: pathname,
        method: req.method,
        durationMs,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
