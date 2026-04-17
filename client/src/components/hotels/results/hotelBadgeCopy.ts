import type { HotelResult } from "@shared/hotels/types";

export type LightweightHotelBadgeId =
  | "recommended"
  | "guest_favorite"
  | "budget_pick";

export interface LightweightHotelBadge {
  id: LightweightHotelBadgeId;
  label: string;
  description: string;
  className: string;
}

function hasBreakfastAmenity(hotel: HotelResult): boolean {
  return hotel.amenities.some((amenity) =>
    amenity.toLowerCase().includes("breakfast"),
  );
}

export function getLightweightHotelBadges(
  hotel: HotelResult,
  max = 2,
): LightweightHotelBadge[] {
  const badges: LightweightHotelBadge[] = [];

  if (hotel.rankingPosition === 1) {
    badges.push({
      id: "recommended",
      label: "Recommended",
      description:
        "This property is currently the top-ranked result in the visible hotel set.",
      className:
        "rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700",
    });
  }

  if (hotel.reviewScore >= 8.5 && hotel.reviewCount >= 500) {
    badges.push({
      id: "guest_favorite",
      label: "Guest favorite",
      description:
        "Strong guest rating backed by a healthy number of reviews.",
      className:
        "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700",
    });
  }

  if (hotel.lowestRate > 0 && hotel.lowestRate < 100) {
    badges.push({
      id: "budget_pick",
      label: "Budget pick",
      description:
        "A lower nightly price than many alternatives in this search range.",
      className:
        "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700",
    });
  }

  return badges.slice(0, max);
}

export function getPrimaryHotelExplanation(hotel: HotelResult): string | null {
  if (hotel.rankingPosition === 1) {
    return "A strong all-around option based on the current hotel ranking order.";
  }

  if (hotel.reviewScore >= 8.5 && hotel.reviewCount >= 500) {
    return "Guests rate this property highly, and the review volume makes that signal more trustworthy.";
  }

  if (hotel.lowestRate > 0 && hotel.lowestRate < 100) {
    return "A lower nightly rate makes this a practical pick if price matters most.";
  }

  if (hotel.stars >= 5) {
    return "A higher-end stay option if comfort and property quality are your priority.";
  }

  if (hasBreakfastAmenity(hotel)) {
    return "Includes breakfast-related amenities, which may add convenience and value.";
  }

  return null;
}
