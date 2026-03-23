import type { Request, Response, NextFunction, RequestHandler } from "express";

type RateLimitWindow = { count: number; resetAt: number };

export const chatRateLimits     = new Map<string, RateLimitWindow>();
export const calendarRateLimits = new Map<string, RateLimitWindow>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function rateLimit(
  store: Map<string, RateLimitWindow>, max: number, windowMs: number, msg: string
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const now = Date.now();
    const existing = store.get(ip);
    if (!existing || existing.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return (next as any)();
    }
    if (existing.count >= max) {
      (res as any).status(429).json({ error: msg });
      return;
    }
    existing.count++;
    (next as any)();
  };
}
