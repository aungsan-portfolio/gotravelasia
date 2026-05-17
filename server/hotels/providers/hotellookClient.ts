import crypto from "crypto";
import type { HotellookResultsResponse, HotellookSearchStartResponse } from "../../../shared/hotels/providers/hotellookTypes.js";

const BASE_URL = "https://engine.hotellook.com/api/v2";

const COMMON_CITY_IATA: Record<string, string> = {
  bangkok: "BKK",
  yangon: "RGN",
  singapore: "SIN",
  tokyo: "TYO",
  "kuala lumpur": "KUL",
  hanoi: "HAN",
  phuket: "HKT",
  bali: "DPS",
  manila: "MNL",
};

export class HotellookClient {
  private marker: string;
  private token: string;

  constructor() {
    this.marker = process.env.TRAVELPAYOUTS_MARKER ?? "gotravelasia";
    this.token = process.env.TRAVELPAYOUTS_TOKEN ?? process.env.TRAVELPAYOUTS_API_TOKEN ?? "";
  }

  /**
   * Helper to sign request parameters alphabetically using MD5
   */
  private generateSignature(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const sortedValues = sortedKeys.map(key => {
      const val = params[key];
      return val === undefined || val === null ? "" : String(val);
    });
    const rawString = `${this.token}:${this.marker}:${sortedValues.join(":")}`;
    return crypto.createHash("md5").update(rawString).digest("hex");
  }

  /**
   * Try to resolve destination name to Hotellook city ID or IATA code
   */
  async resolveCity(cityName: string): Promise<{ cityId?: number; iata?: string }> {
    const cleanName = cityName.trim().toLowerCase();
    
    // 1. Fast static dictionary lookup
    if (COMMON_CITY_IATA[cleanName]) {
      return { iata: COMMON_CITY_IATA[cleanName] };
    }

    // 2. Hotellook Lookup API
    try {
      const url = new URL(`${BASE_URL}/lookup.json`);
      url.searchParams.set("query", cityName);
      url.searchParams.set("lang", "en");
      url.searchParams.set("lookFor", "city");
      url.searchParams.set("limit", "1");

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = (await res.json()) as any;
        const city = json.results?.cities?.[0];
        if (city) {
          return {
            cityId: Number(city.id),
            iata: city.iata?.[0] || undefined,
          };
        }
      }
    } catch (error) {
      console.error(`[Hotellook] City lookup failed for query "${cityName}":`, error);
    }

    // Last resort fallback: default to BKK as dummy or let it throw
    return { iata: "BKK" };
  }

  /**
   * Starts Hotellook async search
   */
  async startSearch(params: {
    checkIn: string;
    checkOut: string;
    adultsCount: number;
    childrenCount: number;
    iata?: string;
    cityId?: number;
    currency?: string;
    lang?: string;
    customerIP?: string;
  }): Promise<string> {
    if (!this.token) {
      throw new Error("[Hotellook] Cannot start search without TRAVELPAYOUTS_TOKEN");
    }

    const payload: Record<string, any> = {
      adultsCount: params.adultsCount,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      childrenCount: params.childrenCount,
      currency: params.currency ?? "USD",
      customerIP: params.customerIP ?? "127.0.0.1",
      lang: params.lang ?? "en",
      waitForResult: 0,
    };

    if (params.cityId !== undefined) {
      payload.cityId = params.cityId;
    } else if (params.iata) {
      payload.iata = params.iata;
    } else {
      throw new Error("[Hotellook] iata or cityId required to start search");
    }

    const signature = this.generateSignature(payload);

    // Assemble start search URL
    const startUrl = new URL(`${BASE_URL}/search/start.json`);
    Object.entries(payload).forEach(([k, v]) => startUrl.searchParams.set(k, String(v)));
    startUrl.searchParams.set("marker", this.marker);
    startUrl.searchParams.set("signature", signature);

    const res = await fetch(startUrl.toString());
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`[Hotellook] Search start failed with status ${res.status}: ${errorText}`);
    }

    const json = (await res.json()) as HotellookSearchStartResponse;
    if (!json.search_id) {
      throw new Error("[Hotellook] Response did not contain search_id");
    }

    return json.search_id;
  }

  /**
   * Retrieves results of the search by searchId
   */
  async getResults(searchId: string): Promise<HotellookResultsResponse> {
    const url = new URL(`${BASE_URL}/search/getResult.json`);
    url.searchParams.set("searchId", searchId);
    url.searchParams.set("limit", "50");
    url.searchParams.set("sortBy", "popularity");
    url.searchParams.set("sortAsc", "0");

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`[Hotellook] Get results failed with status ${res.status}`);
    }

    return (await res.json()) as HotellookResultsResponse;
  }
}
