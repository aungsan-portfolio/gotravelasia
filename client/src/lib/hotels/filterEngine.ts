import type { HotelFilterId } from "@/types/hotels";
import type { HotelResult } from "@shared/hotels/types";

export interface HotelRichFilters {
  priceRange?: {
    min?: number;
    max?: number;
  };
  starRatings?: number[];
  minGuestRating?: number;
  amenities?: string[];
}

export interface ApplyHotelFiltersInput {
  hotels: HotelResult[];
  quickFilters?: HotelFilterId[];
  richFilters?: HotelRichFilters;
}

function normalizeAmenity(value: string): string {
  return value.trim().toLowerCase();
}

function passesQuickFilters(hotel: HotelResult, quickFilters: HotelFilterId[]): boolean {
  return quickFilters.every((filterId) => {
    switch (filterId) {
      case "free_breakfast":
        return (hotel.amenities ?? []).some((a) => a.toLowerCase().includes("breakfast"));
      case "free_cancellation":
        return true;
      case "pay_later":
        return true;
      case "highly_rated":
        return hotel.reviewScore >= 8;
      case "budget":
        return hotel.lowestRate < 100;
      case "luxury":
        return hotel.stars >= 5;
      default:
        return true;
    }
  });
}

function passesRichFilters(hotel: HotelResult, richFilters: HotelRichFilters): boolean {
  if (richFilters.priceRange) {
    const { min, max } = richFilters.priceRange;
    if (typeof min === "number" && hotel.lowestRate < min) {
      return false;
    }
    if (typeof max === "number" && hotel.lowestRate > max) {
      return false;
    }
  }

  if (richFilters.starRatings?.length && !richFilters.starRatings.includes(hotel.stars)) {
    return false;
  }

  if (typeof richFilters.minGuestRating === "number" && hotel.reviewScore < richFilters.minGuestRating) {
    return false;
  }

  if (richFilters.amenities?.length) {
    const hotelAmenities = new Set((hotel.amenities ?? []).map(normalizeAmenity));
    const requiredAmenities = richFilters.amenities.map(normalizeAmenity);

    const hasAllAmenities = requiredAmenities.every((amenity) => hotelAmenities.has(amenity));
    if (!hasAllAmenities) {
      return false;
    }
  }

  return true;
}

export function applyHotelFilters({
  hotels,
  quickFilters = [],
  richFilters,
}: ApplyHotelFiltersInput): HotelResult[] {
  if (!quickFilters.length && !richFilters) {
    return hotels;
  }

  return hotels.filter((hotel) => {
    if (!passesQuickFilters(hotel, quickFilters)) {
      return false;
    }

    if (richFilters && !passesRichFilters(hotel, richFilters)) {
      return false;
    }

    return true;
  });
}
