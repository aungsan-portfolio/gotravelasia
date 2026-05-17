import { CITIES } from "./cities.js";
import type { City } from "./cities.js";

type CountryCode = string; // e.g. "TH", "MM"

export const getPopularCitiesByCountry = (cc: CountryCode): City[] => {
  const citiesInCountry = CITIES.filter(city => city.cc === cc && city.hasHotels);
  
  if (citiesInCountry.length > 0) {
    // Sort hubs first, then others
    return citiesInCountry.sort((a, b) => {
      if (a.hub && !b.hub) return -1;
      if (!a.hub && b.hub) return 1;
      return 0;
    }).slice(0, 3);
  }

  // Fallback to major SEA hubs if country not found or has no cities
  return CITIES.filter(city => ["BKK", "SIN", "KUL"].includes(city.iata));
};
