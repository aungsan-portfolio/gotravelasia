import type { LucideIcon } from "lucide-react";
import {
  Bath,
  BedDouble,
  Building2,
  CarFront,
  Coffee,
  Dumbbell,
  Plane,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Tv,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react";

export interface HotelAmenityVisual {
  label: string;
  Icon: LucideIcon;
  priority: number;
}

const DEFAULT_AMENITY_VISUAL: HotelAmenityVisual = {
  label: "Amenity",
  Icon: Building2,
  priority: 0,
};

function normalizeAmenityName(value: string): string {
  return value.trim().toLowerCase();
}

export function getHotelAmenityVisual(amenity: string): HotelAmenityVisual {
  const normalized = normalizeAmenityName(amenity);

  if (normalized.includes("wifi") || normalized.includes("wi-fi") || normalized.includes("internet")) {
    return { label: "Wi-Fi", Icon: Wifi, priority: 100 };
  }

  if (normalized.includes("pool") || normalized.includes("swimming")) {
    return { label: "Pool", Icon: Waves, priority: 95 };
  }

  if (normalized.includes("breakfast")) {
    return { label: "Breakfast", Icon: Coffee, priority: 92 };
  }

  if (normalized.includes("parking")) {
    return { label: "Parking", Icon: CarFront, priority: 88 };
  }

  if (normalized.includes("gym") || normalized.includes("fitness")) {
    return { label: "Gym", Icon: Dumbbell, priority: 84 };
  }

  if (normalized.includes("spa") || normalized.includes("wellness") || normalized.includes("massage")) {
    return { label: "Spa", Icon: Sparkles, priority: 82 };
  }

  if (
    normalized.includes("restaurant") ||
    normalized.includes("dining") ||
    normalized.includes("bar") ||
    normalized.includes("food")
  ) {
    return { label: "Dining", Icon: UtensilsCrossed, priority: 80 };
  }

  if (normalized.includes("airport") || normalized.includes("shuttle")) {
    return { label: "Airport shuttle", Icon: Plane, priority: 76 };
  }

  if (normalized.includes("family")) {
    return { label: "Family friendly", Icon: BedDouble, priority: 72 };
  }

  if (normalized.includes("air conditioning") || normalized.includes("aircon") || normalized === "ac") {
    return { label: "A/C", Icon: Snowflake, priority: 70 };
  }

  if (normalized.includes("tv") || normalized.includes("television")) {
    return { label: "TV", Icon: Tv, priority: 64 };
  }

  if (normalized.includes("security") || normalized.includes("safe")) {
    return { label: "Secure", Icon: ShieldCheck, priority: 60 };
  }

  if (normalized.includes("bath") || normalized.includes("tub")) {
    return { label: "Bath", Icon: Bath, priority: 55 };
  }

  return {
    ...DEFAULT_AMENITY_VISUAL,
    label: amenity,
  };
}

export function prioritizeAmenities(amenities: string[], max = 4): string[] {
  const uniqueAmenities = Array.from(
    new Map(
      amenities
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => [normalizeAmenityName(item), item]),
    ).values(),
  );

  return uniqueAmenities
    .sort((a, b) => getHotelAmenityVisual(b).priority - getHotelAmenityVisual(a).priority)
    .slice(0, max);
}
