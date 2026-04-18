import type { AutocompleteSuggestion } from "@/types/hotel-search.types";
import { getHotelCities } from "@shared/hotels/cities";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const HOTEL_CITIES = getHotelCities();

export function resolveSupportedHotelCity(input: {
  suggestion?: AutocompleteSuggestion | null;
  label: string;
}): string | null {
  const suggestion = input.suggestion;

  if (suggestion?.locationId) {
    const numericId = Number.parseInt(suggestion.locationId, 10);
    if (!Number.isNaN(numericId)) {
      const byAgodaId = HOTEL_CITIES.find((city) => city.agodaCityId === numericId);
      if (byAgodaId) return byAgodaId.slug;
    }
  }

  const rawLabel = suggestion?.displayName || input.label;
  const exactSlug = HOTEL_CITIES.find((city) => city.slug === rawLabel.trim().toLowerCase());
  if (exactSlug) return exactSlug.slug;

  const normalizedLabel = normalize(rawLabel);
  if (!normalizedLabel) return null;

  const byName = HOTEL_CITIES.find((city) => normalize(city.name) === normalizedLabel);
  if (byName) return byName.slug;

  const byBookingName = HOTEL_CITIES.find((city) => normalize(city.bookingName) === normalizedLabel);
  if (byBookingName) return byBookingName.slug;

  const byIata = HOTEL_CITIES.find((city) => city.iata.toLowerCase() === rawLabel.trim().toLowerCase());
  if (byIata) return byIata.slug;

  return null;
}
