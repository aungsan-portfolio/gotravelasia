// client/src/lib/destination/normalize.ts

/**
 * Clamps a value to [0, 1].
 * Returns 0 for NaN / Infinity.
 */
export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Min-max normalizes `value` to [0, 1] within [min, max].
 * Returns 0 when max <= min (degenerate range).
 */
export function normalize(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return clamp01((value - min) / (max - min));
}

/**
 * Safe division — returns 0 instead of NaN / Infinity.
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (!denominator || !Number.isFinite(denominator)) return 0;
  return numerator / denominator;
}
