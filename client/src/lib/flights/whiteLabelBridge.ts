/**
 * Safely decodes URL query params used by Travelpayouts redirect URLs.
 */
export function safeParam(v: string | null, fallback = ""): string {
  return v ? decodeURIComponent(v) : fallback;
}

export function normalizeCode(v: string | null, fallback = ""): string {
  return safeParam(v, fallback).trim().toUpperCase();
}

export function safeIsoDate(v: string | null): string | null {
  const raw = safeParam(v).trim();
  if (!raw) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

/**
 * Parses Travelpayouts compact `flightSearch` shape: `{ORIGIN}{DDMM}{DEST}{DDMM}`.
 * The widget omits years, so we map parsed dates into the current year.
 */
export function parseFlightSearch(raw: string): {
  origin: string;
  destination: string;
  departDate: string | null;
  returnDate: string | null;
} {
  const EMPTY = { origin: "", destination: "", departDate: null, returnDate: null };
  if (!raw) return EMPTY;

  const segments = [...raw.matchAll(/([A-Z]{3})(\d{2})(\d{2})/g)];
  if (segments.length < 1) return EMPTY;

  const year = new Date().getFullYear();

  function toIso(dd: string, mm: string): string {
    const d = parseInt(dd, 10);
    const m = parseInt(mm, 10);
    if (d < 1 || d > 31 || m < 1 || m > 12) return "";
    return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const origin = segments[0][1];
  const departDate = toIso(segments[0][2], segments[0][3]);

  const destMatch = raw.match(/^[A-Z]{3}\d{4}([A-Z]{3})/);
  const destination = destMatch?.[1] ?? "";

  const returnDate = segments.length >= 2 ? toIso(segments[1][2], segments[1][3]) : null;

  return { origin, destination, departDate, returnDate };
}

/**
 * Builds TP widget init payload from explicit query params, then falls back to compact flightSearch.
 */
export function buildInitFromQuery(search: URLSearchParams): Record<string, unknown> {
  let origin = safeParam(search.get("origin"));
  let destination = safeParam(search.get("destination"));
  let departDate = safeParam(search.get("depart"));
  let returnDate = safeParam(search.get("return"));

  if (!origin || !destination) {
    const parsed = parseFlightSearch(safeParam(search.get("flightSearch")));
    if (!origin) origin = parsed.origin;
    if (!destination) destination = parsed.destination;
    if (!departDate) departDate = parsed.departDate ?? "";
    if (!returnDate) returnDate = parsed.returnDate ?? "";
  }

  const tripType = safeParam(search.get("tripType"), "roundtrip");
  const adults = Number(search.get("adults") || 1);
  const children = Number(search.get("children") || 0);
  const infants = Number(search.get("infants") || 0);

  const init: Record<string, unknown> = {};
  if (origin) init.origin = { iata: origin.toUpperCase(), name: origin.toUpperCase() };
  if (destination) {
    init.destination = { iata: destination.toUpperCase(), name: destination.toUpperCase() };
  }
  if (departDate) init.departDate = departDate;
  if (tripType === "one-way" || !returnDate) {
    init.oneWay = true;
  } else if (returnDate) {
    init.returnDate = returnDate;
  }
  init.passengers = {
    adults: adults > 0 ? adults : 1,
    children: children > 0 ? children : 0,
    infants: infants > 0 ? infants : 0,
  };
  return init;
}

/**
 * Weedle cards are considered rendered only after non-script content appears.
 */
export function hasRenderedWeedles(container: HTMLElement | null): boolean {
  if (!container) return false;
  const weedles = Array.from(container.querySelectorAll<HTMLElement>(".tpwl-widget-weedle"));
  if (!weedles.length) return false;

  return weedles.some(
    (w) =>
      Array.from(w.children).some(
        (c) => !(c instanceof HTMLScriptElement) && c.textContent?.trim() !== "",
      ) || w.querySelector("iframe,a,img,[class*='tpwl'],[data-tpwl-rendered='true']") !== null,
  );
}

export function buildFallbackUrl(origin: string, dest: string): string {
  return `/flights/results?${new URLSearchParams({ origin, destination: dest })}`;
}
