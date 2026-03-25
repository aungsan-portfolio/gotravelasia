export type HotelSort =
  | "recommended"
  | "price_low_to_high"
  | "price_high_to_low"
  | "rating_high_to_low"
  | "stars_high_to_low";

export type HotelFilterId =
  | "free_breakfast"
  | "free_cancellation"
  | "pay_later"
  | "highly_rated"
  | "budget"
  | "luxury";

export interface HotelLocation {
  addressLine: string;
  area: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface HotelPrice {
  amount: number;
  currency: "USD";
  taxesAndFeesIncluded: boolean;
}

export interface HotelReview {
  score: number;
  count: number;
}

export interface HotelOfferLinks {
  primary: string;
  booking?: string;
  agoda?: string;
  trip?: string;
}

export interface HotelItem {
  id: string;
  name: string;
  starRating: number;
  thumbnailUrl: string;
  location: HotelLocation;
  pricePerNight: HotelPrice;
  review: HotelReview;
  amenities: string[];
  badges: string[];
  isFreeBreakfast: boolean;
  isFreeCancellation: boolean;
  isPayLater: boolean;
  deepLinks: HotelOfferLinks;
}

export interface HotelResultsQuery {
  destinationLabel: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface HotelResultsResponse {
  hotels: HotelItem[];
  total: number;
}

export interface HotelFilterOption {
  id: HotelFilterId;
  label: string;
  description: string;
}

export interface HotelResultsState {
  isLoading: boolean;
  errorMessage: string | null;
  sort: HotelSort;
  activeFilters: HotelFilterId[];
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
}
