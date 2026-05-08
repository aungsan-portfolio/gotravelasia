import type { HotelSearchSource } from "@shared/hotels/types";

interface BuildHotelOutboundRedirectUrlParams {
  provider: HotelSearchSource;
  targetUrl?: string;
  hotelId?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  sort?: string;
  resultPosition?: number;
}

/**
 * Builds a trackable outbound redirect URL for hotel partners.
 * Simplified version for internal routing.
 * Format: /hotels/out/[provider]?url=[encoded_target_url]&...metadata
 */
export function buildHotelOutboundRedirectUrl({
  provider,
  targetUrl,
  hotelId,
  city,
  checkIn,
  checkOut,
  sort,
  resultPosition,
}: BuildHotelOutboundRedirectUrlParams): string | undefined {
  if (!targetUrl) {
    return undefined;
  }

  const params = new URLSearchParams({ url: targetUrl });

  if (hotelId) params.set("hotelId", hotelId);
  if (city) params.set("city", city);
  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);
  if (sort) params.set("sort", sort);
  if (typeof resultPosition === "number")
    params.set("position", String(resultPosition));

  return `/hotels/out/${provider}?${params.toString()}`;
}
