import { getCached, setCache } from "../cache.js";
import type { PriceCalendarRequest, PriceCalendarResponse } from "../../../shared/flights/priceCalendar.types.js";
import { buildPriceCalendarCacheKey } from "../../../shared/flights/priceIntelligence.cacheKey.js";
import { fetchCalendarSources } from "./sourceOrchestrator.js";
import { normalizeCalendarWithPrecedence } from "./calendarNormalize.js";
import { fillMissingWithSeasonality } from "./estimationEngine.js";

const TTL_SECONDS = 300;

export async function getPriceCalendar(request: PriceCalendarRequest): Promise<PriceCalendarResponse> {
  const key = buildPriceCalendarCacheKey(request);
  const cached = await getCached(key);
  if (cached) {
    return {
      ...cached,
      cache: { ...cached.cache, hit: true },
    } as PriceCalendarResponse;
  }

  const sources = await fetchCalendarSources(request, key);
  const sourceSuccesses = sources.filter((s) => s.ok).length;
  const normalized = normalizeCalendarWithPrecedence(request, sources);
  const points = fillMissingWithSeasonality(normalized, request.departStartDate, request.departEndDate);

  const response: PriceCalendarResponse = {
    request,
    points,
    fallback: {
      used: sourceSuccesses === 0 || points.every((p) => p.kind !== "live"),
      reason: sourceSuccesses === 0 ? "source_error" : points.every((p) => p.kind !== "live") ? "no_live_data" : undefined,
      fallbackSource: points.some((p) => p.kind === "estimated") ? "none" : undefined,
    },
    cache: { key, hit: false, ttlSeconds: TTL_SECONDS },
    meta: {
      generatedAt: new Date().toISOString(),
      sourceTimeoutMs: 4500,
      sourceFailures: sources.filter((s) => !s.ok).length,
      sourceSuccesses,
    },
  };

  await setCache(key, response);
  return response;
}
