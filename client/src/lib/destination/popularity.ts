// client/src/lib/destination/popularity.ts

import type { DestinationSignal, ScoredDestination } from "@/types/destination";
import { clamp01, normalize } from "./normalize.js";

// ---------------------------------------------------------------------------
// Weight configuration
// ---------------------------------------------------------------------------

/**
 * Weights must sum to 1.0.
 * Phase 1 note: searchVolume defaults to 0 → priceCompetitiveness /
 * seasonalScore / contentStrength carry the ranking until analytics land.
 */
const WEIGHTS = {
  searchVolume:        0.28,
  outboundIntentRate:  0.24,
  clickThroughRate:    0.14,
  seasonalScore:       0.12,
  priceCompetitiveness:0.12,
  routeAvailability:   0.06,
  contentStrength:     0.04,
} as const satisfies Record<string, number>;

// Validate at module load (will throw at runtime if someone edits weights incorrectly)
const weightSum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1.0) > 0.001) {
  throw new Error(`POPULARITY_WEIGHTS must sum to 1.0 (got ${weightSum})`);
}

// ---------------------------------------------------------------------------
// Single-destination score
// ---------------------------------------------------------------------------

type ScoreContext = {
  /** Highest searchVolume in the dataset — used for normalization. */
  maxSearchVolume: number;
  /** Highest routeAvailability in the dataset — used for normalization. */
  maxRouteAvailability: number;
};

export function calculatePopularityScore(
  d: DestinationSignal,
  ctx: ScoreContext,
): number {
  const n = {
    searchVolume:         normalize(d.searchVolume, 0, ctx.maxSearchVolume),
    outboundIntentRate:   clamp01(d.outboundIntentRate),
    clickThroughRate:     clamp01(d.clickThroughRate),
    seasonalScore:        clamp01(d.seasonalScore),
    priceCompetitiveness: clamp01(d.priceCompetitiveness),
    routeAvailability:    normalize(d.routeAvailability, 0, ctx.maxRouteAvailability),
    contentStrength:      clamp01(d.contentStrength),
  };

  return (
    n.searchVolume         * WEIGHTS.searchVolume         +
    n.outboundIntentRate   * WEIGHTS.outboundIntentRate   +
    n.clickThroughRate     * WEIGHTS.clickThroughRate     +
    n.seasonalScore        * WEIGHTS.seasonalScore        +
    n.priceCompetitiveness * WEIGHTS.priceCompetitiveness +
    n.routeAvailability    * WEIGHTS.routeAvailability    +
    n.contentStrength      * WEIGHTS.contentStrength
  );
}

// ---------------------------------------------------------------------------
// Batch scorer
// ---------------------------------------------------------------------------

/**
 * Scores and sorts all destinations in one pass.
 * Uses dataset-aware normalization (avoids brittle hardcoded caps).
 */
export function scoreDestinations(
  destinations: DestinationSignal[],
): ScoredDestination[] {
  if (destinations.length === 0) return [];

  const ctx: ScoreContext = {
    maxSearchVolume:      Math.max(...destinations.map((d) => d.searchVolume), 1),
    maxRouteAvailability: Math.max(...destinations.map((d) => d.routeAvailability), 1),
  };

  return destinations
    .map((d) => ({
      ...d,
      popularityScore: calculatePopularityScore(d, ctx),
    }))
    .sort((a, b) => b.popularityScore - a.popularityScore);
}

// ---------------------------------------------------------------------------
// Phase 3 helper: 30-day blended search signal
// ---------------------------------------------------------------------------

/**
 * Blends a 7-day and 30-day search signal to surface trending destinations.
 * Use in Phase 3 when you have both values from your analytics store.
 *
 * @param last7d  - normalized 7-day search volume (0..1)
 * @param last30d - normalized 30-day search volume (0..1)
 */
export function blendSearchSignal(last7d: number, last30d: number): number {
  return clamp01(last7d * 0.65 + last30d * 0.35);
}

