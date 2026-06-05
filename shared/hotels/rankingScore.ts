import type { HotelResult } from "@shared/hotels/types";

/**
 * Compute a client-side "Best" ranking score for a single hotel.
 *
 * The score is a weighted composite of several quality and value signals.
 * Higher score = better hotel for the traveller.
 *
 * Weight rationale
 * ────────────────
 *  • reviewScore (0–10)  → most trusted quality signal        weight 30
 *  • stars       (0–5)   → property class / comfort tier      weight 15
 *  • reviewCount          → confidence in the review signal    weight 15
 *  • priceValue           → lower nightly rate = better value  weight 20
 *  • perks                → breakfast / free-cancel bonuses    weight 10 + 10
 *
 * `rankingPosition` is intentionally NOT part of the score; it only serves
 * as a final tie-breaker so we don't rely on Agoda's opaque ordering.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Cap used to normalise review counts (diminishing returns). */
const REVIEW_COUNT_CAP = 5_000;

/** Cap used to normalise nightly rate (anything above is treated equally). */
const PRICE_CAP_USD = 500;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp a value into [0, 1]. */
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hasBreakfastAmenity(hotel: HotelResult): boolean {
  return (hotel.amenities ?? []).some((a) =>
    a.toLowerCase().includes("breakfast"),
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the composite ranking score for a hotel.
 *
 * @returns A number in roughly [0, 100] — higher is better.
 */
export function computeRankingScore(hotel: HotelResult): number {
  // 1. Review score (0–10 → normalised to 0–1)
  const reviewNorm = clamp01((hotel.reviewScore ?? 0) / 10);

  // 2. Star rating (0–5 → normalised to 0–1)
  const starsNorm = clamp01((hotel.stars ?? 0) / 5);

  // 3. Review count – log-dampened so a hotel with 2 000 reviews doesn't
  //    dwarf one with 500 (both are statistically meaningful).
  const rawCount = Math.max(0, hotel.reviewCount ?? 0);
  const countNorm = clamp01(Math.log1p(rawCount) / Math.log1p(REVIEW_COUNT_CAP));

  // 4. Price value – invert so *lower* price = *higher* score.
  //    Hotels with no price (0) get a neutral 0.5 instead of best-possible.
  const rate = hotel.lowestRate ?? 0;
  const priceNorm =
    rate > 0 ? 1 - clamp01(rate / PRICE_CAP_USD) : 0.5;

  // 5. Perks
  const hasBreakfast =
    hotel.breakfastIncluded === true || hasBreakfastAmenity(hotel);
  const hasFreeCancellation = hotel.freeCancellation === true;

  // Weighted sum (weights add up to 100 for readability)
  const score =
    reviewNorm * 30 +
    priceNorm * 20 +
    starsNorm * 15 +
    countNorm * 15 +
    (hasFreeCancellation ? 10 : 0) +
    (hasBreakfast ? 10 : 0);

  return score;
}

/**
 * Sort an array of hotels by the composite ranking score (descending).
 * Uses `rankingPosition` as a stable tie-breaker only.
 *
 * Returns a **new** array; the input is never mutated.
 */
export function sortHotelsByRankingScore(hotels: HotelResult[]): HotelResult[] {
  return [...hotels].sort((a, b) => {
    const diff = computeRankingScore(b) - computeRankingScore(a);
    if (diff !== 0) return diff;
    // Tie-breaker: lower rankingPosition wins
    return (a.rankingPosition ?? Infinity) - (b.rankingPosition ?? Infinity);
  });
}
