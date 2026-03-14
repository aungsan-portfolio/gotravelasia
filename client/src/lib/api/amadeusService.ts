// client/src/lib/api/amadeusService.ts
// Amadeus Self-Service API — fallback provider for GoTravel Asia
// Docs: https://developers.amadeus.com/self-service

const AMADEUS_BASE = "https://api.amadeus.com";
const AMADEUS_AUTH = "https://api.amadeus.com/v1/security/oauth2/token";

let cachedToken: { token: string; expiresAt: number } | null = null;

function getCredentials() {
  const clientId = import.meta.env.VITE_AMADEUS_CLIENT_ID
    ?? process.env.AMADEUS_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_AMADEUS_CLIENT_SECRET
    ?? process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string | null> {
  const creds = getCredentials();
  if (!creds) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch(AMADEUS_AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    cachedToken = {
      token: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000,
    };
    return cachedToken.token;
  } catch {
    return null;
  }
}

async function amFetch<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const url = new URL(path, AMADEUS_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn(`[Amadeus] ${path} → ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json.data as T;
  } catch (err) {
    console.error(`[Amadeus] ${path} fetch error:`, err);
    return null;
  }
}


// ── Flight Offers Search ────────────────────────────────────────────
export interface AmFlightOffer {
  type: string;
  id: string;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
      numberOfStops: number;
      duration: string;
    }>;
  }>;
  price: { currency: string; total: string; grandTotal: string };
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

export async function searchFlightOffers(
  origin: string,
  destination: string,
  departureDate: string,
  opts?: { adults?: number; currencyCode?: string; max?: number; nonStop?: boolean },
): Promise<AmFlightOffer[] | null> {
  return amFetch("/v2/shopping/flight-offers", {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: String(opts?.adults ?? 1),
    currencyCode: opts?.currencyCode ?? "THB",
    max: String(opts?.max ?? 10),
    ...(opts?.nonStop ? { nonStop: "true" } : {}),
  });
}


// ── Flight Inspiration (cheapest destinations from origin) ──────────
export interface AmFlightDestination {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: { total: string };
}

export async function searchFlightInspiration(
  origin: string,
  opts?: { maxPrice?: number },
): Promise<AmFlightDestination[] | null> {
  const params: Record<string, string> = { origin };
  if (opts?.maxPrice) params.maxPrice = String(opts.maxPrice);
  return amFetch("/v1/shopping/flight-destinations", params);
}


// ── Cheapest Date Search ────────────────────────────────────────────
export interface AmFlightDate {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: { total: string };
}

export async function searchCheapestDates(
  origin: string,
  destination: string,
): Promise<AmFlightDate[] | null> {
  return amFetch("/v1/shopping/flight-dates", { origin, destination });
}


export function isAmadeusConfigured(): boolean {
  return getCredentials() !== null;
}
