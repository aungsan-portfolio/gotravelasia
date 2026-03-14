import type { CookieOptions } from "express";
import type { IncomingMessage } from "http";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: IncomingMessage): boolean {
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto.join(",")
    : forwardedProto;
  return proto.split(",").some((p: string) => p.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: IncomingMessage): CookieOptions {
  const rawHost =
    req.headers["x-forwarded-host"] ??
    req.headers["host"] ??
    "";
  const hostname = (Array.isArray(rawHost) ? rawHost[0] : rawHost)
    .split(":")[0]
    .trim();

  const shouldSetDomain =
    hostname.length > 0 &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname);

  const domain = shouldSetDomain
    ? hostname.startsWith(".")
      ? hostname
      : `.${hostname}`
    : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
    ...(domain ? { domain } : {}),
  };
}
