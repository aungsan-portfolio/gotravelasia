import type { HotelSearchParams } from "@shared/hotels/types";
import {
  HOTEL_FILTER_OPTIONS,
  HOTEL_SORT_OPTIONS,
  useHotelSearch,
  type UseHotelSearchResult,
} from "@/hooks/useHotelSearch";

/**
 * @deprecated
 * Use `useHotelSearch` from `client/src/hooks/useHotelSearch.ts` for all new work.
 *
 * This wrapper exists so the current hotel results page and older toolbar imports
 * continue to work without a larger refactor in the same commit.
 */
export { HOTEL_FILTER_OPTIONS, HOTEL_SORT_OPTIONS };

export function useHotelResultsState(query: HotelSearchParams): UseHotelSearchResult {
  return useHotelSearch(query);
}
