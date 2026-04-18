import type { HotelFrontDoorFormState, HotelFrontDoorValidationResult } from "./hotelFrontDoor.types";
import { parseIsoLocalDate } from "./hotelFrontDoor.dates";

export function validateHotelFrontDoor(state: HotelFrontDoorFormState): HotelFrontDoorValidationResult {
  const errors: HotelFrontDoorValidationResult["errors"] = {};
  const warnings: string[] = [];

  if (!state.destinationLabel.trim()) {
    errors.destination = "Destination is required.";
  }

  if (!state.citySlug) {
    errors.city = "Please choose a supported city from suggestions.";
  }

  const checkInDate = parseIsoLocalDate(state.checkIn);
  const checkOutDate = parseIsoLocalDate(state.checkOut);

  if (!checkInDate) {
    errors.checkIn = "Check-in date is required.";
  }

  if (!checkOutDate) {
    errors.checkOut = "Check-out date is required.";
  }

  if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
    errors.checkOut = "Check-out must be after check-in.";
  }

  if (state.guests.adults < 1 || state.guests.rooms < 1) {
    errors.guests = "At least 1 adult and 1 room are required.";
  }

  const totalGuests = state.guests.adults + state.guests.children;
  if (state.guests.rooms > totalGuests) {
    warnings.push("Rooms exceed total guests. Consider reducing rooms or adding guests.");
  }

  return {
    errors,
    warnings,
    isValid: Object.keys(errors).length === 0,
  };
}
