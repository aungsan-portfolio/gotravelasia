import type { PriceCalendarResponse, PricePoint } from "@shared/flights/priceCalendar.types";
import type { PriceTrendResponse } from "@shared/flights/priceTrend.types";
import { getCheapestDayLabel, getConfidenceLabel, getTrendSummaryText, type TrendDirection } from "./priceIntelligence.format";

type CalendarHookState = {
  data: PriceCalendarResponse | null;
  loading: boolean;
  error: string | null;
};

type TrendHookState = {
  data: PriceTrendResponse | null;
  loading: boolean;
  error: string | null;
};

export type PriceIntelligenceStateKind = "hidden" | "loading" | "ready" | "soft_error" | "fallback_only";

export interface FlightPriceIntelligenceViewModel {
  show: boolean;
  stateKind: PriceIntelligenceStateKind;
  lowestKnownPrice: number | null;
  currency: string;
  hasLiveData: boolean;
  hasEstimatedData: boolean;
  isFallbackOnly: boolean;
  confidenceLabel: string;
  trendDirection: TrendDirection;
  trendSummaryText: string;
  cheapestDayLabel: string;
  softErrorText: string;
  dataHintText: string;
}

function pickCheapestPoint(points: PricePoint[]): PricePoint | null {
  const validPoints = points.filter((p) => p.amount > 0);
  if (!validPoints.length) return null;
  return validPoints.reduce<PricePoint>((best, point) => (point.amount < best.amount ? point : best), validPoints[0]);
}

export function buildFlightPriceIntelligenceViewModel(
  calendar: CalendarHookState,
  trend: TrendHookState,
): FlightPriceIntelligenceViewModel {
  const calendarData = calendar.data;
  const trendData = trend.data;

  const hasCommitData = Boolean(calendarData || trendData || calendar.loading || trend.loading || calendar.error || trend.error);
  if (!hasCommitData) {
    return {
      show: false,
      stateKind: "hidden",
      lowestKnownPrice: null,
      currency: "USD",
      hasLiveData: false,
      hasEstimatedData: false,
      isFallbackOnly: false,
      confidenceLabel: "",
      trendDirection: "unknown",
      trendSummaryText: "",
      cheapestDayLabel: "",
      softErrorText: "",
      dataHintText: "",
    };
  }

  const cheapestPoint = pickCheapestPoint(calendarData?.points ?? []);
  const currency = cheapestPoint?.currency ?? trendData?.points[0]?.currency ?? calendarData?.request.currency ?? trendData?.request.currency ?? "USD";
  const hasLiveData = Boolean((calendarData?.points ?? []).some((point) => point.kind === "live"));
  const hasEstimatedData = Boolean((calendarData?.points ?? []).some((point) => point.kind === "estimated" || point.kind === "fallback"));
  const isFallbackOnly = Boolean((calendarData?.points ?? []).length) && !hasLiveData;

  const softErrorText = calendar.error || trend.error ? "Price intelligence is temporarily unavailable." : "";

  if (calendar.loading || trend.loading) {
    return {
      show: true,
      stateKind: "loading",
      lowestKnownPrice: cheapestPoint?.amount ?? trendData?.summary.min ?? null,
      currency,
      hasLiveData,
      hasEstimatedData,
      isFallbackOnly,
      confidenceLabel: getConfidenceLabel(cheapestPoint?.confidence?.score),
      trendDirection: (trendData?.summary.direction ?? "unknown") as TrendDirection,
      trendSummaryText: getTrendSummaryText((trendData?.summary.direction ?? "unknown") as TrendDirection, trendData?.summary.average, currency),
      cheapestDayLabel: getCheapestDayLabel(cheapestPoint?.date, cheapestPoint?.amount, currency),
      softErrorText,
      dataHintText: "Fetching latest fare intelligence…",
    };
  }

  if (!calendarData && !trendData) {
    return {
      show: true,
      stateKind: "soft_error",
      lowestKnownPrice: null,
      currency,
      hasLiveData: false,
      hasEstimatedData: false,
      isFallbackOnly: false,
      confidenceLabel: "",
      trendDirection: "unknown",
      trendSummaryText: "",
      cheapestDayLabel: "",
      softErrorText: softErrorText || "Price intelligence is temporarily unavailable.",
      dataHintText: "You can still continue your flight search.",
    };
  }

  const trendDirection = (trendData?.summary.direction ?? "unknown") as TrendDirection;
  const lowestKnownPrice = cheapestPoint?.amount ?? trendData?.summary.min ?? null;

  const stateKind: PriceIntelligenceStateKind =
    softErrorText
      ? "soft_error"
      : isFallbackOnly
        ? "fallback_only"
        : lowestKnownPrice == null
          ? "fallback_only"
          : "ready";

  const dataHintText = isFallbackOnly
    ? "Using estimated fares while live prices warm up."
    : hasLiveData
      ? "Live fares from recent observations."
      : "Limited price intelligence available.";

  return {
    show: true,
    stateKind,
    lowestKnownPrice,
    currency,
    hasLiveData,
    hasEstimatedData,
    isFallbackOnly,
    confidenceLabel: getConfidenceLabel(cheapestPoint?.confidence?.score),
    trendDirection,
    trendSummaryText: getTrendSummaryText(trendDirection, trendData?.summary.average ?? lowestKnownPrice, currency),
    cheapestDayLabel: getCheapestDayLabel(cheapestPoint?.date, cheapestPoint?.amount, currency),
    softErrorText,
    dataHintText,
  };
}
