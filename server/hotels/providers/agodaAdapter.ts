import type { HotelProvider, HotelSearchCriteria } from "../../../shared/hotels/providers/types.js";
import type { HotelResult } from "../../../shared/hotels/types.js";
import {
  fetchAgodaHotelsWithCityCandidates,
  fetchAgodaHotelDetail,
} from "../../api/hotels.js";

// AgodaProvider adapter wraps existing fetchAgodaHotelsWithCityCandidates 1:1
export class AgodaProvider implements HotelProvider {
  readonly id = "agoda";
  readonly priority = 1;
  readonly timeoutMs = 9000; // 9 seconds to allow for slower Agoda responses
  readonly cacheTtlMs = 30 * 60 * 1000; // 30 minutes

  async searchHotels(criteria: HotelSearchCriteria): Promise<any> {
    if (criteria.agodaCityId === undefined || !criteria.ltCityCandidates) {
      throw new Error("AgodaProvider requires agodaCityId and ltCityCandidates");
    }

    return fetchAgodaHotelsWithCityCandidates({
      agodaCityId: criteria.agodaCityId,
      ltCityCandidates: criteria.ltCityCandidates,
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      adults: criteria.adults,
      rooms: criteria.rooms,
      sort: criteria.sort ?? "best",
    });
  }

  async getHotelDetail(
    hotelId: string,
    criteria?: HotelSearchCriteria
  ): Promise<HotelResult | null> {
    if (!criteria) return null;
    const numericHotelId = Number(hotelId);
    if (!Number.isFinite(numericHotelId)) return null;

    // Look up the single hotel via Agoda Hotel List Search (lt_v1 §4) instead of
    // running a full city search and filtering client-side.
    return fetchAgodaHotelDetail({
      hotelId: numericHotelId,
      checkIn: criteria.checkIn,
      checkOut: criteria.checkOut,
      adults: criteria.adults,
      rooms: criteria.rooms,
      city: criteria.city,
      agodaCityId: criteria.agodaCityId,
    });
  }
}
