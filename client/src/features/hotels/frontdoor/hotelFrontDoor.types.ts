import type { GuestConfig } from "@/types/hotel-search.types";

export interface HotelFrontDoorFormState {
  destinationLabel: string;
  citySlug: string;
  checkIn: string;
  checkOut: string;
  guests: GuestConfig;
}

export interface HotelFrontDoorValidationResult {
  errors: Partial<Record<"destination" | "city" | "checkIn" | "checkOut" | "guests", string>>;
  warnings: string[];
  isValid: boolean;
}
