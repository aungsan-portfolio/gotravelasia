import type { HotelResult } from "../types.js";

export interface HotelSearchCriteria {
  city: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  rooms: number;
  currency?: string;
  language?: string;
  // Provider-specific/extra params for 1:1 adaptation
  agodaCityId?: number;
  ltCityCandidates?: any[];
  page?: number;
  sort?: any;
}

export interface HotelProviderResponse<T> {
  data: T;
  source: string;
  isFallback?: boolean;
}

export type HotelProviderId = 'agoda' | 'hotellook' | 'amadeus' | 'mock';

export interface HotelProvider {
  /**
   * Unique identifier for the provider
   */
  readonly id: HotelProviderId;

  /**
   * Priority: 1 is primary, 2 is secondary, etc.
   */
  readonly priority: number;

  /**
   * Per-provider timeout in milliseconds
   */
  readonly timeoutMs: number;

  /**
   * Per-provider cache TTL in milliseconds
   */
  readonly cacheTtlMs: number;

  /**
   * Search for hotels matching the criteria
   */
  searchHotels(criteria: HotelSearchCriteria): Promise<any>;

  /**
   * Get detailed information for a specific hotel
   */
  getHotelDetail(hotelId: string, criteria?: HotelSearchCriteria): Promise<HotelResult | null>;
}
