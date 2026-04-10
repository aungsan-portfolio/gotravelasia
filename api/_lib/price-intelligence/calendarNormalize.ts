import type { PriceCalendarRequest, PricePoint } from "../../../shared/flights/priceCalendar.types.js";
import type { RawPriceRecord, SourceFetchResult, SourceName } from "./sourceOrchestrator.js";

const PRECEDENCE: Record<SourceName, number> = {
  travelpayouts: 1,
  bot_json: 2,
  amadeus: 3,
};

function confidenceFor(source: SourceName, estimated: boolean): PricePoint["confidence"] {
  if (estimated) return { score: 0.45, level: "low", reason: "Estimated from seasonality" };
  if (source === "travelpayouts") return { score: 0.9, level: "high", reason: "Live TP data" };
  if (source === "bot_json") return { score: 0.75, level: "medium", reason: "Bot historical data" };
  return { score: 0.6, level: "medium", reason: "Amadeus fallback live data" };
}

function pickWinningRecord(current: RawPriceRecord | undefined, candidate: RawPriceRecord): RawPriceRecord {
  if (!current) return candidate;
  const currentP = PRECEDENCE[current.source] ?? 99;
  const candidateP = PRECEDENCE[candidate.source] ?? 99;
  if (candidateP < currentP) return candidate;
  if (candidateP > currentP) return current;
  return candidate.amount < current.amount ? candidate : current;
}

export function normalizeCalendarWithPrecedence(
  request: PriceCalendarRequest,
  sourceResults: SourceFetchResult[],
): PricePoint[] {
  const byDate = new Map<string, RawPriceRecord>();

  for (const sourceResult of sourceResults) {
    if (!sourceResult.ok) continue;
    for (const record of sourceResult.records) {
      if (record.date < request.departStartDate || record.date > request.departEndDate) continue;
      byDate.set(record.date, pickWinningRecord(byDate.get(record.date), record));
    }
  }

  const out: PricePoint[] = [];
  for (let d = new Date(`${request.departStartDate}T00:00:00Z`); d <= new Date(`${request.departEndDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const best = byDate.get(date);
    if (!best) continue;

    const estimated = !!best.estimated;
    out.push({
      date,
      amount: Math.round(best.amount),
      currency: best.currency,
      kind: estimated ? "estimated" : "live",
      confidence: confidenceFor(best.source, estimated),
      provenance: {
        source: best.source === "travelpayouts" ? "travelpayouts_v3" : best.source === "amadeus" ? "amadeus" : "bot_json",
        precedence: PRECEDENCE[best.source] ?? 99,
        fetchedAt: new Date().toISOString(),
      },
      estimation: {
        estimated,
        interpolated: false,
        seasonalityWeighted: estimated,
      },
    });
  }

  return out;
}
