import { useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { getHotelCities } from "@shared/hotels/cities";
import { parseHotelSearchParams } from "@shared/hotels/searchParams";
import type { HotelSearchParams, HotelViewMode } from "@shared/hotels/types";

type HotelRouteMode = "canonical" | "legacy";

interface HotelRouteMeta {
  destinationLabel?: string;
  placeId?: string;
  view?: HotelViewMode;
  extraQuery?: Record<string, string>;
}

interface HotelRouteState {
  query: HotelSearchParams;
  routeMode: HotelRouteMode;
  routeMeta: HotelRouteMeta | null;
}

const KNOWN_QUERY_KEYS = new Set([
  "city",
  "cityName",
  "checkIn",
  "checkOut",
  "adults",
  "rooms",
  "page",
  "sort",
]);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Custom hook to manage hotel route state, supporting both
 * canonical path-based URLs and legacy query-string URLs.
 */
export function useHotelRouteState(): HotelRouteState {
  const [pathname] = useLocation();
  const searchString = useSearch();

  return useMemo(
    () => resolveHotelRouteState(pathname, searchString),
    [pathname, searchString]
  );
}

export function resolveHotelRouteState(
  pathname: string,
  searchString: string
): HotelRouteState {
  // 1. Prepare legacy fallback
  const legacyQuery = parseHotelSearchParams(searchString);

  // 2. Attempt to parse as canonical path
  const canonicalParts = parseCanonicalPath(pathname);
  if (!canonicalParts) {
    return {
      query: legacyQuery,
      routeMode: "legacy",
      routeMeta: null,
    };
  }

  try {
    const rawQueryParams = new URLSearchParams(searchString);
    const mergedParams = new URLSearchParams(rawQueryParams);

    // Resolve city slug from the canonical label/pid
    const city = resolveCitySlug(
      canonicalParts.destinationLabel,
      canonicalParts.placeId
    );

    mergedParams.set("city", city || canonicalParts.placeId || "");
    if (canonicalParts.destinationLabel) {
      mergedParams.set("cityName", canonicalParts.destinationLabel);
    }
    mergedParams.set("checkIn", canonicalParts.checkIn);
    mergedParams.set("checkOut", canonicalParts.checkOut);

    if (canonicalParts.adults != null) {
      mergedParams.set("adults", String(canonicalParts.adults));
    }
    if (canonicalParts.rooms != null) {
      mergedParams.set("rooms", String(canonicalParts.rooms));
    }

    // Extract extra query params (tracking, etc.)
    const extraQuery: Record<string, string> = {};
    for (const [key, value] of rawQueryParams.entries()) {
      if (!KNOWN_QUERY_KEYS.has(key)) {
        extraQuery[key] = value;
      }
    }

    return {
      query: parseHotelSearchParams(mergedParams),
      routeMode: "canonical",
      routeMeta: {
        destinationLabel: canonicalParts.destinationLabel,
        placeId: canonicalParts.placeId,
        view: canonicalParts.view,
        extraQuery: Object.keys(extraQuery).length ? extraQuery : undefined,
      },
    };
  } catch {
    return {
      query: legacyQuery,
      routeMode: "legacy",
      routeMeta: null,
    };
  }
}

/**
 * Parses the canonical /hotels/:destination/:checkIn/:checkOut/:party path.
 */
function parseCanonicalPath(pathname: string) {
  try {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length !== 5 || segments[0] !== "hotels") {
      return null;
    }

    const destinationSegment = decodeURIComponent(segments[1]);
    const checkIn = decodeURIComponent(segments[2]);
    const checkOut = decodeURIComponent(segments[3]);
    const partySegment = decodeURIComponent(segments[4]);

    if (!ISO_DATE_RE.test(checkIn) || !ISO_DATE_RE.test(checkOut)) {
      return null;
    }

    // Match destination and optional placeId (supports -p and -pid)
    const destinationMatch = destinationSegment.match(
      /^(.*?)(?:-pid?(\d+))?$/i
    );
    const destinationRaw = (destinationMatch?.[1] ?? destinationSegment).trim();
    const placeId = destinationMatch?.[2];

    const partyTokens = partySegment
      .split(";")
      .map(token => token.trim().toLowerCase());
    const adultsToken = partyTokens.find(
      token =>
        /\d+/.test(token) &&
        (token.includes("adult") || !token.includes("room"))
    );
    const roomsToken = partyTokens.find(token => /\d+room/.test(token));
    const viewToken = partyTokens.find(
      token => token === "map" || token === "list"
    );

    const adultsMatch = adultsToken?.match(/(\d+)/);
    const roomsMatch = roomsToken?.match(/(\d+)/);

    return {
      destinationLabel: destinationRaw || undefined,
      placeId,
      checkIn,
      checkOut,
      adults: adultsMatch ? Number.parseInt(adultsMatch[1], 10) : undefined,
      rooms: roomsMatch ? Number.parseInt(roomsMatch[1], 10) : undefined,
      view: (viewToken as HotelViewMode | undefined) ?? undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Fuzzy resolves a city slug from a destination label and optional place ID.
 */
function resolveCitySlug(
  destinationLabel: string | undefined,
  placeId?: string
) {
  if (!destinationLabel) return undefined;

  const cities = getHotelCities();

  // 1. Try by Place ID (Agoda match)
  if (placeId) {
    const numericId = Number.parseInt(placeId, 10);
    const match = cities.find(c => c.agodaCityId === numericId);
    if (match) return match.slug;
  }

  const normalize = (val: string) =>
    val
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const normalized = normalize(destinationLabel);
  if (!normalized) return undefined;

  // 2. Try by exact normalized name
  const byName = cities.find(c => normalize(c.name) === normalized);
  if (byName) return byName.slug;

  // 3. Try by booking name
  const byBooking = cities.find(c => normalize(c.bookingName) === normalized);
  if (byBooking) return byBooking.slug;

  // 4. Try leading part (e.g. "Bangkok, Thailand" -> "Bangkok")
  const leadingPart = destinationLabel.split(",")[0]?.trim();
  if (leadingPart) {
    const normalizedLeading = normalize(leadingPart);
    const byLeading = cities.find(c => normalize(c.name) === normalizedLeading);
    if (byLeading) return byLeading.slug;
  }

  // 5. Fallback slugification
  return normalized.replace(/\s+/g, "-");
}
