function sanitize(numbers: number[]): number[] {
  return numbers.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
}

export function getMedian(numbers: number[]): number {
  const sorted = sanitize(numbers);
  if (sorted.length === 0) return 0;

  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getPercentile(numbers: number[], percentile: number): number {
  const sorted = sanitize(numbers);
  if (sorted.length === 0) return 0;
  if (percentile <= 0) return sorted[0];
  if (percentile >= 100) return sorted[sorted.length - 1];

  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function getP95(numbers: number[]): number {
  return getPercentile(numbers, 95);
}

export function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function normalizeLowerIsBetter(value: number, values: number[]): number {
  const clean = sanitize(values);
  if (clean.length === 0) return 0.5;

  const min = clean[0];
  const p95 = getP95(clean);
  const denom = p95 - min || 1;

  return clamp01(1 - (value - min) / denom);
}
