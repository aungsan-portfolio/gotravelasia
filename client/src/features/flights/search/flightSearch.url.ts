// features/flights/search/flightSearch.url.ts
//
// IMPORTANT: The payload format below is a project-side abstraction.
// Before going to production, capture a real completed-search URL from
// your Travelpayouts White Label dashboard and align the exact encoding.
// WL version/config affects parameter names slightly.

import type { FlightSearchState } from "./flightSearch.types.js";

interface BuildWhiteLabelUrlOptions {
  /** Base URL of your White Label results page.
   *  e.g. "https://gotravel-asia.vercel.app/flights/results"
   */
  baseUrl: string;
}

/**
 * Builds a Travelpayouts White Label search URL from FlightSearchState.
 *
 * The widget reads these query params on load:
 *   origin      = IATA code
 *   destination = IATA code
 *   depart      = YYYY-MM-DD
 *   return      = YYYY-MM-DD (omitted for one-way)
 *   tripType    = "roundtrip" | "one-way"
 *   adults      = number
 *   children    = number
 *   infants     = number
 *   cabin       = "economy" | "premium_economy" | "business" | "first"
 *   currency    = "THB" | "USD" | ...
 *   locale      = "en" | "th" | ...
 */
export function buildWhiteLabelSearchUrl(
  state: FlightSearchState,
  options: BuildWhiteLabelUrlOptions,
): string {
  const { baseUrl } = options;
  const url = new URL(baseUrl);

  if (state.origin)      url.searchParams.set("origin",      state.origin.code);
  if (state.destination) url.searchParams.set("destination", state.destination.code);
  if (state.departDate)  url.searchParams.set("depart",      state.departDate);

  if (state.tripType === "roundtrip" && state.returnDate) {
    url.searchParams.set("return", state.returnDate);
  }

  url.searchParams.set("tripType",  state.tripType === "roundtrip" ? "roundtrip" : "one-way");
  url.searchParams.set("adults",    String(state.travellers.adults));
  url.searchParams.set("children",  String(state.travellers.children));
  url.searchParams.set("infants",   String(state.travellers.infants));
  url.searchParams.set("cabin",     state.cabin);
  url.searchParams.set("currency",  state.currency);
  url.searchParams.set("locale",    state.locale);

  return url.toString();
}

/** The results page base URL — change to your production domain. */
export const WL_RESULTS_BASE_URL = "https://gotravel-asia.vercel.app/flights/results";
