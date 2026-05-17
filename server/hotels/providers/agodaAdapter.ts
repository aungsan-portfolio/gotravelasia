import type { HotelProvider, HotelSearchCriteria } from "../../../shared/hotels/providers/types.js";
import type { HotelResult, HotelDetail } from "../../../shared/hotels/types.js";

// Currently just a stub wrapper around the existing Agoda implementation
export class AgodaProvider implements HotelProvider {
  readonly id = "agoda";

  async searchHotels(criteria: HotelSearchCriteria): Promise<HotelResult[]> {
    // Phase 2: Move logic from api/hotels.ts here
    // For now, return empty or throw error to indicate this is a stub
    throw new Error("Not implemented yet - stub for Phase 2");
  }

  async getHotelDetail(hotelId: string, criteria?: HotelSearchCriteria): Promise<HotelDetail | null> {
    // Phase 2: Move logic from api/hotels.ts here
    throw new Error("Not implemented yet - stub for Phase 2");
  }
}
