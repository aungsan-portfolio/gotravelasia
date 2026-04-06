import { normalizeSearchParams } from "../../shared/flights/normalizeSearchParams.js";
import { scoreFlights } from "../../shared/flights/flightScoring.js";
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

  const LIMIT = 30; // P2 Payload Payload Limiting
  const best = scoreFlights(validFlights);
  const cheapest = [...best].sort((a, b) => a.price.total - b.price.total);

  function totalTripMinutes(flight: any) {
    return (
      (flight.outbound?.totalDurationMinutes || 0) +
      (flight.return?.totalDurationMinutes || 0)
    );
  }

  const fastest = [...best].sort((a, b) => totalTripMinutes(a) - totalTripMinutes(b));

  const flightsLimited = best.slice(0, LIMIT);

  return {
    success: true,
    flights: flightsLimited,
    best: flightsLimited,
    cheapest: cheapest.slice(0, 15),
    fastest: fastest.slice(0, 15),
    meta: {
      provider: "amadeus",
      count: flightsLimited.length,
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
