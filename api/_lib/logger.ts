import type { VercelRequest } from "@vercel/node";

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

function sanitizeHeaders(headers: VercelRequest["headers"]) {
  const redacted = { ...headers };

  if ("authorization" in redacted) {
    redacted.authorization = "[REDACTED]";
  }

  if ("cookie" in redacted) {
    redacted.cookie = "[REDACTED]";
  }

  return redacted;
}

export function logRequest(req: VercelRequest) {
  const pathname = (req.url ?? "/").split("?")[0];

  console.log(
    JSON.stringify({
      scope: "api.request",
      method: req.method,
      path: pathname,
      ip: getClientIp(req),
      userAgent: req.headers["user-agent"] ?? null,
      headers: sanitizeHeaders(req.headers),
      timestamp: new Date().toISOString(),
    })
  );
}
