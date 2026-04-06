import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import type { HotelFilterId, HotelFilterOption } from "@/types/hotels";
import type { HotelResult, HotelSearchParams, HotelSearchResponse, HotelSort } from "@shared/hotels/types";
import { buildHotelSearchParams } from "@shared/hotels/searchParams";

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

interface UseHotelResultsStateValue {
  isLoading: boolean;
  errorMessage: string | null;
  allHotels: HotelResult[];
  visibleHotels: HotelResult[];
  sort: HotelSort;
  activeFilters: HotelFilterId[];
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  totalFound: number;
  setSort: (value: HotelSort) => void;
  toggleFilter: (filterId: HotelFilterId) => void;
  clearFilters: () => void;
  retry: () => void;
  setSelectedHotelId: (hotelId: string | null) => void;
  setHoveredHotelId: (hotelId: string | null) => void;
}

function applyFilters(hotels: HotelResult[], activeFilters: HotelFilterId[]): HotelResult[] {
  return hotels.filter((hotel) =>
    activeFilters.every((filterId) => {
      switch (filterId) {
        case "free_breakfast":
          return hotel.amenities.some(a => a.toLowerCase().includes("breakfast"));
        case "free_cancellation":
          return true; // Live API filters to be implemented
        case "pay_later":
          return true; // Live API filters to be implemented
        case "highly_rated":
          return hotel.reviewScore >= 8;
        case "budget":
          return hotel.lowestRate < 100;
        case "luxury":
          return hotel.stars >= 5;
        default:
          return true;
      }
    }),
  );
}

export function useHotelResultsState(query: HotelSearchParams): UseHotelResultsStateValue {
  const [allHotels, setAllHotels] = useState<HotelResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sort, setSortState] = useState<HotelSort>(query.sort || "rank");
  const [activeFilters, setActiveFilters] = useState<HotelFilterId[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const [_, setLocation] = useLocation();

  const loadHotels = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const queryParams = buildHotelSearchParams(query);
        const resp = await fetch(`/api/hotels/search?${queryParams.toString()}`, { signal });
        
        if (!resp.ok) {
          throw new Error("Unable to load hotel results.");
        }
        const response = (await resp.json()) as HotelSearchResponse;
        
        if (requestId !== requestIdRef.current) {
          return;
        }
        setAllHotels(response.hotels);
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

  const visibleHotels = useMemo(() => {
    return applyFilters(allHotels, activeFilters);
  }, [allHotels, activeFilters]);

  useEffect(() => {
    if (!visibleHotels.length) {
      setSelectedHotelId(null);
      return;
    }

    setSelectedHotelId((current) => {
      if (current && visibleHotels.some((hotel) => hotel.hotelId === current)) {
        return current;
      }
      return visibleHotels[0]?.hotelId ?? null;
    });
  }, [visibleHotels]);

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

  const setSort = useCallback((newSort: HotelSort) => {
    setSortState(newSort);
    const newParams = buildHotelSearchParams({ ...query, sort: newSort });
    setLocation(`/hotels?${newParams.toString()}`);
  }, [query, setLocation]);

  return {
    isLoading,
    errorMessage,
    allHotels,
    visibleHotels,
    sort,
    activeFilters,
    selectedHotelId,
    hoveredHotelId,
    totalFound: visibleHotels.length,
    setSort,
    toggleFilter,
    clearFilters,
    retry,
    setSelectedHotelId,
    setHoveredHotelId,
  };
}
