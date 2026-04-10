import type { PriceCalendarRequest } from "./priceCalendar.types.js";
import type { PriceTrendRequest } from "./priceTrend.types.js";

function norm(v: string | undefined): string {
  return (v ?? "").trim().toUpperCase();
}

export function buildPriceCalendarCacheKey(req: PriceCalendarRequest): string {
  return [
    "price-calendar:v1",
    norm(req.origin),
    norm(req.destination),
    req.departStartDate,
    req.departEndDate,
    req.returnDate ?? "-",
    req.cabin ?? "-",
    String(req.adults ?? 1),
    String(req.children ?? 0),
    String(req.infants ?? 0),
    norm(req.currency ?? "USD"),
  ].join(":");
}

export function buildPriceTrendCacheKey(req: PriceTrendRequest): string {
  return [
    "price-trend:v1",
    norm(req.origin),
    norm(req.destination),
    req.departStartDate,
    req.departEndDate,
    req.returnDate ?? "-",
    norm(req.currency ?? "USD"),
    String(req.windowDays ?? 7),
  ].join(":");
}
