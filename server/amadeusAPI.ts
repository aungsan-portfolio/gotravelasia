import { ENV } from "./_core/env";

let amadeusToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAmadeusToken(): Promise<string | null> {
  // Return cached token if still valid (with 30s buffer)
  if (amadeusToken && tokenExpiry && Date.now() < tokenExpiry - 30000) {
    return amadeusToken;
  }

  if (!ENV.amadeusId || !ENV.amadeusSecret) {
    console.warn("[Amadeus] Missing API credentials in environment.");
    return null;
  }

  try {
    const response = await fetch("https://test.api.amadeus.com/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: ENV.amadeusId,
        client_secret: ENV.amadeusSecret,
      }),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("[Amadeus] Auth failure:", response.status, errText);
        return null;
    }

    const data = await response.json();
    amadeusToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
    return amadeusToken;
  } catch (error) {
    console.error("[Amadeus] Token fetch error:", error);
    return null;
  }
}

export const amadeusAPI = {
  /**
   * Fetches destination metadata from Amadeus location API.
   * Maps 'city' or 'airport' to our unified schema.
   */
  async fetchDestinationData(slug: string) {
    const token = await getAmadeusToken();
    if (!token) return null;

    try {
      // Use Location Search (subType: CITY,AIRPORT)
      // Note: Amadeus doesn't have a direct "slug" lookup, we use keyword search
      // and match the first best result.
      const searchUrl = new URL("https://test.api.amadeus.com/v1/reference-data/locations");
      searchUrl.searchParams.set("subType", "CITY,AIRPORT");
      searchUrl.searchParams.set("keyword", slug.replace(/-/g, " "));

      const response = await fetch(searchUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return null;
      const json = await response.json();
      const results = json.data || [];
      
      if (results.length === 0) return null;

      // Find best match (prefer exact IATA if slug is 3 chars, or best keyword match)
      const best = results[0];

      return {
        slug: slug.toLowerCase(),
        type: (best.subType === "CITY" ? "city" : "airport") as any,
        name: best.name,
        iataCode: best.iataCode,
        countryCode: best.address?.countryCode,
        primaryAirports: best.subType === "CITY" ? [best.iataCode] : [],
        cities: [],
        capital: null,
        weatherData: null,
        priceRatio: null,
        highlights: null,
        climate: null,
      };
    } catch (error) {
      console.error("[Amadeus] Fetch error:", error);
      return null;
    }
  },
};

export interface AirportResult {
  code:    string;
  name:    string;
  city:    string;
  country: string;
  type:    "airport" | "city";
}

/**
 * Maps the API result to the structure expected by the FlightSearchContext.
 */
export function toContextAirport(r: AirportResult) {
  return {
    code:    r.code,
    name:    `${r.city} (${r.name})`,  // e.g., "Bangkok (Suvarnabhumi)"
    country: r.country,
  };
}

/**
 * Searches for airports and cities using the Amadeus Location API.
 * Includes a local fallback if the API is unavailable.
 */
export async function searchAmadeusLocations(keyword: string): Promise<AirportResult[]> {
  try {
    const token = await getAmadeusToken();
    if (!token) return getFallbackAirports(keyword);

    const res = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?` +
      `subType=AIRPORT,CITY&keyword=${encodeURIComponent(keyword)}&page[limit]=8`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      console.warn("[Amadeus] Search failed, status:", res.status);
      return getFallbackAirports(keyword);
    }

    const data = await res.json();
    
    return (data.data ?? []).map((loc: any) => ({
      code:    loc.iataCode,
      name:    loc.name,
      city:    loc.address?.cityName ?? loc.name,
      country: loc.address?.countryName ?? "",
      type:    loc.subType === "AIRPORT" ? "airport" : "city",
    }));
  } catch (error) {
    console.error("[Amadeus] Search catch error:", error);
    return getFallbackAirports(keyword);
  }
}

/**
 * Local fallback for common regional airports to maintain functionality 
 * even if the external API is unreachable.
 */
function getFallbackAirports(q: string): AirportResult[] {
  const LOCAL: AirportResult[] = [
    { code: "RGN", name: "Yangon Intl",        city: "Yangon",           country: "Myanmar",      type: "airport" },
    { code: "MDL", name: "Mandalay Intl",      city: "Mandalay",         country: "Myanmar",      type: "airport" },
    { code: "BKK", name: "Suvarnabhumi",       city: "Bangkok",          country: "Thailand",     type: "airport" },
    { code: "DMK", name: "Don Mueang",         city: "Bangkok",          country: "Thailand",     type: "airport" },
    { code: "CNX", name: "Chiang Mai Intl",    city: "Chiang Mai",       country: "Thailand",     type: "airport" },
    { code: "HKT", name: "Phuket Intl",        city: "Phuket",           country: "Thailand",     type: "airport" },
    { code: "SIN", name: "Changi Airport",     city: "Singapore",        country: "Singapore",    type: "airport" },
    { code: "KUL", name: "KLIA",               city: "Kuala Lumpur",     country: "Malaysia",     type: "airport" },
    { code: "SGN", name: "Tan Son Nhat",       city: "Ho Chi Minh City", country: "Vietnam",      type: "airport" },
    { code: "HAN", name: "Noi Bai Intl",       city: "Hanoi",            country: "Vietnam",      type: "airport" },
    { code: "DAD", name: "Da Nang Intl",       city: "Da Nang",          country: "Vietnam",      type: "airport" },
    { code: "REP", name: "Siem Reap Intl",     city: "Siem Reap",        country: "Cambodia",     type: "airport" },
    { code: "HKG", name: "Hong Kong Intl",     city: "Hong Kong",        country: "Hong Kong",    type: "airport" },
    { code: "TYO", name: "Narita Intl",        city: "Tokyo",            country: "Japan",        type: "airport" },
    { code: "OSA", name: "Kansai Intl",        city: "Osaka",            country: "Japan",        type: "airport" },
    { code: "ICN", name: "Incheon Intl",       city: "Seoul",            country: "South Korea",  type: "airport" },
    { code: "DPS", name: "Ngurah Rai Intl",    city: "Bali",             country: "Indonesia",    type: "airport" },
    { code: "DXB", name: "Dubai Intl",         city: "Dubai",            country: "UAE",          type: "airport" },
  ];
  const lq = q.toLowerCase();
  return LOCAL.filter(a =>
    a.code.toLowerCase().includes(lq) ||
    a.city.toLowerCase().includes(lq) ||
    a.name.toLowerCase().includes(lq) ||
    a.country.toLowerCase().includes(lq)
  ).slice(0, 6);
}
