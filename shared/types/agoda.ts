/**
 * Agoda Type Definitions
 * Shared between client UI and server API
 */

export interface AgodaSearchParams {
  propertyIds: number[];
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  rooms?: number;
  adults?: number;
  children?: number;
  language?: string;
  currency?: string;
  userCountry?: string;
}

export interface AgodaHotelRate {
  hotelId: number;
  hotelName: string;
  cheapestPrice: number;
  currency: string;
  discountPercentage?: number;
  imageUrl?: string;
  bookingUrl: string;
}
