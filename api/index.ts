import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * api/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE Vercel Serverless Function entry point (Monolith).
 * All /api/* traffic is routed here.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Shared Utils ─────────────────────────────────────────────────────────────
import { rateLimitMiddleware } from "./_lib/rateLimit.js";
import { logRequest } from "./_lib/logger.js";

// ── Route handlers (Static imports ensure Vercel bundles them) ───────────────
import handleFlights from "./_handlers/flights.js";
import handleAuth from "./_handlers/auth.js";
import handleDestinationLanding from "./_handlers/destination-landing.js";
import handleGeo from "./_handlers/geo.js";
import handleNewsletter from "./_handlers/newsletter.js";
import handlePriceAlertsSub from "./_handlers/priceAlertsSubscribe.js";
import handleCronCheckAlerts from "./_handlers/cronCheckPriceAlerts.js";
import handleCronSendAlerts from "./_handlers/cronSendAlerts.js";

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
  // Health check
  { 
    prefix: "/api/ping", 
    handler: (req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }) 
  },

  // Cron
  { prefix: "/api/cron/check-price-alerts", handler: handleCronCheckAlerts },
  { prefix: "/api/cron/send-alerts", handler: handleCronSendAlerts },

  // Features
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
    // 1) Logging
    logRequest(req);

    // 2) CORS Preflight
    if (setCors(req, res)) {
      return;
    }

    // 3) Rate Limiting
    if (rateLimitMiddleware(req, res)) {
      return;
    }

    // 4) Route Dispatching
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
    console.error(`[api/index] Error handling ${pathname}:`, error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
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
