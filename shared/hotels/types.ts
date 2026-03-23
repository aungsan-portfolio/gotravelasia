import type { City } from './cities';

export const HOTEL_SORTS = ['rank', 'price_asc', 'price_desc', 'stars_desc', 'review_desc'] as const;
export type HotelSort = (typeof HOTEL_SORTS)[number];

export interface HotelSearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  page: number;
  sort: HotelSort;
}

export interface HotelOutboundLinks {
  agoda?: string;
  booking?: string;
  trip?: string;
  klook?: string;
  expedia?: string;
  primary?: string;
}

export interface HotelResult {
  hotelId: string;
  name: string;
  stars: number;
  reviewScore: number;
  reviewCount: number;
  address: string;
  imageUrl: string;
  amenities: string[];
  lowestRate: number;
  currency?: string;
  provider?: 'agoda' | 'mock';
  outboundLinks?: HotelOutboundLinks;
}

export interface HotelSearchMeta {
  source: 'agoda' | 'mock';
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  page: number;
  pageSize: number;
  totalResults?: number;
  hasNextPage: boolean;
  sort: HotelSort;
  warnings?: string[];
}

export interface HotelSearchResponse {
  city: City;
  hotels: HotelResult[];
  affiliateLinks: HotelOutboundLinks;
  meta: HotelSearchMeta;
}
