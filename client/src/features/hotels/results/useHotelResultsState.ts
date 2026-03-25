import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sortHotels } from "@/lib/hotels/formatters";
import { fetchMockHotels } from "@/lib/hotels/mockHotels";
import type {
  HotelFilterId,
  HotelFilterOption,
  HotelItem,
  HotelResultsQuery,
  HotelSort,
} from "@/types/hotels";

export const HOTEL_FILTER_OPTIONS: HotelFilterOption[] = [
  { id: "free_breakfast", label: "Free breakfast", description: "Breakfast included" },
  { id: "free_cancellation", label: "Free cancellation", description: "Flexible cancellation" },
  { id: "pay_later", label: "Reserve now, pay later", description: "Pay at hotel" },
  { id: "highly_rated", label: "Rating 8+", description: "Guest review score 8+" },
  { id: "budget", label: "Budget < $100", description: "Price under $100/night" },
  { id: "luxury", label: "Luxury 5-star", description: "5-star properties" },
];

export const HOTEL_SORT_OPTIONS: Array<{ value: HotelSort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "price_low_to_high", label: "Price: low to high" },
  { value: "price_high_to_low", label: "Price: high to low" },
  { value: "rating_high_to_low", label: "Rating" },
  { value: "stars_high_to_low", label: "Stars" },
];

interface UseHotelResultsStateValue {
  isLoading: boolean;
  errorMessage: string | null;
  allHotels: HotelItem[];
  visibleHotels: HotelItem[];
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

function applyFilters(hotels: HotelItem[], activeFilters: HotelFilterId[]): HotelItem[] {
  return hotels.filter((hotel) =>
    activeFilters.every((filterId) => {
      switch (filterId) {
        case "free_breakfast":
          return hotel.isFreeBreakfast;
        case "free_cancellation":
          return hotel.isFreeCancellation;
        case "pay_later":
          return hotel.isPayLater;
        case "highly_rated":
          return hotel.review.score >= 8;
        case "budget":
          return hotel.pricePerNight.amount < 100;
        case "luxury":
          return hotel.starRating >= 5;
        default:
          return true;
      }
    }),
  );
}

export function useHotelResultsState(query: HotelResultsQuery): UseHotelResultsStateValue {
  const [allHotels, setAllHotels] = useState<HotelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sort, setSort] = useState<HotelSort>("recommended");
  const [activeFilters, setActiveFilters] = useState<HotelFilterId[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadHotels = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetchMockHotels(query, signal);
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
    const filtered = applyFilters(allHotels, activeFilters);
    return sortHotels(filtered, sort);
  }, [allHotels, activeFilters, sort]);

  useEffect(() => {
    if (!visibleHotels.length) {
      setSelectedHotelId(null);
      return;
    }

    setSelectedHotelId((current) => {
      if (current && visibleHotels.some((hotel) => hotel.id === current)) {
        return current;
      }
      return visibleHotels[0]?.id ?? null;
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
