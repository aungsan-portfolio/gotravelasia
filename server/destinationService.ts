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

  // Origin === Destination guard (Bangkok BKK→BKK bug fix)
  const safeOriginCode = originCode === destCode ? "CNX" : originCode;

  // Fetch live data in parallel
  const [dealsResult, monthlyResult] = await Promise.all([
    fetchFlightDeals(safeOriginCode, destCode),
    fetchMonthlyPriceTrend(safeOriginCode, destCode),
  ]);

  // Merge live data into static record
  const mergedRecord = {
    ...staticRecord,
    origin: { ...staticRecord.origin, code: safeOriginCode },
    ...(dealsResult.data ? { deals: dealsResult.data } : {}),
    ...(monthlyResult.data ? { priceMonths: monthlyResult.data } : {}),
  };

  // Determine live state
  // "live" if we got actual flight deals (or trends) from travelpayouts or amadeus
  const liveState =
    dealsResult.source === "travelpayouts" ||
    dealsResult.source === "amadeus" ||
    monthlyResult.source === "travelpayouts"
      ? "live"
      : "static";

  const vm = buildDestinationPageVM(mergedRecord, {
    liveState,
    lastUpdated: new Date().toISOString(),
    sourceLabel: liveState === "live" ? "Travelpayouts API" : "Static registry",
  });

  return vm;
}
