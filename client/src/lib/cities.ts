export * from '@shared/hotels/cities';

import { CITIES, getCityByIata } from '@shared/hotels/cities';

export function getCityName(code: string): string {
  return getCityByIata(code)?.name ?? code;
}

export function getCityCode(cityName: string): string {
  const match = CITIES.find((city) => city.name.toLowerCase() === cityName.toLowerCase());
  return match?.iata ?? cityName.toUpperCase();
}

export type IataCode = (typeof CITIES)[number]['iata'];
