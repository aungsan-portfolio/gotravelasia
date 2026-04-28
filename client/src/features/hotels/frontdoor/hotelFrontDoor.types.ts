import type { GuestConfig } from "@/types/hotel-search.types";

export interface HotelFrontDoorFormState {
  destinationLabel: string;
  city: string;
  cityName?: string;
  destinationSource?: "local" | "agoda";
  checkIn: string;
  checkOut: string;
  guests: GuestConfig;
}

export interface HotelFrontDoorValidationResult {
  errors: Partial<
    Record<"destination" | "city" | "checkIn" | "checkOut" | "guests", string>
  >;
  warnings: string[];
  isValid: boolean;
}
