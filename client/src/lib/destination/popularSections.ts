// client/src/lib/destination/popularSections.ts

import type {
  DestinationSignal,
  PopularCountry,
  PopularSections,
  ScoredDestination,
} from "@/types/destination";
import { scoreDestinations } from "./popularity";

// ---------------------------------------------------------------------------
// Country score formula
// ---------------------------------------------------------------------------

/**
 * Blended country score: topCity strength (60%) + average depth (40%).
 *
 * Why not pure average?
 *   A country with one outstanding star city (e.g. Singapore/SIN) would be
 *   penalised by a mean if it has fewer cities. The blend rewards both
 *   "star destination" strength and overall country breadth.
 */
export function computeCountryScore(cityScores: number[]): number {
  if (cityScores.length === 0) return 0;

  const sorted = [...cityScores].sort((a, b) => b - a);
  const top = sorted[0];
  const avg = sorted.reduce((sum, s) => sum + s, 0) / sorted.length;

  return top * 0.6 + avg * 0.4;
}

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

type BuildOptions = {
  /** Max countries returned (default 12). */
  countries?: number;
  /** Max cities returned (default 12). */
  cities?: number;
};

/**
 * Scores all destinations, then groups them into:
 *   - `popularDestinations` — top countries (country-level aggregate)
 *   - `popularCities` — top individual cities
 */
export function buildPopularSections(
  destinations: DestinationSignal[],
  options?: BuildOptions,
): PopularSections {
  const countryLimit = options?.countries ?? 12;
  const cityLimit = options?.cities ?? 12;

  if (destinations.length === 0) {
    return { popularDestinations: [], popularCities: [] };
  }

  const scored = scoreDestinations(destinations);

  // --- Group by country ---
  const byCountry = new Map<string, ScoredDestination[]>();
  for (const item of scored) {
    const list = byCountry.get(item.country) ?? [];
    list.push(item);
    byCountry.set(item.country, list);
  }

  // --- Country-level ranking ---
  const popularDestinations: PopularCountry[] = Array.from(byCountry.entries())
    .map(([country, cities]) => {
      const topCity = cities[0]?.city ?? ""; // already sorted by score
      const popularityScore = computeCountryScore(
        cities.map((c) => c.popularityScore),
      );
      return {
        country,
        popularityScore,
        topCity,
        cityCount: cities.length,
      };
    })
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, countryLimit);

  // --- City-level ranking ---
  const popularCities = scored.slice(0, cityLimit);

  return { popularDestinations, popularCities };
}
