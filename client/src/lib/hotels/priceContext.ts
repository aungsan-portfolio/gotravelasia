import type { HotelResult, HotelSearchSource } from "@shared/hotels/types";

type ProviderPriceSource = Exclude<HotelSearchSource, "metasearch" | "mock">;

export interface HotelPriceContext {
  prices: number[];
  minPrice: number | null;
  maxPrice: number | null;
  providerCount: number;
  providers: ProviderPriceSource[];
}

const PROVIDERS: ProviderPriceSource[] = [
  "agoda",
  "booking",
  "trip",
  "expedia",
  "klook",
];

export function buildHotelPriceContext(hotel: HotelResult): HotelPriceContext {
  const providerPrices = hotel.providerPrices ?? {};

  const validProviderEntries = PROVIDERS.flatMap((provider) => {
    const price = providerPrices[provider];
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      return [];
    }

    return [{ provider, price }];
  });

  const prices = validProviderEntries
    .map((entry) => entry.price)
    .sort((a, b) => a - b);

  const hasLowestRate = Number.isFinite(hotel.lowestRate) && hotel.lowestRate > 0;
  if (hasLowestRate && prices.length === 0) {
    prices.push(hotel.lowestRate);
  }

  const minPrice = prices.length > 0 ? prices[0] : null;
  const maxPrice = prices.length > 0 ? prices[prices.length - 1] : null;

  return {
    prices,
    minPrice,
    maxPrice,
    providerCount: prices.length,
    providers: validProviderEntries.map((entry) => entry.provider),
  };
}
