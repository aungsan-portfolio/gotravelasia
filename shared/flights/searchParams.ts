export type TripType = "roundtrip" | "oneway";

import type { CabinClass } from "./types.js";

export type NormalizedFlightSearchParams = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  tripType: TripType;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  currency?: string;
  nonStopOnly?: boolean;
};

export function isValidIata(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}
