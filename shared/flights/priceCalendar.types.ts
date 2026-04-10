export type PriceDataKind = "live" | "estimated" | "fallback";

export type PriceCalendarSourceName = "travelpayouts_v3" | "travelpayouts_legacy" | "amadeus" | "bot_json" | "cache" | "none";

export interface PriceConfidenceMeta {
  score: number; // 0..1
  level: "low" | "medium" | "high";
  reason: string;
}

export interface PriceSourceProvenance {
  source: PriceCalendarSourceName;
  precedence: number;
  fetchedAt?: string;
}

export interface PriceEstimationFlags {
  estimated: boolean;
  seasonalityWeighted: boolean;
  interpolated: boolean;
}

export interface PriceFallbackMeta {
  used: boolean;
  reason?: "source_timeout" | "source_error" | "no_live_data" | "validation_error";
  fallbackSource?: PriceCalendarSourceName;
}

export interface PriceCacheMeta {
  key: string;
  hit: boolean;
  ttlSeconds: number;
}

export interface ApiErrorShape {
  code: "BAD_REQUEST" | "UPSTREAM_ERROR" | "TIMEOUT" | "INTERNAL_ERROR";
  message: string;
  requestId?: string;
}

export interface PriceCalendarRequest {
  origin: string;
  destination: string;
  departStartDate: string; // YYYY-MM-DD
  departEndDate: string; // YYYY-MM-DD
  returnDate?: string;
  cabin?: "economy" | "premium" | "business" | "first";
  adults?: number;
  children?: number;
  infants?: number;
  currency?: string;
}

export interface PricePoint {
  date: string;
  amount: number;
  currency: string;
  kind: PriceDataKind;
  confidence: PriceConfidenceMeta;
  provenance: PriceSourceProvenance;
  estimation: PriceEstimationFlags;
}

export interface PriceCalendarResponse {
  request: PriceCalendarRequest;
  points: PricePoint[];
  fallback: PriceFallbackMeta;
  cache: PriceCacheMeta;
  meta: {
    generatedAt: string;
    sourceTimeoutMs: number;
    sourceFailures: number;
    sourceSuccesses: number;
  };
  error?: ApiErrorShape;
}
