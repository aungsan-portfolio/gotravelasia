// server/destinationService.ts
import { getDestinationBySlug } from "../client/src/data/destinationRegistry";
import { buildDestinationPageVM } from "../client/src/lib/destination/buildDestinationPageVM";
import { fetchFlightDeals, fetchMonthlyPriceTrend } from "../client/src/lib/api/flightDataFetcher";
import type { DestinationPageVM } from "../client/src/types/destination";

/**
 * Orchestrates live data fetching and merges it with static registry data.
 * Returns a fully built DestinationPageVM ready for the UI.
 */
export async function getDestinationWithLiveData(slug: string): Promise<DestinationPageVM | null> {
  const staticRecord = getDestinationBySlug(slug);
  if (!staticRecord) return null;

  const originCode = staticRecord.origin.code;
  const destCode = staticRecord.dest.code;

  // Fetch live data in parallel
  const [dealsResult, monthlyResult] = await Promise.all([
    fetchFlightDeals(originCode, destCode),
    fetchMonthlyPriceTrend(originCode, destCode),
  ]);

  // Merge live deals into static record if available
  let mergedRecord = { ...staticRecord };

  if (dealsResult.data) {
    mergedRecord = { ...mergedRecord, deals: dealsResult.data };
  }

  if (monthlyResult.data) {
    mergedRecord = { ...mergedRecord, priceMonths: monthlyResult.data };
  }

  // Determine live state
  // "live" if we got actual flight deals from an API
  // "partial" if we only got monthly trends
  // "static" if both failed
  const liveState = (dealsResult.source === "travelpayouts" || dealsResult.source === "amadeus")
    ? "live"
    : monthlyResult.source === "travelpayouts"
      ? "partial"
      : "static";

  const sourceLabels = [];
  if (dealsResult.source !== "static") sourceLabels.push(dealsResult.source);
  if (monthlyResult.source !== "static" && monthlyResult.source !== dealsResult.source) {
    sourceLabels.push(monthlyResult.source);
  }
  const sourceLabel = sourceLabels.length > 0 
    ? sourceLabels.join(" + ") 
    : "Static registry";

  const vm = buildDestinationPageVM(mergedRecord, {
    liveState,
    lastUpdated: new Date().toISOString(),
    sourceLabel,
  });

  return vm;
}
