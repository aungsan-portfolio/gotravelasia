import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * api/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE Vercel Serverless Function entry point (Monolith).
 * Uses dynamic imports for handlers to isolate module-level crashes 
 * and improve cold start performance by only loading requested code.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Shared Utils ─────────────────────────────────────────────────────────────
import { rateLimitMiddleware } from "./_lib/rateLimit.js";
import { logRequest } from "./_lib/logger.js";

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
  handler?: Handler;
  handlerPath?: string;
};

// ── Route table ──────────────────────────────────────────────────────────────
const routes: Route[] = [
  // Health check (no dynamic loading)
  { 
    prefix: "/api/ping", 
    handler: (req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }) 
  },

  // Cron
  { prefix: "/api/cron/check-price-alerts", handlerPath: "./_handlers/cronCheckPriceAlerts.js" },
  { prefix: "/api/cron/send-alerts", handlerPath: "./_handlers/cronSendAlerts.js" },

  // Features
  { prefix: "/api/flights", handlerPath: "./_handlers/flights.js" },
  { prefix: "/api/auth", handlerPath: "./_handlers/auth.js" },
  { prefix: "/api/destination-landing", handlerPath: "./_handlers/destination-landing.js" },
  { prefix: "/api/geo", handlerPath: "./_handlers/geo.js" },
  { prefix: "/api/newsletter", handlerPath: "./_handlers/newsletter.js" },
  { prefix: "/api/price-alerts", handlerPath: "./_handlers/priceAlertsSubscribe.js" },
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
        
        // Execute direct handler if exists
        if (route.handler) {
          await route.handler(req, res);
        } 
        // Or load handler dynamically
        else if (route.handlerPath) {
          const mod = await import(route.handlerPath);
          const handlerFn = mod.default || mod.handler;
          
          if (typeof handlerFn !== "function") {
            throw new Error(`Handler in ${route.handlerPath} is not a function`);
          }
          
          await handlerFn(req, res);
        }

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
      availableRoutes: ["/api/ping", ...routes.filter(r => r.prefix !== "/api/ping").map(r => r.prefix)],
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
