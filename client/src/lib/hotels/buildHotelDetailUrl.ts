import { buildHotelSearchParams } from "@shared/hotels/searchParams";
import type { HotelSearchParams } from "@shared/hotels/types";

export function buildHotelDetailUrl(input: {
  hotelId: string;
  query: HotelSearchParams;
}): string {
  const params = buildHotelSearchParams(input.query);
  return `/hotels/detail/${encodeURIComponent(input.hotelId)}?${params.toString()}`;
}
