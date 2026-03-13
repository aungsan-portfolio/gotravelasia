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
