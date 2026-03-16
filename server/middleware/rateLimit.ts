import type { VercelRequest, VercelResponse } from "@vercel/node";

const WINDOW_MS  = 60_000;   // 1 minute window
const MAX_REQ    = 60;        // requests per window per IP

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(
  req: VercelRequest,
  res: VercelResponse,
): boolean {
  const ip  = (req.headers["x-forwarded-for"] as string ?? "unknown")
                .split(",")[0]?.trim();
  const now = Date.now();

  let record = store.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, record);
  }
  record.count++;

  res.setHeader("X-RateLimit-Limit",     MAX_REQ);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, MAX_REQ - record.count));
  res.setHeader("X-RateLimit-Reset",     Math.ceil(record.resetAt / 1000));

  if (record.count > MAX_REQ) {
    res.status(429).json({
      error:   "Too Many Requests",
      message: "Please slow down — you've exceeded 60 requests per minute.",
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    });
    return true; // signal: response already sent
  }
  return false;
}
