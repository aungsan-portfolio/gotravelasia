import type { PriceTrendRequest, PriceTrendResponse } from "../../../shared/flights/priceTrend.types.js";
import { getCached, setCache } from "../cache.js";
import { buildPriceTrendCacheKey } from "../../../shared/flights/priceIntelligence.cacheKey.js";
import { getPriceCalendar } from "./calendarService.js";
import { deriveTrendPoints } from "./trendDeriver.js";

const TTL_SECONDS = 300;

export async function getPriceTrend(request: PriceTrendRequest): Promise<PriceTrendResponse> {
  const key = buildPriceTrendCacheKey(request);
  const cached = await getCached(key);
  if (cached) {
    return { ...cached, cache: { ...cached.cache, hit: true } } as PriceTrendResponse;
  }

  const calendar = await getPriceCalendar({
    ...request,
    cabin: undefined,
    adults: undefined,
    children: undefined,
    infants: undefined,
  });

  const points = deriveTrendPoints(calendar.points, request.windowDays ?? 7);
  const values = points.map((p) => p.amount).filter((n) => n > 0);
  const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const summary: PriceTrendResponse["summary"] = {
    direction: points.length < 2 ? "flat" : points[points.length - 1].rollingAverage > points[0].rollingAverage ? "up" : points[points.length - 1].rollingAverage < points[0].rollingAverage ? "down" : "flat",
    average,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
  };

  const response: PriceTrendResponse = {
    request,
    points,
    summary,
    fallback: calendar.fallback,
    cache: { key, hit: false, ttlSeconds: TTL_SECONDS },
    meta: {
      generatedAt: new Date().toISOString(),
      derivedFromCalendar: true,
    },
  };

  await setCache(key, response);
  return response;
}
