/**
 * Core type definitions for GoTravel Asia Hotel Search
 */

export enum LocationType {
  HOTEL = "hotel",
  CITY = "city",
  AIRPORT = "airport",
  LANDMARK = "landmark",
  NEIGHBORHOOD = "neighborhood",
  REGION = "region",
  COUNTRY = "country",
  ADDRESS = "address",
  POINT = "point",
}

export interface AutocompleteSuggestion {
  displayName:  string;
  locationType: LocationType | string;
  locationId:   string;
  subtitle?:    string;
  imageUrl?:    string;
}

export interface GuestConfig {
  rooms:    number;
  adults:   number;
  children: number;
}

export interface HotelSearchParams {
  destination:  string;
  locationId:   string;
  locationType: string;
  checkIn:      string; // YYYY-MM-DD
  checkOut:     string; // YYYY-MM-DD
  guests:       GuestConfig;
}

export interface DatePriceData {
  date:      string;
  score:     number; // 0-100 indicating "deal" quality
  priceHint: "cheap" | "average" | "expensive";
}

export enum PageType {
  FRONT_DOOR = "FD",    // Landing page
  RESULTS_PAGE = "RP",  // Search results
  DETAIL_PAGE = "DP",   // Hotel details
}

export interface HotelResult {
  id:            string;
  name:          string;
  stars:         number;
  rating:        number;
  reviewCount:   number;
  pricePerNight: number;
  currency:      string;
  imageUrl:      string;
  district?:     string;
  amenities:     string[];
}
