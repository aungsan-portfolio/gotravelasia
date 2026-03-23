// client/src/lib/destination/signalMerger.ts

import type { DestinationSignal } from "@/types/destination";
import { safeDivide } from "./normalize.js";

// ---------------------------------------------------------------------------
// Input shape
// ---------------------------------------------------------------------------

export type RawDestinationInput = {
  // Source A — registry (required)
  slug: string;
  city: string;
  country: string;
  iata: string;

  // Source B — live fares (optional, Phase 1)
  minPrice?: number | null;
  avgBenchmarkPrice?: number | null;
  routeAvailability?: number;

  // Source C — analytics (optional, Phase 2)
  searchVolume?: number;
  pageViews?: number;
  outboundClicks?: number;
  impressions?: number;

  // Shared contextual signals
  /**
   * 0..1 — how suitable is this destination for the current month?
   * Provide via your seasonal data table. Default: 0.5 (neutral).
   */
  seasonalScore?: number;

  /**
   * 0..1 — how complete is the destination's page?
   * Computed from your CMS field audit. Default: 0.6.
   */
  contentStrength?: number;
};

// ---------------------------------------------------------------------------
// Price competitiveness
// ---------------------------------------------------------------------------

/**
 * Converts (minPrice / avgBenchmarkPrice) ratio into a 0..1 competitiveness score.
 *   ≤ 70% of benchmark  → 1.0 (great deal)
 *   ≤ 85%               → 0.8
 *   ≤ 100%              → 0.6 (average)
 *   ≤ 115%              → 0.4
 *   > 115%              → 0.2 (expensive)
 *   missing data        → 0.5 (neutral)
 */
export function computePriceCompetitiveness(
  minPrice?: number | null,
  avgBenchmarkPrice?: number | null,
): number {
  if (!minPrice || !avgBenchmarkPrice || avgBenchmarkPrice <= 0) return 0.5;

  const ratio = minPrice / avgBenchmarkPrice;
  if (ratio <= 0.70) return 1.0;
  if (ratio <= 0.85) return 0.8;
  if (ratio <= 1.00) return 0.6;
  if (ratio <= 1.15) return 0.4;
  return 0.2;
}

// ---------------------------------------------------------------------------
// Seasonal score helper
// ---------------------------------------------------------------------------

/**
 * Convention: 1.0 = peak / ideal, 0.2 = monsoon / off-season.
 */
const SEASONAL_TABLE: Record<string, number[]> = {
  // [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
  SIN: [0.9, 0.9, 0.8, 0.8, 0.8, 0.7, 0.8, 0.8, 0.7, 0.7, 0.8, 0.9],
  BKK: [0.9, 0.9, 0.9, 0.8, 0.6, 0.5, 0.5, 0.5, 0.5, 0.6, 0.8, 0.9],
  RGN: [0.9, 0.9, 0.8, 0.7, 0.3, 0.2, 0.2, 0.2, 0.3, 0.6, 0.8, 0.9],
  KUL: [0.8, 0.8, 0.8, 0.8, 0.7, 0.7, 0.8, 0.8, 0.7, 0.6, 0.7, 0.8],
  DPS: [0.8, 0.8, 0.9, 0.9, 0.8, 0.8, 1.0, 1.0, 0.9, 0.8, 0.7, 0.7],
  HKT: [0.9, 1.0, 1.0, 0.9, 0.7, 0.5, 0.5, 0.5, 0.4, 0.4, 0.6, 0.8],
  HAN: [0.7, 0.7, 0.8, 0.9, 0.9, 0.7, 0.8, 0.8, 0.7, 0.7, 0.8, 0.7],
  SGN: [0.9, 0.9, 0.9, 0.8, 0.6, 0.6, 0.6, 0.6, 0.6, 0.7, 0.8, 0.9],
};

export function getSeasonalScore(iata: string, month?: number): number {
  const m = month ?? new Date().getMonth() + 1; // default to current month
  const row = SEASONAL_TABLE[iata.toUpperCase()];
  if (!row) return 0.5;
  return row[Math.max(0, Math.min(11, m - 1))];
}

// ---------------------------------------------------------------------------
// Main merger
// ---------------------------------------------------------------------------

/**
 * Merges registry + live fare + analytics into one DestinationSignal.
 */
export function toDestinationSignal(
  input: RawDestinationInput,
  month?: number,
): DestinationSignal {
  const pageViews      = input.pageViews      ?? 0;
  const outboundClicks = input.outboundClicks  ?? 0;
  const impressions    = input.impressions     ?? Math.max(pageViews, 1);

  return {
    slug:    input.slug,
    city:    input.city,
    country: input.country,
    iata:    input.iata,

    // Behavioral
    searchVolume:       input.searchVolume ?? pageViews,
    outboundIntentRate: safeDivide(outboundClicks, pageViews),
    clickThroughRate:   safeDivide(outboundClicks, impressions),

    // Contextual
    seasonalScore:        input.seasonalScore    ?? getSeasonalScore(input.iata, month),
    priceCompetitiveness: computePriceCompetitiveness(input.minPrice, input.avgBenchmarkPrice),
    routeAvailability:    input.routeAvailability ?? 0,
    contentStrength:      input.contentStrength  ?? 0.6,

    // Fare
    minPrice:     input.minPrice     ?? null,
    avgPrice:     input.avgBenchmarkPrice ?? null,
    directFlights: (input.routeAvailability ?? 0) > 0,
  };
}
