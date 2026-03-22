import type { City } from './cities';

export type HotelSort = 'rank' | 'price_asc' | 'price_desc' | 'stars_desc' | 'review_desc';
export type HotelSearchSource = 'agoda' | 'mock';

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
  rankingPosition?: number;
  outboundLinks?: HotelOutboundLinks;
}

export interface HotelSearchMeta {
  source: HotelSearchSource;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  page: number;
  sort: HotelSort;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  warnings?: string[];
}

export interface HotelSearchResponse {
  city: City;
  hotels: HotelResult[];
  affiliateLinks: HotelOutboundLinks;
  meta: HotelSearchMeta;
}
