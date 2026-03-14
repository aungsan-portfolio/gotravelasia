// client/src/lib/api/travelpayoutsService.ts
// Travelpayouts Data API — targeted integration for GoTravel Asia
// Docs: https://travelpayouts.github.io/slate/

const BASE = "https://api.travelpayouts.com";

function getToken(): string {
  const token = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TRAVELPAYOUTS_API_TOKEN)
    ?? process.env.VITE_TRAVELPAYOUTS_API_TOKEN
    ?? process.env.TRAVELPAYOUTS_API_TOKEN
    ?? process.env.VITE_TRAVELPAYOUTS_TOKEN
    ?? process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) throw new Error("[Travelpayouts] Missing API token");
  return token;
}

function getMarker(): string {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TRAVELPAYOUTS_MARKER)
    ?? process.env.VITE_TRAVELPAYOUTS_MARKER
    ?? process.env.TRAVELPAYOUTS_MARKER
    ?? process.env.VITE_TRAVELPAYOUTS_MARKER
    ?? "gotravelasia";
}

async function tpFetch<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const url = new URL(path, BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      headers: { "X-Access-Token": getToken() },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.warn(`[Travelpayouts] ${path} → ${res.status}`);
      return null;
    }
    const json = await res.json();
    if (!json.success) {
      console.warn(`[Travelpayouts] ${path} → success=false`, json.error);
      return null;
    }
    return json.data as T;
  } catch (err) {
    console.error(`[Travelpayouts] ${path} fetch error:`, err);
    return null;
  }
}


// ── 1. Cheapest tickets (supports 0,1,2 stops) ─────────────────────
// Rate limit: 300 req/min
export interface TpCheapTicket {
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
}

export async function fetchCheapPrices(
  origin: string,
  destination: string,
  opts?: { departMonth?: string; currency?: string },
): Promise<Record<string, Record<string, TpCheapTicket>> | null> {
  const params: Record<string, string> = {
    origin,
    destination,
    currency: opts?.currency ?? "THB",
  };
  if (opts?.departMonth) params.depart_date = opts.departMonth;
  return tpFetch("/v1/prices/cheap", params);
}


// ── 2. Non-stop (direct) tickets ────────────────────────────────────
// Rate limit: 180 req/min
export async function fetchDirectPrices(
  origin: string,
  destination: string,
  opts?: { departMonth?: string; currency?: string },
): Promise<Record<string, Record<string, TpCheapTicket>> | null> {
  const params: Record<string, string> = {
    origin,
    destination,
    currency: opts?.currency ?? "THB",
  };
  if (opts?.departMonth) params.depart_date = opts.departMonth;
  return tpFetch("/v1/prices/direct", params);
}


// ── 3. Calendar — daily prices for a month ──────────────────────────
// Rate limit: 300 req/min
export interface TpCalendarEntry {
  origin: string;
  destination: string;
  price: number;
  transfers: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
}

export async function fetchCalendarPrices(
  origin: string,
  destination: string,
  departMonth: string, // "2026-04"
  opts?: { currency?: string },
): Promise<Record<string, TpCalendarEntry> | null> {
  return tpFetch("/v1/prices/calendar", {
    origin,
    destination,
    depart_date: departMonth,
    calendar_type: "departure_date",
    currency: opts?.currency ?? "THB",
  });
}


// ── 4. Monthly cheapest ─────────────────────────────────────────────
// Rate limit: 60 req/min — use sparingly
export interface TpMonthlyEntry {
  origin: string;
  destination: string;
  price: number;
  transfers: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
}

export async function fetchMonthlyPrices(
  origin: string,
  destination: string,
  opts?: { currency?: string },
): Promise<Record<string, TpMonthlyEntry> | null> {
  return tpFetch("/v1/prices/monthly", {
    origin,
    destination,
    currency: opts?.currency ?? "THB",
  });
}


// ── 5. Popular directions from a city ───────────────────────────────
// Rate limit: 600 req/min
export interface TpPopularDirection {
  origin: string;
  destination: string;
  price: number;
  transfers: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
}

export async function fetchPopularDirections(
  origin: string,
  opts?: { currency?: string },
): Promise<Record<string, TpPopularDirection> | null> {
  return tpFetch("/v1/city-directions", {
    origin,
    currency: opts?.currency ?? "THB",
  });
}


// ── 6. Latest prices (last 48h) ────────────────────────────────────
// Rate limit: 300 req/min
export interface TpLatestPrice {
  show_to_affiliates: boolean;
  trip_class: number;
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string;
  number_of_changes: number;
  value: number;
  found_at: string;
  distance: number;
  actual: boolean;
}

export async function fetchLatestPrices(
  origin: string,
  destination: string,
  opts?: { currency?: string; limit?: number; sorting?: "price" | "route" | "distance_unit_price" },
): Promise<TpLatestPrice[] | null> {
  return tpFetch("/v2/prices/latest", {
    origin,
    destination,
    currency: opts?.currency ?? "THB",
    limit: String(opts?.limit ?? 30),
    sorting: opts?.sorting ?? "price",
    period_type: "year",
    show_to_affiliates: "true",
  });
}


// ── 7. Affiliate booking link builder ───────────────────────────────
export function buildAffiliateLink(
  origin: string,
  destination: string,
  departDate?: string,
  returnDate?: string,
): string {
  const marker = getMarker();
  const params = new URLSearchParams({
    origin_iata: origin,
    destination_iata: destination,
    with_request: "true",
  });
  if (departDate) params.set("depart_date", departDate);
  if (returnDate) params.set("return_date", returnDate);
  return `https://search.aviasales.com/flights/${origin}${departDate?.replace(/-/g, "").slice(2, 8) ?? ""}${destination}1?marker=${marker}&${params.toString()}`;
}

export function buildWhiteLabelLink(
  whiteLabelDomain: string,
  origin: string,
  destination: string,
  departDate?: string,
): string {
  const base = `https://${whiteLabelDomain}/flights/`;
  const params = new URLSearchParams({
    origin_iata: origin,
    destination_iata: destination,
  });
  if (departDate) params.set("depart_date", departDate);
  return `${base}?${params.toString()}`;
}
