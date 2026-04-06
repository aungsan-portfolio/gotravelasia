import type { NormalizedFlightSearchParams, TripType } from "./searchParams.js";
import type { CabinClass } from "./types.js";

/**
 * Normalizes raw flight search query parameters or state into a canonical typed shape.
 * Handles legacy aliases like 'return' -> 'roundtrip', 'arrival'/'to' -> 'destination'.
 * Provides safe defaults for missing fields.
 */
export function normalizeSearchParams(raw: Record<string, any>): NormalizedFlightSearchParams {
  const origin = typeof raw.origin === "string" ? raw.origin.toUpperCase() : "";
  
  // Destination aliases: destination, to, arrival
  let destination = typeof raw.destination === "string" ? raw.destination : undefined;
  if (!destination) destination = typeof raw.to === "string" ? raw.to : undefined;
  if (!destination) destination = typeof raw.arrival === "string" ? raw.arrival : undefined;
  destination = destination ? destination.toUpperCase() : "";

  // TripType aliases
  let rawTripType = typeof raw.tripType === "string" ? raw.tripType.toLowerCase() : undefined;
  if (!rawTripType) rawTripType = typeof raw.type === "string" ? raw.type.toLowerCase() : undefined;
  
  let tripType: TripType = "roundtrip"; // Default
  if (
    rawTripType === "oneway" || 
    rawTripType === "one-way" || 
    rawTripType === "single" || 
    rawTripType === "one_way"
  ) {
    tripType = "oneway";
  } else if (
    rawTripType === "roundtrip" ||
    rawTripType === "return" ||
    rawTripType === "round-trip" ||
    rawTripType === "round_trip" ||
    rawTripType === "both"
  ) {
    tripType = "roundtrip";
  } else if (raw.returnDate || raw.return_date) {
    // Infer roundtrip if return date is provided but tripType was missing/invalid
    tripType = "roundtrip";
  } else if (raw.departDate && !raw.returnDate && !raw.return_date) {
    // If we only have departDate and absolutely no returnDate, we could infer roundtrip or oneway. 
    // Usually roundtrip is default in UI, but if explicit oneway inference is better:
    tripType = "oneway";
  }

  // Dates
  const departDate = typeof raw.departDate === "string" ? raw.departDate : (typeof raw.depart_date === "string" ? raw.depart_date : "");
  
  let returnDate = typeof raw.returnDate === "string" ? raw.returnDate : (typeof raw.return_date === "string" ? raw.return_date : undefined);
  if (tripType === "oneway") {
    returnDate = undefined; // Enforce semantic correctness: oneway cannot have returnDate
  } else if (tripType === "roundtrip" && !returnDate) {
      // If roundtrip but no return date provided, it is an invalid state, but we normalize what we have.
  }

  // Passengers
  const adults = parseInt(raw.adults, 10);
  const childrenInt = parseInt(raw.children, 10);
  const infantsInt = parseInt(raw.infants, 10);

  // Cabin mapping
  const rawCabin = typeof raw.cabin === "string" ? raw.cabin : (typeof raw.cabinClass === "string" ? raw.cabinClass : "economy");
  let cabinClass: CabinClass = "economy";
  const normalizedCabin = rawCabin.toLowerCase();
  
  if (normalizedCabin === "premium" || normalizedCabin === "premium_economy") {
    cabinClass = "premium";
  } else if (normalizedCabin === "business") {
    cabinClass = "business";
  } else if (normalizedCabin === "first") {
    cabinClass = "first";
  }

  return {
    origin,
    destination,
    departDate,
    returnDate,
    tripType,
    adults: Number.isFinite(adults) ? adults : 1,
    children: Number.isFinite(childrenInt) ? childrenInt : 0,
    infants: Number.isFinite(infantsInt) ? infantsInt : 0,
    cabinClass,
  };
}
