/**
 * shared/flights/scoring.ts
 * ─────────────────────────────────────────────────────────────────
 * MCDA (Multi-Criteria Decision Analysis) Best Flight Scoring.
 * Pure utility — no UI, no routing, no imports from project code.
 *
 * Usage (backend or frontend):
 *   import { rankFlightsByBest, calculateFlightScore } from "@shared/flights/scoring";
 */

// ─── Minimal self-contained types ──────────────────────────────────
export interface ScoredFlight {
  id: string;
  price: number;
  durationMinutes: number;
  stops: number;
  departureHour: number;       // 0-23 — local hour at origin
  airlineRating: number;       // 0-5
}

export interface ScoringWeights {
  price: number;              // default 0.35
  duration: number;           // default 0.25
  stops: number;              // default 0.20
  departureTime: number;      // default 0.10
  airline: number;            // default 0.10
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  price:         0.35,
  duration:      0.25,
  stops:         0.20,
  departureTime: 0.10,
  airline:       0.10,
};

// ─── Internal helpers ───────────────────────────────────────────────

/**
 * MinMax normalization — returns 0-1.
 * lowerIsBetter=true → cheapest/fastest gets 1.0
 */
function normalizeScore(
  value: number,
  min: number,
  max: number,
  lowerIsBetter = true,
): number {
  if (max === min) return 1;
  const n = (value - min) / (max - min);
  return lowerIsBetter ? 1 - n : n;
}

/**
 * Departure-time preference score (0-1).
 * Peak morning / peak evening = highest preference.
 * Red-eye = lowest.
 */
function getDepartureTimeScore(hour: number): number {
  if (hour >= 7  && hour <= 10) return 1.0;   // peak morning
  if (hour >= 16 && hour <= 20) return 0.9;   // peak evening
  if (hour >= 11 && hour <= 15) return 0.8;   // mid-day
  if (hour >= 5  && hour <= 6 ) return 0.6;   // early morning
  if (hour >= 22 || hour <= 4 ) return 0.3;   // red-eye
  return 0.5;
}

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Calculate a Best-Flight score (0-1) for a single flight
 * within the context of all flights returned for the same search.
 */
export function calculateFlightScore(
  flight: ScoredFlight,
  allFlights: ScoredFlight[],
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): number {
  const prices    = allFlights.map((f) => f.price);
  const durations = allFlights.map((f) => f.durationMinutes);
  const stopsArr  = allFlights.map((f) => f.stops);

  const priceScore    = normalizeScore(flight.price,           Math.min(...prices),    Math.max(...prices),    true);
  const durationScore = normalizeScore(flight.durationMinutes, Math.min(...durations), Math.max(...durations), true);
  const stopsScore    = normalizeScore(flight.stops,           Math.min(...stopsArr),  Math.max(...stopsArr),  true);
  const depTimeScore  = getDepartureTimeScore(flight.departureHour);
  const airlineScore  = Math.min(flight.airlineRating, 5) / 5;

  const total =
    priceScore    * weights.price         +
    durationScore * weights.duration      +
    stopsScore    * weights.stops         +
    depTimeScore  * weights.departureTime +
    airlineScore  * weights.airline;

  return Math.round(total * 100) / 100;
}

/**
 * Rank flights by Best-Flight score (highest first).
 * Returns the same objects + { score, rank } fields.
 */
export function rankFlightsByBest<T extends ScoredFlight>(
  flights: T[],
  weights?: ScoringWeights,
): Array<T & { score: number; rank: number }> {
  const scored = flights.map((f) => ({
    ...f,
    score: calculateFlightScore(f, flights, weights),
    rank:  0,
  }));

  scored.sort((a, b) => b.score - a.score);
  scored.forEach((f, i) => { f.rank = i + 1; });

  return scored;
}
