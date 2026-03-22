export {
  CITIES,
  CITIES_BY_COUNTRY,
  HOTEL_CITIES_SORTED,
  cityByAgoda,
  cityByIata,
  cityBySlug,
  getCityByAgodaId,
  getCityByIata,
  getCityBySlug,
  getHotelCities,
  getHubCities,
  type City,
  type IataCode,
} from '@shared/hotels/cities';

import { CITIES, getCityByIata } from '@shared/hotels/cities';

export function getCityName(iata: string): string {
  return getCityByIata(iata)?.name ?? iata;
}

export function getCityCode(name: string): string {
  const normalizedName = name.trim().toLowerCase();
  const found = CITIES.find(
    (city) => city.name.toLowerCase() === normalizedName || city.slug === normalizedName
  );
  return found?.iata ?? name.toUpperCase();
}
