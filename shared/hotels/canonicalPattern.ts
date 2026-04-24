import type { HotelSearchParams, HotelSort, HotelViewMode } from "./types.js";

type CanonicalParseResult = {
  destinationLabel?: string;
  placeId?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  rooms: number;
  view?: HotelViewMode;
  rawSort: string | null;
  extraQuery: Record<string, string>;
};

const SORT_TO_INTERNAL: Record<string, HotelSort> = {
  best_a: "best",
  rank_a: "rank",
  price_a: "price_asc",
  price_d: "price_desc",
  star_d: "stars_desc",
  review_a: "review_desc",
};

const INTERNAL_TO_SORT: Record<HotelSort, string> = {
  best: "best_a",
  rank: "rank_a",
  price_asc: "price_a",
  price_desc: "price_d",
  stars_desc: "star_d",
  review_desc: "review_a",
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function canonicalSortToInternalSort(token: string | null | undefined): HotelSort {
  if (!token) return "best";
  return SORT_TO_INTERNAL[token.toLowerCase()] ?? "best";
}

export function internalSortToCanonicalSort(sort: HotelSort): string {
  return INTERNAL_TO_SORT[sort] ?? "rank_a";
}

export function parseCanonicalHotelPath(input: string): CanonicalParseResult | null {
  try {
    const normalizedInput = (input ?? "").trim();
    if (!normalizedInput) return null;

    const parsedUrl = toUrl(normalizedInput);
    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);

    if (pathSegments.length < 5 || pathSegments[0] !== "hotels") {
      return null;
    }

    const [, destinationToken, checkIn, checkOut, partyToken] = pathSegments;

    if (!destinationToken || !isIsoDate(checkIn) || !isIsoDate(checkOut) || !partyToken) {
      return null;
    }

    const { destinationLabel, placeId } = parseDestinationToken(destinationToken);
    const { adults, rooms, view } = parsePartyToken(partyToken);

    const query = parsedUrl.searchParams;
    const rawSort = query.get("sort");
    const extraQuery: Record<string, string> = {};
    for (const [key, value] of query.entries()) {
      if (key === "sort") continue;
      extraQuery[key] = value;
    }

    return {
      destinationLabel,
      placeId,
      checkIn,
      checkOut,
      adults,
      rooms,
      view,
      rawSort,
      extraQuery,
    };
  } catch {
    return null;
  }
}

export function toInternalHotelParamsFromCanonical(
  input: string,
  citySlugFromLabel: (label: string, placeId?: string) => string | undefined,
): {
  params: Partial<HotelSearchParams> | null;
  meta: {
    destinationLabel?: string;
    placeId?: string;
    view?: HotelViewMode;
    rawSort?: string | null;
    extraQuery?: Record<string, string>;
  } | null;
} {
  const parsed = parseCanonicalHotelPath(input);
  if (!parsed || !parsed.destinationLabel || !parsed.checkIn || !parsed.checkOut || !parsed.adults) {
    return { params: null, meta: null };
  }

  const city = citySlugFromLabel(parsed.destinationLabel, parsed.placeId);
  if (!city) {
    return {
      params: null,
      meta: {
        destinationLabel: parsed.destinationLabel,
        placeId: parsed.placeId,
        view: parsed.view,
        rawSort: parsed.rawSort,
        extraQuery: parsed.extraQuery,
      },
    };
  }

  return {
    params: {
      city,
      checkIn: parsed.checkIn,
      checkOut: parsed.checkOut,
      adults: parsed.adults,
      rooms: parsed.rooms,
      sort: canonicalSortToInternalSort(parsed.rawSort),
      page: 1,
    },
    meta: {
      destinationLabel: parsed.destinationLabel,
      placeId: parsed.placeId,
      view: parsed.view,
      rawSort: parsed.rawSort,
      extraQuery: parsed.extraQuery,
    },
  };
}

export function buildCanonicalHotelPath(input: {
  destinationLabel: string;
  placeId?: string | number;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms?: number;
  view?: HotelViewMode;
  sort?: HotelSort;
  extraQuery?: Record<string, string | number | boolean | undefined>;
}): string {
  const destinationLabel = slugifyDestinationLabel(input.destinationLabel || "");
  const destinationToken = input.placeId != null && String(input.placeId).trim()
    ? `${destinationLabel}-pid${String(input.placeId).trim()}`
    : destinationLabel;

  const adults = Number.isFinite(input.adults) && input.adults > 0 ? Math.floor(input.adults) : 1;
  // Ensure we use the 'Xadults' format for compatibility with the parser
  const party = `${adults}adults;${input.view === "map" ? "map" : "list"}`;
  const path = `/hotels/${encodeURIComponent(destinationToken)}/${input.checkIn}/${input.checkOut}/${party}`;

  const query = new URLSearchParams();
  if (input.sort) {
    query.set("sort", internalSortToCanonicalSort(input.sort));
  }

  for (const [key, value] of Object.entries(input.extraQuery ?? {})) {
    if (value === undefined || key === "sort") continue;
    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function toUrl(input: string) {
  if (/^https?:\/\//i.test(input)) {
    return new URL(input);
  }
  if (input.startsWith("/")) {
    return new URL(input, "https://example.com");
  }
  return new URL(`/${input}`, "https://example.com");
}

function parseDestinationToken(token: string): { destinationLabel?: string; placeId?: string } {
  const decoded = decodeURIComponent(token);
  // Support both -p and -pid for place IDs
  const match = decoded.match(/^(.*)-pid?([^/]+)$/);
  if (!match) {
    return { destinationLabel: deslugifyLabel(decoded) };
  }

  return {
    destinationLabel: deslugifyLabel(match[1]),
    placeId: match[2],
  };
}

function parsePartyToken(token: string): { adults?: number; rooms: number; view?: HotelViewMode } {
  const segments = decodeURIComponent(token).toLowerCase().split(";");
  
  // Robustly find adults token (e.g. "2adults" or just "2")
  const adultsToken = segments.find(s => /\d+/.test(s) && (s.includes("adult") || !s.includes("room")));
  const adultsMatch = adultsToken?.match(/(\d+)/);
  const adults = adultsMatch ? Number.parseInt(adultsMatch[1], 10) : undefined;

  // Robustly find view mode
  const view = segments.includes("map") ? ("map" as const) : segments.includes("list") ? ("list" as const) : undefined;

  return {
    adults: typeof adults === 'number' && Number.isFinite(adults) && adults > 0 ? adults : undefined,
    rooms: 1,
    view,
  };
}

function slugifyDestinationLabel(label: string): string {
  const normalized = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "unknown";
}

function deslugifyLabel(label: string): string {
  return label.replace(/-/g, " ").trim();
}

function isIsoDate(value?: string): value is string {
  return !!value && ISO_DATE_RE.test(value);
}
