import { randomUUID } from "node:crypto";
import { Router } from "express";

const router = Router();

const ALLOWED_PROVIDERS = new Set([
  "agoda",
  "booking",
  "trip",
  "expedia",
  "klook",
]);

function getSingleQueryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function parseHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/**
 * Professional outbound redirector for hotel partners.
 * Generates a unique clickId for attribution and logs metadata for analytics.
 * Path: /hotels/out/:provider
 */
router.get("/hotels/out/:provider", (req, res) => {
  const provider = req.params.provider;

  if (!ALLOWED_PROVIDERS.has(provider)) {
    return res.status(404).send("Unknown hotel provider");
  }

  const rawTargetUrl = getSingleQueryValue(req.query.url);
  if (!rawTargetUrl) {
    return res.status(400).send("Invalid outbound URL");
  }

  const targetUrl = parseHttpUrl(rawTargetUrl);
  if (!targetUrl) {
    return res.status(400).send("Invalid outbound URL");
  }

  // Generate a unique identifier for this outbound click
  const clickId = randomUUID();

  // Append clickId to target URL if it's not already there (for attribution)
  if (!targetUrl.searchParams.has("clickId")) {
    targetUrl.searchParams.set("clickId", clickId);
  }

  console.info("[Hotels] outbound click", {
    clickId,
    provider,
    host: targetUrl.host,
    hotelId: getSingleQueryValue(req.query.hotelId),
    city: getSingleQueryValue(req.query.city),
    checkIn: getSingleQueryValue(req.query.checkIn),
    checkOut: getSingleQueryValue(req.query.checkOut),
    sort: getSingleQueryValue(req.query.sort),
    position: getSingleQueryValue(req.query.position),
    timestamp: new Date().toISOString(),
  });

  // Perform a temporary redirect
  return res.redirect(302, targetUrl.toString());
});

export default router;
