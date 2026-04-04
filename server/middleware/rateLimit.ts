import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getStore } from "../../shared/utils/store.js";

export function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Shared rate-limit middleware using IStore abstraction.
 * Soft-fails on store errors to ensure service availability.
 */
export function rateLimit(
  namespace: string,
  max: number,
  windowMs: number,
  msg: string
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = getClientIp(req);
      const key = `ratelimit:${namespace}:${ip}`;
      const store = getStore();

      const { count, resetAt } = await store.increment(key, windowMs);

      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - count)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

      if (count > max) {
        console.warn(`[RateLimit:Hit] ${key} - count: ${count}/${max}`);
        res.status(429).json({ error: msg, retryAfter: Math.ceil((resetAt - Date.now()) / 1000) });
        return;
      }

      next();
    } catch (err) {
      console.error("[RateLimit:Error] Fallback to allow:", err);
      next(); // Fail-soft policy
    }
  };
}
