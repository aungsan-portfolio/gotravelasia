import type {
  HotelSearchParams,
  HotelSearchResponse,
} from "@shared/hotels/types";
import { buildHotelSearchParams } from "@shared/hotels/searchParams";

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
