import type { VercelRequest, VercelResponse } from "@vercel/node";

type Entry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

// In-memory store
const hits = new Map<string, Entry>();

function getClientIp(req: VercelRequest): string {
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

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of hits.entries()) {
    if (value.resetAt <= now) {
      hits.delete(key);
    }
  }
}

export function rateLimitMiddleware(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const ip = getClientIp(req);
  const existing = hits.get(ip);

  if (!existing || existing.resetAt <= now) {
    hits.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
    res.setHeader("X-RateLimit-Remaining", String(MAX_REQUESTS - 1));
    return false;
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    );

    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
    res.setHeader("X-RateLimit-Remaining", "0");

    res.status(429).json({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
    });

    return true;
  }

  existing.count += 1;

  res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
  res.setHeader(
    "X-RateLimit-Remaining",
    String(Math.max(0, MAX_REQUESTS - existing.count))
  );

  return false;
}
