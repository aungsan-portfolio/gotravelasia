import type { ApiErrorShape, PriceCacheMeta, PriceConfidenceMeta, PriceDataKind, PriceFallbackMeta } from "./priceCalendar.types.js";

export interface PriceTrendRequest {
  origin: string;
  destination: string;
  departStartDate: string;
  departEndDate: string;
  returnDate?: string;
  currency?: string;
  windowDays?: number;
}

export interface TrendPoint {
  date: string;
  amount: number;
  currency: string;
  deltaFromPrevious: number;
  rollingAverage: number;
  kind: PriceDataKind;
  confidence: PriceConfidenceMeta;
}

export interface PriceTrendResponse {
  request: PriceTrendRequest;
  points: TrendPoint[];
  summary: {
    direction: "up" | "down" | "flat";
    average: number;
    min: number | null;
    max: number | null;
  };
  fallback: PriceFallbackMeta;
  cache: PriceCacheMeta;
  meta: {
    generatedAt: string;
    derivedFromCalendar: boolean;
  };
  error?: ApiErrorShape;
}
