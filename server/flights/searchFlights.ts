import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";
import { scoreFlights } from "../../shared/flights/flightScoring.js";
import { FlightSchema } from "../../shared/flights/types.js";
import { searchAmadeusFlightOffers } from "../_core/amadeus.js";
import { normalizeAmadeusOffers } from "./adapters/amadeus.js";

type RawSearchInput = Record<string, any>;

const FLIGHTS_LIMIT = 30;
const TOP_BUCKET_LIMIT = 10;

export async function searchFlights(raw: RawSearchInput) {
  const params = normalizeSearchParams(raw);
  const currency =
    typeof raw.currency === "string" && raw.currency.trim()
      ? raw.currency.toUpperCase()
      : "USD";
  const nonStopOnly =
    raw.nonStopOnly === true ||
    raw.nonStopOnly === "true" ||
    raw.nonStopOnly === "1";

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
      },
    };
  }

  const offers = await searchAmadeusFlightOffers({
    ...params,
    currency,
    nonStopOnly,
  });

  const normalized = normalizeAmadeusOffers(offers);

  const validFlights = normalized.filter((flight) => {
    const parsed = FlightSchema.safeParse(flight);
    if (!parsed.success) {
      console.warn("[FlightsSearch] Dropping invalid normalized flight");
      return false;
    }
    return true;
  });

  const scored = scoreFlights(validFlights);
  const cheapest = [...scored].sort((a, b) => a.price.total - b.price.total);
  const fastest = [...scored].sort(
    (a, b) => a.outbound.totalDurationMinutes - b.outbound.totalDurationMinutes
  );

  return {
    success: true,
    flights: scored.slice(0, FLIGHTS_LIMIT),
    best: scored.slice(0, TOP_BUCKET_LIMIT),
    cheapest: cheapest.slice(0, TOP_BUCKET_LIMIT),
    fastest: fastest.slice(0, TOP_BUCKET_LIMIT),
    meta: {
      provider: "amadeus",
      count: scored.length,
      returnedCount: Math.min(scored.length, FLIGHTS_LIMIT),
      rawOfferCount: Array.isArray(offers) ? offers.length : 0,
      searchedAt: new Date().toISOString(),
      currency,
      params: {
        ...params,
        nonStopOnly,
      },
    },
  };
}
