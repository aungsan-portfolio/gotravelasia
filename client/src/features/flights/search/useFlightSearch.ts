// features/flights/search/useFlightSearch.ts

import { useMemo, useState } from "react";
import type {
  AirportOption,
  CabinClass,
  FlightSearchState,
  TripType,
  TravellerState,
} from "./flightSearch.types.js";
import { DEFAULT_FLIGHT_SEARCH } from "./flightSearch.constants.js";
import { swapRoute } from "./flightSearch.utils.js";
import { validateFlightSearch } from "./flightSearch.validation.js";
import { buildWhiteLabelSearchUrl, WL_RESULTS_BASE_URL } from "./flightSearch.url.js";

export function useFlightSearch(initialState?: Partial<FlightSearchState>) {
  const [state, setState] = useState<FlightSearchState>({
    ...DEFAULT_FLIGHT_SEARCH,
    ...initialState,
  });
  const [errors, setErrors] = useState<string[]>([]);

  // ── Field setters ──────────────────────────────────────────────
  function setTripType(tripType: TripType) {
    setState((prev) => ({
      ...prev,
      tripType,
      // Clear return date when switching to one-way
      returnDate: tripType === "oneway" ? null : prev.returnDate,
    }));
  }

  function setOrigin(origin: AirportOption | null) {
    setState((prev) => ({ ...prev, origin }));
  }

  function setDestination(destination: AirportOption | null) {
    setState((prev) => ({ ...prev, destination }));
  }

  function setDepartDate(departDate: string | null) {
    setState((prev) => ({ ...prev, departDate }));
  }

  function setReturnDate(returnDate: string | null) {
    setState((prev) => ({ ...prev, returnDate }));
  }

  function setTravellers(travellers: TravellerState) {
    setState((prev) => ({ ...prev, travellers }));
  }

  function setCabin(cabin: CabinClass) {
    setState((prev) => ({ ...prev, cabin }));
  }

  function onSwapRoute() {
    setState((prev) => swapRoute(prev));
  }

  // ── Submit ─────────────────────────────────────────────────────
  function submit(): { ok: true; url: string } | { ok: false; errors: string[] } {
    const result = validateFlightSearch(state);

    if (!result.ok) {
      setErrors(result.errors);
      return { ok: false, errors: result.errors };
    }

    setErrors([]);

    const url = buildWhiteLabelSearchUrl(state, {
      baseUrl: WL_RESULTS_BASE_URL,
    });

    return { ok: true, url };
  }

  // ── Derived ────────────────────────────────────────────────────
  const isRoundTrip   = useMemo(() => state.tripType === "roundtrip", [state.tripType]);
  const totalTravellers = useMemo(
    () => state.travellers.adults + state.travellers.children + state.travellers.infants,
    [state.travellers],
  );

  return {
    state,
    errors,
    isRoundTrip,
    totalTravellers,
    actions: {
      setTripType,
      setOrigin,
      setDestination,
      setDepartDate,
      setReturnDate,
      setTravellers,
      setCabin,
      onSwapRoute,
      submit,
    },
  };
}
