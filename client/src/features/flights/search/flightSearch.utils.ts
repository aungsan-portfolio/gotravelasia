// features/flights/search/flightSearch.utils.ts

import type { FlightSearchState } from "./flightSearch.types.js";

export function swapRoute(state: FlightSearchState): FlightSearchState {
  return { ...state, origin: state.destination, destination: state.origin };
}

export function getTotalTravellers(state: FlightSearchState): number {
  return (
    state.travellers.adults +
    state.travellers.children +
    state.travellers.infants
  );
}

export function formatCabinLabel(cabin: FlightSearchState["cabin"]): string {
  switch (cabin) {
    case "premium_economy": return "Premium Economy";
    case "business":        return "Business";
    case "first":           return "First";
    default:                return "Economy";
  }
}

/**
 * Format a YYYY-MM-DD date string into a short display label.
 * e.g. "2026-04-17" → "Thu 17 Apr"
 */
export function formatDateLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Returns today's date as YYYY-MM-DD string.
 */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
