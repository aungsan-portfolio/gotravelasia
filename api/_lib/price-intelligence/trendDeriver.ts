import type { PricePoint } from "../../../shared/flights/priceCalendar.types.js";
import type { TrendPoint } from "../../../shared/flights/priceTrend.types.js";

function rollingAverage(values: number[], idx: number, window: number): number {
  const from = Math.max(0, idx - window + 1);
  const slice = values.slice(from, idx + 1);
  if (!slice.length) return 0;
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
}

export function deriveTrendPoints(calendarPoints: PricePoint[], windowDays = 7): TrendPoint[] {
  const sorted = [...calendarPoints].sort((a, b) => a.date.localeCompare(b.date));
  const amounts = sorted.map((p) => p.amount);

  return sorted.map((p, idx) => {
    const prev = idx > 0 ? sorted[idx - 1].amount : p.amount;
    return {
      date: p.date,
      amount: p.amount,
      currency: p.currency,
      deltaFromPrevious: p.amount - prev,
      rollingAverage: rollingAverage(amounts, idx, windowDays),
      kind: p.kind,
      confidence: p.confidence,
    };
  });
}
