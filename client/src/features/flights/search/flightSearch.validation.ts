// features/flights/search/flightSearch.validation.ts

import type { FlightSearchState } from "./flightSearch.types.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateFlightSearch(state: FlightSearchState): ValidationResult {
  const errors: string[] = [];

  if (!state.origin)      errors.push("Origin is required.");
  if (!state.destination) errors.push("Destination is required.");
  if (!state.departDate)  errors.push("Departure date is required.");

  if (
    state.origin &&
    state.destination &&
    state.origin.code === state.destination.code
  ) {
    errors.push("Origin and destination cannot be the same.");
  }

  if (state.tripType === "roundtrip" && !state.returnDate) {
    errors.push("Return date is required for round trip.");
  }

  if (
    state.tripType === "roundtrip" &&
    state.departDate &&
    state.returnDate &&
    state.returnDate < state.departDate
  ) {
    errors.push("Return date cannot be earlier than departure date.");
  }

  if (state.travellers.adults < 1) {
    errors.push("At least 1 adult is required.");
  }

  if (state.travellers.infants > state.travellers.adults) {
    errors.push("Infants cannot exceed adults.");
  }

  return { ok: errors.length === 0, errors };
}
