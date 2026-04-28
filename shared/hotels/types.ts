import type { City } from "./cities.js";

export type HotelSort =
  | "best"
  | "rank"
  | "price_asc"
  | "price_desc"
  | "stars_desc"
  | "review_desc";
export type HotelSearchSource =
  | "agoda"
  | "booking"
  | "trip"
  | "expedia"
  | "klook"
  | "metasearch"
  | "mock";
export type HotelViewMode = "list" | "map";

export interface HotelSearchParams {
  city: string;
  cityName?: string;
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

export interface HotelCoordinates {
  lat: number;
  lng: number;
  /** Temporary fallback until upstream hotel-level coordinates are available. */
  isFallback?: boolean;
}

export type HotelCoordinatesConfidence = "exact" | "fallback" | "missing";

export interface HotelPriceDisplay {
  priceLabel?: string;
  totalStayEstimateLabel?: string;
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
  coordinates?: HotelCoordinates;
  outboundLinks?: HotelOutboundLinks;
  neighborhood?: string;
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  payLater?: boolean;
  provider?: HotelSearchSource;
  providerPrices?: Partial<
    Record<Exclude<HotelSearchSource, "metasearch" | "mock">, number>
  >;
  coordinatesConfidence?: HotelCoordinatesConfidence;
  priceDisplay?: HotelPriceDisplay;
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
  warning?: string;
  warnings?: string[];
  diagnostics?: HotelSearchDiagnostics;
}

export type HotelDiagnosticsReason =
  | "missing_credentials"
  | "non_ok_response"
  | "empty_results"
  | "fetch_error";

export interface HotelSearchDiagnostics {
  reason: HotelDiagnosticsReason;
  status?: number;
  agodaResponsePreview?: string;
  hasAgodaSiteId: boolean;
  hasAgodaApiKey: boolean;
  requestShape?: {
    cityId: number;
    checkIn: string;
    checkOut: string;
    adults: number;
    rooms: number;
    page: number;
    pageSize: number;
  };
  payloadTopLevelKeys?: string[];
  resultCandidateCounts?: Record<string, number>;
  agodaErrorCode?: string;
  agodaErrorMessage?: string;
  agodaErrorType?: string;
}

export interface HotelSearchCity {
  slug: string;
  name: string;
  bookingName: string;
  country: string;
  agodaCityId: number;
  lat?: number;
  lng?: number;
}

export interface HotelSearchResponse {
  city: HotelSearchCity | City;
  hotels: HotelResult[];
  affiliateLinks: HotelOutboundLinks;
  meta: HotelSearchMeta;
}
