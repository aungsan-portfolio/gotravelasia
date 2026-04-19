import { buildHotelSearchParams } from "@shared/hotels/searchParams";
import type { HotelSearchParams } from "@shared/hotels/types";
import { buildCanonicalHotelPath } from "@shared/hotels/canonicalPattern";

export interface HotelRouteMeta {
  destinationLabel?: string;
  placeId?: string;
  view?: "list" | "map";
  extraQuery?: Record<string, string>;
}

export function buildHotelRouteUrl(input: {
  query: HotelSearchParams;
  routeMode: "canonical" | "legacy";
  routeMeta?: HotelRouteMeta | null;
}): string {
  const legacyParams = buildHotelSearchParams(input.query);

  // Use canonical fallback ONLY if we at least have a destinationLabel
  // (placeId is optional for valid SEO URLs)
  if (input.routeMode === "canonical" && input.routeMeta?.destinationLabel) {
    
    // Only append page to the extra query if it's > 1
    const pageQuery = input.query.page > 1 ? { page: String(input.query.page) } : {};
    
    const finalExtraQuery = {
      ...(input.routeMeta.extraQuery || {}),
      ...pageQuery
    };

    return buildCanonicalHotelPath({
      destinationLabel: input.routeMeta.destinationLabel,
      placeId: input.routeMeta.placeId,
      checkIn: input.query.checkIn,
      checkOut: input.query.checkOut,
      adults: input.query.adults,
      rooms: input.query.rooms,
      view: input.routeMeta.view,
      sort: input.query.sort,
      extraQuery: finalExtraQuery,
    });
  }

  // Fallback to legacy query string if canonical requirements are missing
  return `/hotels?${legacyParams.toString()}`;
}
