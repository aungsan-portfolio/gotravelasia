import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStore } from "../../shared/utils/store.js";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function getClientIp(req: any): string {
  const xForwardedFor = req.headers["x-forwarded-for"];

  if (typeof xForwardedFor === "string" && xForwardedFor.length > 0) {
    return xForwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0].split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.length > 0) {
    return realIp.trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

/**
 * Shared rate-limit middleware for Vercel functions.
 * Uses SharedStore (Redis/KV) with in-memory fallback.
 */
export async function rateLimitMiddleware(
  req: any,
  res: any,
  namespace: string = "api"
): Promise<boolean> {
  try {
    const now = Date.now();
    const ip = getClientIp(req);
    const key = `ratelimit:${namespace}:${ip}`;
    const store = getStore();

    const { count, resetAt } = await store.increment(key, WINDOW_MS);

    res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, MAX_REQUESTS - count)));

    if (count > MAX_REQUESTS) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((resetAt - now) / 1000)
      );

      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
      });

      return true; // Blocked
    }

    return false; // Allowed
  } catch (err) {
    console.error("[RateLimit:Error] Fallback to allow:", err);
    return false; // Fail-soft policy
  }
}
