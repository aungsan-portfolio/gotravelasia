import type {
  HotelDetailResponse,
  HotelResult,
  HotelSearchParams,
  HotelSearchResponse,
} from "@shared/hotels/types";
import { buildHotelSearchParams } from "@shared/hotels/searchParams";

async function getSafeErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown; message?: unknown };
    const candidate = typeof payload?.error === "string" ? payload.error : typeof payload?.message === "string" ? payload.message : "";
    const normalized = candidate.trim();
    return normalized || fallback;
  } catch {
    return fallback;
  }
}

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
    throw new Error(await getSafeErrorMessage(response, "Unable to load hotel results."));
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
    throw new Error(await getSafeErrorMessage(response, "Unable to load hotel details."));
  }

  return response.json() as Promise<HotelDetailResponse>;
}
