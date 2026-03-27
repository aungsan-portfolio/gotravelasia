/**
 * Search URL utilities for GoTravel Asia
 * Handles deep-linking and state recovery for hotel searches
 */

import { HotelSearchParams, PageType } from "../types/hotel-search.types";

export function buildHotelSearchUrl(params: HotelSearchParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("q", params.destination);
  searchParams.set("id", params.locationId);
  searchParams.set("type", params.locationType);
  searchParams.set("checkin", params.checkIn);
  searchParams.set("checkout", params.checkOut);
  searchParams.set("rooms", params.guests.rooms.toString());
  searchParams.set("adults", params.guests.adults.toString());
  searchParams.set("children", params.guests.children.toString());
  
  return `/hotels/search?${searchParams.toString()}`;
}

export function buildHotelDetailUrl(hotelId: string, params: HotelSearchParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("checkin", params.checkIn);
  searchParams.set("checkout", params.checkOut);
  searchParams.set("rooms", params.guests.rooms.toString());
  searchParams.set("adults", params.guests.adults.toString());
  searchParams.set("children", params.guests.children.toString());
  
  return `/hotels/${hotelId}?${searchParams.toString()}`;
}

export function parseHotelSearchParams(queryString: string): HotelSearchParams {
  const search = new URLSearchParams(queryString);
  
  return {
    destination:  search.get("q") || "",
    locationId:   search.get("id") || "",
    locationType: search.get("type") || "city",
    checkIn:      search.get("checkin") || "",
    checkOut:     search.get("checkout") || "",
    guests: {
      rooms:    Number(search.get("rooms")) || 1,
      adults:   Number(search.get("adults")) || 2,
      children: Number(search.get("children")) || 0,
    }
  };
}

/**
 * Resolves current page type based on location
 */
export function resolvePageType(path: string): PageType {
  if (path === "/") return PageType.FRONT_DOOR;
  if (path.startsWith("/hotels/search")) return PageType.RESULTS_PAGE;
  if (path.match(/^\/hotels\/[^/]+$/)) return PageType.DETAIL_PAGE;
  return PageType.FRONT_DOOR;
}
