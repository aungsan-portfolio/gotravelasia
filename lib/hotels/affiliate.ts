import type { HotelOutboundLinks } from "../../shared/hotels/types";

const AGODA_SITE_ID = process.env.AGODA_SITE_ID?.replace(/,/g, "").trim() || "";
const TRIP_SITE_ID = process.env.TRIP_COM_SITE_ID || "";
const KLOOK_ID = process.env.KLOOK_PARTNER_ID || "";
const EXPEDIA_CODE = process.env.EXPEDIA_TP_CODE || "ZZxDEika";
const BOOKING_ADV = process.env.BOOKING_AWIN_ADV_ID || "5910";
const AWIN_TOKEN = process.env.AWIN_TOKEN || "";
const AWIN_PUB_ID = process.env.AWIN_PUBLISHER_ID || "";

// ─── Awin Configuration ────────────────────────────────────────────
const AWIN_TIMEOUT_MS = Number(process.env.AWIN_TIMEOUT_MS) || 5000;
const AWIN_MAX_RETRIES = Number(process.env.AWIN_MAX_RETRIES) || 2;
const AWIN_RETRY_BASE_MS = 300;
const AWIN_LINK_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Awin Link Cache ───────────────────────────────────────────────
interface AwinCacheEntry {
  url: string;
  expiresAt: number;
}

const awinLinkCache = new Map<string, AwinCacheEntry>();

function getAwinCachedLink(destinationUrl: string): string | null {
  const entry = awinLinkCache.get(destinationUrl);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    awinLinkCache.delete(destinationUrl);
    return null;
  }
  return entry.url;
}

function setAwinCachedLink(destinationUrl: string, generatedUrl: string): void {
  awinLinkCache.set(destinationUrl, {
    url: generatedUrl,
    expiresAt: Date.now() + AWIN_LINK_CACHE_TTL_MS,
  });

  // Prevent unbounded cache growth
  if (awinLinkCache.size > 500) {
    const oldest = awinLinkCache.keys().next().value;
    if (oldest) awinLinkCache.delete(oldest);
  }
}

// ─── Awin Error Logging ────────────────────────────────────────────
interface AwinErrorLogEntry {
  timestamp: string;
  attempt: number;
  maxRetries: number;
  destinationUrl: string;
  errorType: "timeout" | "http_error" | "network_error" | "parse_error";
  statusCode?: number;
  message: string;
}

function logAwinError(entry: AwinErrorLogEntry): void {
  console.error("[Awin]", JSON.stringify(entry));
}

// ─── Awin Local Fallback Link Builder ──────────────────────────────
/**
 * Builds a local Awin-compatible tracking URL without calling the API.
 * Uses the standard Awin redirect format:
 * https://www.awin1.com/cread.php?awinmid=ADV_ID&awinaffid=PUB_ID&ued=ENCODED_URL
 *
 * This is a reliable fallback when the Awin Link Builder API is unavailable.
 */
export function buildLocalAwinLink(destinationUrl: string): string {
  if (!AWIN_PUB_ID || !BOOKING_ADV) return destinationUrl;

  const params = new URLSearchParams({
    awinmid: BOOKING_ADV,
    awinaffid: AWIN_PUB_ID,
    ued: destinationUrl,
    platform: "dl",
  });

  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

// ─── Utility: Fetch with Timeout ───────────────────────────────────
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Utility: Sleep for Exponential Backoff ────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Provider URL Builders ─────────────────────────────────────────

export function agodaSearchUrl(cityId: number, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    city: String(cityId),
    checkIn,
    checkOut,
    rooms: String(rooms),
    adults: String(adults),
    cid: AGODA_SITE_ID,
  });
  return `https://www.agoda.com/search?${params.toString()}`;
}

export function agodaHotelUrl(hotelId: string, cityId: number, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    hotel_id: hotelId,
    city: String(cityId),
    checkIn,
    checkOut,
    adults: String(adults),
    rooms: String(rooms),
  });
  if (AGODA_SITE_ID) params.set("cid", AGODA_SITE_ID);
  return `https://www.agoda.com/search?${params.toString()}`;
}

export function bookingUrl(destinationName: string, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    ss: destinationName,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: String(rooms),
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function tripUrl(cityName: string, checkIn: string, checkOut: string, adults: number) {
  const destination = `https://www.trip.com/hotels/list?city=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adult=${adults}`;
  return TRIP_SITE_ID ? `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(destination)}` : destination;
}

export function klookUrl(cityName: string, checkIn: string, checkOut: string, adults: number) {
  const params = new URLSearchParams({
    city: cityName,
    checkin: checkIn,
    checkout: checkOut,
    adults: String(adults),
  });
  if (KLOOK_ID) params.set("aid", KLOOK_ID);
  return `https://www.klook.com/hotels/search/?${params.toString()}`;
}

export function expediaUrl(destinationName: string, checkIn: string, checkOut: string, adults: number) {
  const destination = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destinationName)}&startDate=${checkIn}&endDate=${checkOut}&adults=${adults}`;
  return `https://expedia.tpx.gr/${EXPEDIA_CODE}?url=${encodeURIComponent(destination)}`;
}

