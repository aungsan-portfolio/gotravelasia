import type { HotelResult, HotelDetail } from "../types.js";

export interface HotelSearchCriteria {
  city: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  rooms: number;
  currency?: string;
  language?: string;
}

export interface HotelProviderResponse<T> {
  data: T;
  source: string;
  isFallback?: boolean;
}

export interface HotelProvider {
  /**
   * Unique identifier for the provider (e.g. 'agoda', 'travelpayouts')
   */
  readonly id: string;

  /**
   * Search for hotels matching the criteria
   */
  searchHotels(criteria: HotelSearchCriteria): Promise<HotelResult[]>;

  /**
   * Get detailed information for a specific hotel
   */
  getHotelDetail(hotelId: string, criteria?: HotelSearchCriteria): Promise<HotelDetail | null>;
}
