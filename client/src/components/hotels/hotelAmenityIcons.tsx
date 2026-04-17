import type { LucideIcon } from "lucide-react";
import {
  Bath,
  BedDouble,
  CarFront,
  Coffee,
  Dumbbell,
  Plane,
  Snowflake,
  Sparkles,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react";

export interface HotelAmenityVisual {
  label: string;
  Icon: LucideIcon;
}

const DEFAULT_AMENITY_VISUAL: HotelAmenityVisual = {
  label: "Amenity",
  Icon: BedDouble,
};

function normalizeAmenityName(value: string): string {
  return value.trim().toLowerCase();
}

export function getHotelAmenityVisual(amenity: string): HotelAmenityVisual {
  const normalized = normalizeAmenityName(amenity);

  if (normalized.includes("wifi") || normalized.includes("wi-fi") || normalized.includes("internet")) {
    return { label: "Wi-Fi", Icon: Wifi };
  }

  if (normalized.includes("pool") || normalized.includes("swimming")) {
    return { label: "Pool", Icon: Waves };
  }

  if (normalized.includes("breakfast")) {
    return { label: "Breakfast", Icon: Coffee };
  }

  if (normalized.includes("parking")) {
    return { label: "Parking", Icon: CarFront };
  }

  if (normalized.includes("gym") || normalized.includes("fitness")) {
    return { label: "Gym", Icon: Dumbbell };
  }

  if (normalized.includes("spa") || normalized.includes("wellness") || normalized.includes("massage")) {
    return { label: "Spa", Icon: Sparkles };
  }

  if (
    normalized.includes("restaurant") ||
    normalized.includes("dining") ||
    normalized.includes("bar") ||
    normalized.includes("food")
  ) {
    return { label: "Dining", Icon: UtensilsCrossed };
  }

  if (normalized.includes("airport") || normalized.includes("shuttle")) {
    return { label: "Airport shuttle", Icon: Plane };
  }

  if (normalized.includes("family")) {
    return { label: "Family friendly", Icon: BedDouble };
  }

  if (normalized.includes("air conditioning") || normalized.includes("aircon") || normalized.includes("ac")) {
    return { label: "A/C", Icon: Snowflake };
  }

  if (normalized.includes("bath") || normalized.includes("tub")) {
    return { label: "Bath", Icon: Bath };
  }

  return {
    ...DEFAULT_AMENITY_VISUAL,
    label: amenity,
  };
}

export function getTopAmenities(amenities: string[], max = 4) {
  const cleaned = amenities
    .map((item) => item.trim())
    .filter(Boolean);

  return cleaned.slice(0, max);
}
