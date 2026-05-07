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
import { applyHotelFilters, type HotelRichFilters } from "@/lib/hotels/filterEngine";
import { sortHotelsByRankingScore } from "@/lib/hotels/rankingScore";
import { buildHotelRouteUrl, type HotelRouteMeta } from "@/lib/hotels/buildHotelRouteUrl";
import { searchHotels } from "@/lib/hotels/searchClient";
import {
  trackHotelFilterApply,
  trackHotelFilterClear,
  trackHotelSortChange,
} from "@/lib/hotels/tracking";

export const HOTEL_FILTER_OPTIONS: HotelFilterOption[] = [
  { id: "free_breakfast", label: "Free breakfast", description: "Breakfast included" },
  { id: "free_cancellation", label: "Free cancellation", description: "Flexible cancellation" },
  { id: "pay_later", label: "Reserve now, pay later", description: "Pay at hotel" },
  { id: "highly_rated", label: "Rating 8+", description: "Guest review score 8+" },
  { id: "budget", label: "Budget < $100", description: "Price under $100/night" },
  { id: "luxury", label: "Luxury 5-star", description: "5-star properties" },
];

export const HOTEL_SORT_OPTIONS: Array<{ value: HotelSort; label: string }> = [
  { value: "best", label: "Best" },
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
  richFilters: HotelRichFilters;
  currentPage: number;
  totalPages: number;
  setSort: (value: HotelSort) => void;
  setPage: (value: number) => void;
  toggleFilter: (filterId: HotelFilterId) => void;
  setPriceRange: (range: HotelRichFilters["priceRange"]) => void;
  toggleStarRating: (stars: number) => void;
  setMinGuestRating: (rating?: number) => void;
  toggleAmenity: (amenity: string) => void;
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
  const [sort, setSortState] = useState<HotelSort>(query.sort || "best");
  const [activeFilters, setActiveFilters] = useState<HotelFilterId[]>([]);
  const [richFilters, setRichFilters] = useState<HotelRichFilters>({});

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
        const payload = await searchHotels(query, signal);

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
    setSortState(query.sort || "best");
  }, [query.sort]);

  const visibleHotels = useMemo(() => {
    const filteredHotels = applyHotelFilters({
      hotels: allHotels,
      quickFilters: activeFilters,
      richFilters,
    });

    switch (sort) {
      case "best":
        return sortHotelsByRankingScore(filteredHotels);
      case "price_asc":
        return [...filteredHotels].sort(
          (a, b) =>
            (a.lowestRate || Number.MAX_SAFE_INTEGER) -
            (b.lowestRate || Number.MAX_SAFE_INTEGER),
        );
      case "price_desc":
        return [...filteredHotels].sort(
          (a, b) => (b.lowestRate || 0) - (a.lowestRate || 0),
        );
      case "review_desc":
        return [...filteredHotels].sort(
          (a, b) =>
            (b.reviewScore || 0) - (a.reviewScore || 0) ||
            (b.reviewCount || 0) - (a.reviewCount || 0),
        );
      case "stars_desc":
        return [...filteredHotels].sort(
          (a, b) =>
            (b.stars || 0) - (a.stars || 0) ||
            (b.reviewScore || 0) - (a.reviewScore || 0),
        );
      case "rank":
      default:
        return filteredHotels;
    }
  }, [allHotels, activeFilters, richFilters, sort]);

  const toggleFilter = useCallback((filterId: HotelFilterId) => {
    trackHotelFilterApply({
      city: query.city,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      filterId,
      filterType: "quick",
      source: "hotel_results",
    });

    setActiveFilters((current) =>
      current.includes(filterId)
        ? current.filter((item) => item !== filterId)
        : [...current, filterId],
    );
  }, [query.checkIn, query.checkOut, query.city]);

  const clearFilters = useCallback(() => {
    trackHotelFilterClear({
      city: query.city,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      source: "hotel_results",
    });
    setActiveFilters([]);
    setRichFilters({});
  }, [query.checkIn, query.checkOut, query.city]);

  const setPriceRange = useCallback(
    (range: HotelRichFilters["priceRange"]) => {
      trackHotelFilterApply({
        city: query.city,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        filterType: "price_range",
        filters: { priceRange: range },
        source: "hotel_results",
      });
      setRichFilters((current) => ({ ...current, priceRange: range }));
    },
    [query.checkIn, query.checkOut, query.city],
  );

  const toggleStarRating = useCallback(
    (stars: number) => {
      trackHotelFilterApply({
        city: query.city,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        filterType: "star_rating",
        filterValue: stars,
        source: "hotel_results",
      });
      setRichFilters((current) => {
        const currentStars = current.starRatings ?? [];
        return {
          ...current,
          starRatings: currentStars.includes(stars)
            ? currentStars.filter((value) => value !== stars)
            : [...currentStars, stars],
        };
      });
    },
    [query.checkIn, query.checkOut, query.city],
  );

  const setMinGuestRating = useCallback(
    (rating?: number) => {
      trackHotelFilterApply({
        city: query.city,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        filterType: "guest_rating",
        filterValue: rating ?? "clear",
        source: "hotel_results",
      });
      setRichFilters((current) => ({ ...current, minGuestRating: rating }));
    },
    [query.checkIn, query.checkOut, query.city],
  );

  const toggleAmenity = useCallback(
    (amenity: string) => {
      trackHotelFilterApply({
        city: query.city,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        filterType: "amenity",
        filterValue: amenity,
        source: "hotel_results",
      });
      setRichFilters((current) => {
        const currentAmenities = current.amenities ?? [];
        return {
          ...current,
          amenities: currentAmenities.includes(amenity)
            ? currentAmenities.filter((value) => value !== amenity)
            : [...currentAmenities, amenity],
        };
      });
    },
    [query.checkIn, query.checkOut, query.city],
  );

  const retry = useCallback(() => {
    void loadHotels();
  }, [loadHotels]);

  const setSort = useCallback(
    (newSort: HotelSort) => {
      setSortState(newSort);
      trackHotelSortChange({
        city: query.city,
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        sort: newSort,
        source: "hotel_results",
      });
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
    richFilters,
    currentPage: data?.meta.page ?? query.page,
    totalPages: data?.meta.totalPages ?? 1,
    setSort,
    setPage,
    toggleFilter,
    setPriceRange,
    toggleStarRating,
    setMinGuestRating,
    toggleAmenity,
    clearFilters,
    retry,
  };
}

export default useHotelSearch;
