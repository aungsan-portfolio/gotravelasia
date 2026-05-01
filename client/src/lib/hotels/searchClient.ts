import type {
  HotelDetailResponse,
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
  const payload = await getHotelDetail(query, hotelId, signal);
  return payload.hotel;
}

/**
 * Returns one hotel by id using the server-side normalized search results.
 */
export async function getHotelDetail(
  query: HotelSearchParams,
  hotelId: string,
  signal?: AbortSignal,
): Promise<HotelDetailResponse> {
  const queryParams = buildHotelSearchParams(query);
  const encodedHotelId = encodeURIComponent(hotelId);

  const response = await fetch(
    `/api/hotels/detail/${encodedHotelId}?${queryParams.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Unable to load hotel details.");
  }

  return response.json() as Promise<HotelDetailResponse>;
}
