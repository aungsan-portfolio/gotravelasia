import type { HotelProvider, HotelSearchCriteria } from "../../../shared/hotels/providers/types.js";
import { fetchAgodaHotelsWithCityCandidates } from "../../api/hotels.js";

// AgodaProvider adapter wraps existing fetchAgodaHotelsWithCityCandidates 1:1
export class AgodaProvider implements HotelProvider {
  readonly id = "agoda";

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
      page: criteria.page ?? 1,
      sort: criteria.sort ?? "best",
    });
  }

  async getHotelDetail(hotelId: string, criteria?: HotelSearchCriteria): Promise<any | null> {
    if (!criteria) return null;
    const searchResult = await this.searchHotels(criteria);
    return searchResult.hotels.find((h: any) => h.hotelId === hotelId) ?? null;
  }
}
