/**
 * Canonical live API results hook for flight search.
 *
 * NOTE: This hook powers inline/live search results (API + in-memory filtering/sorting).
 * Do not confuse it with the white-label form redirect hook under
 * `features/flights/search/useWhiteLabelFlightSearch.ts`.
 */

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { Dispatch, SetStateAction } from "react";

import type {
  Flight,
} from "../../../shared/flights/types.js";
import type { HackerFareCombination } from "../../../shared/flights/hackerFare.js";
import { findHackerFares } from "../../../shared/flights/hackerFare.js";

import { applyFlightFilters } from "../../../shared/flights/flightFilters.js";
import type { FlightFilterInput } from "../../../shared/flights/flightFilters.js";

import { sortFlights } from "../../../shared/flights/flightSorting.js";
import type { FlightSortOption } from "../../../shared/flights/flightSorting.js";

// ─────────────────────────────────────────────────────────────
// Backend response meta
// ─────────────────────────────────────────────────────────────
export interface FlightSearchMeta {
  provider: "amadeus";
  count: number;
  rawOfferCount: number;
  searchedAt: string;
  currency: string;
  params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    passengers?: number;
    nonStopOnly?: boolean;
  };
}

export type SearchResultItem = Flight | HackerFareCombination;

// ─────────────────────────────────────────────────────────────
// Hook options
// ─────────────────────────────────────────────────────────────
export interface UseFlightSearchOptions {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers?: number;
  currency?: string;
  nonStopOnly?: boolean;
  enabled?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Hook result
// ─────────────────────────────────────────────────────────────
export interface UseFlightSearchResult {
  rawFlights: Flight[];
  hackerFareFlights: HackerFareCombination[];
  meta: FlightSearchMeta | null;

  flights: SearchResultItem[];
  normalFlights: Flight[];
  bestFlights: Flight[];
  cheapestFlights: Flight[];
  fastestFlights: Flight[];

  filters: FlightFilterInput;
  sortBy: FlightSortOption;
  setFilters: Dispatch<SetStateAction<FlightFilterInput>>;
  setSortBy: Dispatch<SetStateAction<FlightSortOption>>;
  resetFilters: () => void;
  resetSortBy: () => void;

  refetch: () => Promise<void>;
  clearSearch: () => void;

