import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";

import type { HotelFilterId, HotelFilterOption } from "@/types/hotels";
import type {
  HotelOutboundLinks,
  HotelResult,
  HotelSearchMeta,
  HotelSearchParams,
  HotelSearchResponse,
  HotelSort,
} from "@shared/hotels/types";
import { buildHotelSearchParams } from "@shared/hotels/searchParams";
import { applyHotelFilters } from "@/lib/hotels/filterEngine";
import { buildHotelRouteUrl, type HotelRouteMeta } from "@/lib/hotels/buildHotelRouteUrl";

export const HOTEL_FILTER_OPTIONS: HotelFilterOption[] = [
  { id: "free_breakfast", label: "Free breakfast", description: "Breakfast included" },
  { id: "free_cancellation", label: "Free cancellation", description: "Flexible cancellation" },
  { id: "pay_later", label: "Reserve now, pay later", description: "Pay at hotel" },
  { id: "highly_rated", label: "Rating 8+", description: "Guest review score 8+" },
  { id: "budget", label: "Budget < $100", description: "Price under $100/night" },
  { id: "luxury", label: "Luxury 5-star", description: "5-star properties" },
];

export const HOTEL_SORT_OPTIONS: Array<{ value: HotelSort; label: string }> = [
  { value: "rank", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "review_desc", label: "Rating" },
  { value: "stars_desc", label: "Stars" },
];

export interface UseHotelSearchOptions {
  routeMode?: "canonical" | "legacy";
  routeMeta?: HotelRouteMeta | null;
}

export interface UseHotelSearchResult {
  isLoading: boolean;
  errorMessage: string | null;
  data: HotelSearchResponse | null;
  meta: HotelSearchMeta | null;
  affiliateLinks: HotelOutboundLinks | null;
  allHotels: HotelResult[];
  visibleHotels: HotelResult[];
  sort: HotelSort;
  activeFilters: HotelFilterId[];
  totalFound: number;
  currentPage: number;
  totalPages: number;
  setSort: (value: HotelSort) => void;
  setPage: (value: number) => void;
  toggleFilter: (filterId: HotelFilterId) => void;
  clearFilters: () => void;
  retry: () => void;
}


/**
 * Canonical hotel search hook.
 */
export function useHotelSearch(
  query: HotelSearchParams,
  options: UseHotelSearchOptions = {},
): UseHotelSearchResult {
  const [data, setData] = useState<HotelSearchResponse | null>(null);
  const [allHotels, setAllHotels] = useState<HotelResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sort, setSortState] = useState<HotelSort>(query.sort || "rank");
  const [activeFilters, setActiveFilters] = useState<HotelFilterId[]>([]);

  const routeMode = options.routeMode ?? "legacy";
  const routeMeta = options.routeMeta ?? null;

  const requestIdRef = useRef(0);
  const [, setLocation] = useLocation();

  const loadHotels = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const queryParams = buildHotelSearchParams(query);
        const response = await fetch(`/api/hotels/search?${queryParams.toString()}`, {
          signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load hotel results.");
        }

        const payload = (await response.json()) as HotelSearchResponse;

        if (requestId !== requestIdRef.current) {
          return;
        }

        setData(payload);
        setAllHotels(payload.hotels);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load hotel results.",
        );
        setData(null);
        setAllHotels([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [query],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadHotels(controller.signal);
    return () => controller.abort();
  }, [loadHotels]);

  useEffect(() => {
    setSortState(query.sort || "rank");
  }, [query.sort]);

  const visibleHotels = useMemo(() => {
    return applyHotelFilters({ hotels: allHotels, quickFilters: activeFilters });
  }, [allHotels, activeFilters]);

  const toggleFilter = useCallback((filterId: HotelFilterId) => {
    setActiveFilters((current) =>
      current.includes(filterId)
        ? current.filter((item) => item !== filterId)
        : [...current, filterId],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  const retry = useCallback(() => {
    void loadHotels();
  }, [loadHotels]);

  const setSort = useCallback(
    (newSort: HotelSort) => {
      setSortState(newSort);
      setLocation(
        buildHotelRouteUrl({
          query: { ...query, page: 1, sort: newSort },
          routeMode,
          routeMeta,
        }),
      );
    },
    [query, routeMeta, routeMode, setLocation],
  );

  const setPage = useCallback(
    (newPage: number) => {
      const safePage = Math.max(1, newPage);
      setLocation(
        buildHotelRouteUrl({
          query: { ...query, page: safePage },
          routeMode,
          routeMeta,
        }),
      );
    },
    [query, routeMeta, routeMode, setLocation],
  );

  return {
    isLoading,
    errorMessage,
    data,
    meta: data?.meta ?? null,
    affiliateLinks: data?.affiliateLinks ?? null,
    allHotels,
    visibleHotels,
    sort,
    activeFilters,
    totalFound: visibleHotels.length,
    currentPage: data?.meta.page ?? query.page,
    totalPages: data?.meta.totalPages ?? 1,
    setSort,
    setPage,
    toggleFilter,
    clearFilters,
    retry,
  };
}

export default useHotelSearch;
