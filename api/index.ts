/**
 * api/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE Vercel Serverless Function entry point.
 * All /api/* traffic is rewritten here by vercel.json.
 *
 * Handlers live in api/_handlers/ (underscore prefix = Vercel ignores them).
 * Helper modules live in api/_lib/  (underscore prefix = also ignored).
 *
 * This keeps GoTravel at exactly 1 Serverless Function on the Hobby plan.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// ── Middleware ────────────────────────────────────────────────────────────────
import { rateLimitMiddleware } from "../server/middleware/rateLimit";
import { logRequest }          from "../server/middleware/logger";

// ── Route handlers (in _handlers/ — Vercel never counts them) ────────────────
import handleFlights            from "./_handlers/flights";
import handleAuth               from "./_handlers/auth";
import handleDestinationLanding from "./_handlers/destination-landing";
import handleGeo                from "./_handlers/geo";
import handleNewsletter         from "./_handlers/newsletter";
import handlePriceAlertsSub     from "./_handlers/priceAlertsSubscribe";
import handleCronCheckAlerts    from "./_handlers/cronCheckPriceAlerts";
import handleCronSendAlerts     from "./_handlers/cronSendAlerts";

// ── CORS helper (shared across all routes) ───────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://gotravel-asia.vercel.app",
  "https://gotravelasia.com",
  "https://www.gotravelasia.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

function setCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin ?? "";
  if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
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
    return true; // caller should stop
  }
  return false;
}

// ── Route table ──────────────────────────────────────────────────────────────
// Each entry maps a URL prefix to a handler function.
// The router matches the FIRST prefix that fits, so order matters
// (longer/more-specific prefixes first).
type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

const routes: Array<{ prefix: string; handler: Handler }> = [
  // Cron jobs (checked first so /api/cron/* resolves quickly)
  { prefix: "/api/cron/check-price-alerts", handler: handleCronCheckAlerts },
  { prefix: "/api/cron/send-alerts",        handler: handleCronSendAlerts  },

  // Feature routes
  { prefix: "/api/flights",              handler: handleFlights            },
  { prefix: "/api/auth",                 handler: handleAuth               },
  { prefix: "/api/destination-landing",  handler: handleDestinationLanding },
  { prefix: "/api/geo",                  handler: handleGeo                },
  { prefix: "/api/newsletter",           handler: handleNewsletter         },
  { prefix: "/api/price-alerts",         handler: handlePriceAlertsSub     },
];

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1) Log every request
  logRequest(req);

  // 2) CORS preflight — handle globally so individual handlers don't need to
  if (setCors(req, res)) return;

  // 3) Rate limiting — stop abusive clients early
  if (rateLimitMiddleware(req, res)) return;

  // 4) Route dispatching
  const url = req.url ?? "/";
  const pathname = url.split("?")[0]; // strip query string for matching

  for (const route of routes) {
    if (pathname.startsWith(route.prefix)) {
      try {
        return await route.handler(req, res);
      } catch (err) {
        console.error(`[api/index] Error in ${route.prefix}:`, err);
        if (!res.headersSent) {
          return res.status(500).json({
            error: "Internal server error",
            path: pathname,
          });
        }
        return;
      }
    }
  }

  // 5) No route matched → 404
  res.status(404).json({
    error: "Not Found",
    message: `No handler for ${pathname}`,
    availableRoutes: routes.map(r => r.prefix),
  });
}
