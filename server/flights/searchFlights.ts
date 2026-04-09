import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";
import { scoreFlights } from "../../shared/flights/flightScoring.js";
import { sortFlights } from "../../shared/flights/flightSorting.js";
import { FlightSchema } from "../../shared/flights/types.js";
import { searchAmadeusFlightOffers } from "../_core/amadeus.js";
import { normalizeAmadeusOffers } from "./adapters/amadeus.js";

type RawSearchInput = Record<string, any>;

const searchCache = new Map<string, { expiresAt: number; value: any }>();
const inflightSearches = new Map<string, Promise<any>>();

const CACHE_TTL_MS = 45_000;
const MAX_OFFERS_TO_SCORE = 80;
const MAX_RESULTS = 30;
const MAX_BUCKET_RESULTS = 15;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseSearchContext(raw: RawSearchInput) {
  const params = normalizeSearchParams(raw);
  const currency =
    typeof raw.currency === "string" && raw.currency.trim()
      ? raw.currency.toUpperCase()
      : "USD";
  const nonStopOnly =
    raw.nonStopOnly === true ||
    raw.nonStopOnly === "true" ||
    raw.nonStopOnly === "1";

  return { params, currency, nonStopOnly };
}

async function buildFlightSearchResult(raw: RawSearchInput) {
  const startedAt = Date.now();
  const { params, currency, nonStopOnly } = parseSearchContext(raw);

  if (!params.origin || !params.destination || !params.departDate) {
    return {
      success: false,
      error: "Missing required search params",
      flights: [],
      best: [],
      cheapest: [],
      fastest: [],
      meta: {
        provider: "amadeus",
        count: 0,
        searchedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
      },
    };
  }

  const offers = await searchAmadeusFlightOffers({
    ...params,
    currency,
    nonStopOnly,
  });

  const normalized = normalizeAmadeusOffers(offers);
  const scoreLimit = clamp(Number(process.env.FLIGHT_SEARCH_MAX_OFFERS || MAX_OFFERS_TO_SCORE), 20, 120);
  const normalizedLimited = normalized.slice(0, scoreLimit);

  let droppedInvalid = 0;
  const validFlights = normalizedLimited.filter((flight) => {
    const parsed = FlightSchema.safeParse(flight);
    if (!parsed.success) {
      droppedInvalid += 1;
      return false;
    }
    return true;
  });

  const scoredFlights = scoreFlights(validFlights);

  const bestFlights = sortFlights(scoredFlights, "smartMix");
  const cheapestFlights = sortFlights(scoredFlights, "cheapest");
  const fastestFlights = sortFlights(scoredFlights, "fastest");

  const bestLimited = bestFlights.slice(0, MAX_RESULTS);
  const durationMs = Date.now() - startedAt;

  return {
    success: true,
    flights: bestLimited,
    best: bestLimited,
    cheapest: cheapestFlights.slice(0, MAX_BUCKET_RESULTS),
    fastest: fastestFlights.slice(0, MAX_BUCKET_RESULTS),
    meta: {
      provider: "amadeus",
      count: bestLimited.length,
      returnedCount: bestLimited.length,
      rawOfferCount: Array.isArray(offers) ? offers.length : 0,
      normalizedOfferCount: normalized.length,
      consideredOfferCount: normalizedLimited.length,
      validOfferCount: validFlights.length,
      droppedInvalidOfferCount: droppedInvalid,
      searchedAt: new Date().toISOString(),
      durationMs,
      currency,
      params: {
        ...params,
        nonStopOnly,
      },
    },
  };
}

export async function searchFlights(raw: RawSearchInput) {
  const { params, currency, nonStopOnly } = parseSearchContext(raw);
  const cacheKey = JSON.stringify({ ...params, currency, nonStopOnly });
  const now = Date.now();

  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return {
      ...cached.value,
      meta: {
        ...cached.value.meta,
        cacheHit: true,
      },
    };
  }

  const running = inflightSearches.get(cacheKey);
  if (running) return running;

  const task = buildFlightSearchResult(raw)
    .then((result) => {
      searchCache.set(cacheKey, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
      return {
        ...result,
        meta: {
          ...result.meta,
          cacheHit: false,
        },
      };
    })
    .finally(() => {
      inflightSearches.delete(cacheKey);
      if (searchCache.size > 200) {
        const oldestKey = searchCache.keys().next().value;
        if (oldestKey) searchCache.delete(oldestKey);
      }
    });

  inflightSearches.set(cacheKey, task);
  return task;
}
