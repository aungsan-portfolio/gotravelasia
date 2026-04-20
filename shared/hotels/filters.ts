export interface HotelPriceRangeFilter {
  min: number;
  max: number;
}

export interface HotelFilters {
  priceRange?: HotelPriceRangeFilter;
  starRatings?: number[];
  minGuestRating?: number;
  amenities?: string[];
}

export function isHotelFiltersEmpty(
  filters: HotelFilters | null | undefined,
): boolean {
  if (!filters) return true;

  const hasPriceRange =
    !!filters.priceRange &&
    (Number.isFinite(filters.priceRange.min) ||
      Number.isFinite(filters.priceRange.max));

  const hasStarRatings =
    Array.isArray(filters.starRatings) && filters.starRatings.length > 0;

  const hasMinGuestRating = typeof filters.minGuestRating === "number";

  const hasAmenities =
    Array.isArray(filters.amenities) &&
    filters.amenities.some((amenity) => amenity.trim().length > 0);

  return !(
    hasPriceRange ||
    hasStarRatings ||
    hasMinGuestRating ||
    hasAmenities
  );
}