  loading: boolean;
  error: string | null;
  searchedAt: string | null;
  hasSearched: boolean;
  isEmpty: boolean;
  cheapestProtectedRoundTripPrice: number | null;
}

interface SearchApiSuccess {
  success: true;
  flights?: Flight[];
  meta?: FlightSearchMeta;
  hackerFareCandidates?: {
    outbound?: Flight[];
    inbound?: Flight[];
  };
}

interface SearchApiFailure {
  success: false;
  error?: string;
}

type SearchApiResponse = SearchApiSuccess | SearchApiFailure;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function normalizeIata(code: string): string {
  return code.trim().toUpperCase();
}

function normalizeCurrency(currency?: string): string | undefined {
  return currency?.trim().toUpperCase();
}

function validateOptions(options: UseFlightSearchOptions): string | null {
  const origin = normalizeIata(options.origin);
  const destination = normalizeIata(options.destination);

  if (!origin) return "Origin is required.";
  if (!destination) return "Destination is required.";
  if (!options.departDate) return "Departure date is required.";

  if (origin.length !== 3) {
    return "Origin must be a valid 3-letter IATA code.";
  }

  if (destination.length !== 3) {
    return "Destination must be a valid 3-letter IATA code.";
  }

  if ((options.passengers ?? 1) < 1) {
    return "Passengers must be at least 1.";
  }

  return null;
}

function buildSearchParams(options: UseFlightSearchOptions): URLSearchParams {
  const params = new URLSearchParams({
    origin: normalizeIata(options.origin),
    destination: normalizeIata(options.destination),
    departDate: options.departDate,
  });

  if (options.returnDate) {
    params.set("returnDate", options.returnDate);
  }

  if (typeof options.passengers === "number") {
    params.set("passengers", String(options.passengers));
  }

  const normalizedCurrency = normalizeCurrency(options.currency);
  if (normalizedCurrency) {
    params.set("currency", normalizedCurrency);
  }

  if (options.nonStopOnly) {
    params.set("nonStopOnly", "true");
  }

  return params;
}

function getFlightPrice(flight: Flight): number {
  const value = Number((flight as any)?.price?.total);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function sortMergedResults(
  normalFlights: Flight[],
  hackerFareFlights: HackerFareCombination[],
  sortBy: FlightSortOption
): SearchResultItem[] {
  const sortedNormal = sortFlights(normalFlights, sortBy);

  const sortedHacker = [...hackerFareFlights].sort((a, b) => {
    if (sortBy === "cheapest") return a.totalPrice - b.totalPrice;
    if (sortBy === "fastest") return a.airTravelMinutes - b.airTravelMinutes;
    return b.score - a.score || a.totalPrice - b.totalPrice;
  });

  const recommendedSafeHackers = sortedHacker.filter(
    (item) => item.isRecommended && item.riskLevel !== "high"
  );
  const otherHackers = sortedHacker.filter(
    (item) => !(item.isRecommended && item.riskLevel !== "high")
  );

  return [...sortedNormal, ...recommendedSafeHackers, ...otherHackers];
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useFlightSearch(
  options: UseFlightSearchOptions
): UseFlightSearchResult {
  const [rawFlights, setRawFlights] = useState<Flight[]>([]);
  const [hackerFareCandidates, setHackerFareCandidates] = useState<{
    outbound: Flight[];
    inbound: Flight[];
  }>({
    outbound: [],
    inbound: [],
  });
  const [meta, setMeta] = useState<FlightSearchMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedAt, setSearchedAt] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<FlightFilterInput>({});
  const [sortBy, setSortBy] = useState<FlightSortOption>("smartMix");

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const validationError = useMemo(
    () => validateOptions(options),
    [
      options.origin,
      options.destination,
      options.departDate,
      options.returnDate,
      options.passengers,
      options.currency,
      options.nonStopOnly,
    ]
  );

  const performSearch = useCallback(async (): Promise<void> => {
    setHasSearched(true);

    if (validationError) {
      abortControllerRef.current?.abort();
      setLoading(false);
      setError(validationError);
      setRawFlights([]);
      setHackerFareCandidates({ outbound: [], inbound: [] });
      setMeta(null);
      setSearchedAt(null);
      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const params = buildSearchParams(options);
      const response = await fetch(`/api/flights/search?${params.toString()}`, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      let data: SearchApiResponse | null = null;

      try {
        data = (await response.json()) as SearchApiResponse;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          (data && "error" in data && data.error) ||
          `HTTP ${response.status}: Flight search failed`;
        throw new Error(message);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Unknown server error");
      }

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const nextFlights = Array.isArray(data.flights) ? data.flights : [];
      const nextMeta = data.meta ?? null;
      const nextSearchedAt = data.meta?.searchedAt ?? null;
      const nextOutboundCandidates = Array.isArray(data.hackerFareCandidates?.outbound)
        ? data.hackerFareCandidates?.outbound
        : [];
      const nextInboundCandidates = Array.isArray(data.hackerFareCandidates?.inbound)
        ? data.hackerFareCandidates?.inbound
        : [];

      setRawFlights(nextFlights);
      setHackerFareCandidates({
        outbound: nextOutboundCandidates,
        inbound: nextInboundCandidates,
      });
      setMeta(nextMeta);
      setSearchedAt(nextSearchedAt);
      setError(null);
    } catch (err: unknown) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const message =
        err instanceof Error ? err.message : "Failed to fetch flights";

      setError(message);
      setRawFlights([]);
      setHackerFareCandidates({ outbound: [], inbound: [] });
      setMeta(null);
      setSearchedAt(null);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [
    options.origin,
    options.destination,
    options.departDate,
    options.returnDate,
    options.passengers,
    options.currency,
    options.nonStopOnly,
    validationError,
  ]);

  useEffect(() => {
    if (options.enabled === false) return;
    void performSearch();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [performSearch, options.enabled]);

  const normalFlights = useMemo(() => {
    if (!rawFlights.length) return [];
    const filtered = applyFlightFilters(rawFlights, filters);
    return sortFlights(filtered, sortBy);
  }, [rawFlights, filters, sortBy]);

  const cheapestProtectedRoundTripPrice = useMemo(() => {
    if (!rawFlights.length || !options.returnDate) return null;

    const prices = rawFlights
      .map(getFlightPrice)
      .filter((value) => Number.isFinite(value));

    return prices.length ? Math.min(...prices) : null;
  }, [rawFlights, options.returnDate]);

  const hackerFareFlights = useMemo(() => {
    if (!options.returnDate) return [];

    const outboundFlights = hackerFareCandidates.outbound ?? [];
    const inboundFlights = hackerFareCandidates.inbound ?? [];

    if (!outboundFlights.length || !inboundFlights.length) {
      return [];
    }

    return findHackerFares(outboundFlights, inboundFlights, {
      limit: 20,
      minScore: 55,
      minDestinationStayMinutes: 180,
      strictAirportMatch: true,
      cheapestProtectedRoundTripPrice:
        cheapestProtectedRoundTripPrice ?? undefined,
      candidatePoolSize: 25,
    });
  }, [
    options.returnDate,
    hackerFareCandidates,
    cheapestProtectedRoundTripPrice,
  ]);

  const flights = useMemo(() => {
    return sortMergedResults(normalFlights, hackerFareFlights, sortBy);
  }, [normalFlights, hackerFareFlights, sortBy]);

  const bestFlights = useMemo(
    () => sortFlights(normalFlights, "smartMix"),
    [normalFlights]
  );

  const cheapestFlights = useMemo(
    () => sortFlights(normalFlights, "cheapest"),
    [normalFlights]
  );

  const fastestFlights = useMemo(
    () => sortFlights(normalFlights, "fastest"),
    [normalFlights]
  );

  const refetch = useCallback(async (): Promise<void> => {
    await performSearch();
  }, [performSearch]);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const resetSortBy = useCallback(() => {
    setSortBy("smartMix");
  }, []);

  const clearSearch = useCallback(() => {
    abortControllerRef.current?.abort();
    requestIdRef.current += 1;

    setRawFlights([]);
    setHackerFareCandidates({ outbound: [], inbound: [] });
    setMeta(null);
    setError(null);
    setSearchedAt(null);
    setHasSearched(false);
    setFilters({});
    setSortBy("smartMix");
    setLoading(false);
  }, []);

  const isEmpty = hasSearched && !loading && !error && flights.length === 0;

  return {
    rawFlights,
    hackerFareFlights,
    meta,

    flights,
    normalFlights,
    bestFlights,
    cheapestFlights,
    fastestFlights,

    filters,
    sortBy,
    setFilters,
    setSortBy,
    resetFilters,
    resetSortBy,

    refetch,
    clearSearch,

    loading,
    error,
    searchedAt,
    hasSearched,
    isEmpty,
    cheapestProtectedRoundTripPrice,
  };
}

export default useFlightSearch;
