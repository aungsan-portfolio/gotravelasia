import type { HotelProvider, HotelSearchCriteria } from "../../../shared/hotels/providers/types.js";
import type { HotelResult } from "../../../shared/hotels/types.js";
import { HotellookClient } from "./hotellookClient.js";
import { normalizeHotellookHotel } from "./hotellookNormalize.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class HotellookProvider implements HotelProvider {
  readonly id = "hotellook";
  readonly priority = 2;
  readonly timeoutMs = 4000; // 4 seconds
  readonly cacheTtlMs = 15 * 60 * 1000; // 15 minutes
  private client: HotellookClient;

  constructor() {
    this.client = new HotellookClient();
  }

  async searchHotels(criteria: HotelSearchCriteria): Promise<any> {
    try {
      // 1. Resolve city to Hotellook IATA/city ID
      const resolution = await this.client.resolveCity(criteria.city);

      // 2. Start asynchronous search query
      const searchId = await this.client.startSearch({
        checkIn: criteria.checkIn,
        checkOut: criteria.checkOut,
        adultsCount: criteria.adults,
        childrenCount: 0, // Default fallback
        iata: resolution.iata,
        cityId: resolution.cityId,
        currency: criteria.currency ?? "USD",
        lang: criteria.language ?? "en",
      });

      // 3. Bounded polling: Poll up to 3 times with 1.2s delay (max 3.6s)
      let results = await this.client.getResults(searchId);
      
      for (let i = 0; i < 3; i++) {
        if (results.status === "ok" && results.hotels && results.hotels.length > 0) {
          break;
        }
        await sleep(1200);
        results = await this.client.getResults(searchId);
      }

      const rawHotels = results.hotels ?? [];
      const marker = process.env.TRAVELPAYOUTS_MARKER ?? "gotravelasia";

      // 4. Normalize raw Hotellook results into unified HotelResult payload
      const normalizedHotels = rawHotels.map(h =>
        normalizeHotellookHotel(h, {
          city: criteria.city,
          checkIn: criteria.checkIn,
          checkOut: criteria.checkOut,
          adults: criteria.adults,
          rooms: criteria.rooms,
          sort: "best",
          page: criteria.page ?? 1,
        }, marker)
      );

      return {
        source: "hotellook" as const,
        hotels: normalizedHotels,
        totalCount: normalizedHotels.length,
      };
    } catch (error) {
      console.error("[HotellookProvider] Search failed:", error);
      return {
        source: "hotellook" as const,
        hotels: [],
        totalCount: 0,
        warning: "Hotellook search failed.",
      };
    }
  }

  async getHotelDetail(hotelId: string, criteria?: HotelSearchCriteria): Promise<HotelResult | null> {
    if (!criteria) return null;
    
    // Fallback lookup: search all matching hotels and filter by matching hotel ID namespace
    const result = await this.searchHotels(criteria);
    if (!result || !result.hotels) return null;
    
    return result.hotels.find((h: HotelResult) => h.hotelId === hotelId) ?? null;
  }
}
