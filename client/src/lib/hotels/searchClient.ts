import type {
  HotelResult,
  HotelSearchParams,
  HotelSearchResponse,
} from "@shared/hotels/types";
import { buildHotelSearchParams } from "@shared/hotels/searchParams";

/**
 * Executes a hotel search against the API.
 */
export async function searchHotels(
  query: HotelSearchParams,
  signal?: AbortSignal,
): Promise<HotelSearchResponse> {
  const queryParams = buildHotelSearchParams(query);

  const response = await fetch(`/api/hotels/search?${queryParams.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Unable to load hotel results.");
  }

  return response.json() as Promise<HotelSearchResponse>;
}

/**
 * Searches for a specific hotel within a city-wide search result.
 * Useful as a fallback when direct detail lookup is unavailable.
 */
export async function findHotelInSearchResults(
  query: HotelSearchParams,
  hotelId: string,
  signal?: AbortSignal,
): Promise<HotelResult | null> {
  const payload = await searchHotels(query, signal);
  return payload.hotels.find((hotel) => hotel.hotelId === hotelId) ?? null;
}
