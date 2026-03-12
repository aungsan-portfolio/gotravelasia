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

function clean(value?: string | null): string {
  return (value ?? "").trim();
}

export function resolveFlightsRedirectPath(
  input: ResolveFlightsRedirectInput,
  deps: ResolveFlightsRedirectDeps
): string {
  const origin = clean(input.origin).toUpperCase();
  const destinationRaw = clean(input.destination);
  const destinationCode = destinationRaw.toUpperCase();

  const record =
    deps.findByCode(destinationCode) ||
    deps.findBySlug(destinationRaw.toLowerCase());

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
    return `/flights/${origin.toLowerCase()}/${destinationCode.toLowerCase()}`;
  }

  return "/";
}
