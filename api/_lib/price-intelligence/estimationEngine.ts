import type { PricePoint } from "../../../shared/flights/priceCalendar.types.js";

function monthWeight(month: number): number {
  // Simple explainable seasonality profile.
  const peak = new Set([6, 7, 8, 12]);
  const shoulder = new Set([4, 5, 9, 10, 11]);
  if (peak.has(month)) return 1.12;
  if (shoulder.has(month)) return 1.04;
  return 0.95;
}

export function fillMissingWithSeasonality(input: PricePoint[], startDate: string, endDate: string): PricePoint[] {
  const map = new Map(input.map((p) => [p.date, p]));
  const liveValues = input.filter((p) => p.kind === "live").map((p) => p.amount);
  const baseline = liveValues.length ? liveValues.reduce((a, b) => a + b, 0) / liveValues.length : 0;

  const out: PricePoint[] = [];
  for (let d = new Date(`${startDate}T00:00:00Z`); d <= new Date(`${endDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const existing = map.get(date);
    if (existing) {
      out.push(existing);
      continue;
    }

    if (baseline <= 0) {
      out.push({
        date,
        amount: 0,
        currency: input[0]?.currency ?? "USD",
        kind: "fallback",
        confidence: { score: 0.2, level: "low", reason: "No baseline data" },
        provenance: { source: "none", precedence: 99 },
        estimation: { estimated: true, seasonalityWeighted: false, interpolated: false },
      });
      continue;
    }

    const month = d.getUTCMonth() + 1;
    const estimatedAmount = Math.round(baseline * monthWeight(month));
    out.push({
      date,
      amount: estimatedAmount,
      currency: input[0]?.currency ?? "USD",
      kind: "estimated",
      confidence: { score: 0.45, level: "low", reason: "Seasonality-weighted estimate" },
      provenance: { source: "none", precedence: 98 },
      estimation: { estimated: true, seasonalityWeighted: true, interpolated: false },
    });
  }

  return out;
}
