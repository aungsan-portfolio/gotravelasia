import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  const forwardedProto = req.get("x-forwarded-proto");
  if (!forwardedProto) return false;

  return forwardedProto
    .split(",")
    .some((proto: string) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: Request): CookieOptions {
  const hostname =
    (req as any).hostname ||
    req.get("x-forwarded-host") ||
    req.get("host") ||
    "";

  const normalizedHost = hostname.split(":")[0];

  const shouldSetDomain =
    normalizedHost &&
    !LOCAL_HOSTS.has(normalizedHost) &&
    !isIpAddress(normalizedHost);

  const domain =
    shouldSetDomain && !normalizedHost.startsWith(".")
      ? `.${normalizedHost}`
      : shouldSetDomain
        ? normalizedHost
        : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
    ...(domain ? { domain } : {}),
  };
}
