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
  crossedOutRate?: number;
  discountPercentage?: number;
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
  siteIdLooksNumeric: boolean;
  apiKeyPresent: boolean;
  authFormat: "siteid_colon_apikey";
  requestShape?: {
    cityId: number;
    checkIn: string;
    checkOut: string;
    adults: number;
    rooms: number;
    page: number;
    pageSize: number;
    ltCityId?: number;
    authFormat?: string;
    requestFormat?: string;
  };
  payloadTopLevelKeys?: string[];
  resultCandidateCounts?: Record<string, number>;
  agodaErrorCode?: string;
  agodaErrorMessage?: string;
  agodaErrorType?: string;
  attemptedLtCityIds?: number[];
  resolvedLtCityId?: number;
  resolvedLtCityIdSource?:
    | "verified_lt_id"
    | "dynamic_query_id"
    | "local_agoda_city_id";
  cityResolutionStatus?:
    | "resolved"
    | "unresolved_empty_results"
    | "auth_error"
    | "api_error";
}

export interface HotelSearchCity {
  slug: string;
  name: string;
  bookingName: string;
  country: string;
  agodaCityId: number;
  agodaLtCityId?: number;
  lat?: number;
  lng?: number;
}

export interface HotelSearchResponse {
  city: HotelSearchCity | City;
  hotels: HotelResult[];
  affiliateLinks: HotelOutboundLinks;
  meta: HotelSearchMeta;
}

export interface HotelDetailResponse {
  hotel: HotelResult | null;
  city: HotelSearchCity;
  affiliateLinks: HotelOutboundLinks;
  meta?: HotelSearchMeta & { hotelId?: string };
}

/**
 * ─── Metasearch Identity & Canonicalization ────────────────────────
 */

export type HotelOfferProvider = Exclude<HotelSearchSource, "metasearch" | "mock">;

export interface HotelOffer {
  offerId: string;
  provider: HotelSearchSource;
  providerHotelId: string;
  price: number;
  currency?: string;
  deeplink?: string;
  /** Optional metadata about the specific offer (e.g., room type) */
  description?: string;
  crossedOutRate?: number;
  discountPercentage?: number;
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  payLater?: boolean;
  updatedAt?: string;
}

/**
 * Represents a hotel as seen by a specific upstream provider.
 * This is the input to the identity matching/canonicalization flow.
 */
export interface ProviderHotel {
  provider: HotelSearchSource;
  providerHotelId: string;
  name: string;
  city?: string;
  cityName?: string;
  address?: string;
  neighborhood?: string;
  stars?: number;
  reviewScore?: number;
  reviewCount?: number;
  imageUrl?: string;
  amenities?: string[];
  coordinates?: HotelCoordinates;
  /** The specific offer (price/link) associated with this provider's listing. */
  offer?: HotelOffer;
  /** Raw metadata from the provider for debugging/diagnostics. */
  raw?: any;
  /** The original normalized result if created from search. */
  sourceHotel?: HotelResult;
}

/**
 * A "Unified" hotel representing the best-known metadata for a property,
 * aggregating offers from multiple providers.
 */
export interface CanonicalHotel {
  canonicalId: string;
  name: string;
  city?: string;
  cityName?: string;
  address?: string;
  neighborhood?: string;
  amenities: string[];
  coordinates?: HotelCoordinates;
  imageUrl?: string;
  stars?: number;
  reviewScore?: number;
  reviewCount?: number;
  /** All available offers for this property, deduped by offerId. */
  offers: HotelOffer[];
  /** Mapping of provider -> providerHotelId for traceability. */
  providerHotelIds?: Partial<Record<HotelSearchSource, string>>;
  /** Original provider records for deeper inspection. */
  sourceHotels?: ProviderHotel[];
}

export type HotelIdentityMatchReason =
  | "same_provider_id"
  | "exact_normalized_name"
  | "similar_name"
  | "same_city"
  | "same_address"
  | "nearby_coordinates"
  | "city_mismatch_negative";

export interface HotelIdentityMatch {
  matched: boolean;
  score: number;
  reasons: HotelIdentityMatchReason[];
}
