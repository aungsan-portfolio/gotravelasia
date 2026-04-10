import { clamp01, getMedian } from "./stats.js";
import type { PriceTrendAnalysis } from "./types.js";

export type PriceRecommendation = "buy_now" | "wait" | "neutral";

export interface HistoricalPricePoint {
  price: number;
  observedAt?: string;
}

export interface AnalyzePriceTrendInput {
  currentPrice: number;
  currency?: string;
  historicalPrices?: HistoricalPricePoint[];
  daysToDeparture?: number;
}

export interface TrendChartPoint {
  label: string;
  price: number;
}

export interface PriceTrendResult {
  recommendation: PriceRecommendation;
  confidence: number;
  reason: string;
  currentPrice: number;
  historicalMin?: number;
  historicalMedian?: number;
  forecastDelta?: number;
  points?: TrendChartPoint[];
  analysis?: PriceTrendAnalysis;
}

function sanitizeHistoricalPoints(points: HistoricalPricePoint[] = []): HistoricalPricePoint[] {
  return points.filter((point) => Number.isFinite(point.price) && point.price > 0);
}

function calculateDispersionRatio(prices: number[], median: number): number {
  if (!prices.length || median <= 0) return 0;

  const variance = prices.reduce((acc, price) => acc + (price - median) ** 2, 0) / prices.length;
  const stdev = Math.sqrt(variance);

  return stdev / median;
}

export function computeConfidenceScore(input: {
  sampleSize: number;
  dispersionRatio: number;
  usedFallback: boolean;
}): number {
  const sizeSignal = Math.min(1, input.sampleSize / 12);
  const stabilitySignal = clamp01(1 - input.dispersionRatio);

  let confidence = 0.2 + sizeSignal * 0.45 + stabilitySignal * 0.35;
  if (input.usedFallback) confidence *= 0.55;

  return Number(clamp01(confidence).toFixed(2));
}

export function classifyPricePosition(
  currentPrice: number,
  historicalMin: number,
  historicalMedian: number
): "below_min" | "near_min" | "below_median" | "near_median" | "above_median" | "far_above_median" {
  if (currentPrice < historicalMin) return "below_min";
  if (currentPrice <= historicalMin * 1.03) return "near_min";
  if (currentPrice <= historicalMedian * 0.95) return "below_median";
  if (currentPrice <= historicalMedian * 1.05) return "near_median";
  if (currentPrice <= historicalMedian * 1.2) return "above_median";

  return "far_above_median";
}

export function buildTrendChartPoints(
  historicalPoints: HistoricalPricePoint[],
  currentPrice: number
): TrendChartPoint[] {
  const points = historicalPoints.slice(-24).map((point, index) => ({
    label: point.observedAt ? point.observedAt.slice(0, 10) : `H${index + 1}`,
    price: Number(point.price.toFixed(2)),
  }));

  points.push({
    label: "Now",
    price: Number(currentPrice.toFixed(2)),
  });

  return points;
}

export function fallbackHeuristicForecast(input: AnalyzePriceTrendInput): Pick<
  PriceTrendResult,
  "recommendation" | "confidence" | "reason" | "forecastDelta"
> {
  const departurePressure = input.daysToDeparture ?? 30;

  if (departurePressure <= 7) {
    return {
      recommendation: "buy_now",
      confidence: 0.34,
      reason: "Limited history; departure is close, so waiting may be riskier.",
      forecastDelta: undefined,
    };
  }

  if (departurePressure >= 45) {
    return {
      recommendation: "neutral",
      confidence: 0.28,
      reason: "Limited history and long horizon; monitor prices before committing.",
      forecastDelta: undefined,
    };
  }

  return {
    recommendation: "neutral",
    confidence: 0.3,
    reason: "Historical price depth is insufficient for a reliable directional call.",
    forecastDelta: undefined,
  };
}

function estimateForecastDelta(prices: number[]): number | undefined {
  if (prices.length < 4) return undefined;

  const lookback = prices.slice(-6);
  const first = lookback[0];
  const last = lookback[lookback.length - 1];
  const stepDelta = (last - first) / (lookback.length - 1);
  const coarseDelta = stepDelta * 3;

  if (!Number.isFinite(coarseDelta)) return undefined;
  return Number(coarseDelta.toFixed(2));
}

export function analyzePriceTrend(input: AnalyzePriceTrendInput): PriceTrendResult {
  const historicalPoints = sanitizeHistoricalPoints(input.historicalPrices);
  const currentPrice = Number(input.currentPrice.toFixed(2));

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return {
      recommendation: "neutral",
      confidence: 0,
      reason: "Current price is invalid for trend analysis.",
      currentPrice,
    };
  }

  if (historicalPoints.length < 3) {
    const fallback = fallbackHeuristicForecast(input);

    return {
      ...fallback,
      currentPrice,
    };
  }

  const historicalPrices = historicalPoints.map((point) => point.price);
  const historicalMin = Number(Math.min(...historicalPrices).toFixed(2));
  const historicalMedian = Number(getMedian(historicalPrices).toFixed(2));
  const dispersionRatio = calculateDispersionRatio(historicalPrices, historicalMedian);
  const forecastDelta = estimateForecastDelta(historicalPrices);

  const position = classifyPricePosition(currentPrice, historicalMin, historicalMedian);

  let recommendation: PriceRecommendation = "neutral";
  let reason = "Price is in a typical range compared with observed history.";

  if (position === "below_min" || position === "near_min" || position === "below_median") {
    recommendation = "buy_now";
    reason = "Current price is near the lower end of historical observations.";
  } else if (
    position === "far_above_median" ||
    (position === "above_median" && typeof forecastDelta === "number" && forecastDelta <= 0)
  ) {
    recommendation = "wait";
    reason = "Current price is elevated relative to history with potential downside.";
  }

  const confidence = computeConfidenceScore({
    sampleSize: historicalPoints.length,
    dispersionRatio,
    usedFallback: false,
  });

  const trend: PriceTrendAnalysis["trend"] =
    typeof forecastDelta !== "number" ? "unknown" : forecastDelta < -2 ? "down" : forecastDelta > 2 ? "up" : "stable";

  return {
    recommendation,
    confidence,
    reason,
    currentPrice,
    historicalMin,
    historicalMedian,
    forecastDelta,
    points: buildTrendChartPoints(historicalPoints, currentPrice),
    analysis: {
      trend,
      confidence,
      changeAmount: forecastDelta,
      changePercent:
        typeof forecastDelta === "number" && currentPrice > 0
          ? Number(((forecastDelta / currentPrice) * 100).toFixed(2))
          : undefined,
      referencePrice: historicalMedian,
      referenceCurrency: input.currency,
      note: reason,
    },
  };
}
