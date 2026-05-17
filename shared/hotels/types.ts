import type { City } from "./cities";

export type HotelSearchSource = "agoda" | "hotellook" | "booking" | "trip" | "expedia" | "klook" | "metasearch" | "mock";
export type HotelSort = "best" | "rank" | "price_asc" | "price_desc" | "stars_desc" | "review_desc";
export type HotelViewMode = "list" | "map";

export interface HotelSearchParams {
  city: string;
  cityName?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  children?: number;
  sort: HotelSort;
  page: number;
}

export interface HotelPriceDisplay {
  amount: number;
  currency: string;
  provider: HotelSearchSource;
  taxInclusive: boolean;
  isStrikethrough?: boolean;
}

export interface HotelOutboundLinks {
  agoda?: string;
  hotellook?: string;
  booking?: string;
  trip?: string;
  expedia?: string;
  klook?: string;
  mock?: string;
  metasearch?: string;
}

export type HotelOfferProvider = Exclude<HotelSearchSource, "metasearch" | "mock">;

export interface HotelOffer {
  provider: HotelSearchSource;
  price: number;
  currency: string;
  outboundLink?: string; // Singular for newer logic
  outboundLinks?: HotelOutboundLinks; // Plural for identity merging
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  payLater: boolean;
  roomName?: string;
  hotelId: string;
  rank: number;
  crossedOutPrice?: number;
  deeplinkUrl?: string;
  cancellationPolicy?: string;
}

export type HotelCoordinatesConfidence = "exact" | "approximate" | "fallback";

export interface HotelCoordinates {
  lat: number;
  lng: number;
  isFallback?: boolean;
  confidence?: HotelCoordinatesConfidence;
}

export interface HotelResult {
  hotelId: string;
  name: string;
  stars: number;
  reviewScore: number;
  reviewCount: number;
  address: string;
  imageUrl: string;
  images?: string[];
  amenities: string[];
  lowestRate: number;
  currency: string;
  rankingPosition: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  payLater: boolean;
  outboundLinks: HotelOutboundLinks;
  coordinates?: HotelCoordinates;
  distanceFromCenter?: number;
  provider?: HotelSearchSource;
  crossedOutRate?: number;
  discountPercentage?: number;
  providerPrices?: Partial<Record<HotelOfferProvider, number>>;
  coordinatesConfidence?: HotelCoordinatesConfidence;
  priceDisplay?: HotelPriceDisplay;
  offers?: HotelOffer[];
}

export interface ProviderHotel {
  provider: HotelOfferProvider;
  city: string;
  result: HotelResult;
  offer: HotelOffer;
}

export interface HotelIdentityMatch {
  nameSimilarity: number;
  distanceKm?: number;
  score: number;
}

export interface CanonicalHotel {
  canonicalId: string;
  city: string;
  name: string;
  address?: string;
  coordinates?: HotelCoordinates;
  primaryHotel: ProviderHotel;
  offers: HotelOffer[];
  providers: ProviderHotel[];
  identityMatch?: HotelIdentityMatch;
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
  emptyStateReason?: HotelEmptyStateReason;
}

export type HotelDiagnosticsReason =
  | "missing_credentials"
  | "non_ok_response"
  | "empty_results"
  | "fetch_error"
  | "unsupported_city"
  | "unresolved_city"
  | "no_results_for_filters";

export type HotelEmptyStateReason =
  | "provider_unavailable"
  | "unsupported_city"
  | "unresolved_city"
  | "no_filter_matches"
  | "no_live_inventory";

export interface HotelSearchDiagnostics {
  reason: HotelDiagnosticsReason;
  status?: number;
  agodaResponsePreview?: string;
  hasAgodaSiteId: boolean;
  hasAgodaApiKey: boolean;
  siteIdLooksNumeric: boolean;
  apiKeyPresent: boolean;
  authFormat: "siteid_colon_apikey" | "plain_apikey";
  requestFormat?: string;
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
    | "data_file_city_id"
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

export interface HotelDetailResponse extends HotelSearchResponse {
  hotel: HotelResult | null;
  meta: HotelSearchMeta & {
    hotelId: string;
  };
}

export type HotelSearchResponsePayload = HotelSearchResponse;
