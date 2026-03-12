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

  const record = resolveDestinationRecord(destinationRaw, deps);

  if (record) {
    const next = new URLSearchParams();

    if (origin) next.set("origin", origin);
    if (record.dest.code) next.set("destination", record.dest.code);
    if (clean(input.depart)) next.set("depart", clean(input.depart));
    if (clean(input.returnAt)) next.set("return", clean(input.returnAt));
    if (clean(input.tripType)) next.set("tripType", clean(input.tripType));
    if (clean(input.adults)) next.set("adults", clean(input.adults));
    if (clean(input.children)) next.set("children", clean(input.children));
    if (clean(input.cabin)) next.set("cabin", clean(input.cabin));

    const query = next.toString();
    return `/flights/to/${record.slug}${query ? `?${query}` : ""}`;
  }

  if (origin && destinationCode) {
    const slug = `${origin.toLowerCase()}-${destinationCode.toLowerCase()}`;
    const next = new URLSearchParams();
    next.set("origin", origin);
    next.set("destination", destinationCode);
    if (clean(input.depart)) next.set("depart", clean(input.depart));
    if (clean(input.returnAt)) next.set("return", clean(input.returnAt));
    if (clean(input.tripType)) next.set("tripType", clean(input.tripType));
    
    return `/flights/to/${slug}?${next.toString()}`;
  }

  return "/";
}
