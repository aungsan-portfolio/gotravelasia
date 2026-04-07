import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";
import { scoreFlights } from "../../shared/flights/flightScoring.js";
import { sortFlights } from "../../shared/flights/flightSorting.js";
import { FlightSchema } from "../../shared/flights/types.js";
import { searchAmadeusFlightOffers } from "../_core/amadeus.js";
import { normalizeAmadeusOffers } from "./adapters/amadeus.js";

type RawSearchInput = Record<string, any>;

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
      console.warn("[FlightsSearch] Dropping invalid normalized flight:", parsed.error.flatten());
      return false;
    }
    return true;
  });

  const LIMIT = 30;
  const BUCKET_LIMIT = 15;

  const scoredFlights = scoreFlights(validFlights);

  const bestFlights = sortFlights(scoredFlights, "smartMix");
  const cheapestFlights = sortFlights(scoredFlights, "cheapest");
  const fastestFlights = sortFlights(scoredFlights, "fastest");

  const bestLimited = bestFlights.slice(0, LIMIT);

  return {
    success: true,
    flights: bestLimited,
    best: bestLimited,
    cheapest: cheapestFlights.slice(0, BUCKET_LIMIT),
    fastest: fastestFlights.slice(0, BUCKET_LIMIT),
    meta: {
      provider: "amadeus",
      count: bestLimited.length,
      returnedCount: bestLimited.length,
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
