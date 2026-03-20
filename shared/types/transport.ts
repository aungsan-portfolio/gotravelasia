/**
 * 12Go Transport Types
 * Shared between client UI and server API
 */

export interface TransportSchedule {
  id: string;
  type: 'bus' | 'train' | 'minibus';
  company: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  seats: number;
  rating: number;
  bookingUrl: string;
}

export interface TransportSearchParams {
  from: string;
  to: string;
  date: string;
}

export interface TransportSearchResult {
  from: string;
  to: string;
  date: string;
  schedules: TransportSchedule[];
  affiliateLink: string;
}
