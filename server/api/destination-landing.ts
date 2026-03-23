import { getSeedBySlug, DESTINATION_SEEDS } from "../../shared/destination/registry.js";
import type { DestinationLandingApiResponse } from "../../client/src/types/destination.js";

export async function getDestinationLandingData(params: {
  slug: string;
  userCountryCode?: string | null;
}): Promise<DestinationLandingApiResponse> {
  const seed = getSeedBySlug(params.slug);
  if (!seed) {
    throw new Error(`Destination not found: ${params.slug}`);
  }

  // Mock implementation matching the expected VM structure
  return {
    destination: {
      slug: seed.slug,
      city: seed.city,
      country: seed.country,
      iata: seed.code,
      flag: seed.flag,
      airport: seed.airport,
    } as any,
    originMarket: "TH",
    popularDestinations: DESTINATION_SEEDS.filter(s => s.isPopularDestination).map(s => ({
      slug: s.slug,
      city: s.city,
      country: s.country,
      flag: s.flag,
      iata: s.code,
    })) as any,
    popularCities: DESTINATION_SEEDS.filter(s => s.isPopularCity).map(s => ({
      slug: s.slug,
      city: s.city,
      country: s.country,
      flag: s.flag,
      iata: s.code,
    })) as any,
    priceInsights: {
      cheapestMonth: "May 2026",
      currentMinPrice: 4200,
    },
    fareFinder: [],
  };
}
