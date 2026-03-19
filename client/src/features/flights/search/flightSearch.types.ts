// features/flights/search/flightSearch.types.ts

export type TripType = "roundtrip" | "oneway" | "multicity";
export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface AirportOption {
  code: string;     // BKK
  city: string;     // Bangkok
  name: string;     // Suvarnabhumi
  country: string;  // Thailand
}

export interface TravellerState {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightSearchState {
  tripType: TripType;
  origin: AirportOption | null;
  destination: AirportOption | null;
  departDate: string | null;   // YYYY-MM-DD
  returnDate: string | null;   // YYYY-MM-DD
  travellers: TravellerState;
  cabin: CabinClass;
  currency: string;            // THB
  locale: string;              // en / th
}