export function shouldIncludeExpediaLink(expediaCode: string) {
  const normalized = expediaCode.trim();
  if (!normalized) return false;
  if (/placeholder|your|replace|sample|example|todo/i.test(normalized)) return false;
  // Check for non-latin chars (like Burmese)
  if (/[\u1000-\u109f]/.test(normalized)) return false;
  return true;
}

// ─── Awin Deep Link (Improved) ─────────────────────────────────────

/**
 * Generates an Awin deep link for a given destination URL.
 *
 * Improvements over the original implementation:
 * - Request timeout (configurable, default 5s)
 * - Retry with exponential backoff (configurable, default 2 retries)
 * - In-memory link cache (1 hour TTL) to avoid redundant API calls
 * - Local fallback link builder when API is completely unavailable
 * - Structured error logging for observability
 */
export async function awinDeepLink(destinationUrl: string): Promise<string> {
  // If no credentials, use local fallback immediately
  if (!AWIN_TOKEN || !AWIN_PUB_ID) {
    return buildLocalAwinLink(destinationUrl);
  }

  // Check cache first
  const cached = getAwinCachedLink(destinationUrl);
  if (cached) return cached;

  const endpoint = `https://api.awin.com/publishers/${AWIN_PUB_ID}/linkbuilder/generate`;
  const body = JSON.stringify({
    advertiserId: parseInt(BOOKING_ADV, 10),
    destinationUrl,
  });

  let lastError: unknown;

  for (let attempt = 1; attempt <= AWIN_MAX_RETRIES + 1; attempt++) {
    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AWIN_TOKEN}`,
            "Content-Type": "application/json",
          },
          body,
        },
        AWIN_TIMEOUT_MS,
      );

      if (!response.ok) {
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          logAwinError({
            timestamp: new Date().toISOString(),
            attempt,
            maxRetries: AWIN_MAX_RETRIES,
            destinationUrl,
            errorType: "http_error",
            statusCode: response.status,
            message: `Non-retryable HTTP ${response.status}`,
          });
          break;
        }

        logAwinError({
          timestamp: new Date().toISOString(),
          attempt,
          maxRetries: AWIN_MAX_RETRIES,
          destinationUrl,
          errorType: "http_error",
          statusCode: response.status,
          message: `HTTP ${response.status} (will retry)`,
        });

        lastError = new Error(`HTTP ${response.status}`);

        if (attempt <= AWIN_MAX_RETRIES) {
          await sleep(AWIN_RETRY_BASE_MS * Math.pow(2, attempt - 1));
          continue;
        }
        break;
      }

      const payload = (await response.json()) as { url?: string };

      if (!payload.url) {
        logAwinError({
          timestamp: new Date().toISOString(),
          attempt,
          maxRetries: AWIN_MAX_RETRIES,
          destinationUrl,
          errorType: "parse_error",
          message: "Response missing 'url' field",
        });
        break;
      }

      // Cache the successful result
      setAwinCachedLink(destinationUrl, payload.url);
      return payload.url;
    } catch (error) {
      lastError = error;

      const isTimeout =
        error instanceof DOMException && error.name === "AbortError";
      const isAbortError =
        error instanceof Error && error.name === "AbortError";

      logAwinError({
        timestamp: new Date().toISOString(),
        attempt,
        maxRetries: AWIN_MAX_RETRIES,
        destinationUrl,
        errorType: isTimeout || isAbortError ? "timeout" : "network_error",
        message:
          error instanceof Error ? error.message : "Unknown fetch error",
      });

      if (attempt <= AWIN_MAX_RETRIES) {
        await sleep(AWIN_RETRY_BASE_MS * Math.pow(2, attempt - 1));
        continue;
      }
    }
  }

  // All retries exhausted — use local fallback
  const fallbackUrl = buildLocalAwinLink(destinationUrl);
  setAwinCachedLink(destinationUrl, fallbackUrl);
  return fallbackUrl;
}

// ─── Build Affiliate Links ─────────────────────────────────────────

export function buildAffiliateLinks(
  cityName: string,
  bookingName: string,
  cityId: number,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number
): HotelOutboundLinks {
  const links: HotelOutboundLinks = {
    agoda: agodaSearchUrl(cityId, checkIn, checkOut, adults, rooms),
    booking: bookingUrl(bookingName, checkIn, checkOut, adults, rooms),
    trip: tripUrl(cityName, checkIn, checkOut, adults),
    klook: klookUrl(cityName, checkIn, checkOut, adults),
  };

  if (shouldIncludeExpediaLink(EXPEDIA_CODE)) {
    links.expedia = expediaUrl(bookingName, checkIn, checkOut, adults);
  }

  return links;
}
