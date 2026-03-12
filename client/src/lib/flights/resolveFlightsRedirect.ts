// client/src/lib/flights/resolveFlightsRedirect.ts

export type RedirectLookupRecord = {
  slug: string;
  dest: {
    code: string;
  };
};

export type ResolveFlightsRedirectInput = {
  origin?: string | null;
  destination?: string | null;
  depart?: string | null;
  returnAt?: string | null;
  tripType?: string | null;
  adults?: string | null;
  children?: string | null;
  cabin?: string | null;
};

export type ResolveFlightsRedirectDeps = {
  findByCode: (code: string) => RedirectLookupRecord | undefined;
  findBySlug: (slug: string) => RedirectLookupRecord | undefined;
};

const DESTINATION_ALIASES: Record<string, string> = {
  "singapore city": "singapore",
  "singapore-city": "singapore",
  singaporecity: "singapore",
  sg: "singapore",
  "sin city": "singapore",
  sgn: "ho-chi-minh-city",
  "ho chi minh": "ho-chi-minh-city",
  "ho-chi-minh": "ho-chi-minh-city",
  "ho chi minh city": "ho-chi-minh-city",
  "ho-chi-minh-city": "ho-chi-minh-city",
  saigon: "ho-chi-minh-city",
  bkk: "bangkok",
  "bangkok city": "bangkok",
  "bangkok-city": "bangkok",
  cnx: "chiang-mai",
  "chiang mai": "chiang-mai",
  "chiang-mai-city": "chiang-mai",
  hkt: "phuket",
  "phuket island": "phuket",
  dmk: "bangkok",
};

function clean(value?: string | null): string {
  return (value ?? "").trim();
}

/**
 * Robust ISO date extraction - ensures we get just the YYYY-MM-DD part.
 * Handles cases where a full ISO string (with time) is passed from pickers.
 */
export function extractDateFromISO(isoString: string | null | undefined): string {
  const val = (isoString ?? "").trim();
  if (!val) return "";

  // Handle ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
  const datePart = val.split("T")[0];

  // Validate it looks like a date (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  // Fallback: try to parse and reformat
  try {
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch (e) {
    console.warn("Invalid ISO date:", val);
  }

  return "";
}

function normalizeSlugLike(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeAliasKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function buildSlugCandidates(value: string): string[] {
  const slugLike = normalizeSlugLike(value);
  const aliasKey = normalizeAliasKey(value);
  const compact = aliasKey.replace(/\s+/g, "");

  return Array.from(
    new Set([
      value.trim().toLowerCase(),
      slugLike,
      aliasKey,
      compact,
      DESTINATION_ALIASES[aliasKey],
      DESTINATION_ALIASES[slugLike],
      DESTINATION_ALIASES[compact],
    ].filter(Boolean) as string[])
  );
}

function resolveDestinationRecord(
  destinationRaw: string,
  deps: ResolveFlightsRedirectDeps
): RedirectLookupRecord | undefined {
  const destinationCode = clean(destinationRaw).toUpperCase();

  if (destinationCode) {
    const byCode = deps.findByCode(destinationCode);
    if (byCode) return byCode;
  }

  const candidates = buildSlugCandidates(destinationRaw);

  for (const candidate of candidates) {
    const record = deps.findBySlug(candidate);
    if (record) return record;
  }

  return undefined;
}

export function resolveFlightsRedirectPath(
  input: ResolveFlightsRedirectInput,
  deps: ResolveFlightsRedirectDeps
): string {
  const origin = clean(input.origin).toUpperCase();
  const destinationRaw = clean(input.destination);
  const destinationCode = destinationRaw.toUpperCase();

  const depart = extractDateFromISO(input.depart);
  const returnAt = extractDateFromISO(input.returnAt);

  const record = resolveDestinationRecord(destinationRaw, deps);

  const hasSearchIntent = Boolean(depart);

  // ── Search intent → Travelpayouts results page ────────────────
  if (hasSearchIntent && origin && destinationCode) {
    const search = new URLSearchParams();

    search.set("origin", origin);
    search.set("destination", destinationCode);

    if (depart) search.set("depart", depart);
    if (returnAt) search.set("return", returnAt);
    if (clean(input.tripType)) search.set("tripType", clean(input.tripType));
    if (clean(input.adults)) search.set("adults", clean(input.adults));
    if (clean(input.children)) search.set("children", clean(input.children));
    if (clean(input.cabin)) search.set("cabin", clean(input.cabin));

    // FlightResults page will parse this and build the actual
    // Travelpayouts white-label query.
    const wrapper = new URLSearchParams();
    wrapper.set("flightSearch", search.toString());

    return `/flights/results?${wrapper.toString()}`;
  }

  // ── Browse intent → Destination landing page ──────────────────
  if (record) {
    const next = new URLSearchParams();

    if (origin) next.set("origin", origin);
    if (record.dest.code) next.set("destination", record.dest.code);
    if (depart) next.set("depart", depart);
    if (returnAt) next.set("return", returnAt);
    if (clean(input.tripType)) next.set("tripType", clean(input.tripType));
    if (clean(input.adults)) next.set("adults", clean(input.adults));
    if (clean(input.children)) next.set("children", clean(input.children));
    if (clean(input.cabin)) next.set("cabin", clean(input.cabin));

    const query = next.toString();
    return `/flights/to/${record.slug}${query ? `?${query}` : ""}`;
  }

  if (origin && destinationCode) {
    return `/flights/${origin.toLowerCase()}/${destinationCode.toLowerCase()}`;
  }

  return "/";
}
