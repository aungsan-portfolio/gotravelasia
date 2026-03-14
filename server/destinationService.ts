// server/destinationService.ts
import { getDestinationBySlug } from "../client/src/data/destinationRegistry";
import { buildDestinationPageVM } from "../client/src/lib/destination/buildDestinationPageVM";
import {
  fetchFlightDeals,
  fetchMonthlyPriceTrend,
} from "../client/src/lib/api/flightDataFetcher";

export async function getDestinationWithLiveData(slug: string) {
  const staticRecord = getDestinationBySlug(slug);
  if (!staticRecord) return null;

  const originCode = staticRecord.origin.code;
  const destCode   = staticRecord.dest.code;

  // BKK→BKK guard
  const safeOrigin = originCode === destCode
    ? { city: "Chiang Mai", code: "CNX", country: "Thailand" }
    : staticRecord.origin;

  const [dealsResult, monthlyResult] = await Promise.all([
    fetchFlightDeals(safeOrigin.code, destCode),
    fetchMonthlyPriceTrend(safeOrigin.code, destCode),
  ]);

  const mergedRecord = {
    ...staticRecord,
    origin: safeOrigin,
    ...(dealsResult.data   ? { deals:       dealsResult.data   } : {}),
    ...(monthlyResult.data ? { priceMonths: monthlyResult.data } : {}),
  };

  const liveState =
    dealsResult.source === "travelpayouts" ||
    dealsResult.source === "amadeus"
      ? "live"
      : "static";

  return buildDestinationPageVM(mergedRecord, {
    liveState,
    lastUpdated: new Date().toISOString(),
    sourceLabel: liveState === "live" ? "Travelpayouts API" : "Static registry",
  });
}
