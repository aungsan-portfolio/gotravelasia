import type { DealTag, Flight } from "./types.js";
import { getMedian } from "./stats.js";
import { analyzeLayoverWorthIt } from "./layoverAnalysis.js";

import { analyzePriceTrend, type HistoricalPricePoint } from "./priceTrend.js";

export interface DealTagContext {
  /**
   * Simple previous price lookup for quick detection.
   */
  historicalPriceByFlightId?: Record<string, { previousTotal: number; observedAt?: string; confidence?: number } | undefined>;
  
  /**
   * Full historical series for deep trend analysis.
   */
  historicalSeriesByFlightId?: Record<string, HistoricalPricePoint[] | undefined>;
  
  layoverAnalysisSupported?: boolean;
}

const PRIMARY_TAG_PRIORITY: DealTag[] = [
  "great_deal",
  "price_drop",
  "red_eye_saver",
  "eco_friendly",
  "worth_it",
  "best",
  "great",
  "typical",
  "expensive",
];

function getPriceStats(allFlights: Flight[]): { prices: number[]; median: number; min: number } | null {
  const prices = allFlights.map((f) => f.price.total).filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return null;

  return {
    prices,
    median: getMedian(prices),
    min: Math.min(...prices),
  };
}

export function isRedEyeDeparture(flight: Flight): boolean {
  const localIso = flight.outbound.segments[0]?.departure.localTime;
  if (!localIso) return false;

  const hour = new Date(localIso).getHours();
  return hour >= 22 || hour < 5;
}

export function computeRelativePricePosition(
  flight: Flight,
  allFlights: Flight[]
): { ratioToMedian: number; savingsVsMedian: number; isCheapest: boolean } {
  const stats = getPriceStats(allFlights);
  if (!stats) {
    return { ratioToMedian: 1, savingsVsMedian: 0, isCheapest: false };
  }

  const ratioToMedian = flight.price.total / stats.median;
  const savingsVsMedian = (stats.median - flight.price.total) / stats.median;

  return {
    ratioToMedian,
    savingsVsMedian,
    isCheapest: flight.price.total <= stats.min,
  };
}

export function isEcoFriendlyHeuristic(flight: Flight, allFlights: Flight[]): boolean {
  const durations = allFlights
    .map((f) => f.outbound.totalDurationMinutes)
    .filter((d) => Number.isFinite(d) && d > 0);

  const medianDuration = durations.length ? getMedian(durations) : flight.outbound.totalDurationMinutes;
  const isReasonablyEfficientDuration = flight.outbound.totalDurationMinutes <= medianDuration * 1.1;

  return flight.totalStops <= 1 && !flight.isSelfTransfer && isReasonablyEfficientDuration;
}

function getCompatibilityTag(flight: Flight, allFlights: Flight[]): DealTag {
  const stats = getPriceStats(allFlights);
  if (!stats) return "typical";

  if (flight.price.total <= stats.min) return "best";
  if (flight.price.total <= stats.median * 0.85) return "great";
  if (flight.price.total <= stats.median * 1.15) return "typical";
  return "expensive";
}

function hasSupportedPriceDropSignal(flight: Flight, context?: DealTagContext): boolean {
  const series = context?.historicalSeriesByFlightId?.[flight.id];
  const simplePoint = context?.historicalPriceByFlightId?.[flight.id];

  if (!series && !simplePoint) return false;

  // Prefer full series analysis if available
  const historicalPrices: HistoricalPricePoint[] = series 
    ? series 
    : [{ price: simplePoint!.previousTotal, observedAt: simplePoint!.observedAt }];

  const result = analyzePriceTrend({
    currentPrice: flight.price.total,
    currency: flight.price.currency,
    historicalPrices
  });

  // A price drop is valid if it's a "buy now" recommendation and the price has actually decreased
  const isBuySignal = result.recommendation === "buy_now";
  const isHistoricalDrop = result.currentPrice < (result.historicalMedian ?? result.currentPrice);
  
  // If we only have 1 point, check the confidence from context
  if (!series && simplePoint) {
    const dropRatio = (simplePoint.previousTotal - flight.price.total) / simplePoint.previousTotal;
    const confidence = simplePoint.confidence ?? 0.5;
    return dropRatio >= 0.05 && confidence >= 0.5;
  }

  return isBuySignal && isHistoricalDrop && result.confidence >= 0.4;
}

function hasWorthItSignal(flight: Flight, allFlights: Flight[], context?: DealTagContext): boolean {
  if (!context?.layoverAnalysisSupported) return false;
  
  // Use the advanced analysis to decide if this layover-heavy flight is actually a good deal
  const analysis = analyzeLayoverWorthIt(flight, allFlights);
  return analysis.isWorthIt;
}

export function getDealTags(
  flight: Flight,
  allFlights: Flight[],
  context?: DealTagContext
): DealTag[] {
  const tags: DealTag[] = [];
  const { savingsVsMedian } = computeRelativePricePosition(flight, allFlights);

  if (savingsVsMedian >= 0.18) {
    tags.push("great_deal");
  }

  if (isEcoFriendlyHeuristic(flight, allFlights)) {
    tags.push("eco_friendly");
  }

  if (hasSupportedPriceDropSignal(flight, context)) {
    tags.push("price_drop");
  }

  if (isRedEyeDeparture(flight) && savingsVsMedian >= 0.12) {
    tags.push("red_eye_saver");
  }

  if (hasWorthItSignal(flight, allFlights, context)) {
    tags.push("worth_it");
  }

  tags.push(getCompatibilityTag(flight, allFlights));

  return [...new Set(tags)];
}

export function getPrimaryDealTag(tags: DealTag[]): DealTag {
  for (const tag of PRIMARY_TAG_PRIORITY) {
    if (tags.includes(tag)) return tag;
  }

  return "typical";
}
