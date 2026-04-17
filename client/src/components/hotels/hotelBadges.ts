import type { HotelResult } from "@shared/hotels/types";

export type HotelBadgeTone = "indigo" | "green" | "amber" | "rose" | "slate";

export interface HotelBadge {
  id: string;
  label: string;
  description: string;
  tone: HotelBadgeTone;
  priority: number;
}

function hasAmenity(hotel: HotelResult, keyword: string): boolean {
  return hotel.amenities.some((amenity) =>
    amenity.toLowerCase().includes(keyword.toLowerCase()),
  );
}

export function getHotelBadges(hotel: HotelResult, max = 3): HotelBadge[] {
  const badges: HotelBadge[] = [];

  if (hotel.rankingPosition === 1) {
    badges.push({
      id: "recommended",
      label: "Recommended",
      description: "Top-ranked result in this set.",
      tone: "indigo",
      priority: 1,
    });
  }

  if (hotel.reviewScore >= 9) {
    badges.push({
      id: "top_rated",
      label: "Top rated",
      description: "Excellent guest score.",
      tone: "amber",
      priority: 2,
    });
  } else if (hotel.reviewScore >= 8.5 && hotel.reviewCount >= 500) {
    badges.push({
      id: "guest_favorite",
      label: "Guest favorite",
      description: "Strong rating with a solid number of reviews.",
      tone: "indigo",
      priority: 3,
    });
  }

  if (hotel.stars >= 5) {
    badges.push({
      id: "luxury",
      label: "Luxury",
      description: "5-star property.",
      tone: "amber",
      priority: 4,
    });
  }

  if (hotel.lowestRate > 0 && hotel.lowestRate < 100) {
    badges.push({
      id: "budget_pick",
      label: "Budget pick",
      description: "Lower nightly rate than many alternatives.",
      tone: "green",
      priority: 5,
    });
  }

  if (hasAmenity(hotel, "breakfast")) {
    badges.push({
      id: "breakfast",
      label: "Breakfast",
      description: "Breakfast-related amenity detected.",
      tone: "green",
      priority: 6,
    });
  }

  if (hotel.coordinates && !hotel.coordinates.isFallback) {
    badges.push({
      id: "map_ready",
      label: "Map ready",
      description: "Precise hotel coordinates available.",
      tone: "slate",
      priority: 7,
    });
  }

  badges.sort((a, b) => a.priority - b.priority);

  return badges.slice(0, max);
}

export function getHotelBadgeClassName(tone: HotelBadgeTone): string {
  switch (tone) {
    case "indigo":
      return "rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700";
    case "green":
      return "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700";
    case "amber":
      return "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700";
    case "rose":
      return "rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700";
    case "slate":
    default:
      return "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700";
  }
}
