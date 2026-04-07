import type { Flight } from "./types.js";

export type FlightSortOption =
  | "smartMix"
  | "cheapest"
  | "fastest"
  | "bestValue"
  | "earliest"
  | "latest";

type FlightLikeWithOptionalScore = Flight & { score?: number };

const BEST_VALUE_PRICE_WEIGHT = 0.6;
const BEST_VALUE_DURATION_WEIGHT = 0.4;

/**
 * Sorts flights using a stable, non-mutating strategy.
 * Invalid numeric values always sort last.
 */
export function sortFlights<T extends FlightLikeWithOptionalScore>(
  flights: T[],
  sortBy: FlightSortOption
): T[] {
  if (!Array.isArray(flights) || flights.length <= 1) return [...(flights ?? [])];

  switch (sortBy) {
    case "smartMix":
      return sortBySmartMix(flights);

    case "cheapest":
      return sortByNumeric(flights, (flight) => flight.price.total, "asc");

    case "fastest":
      return sortByNumeric(flights, getTotalTripMinutes, "asc");

    case "earliest":
      return sortByNumeric(flights, getFirstDepartureSortValue, "asc");

    case "latest":
      return sortByNumeric(flights, getFirstDepartureSortValue, "desc");

    case "bestValue":
      return sortByBestValue(flights);

    default:
      return [...flights];
  }
}

/**
 * Total trip duration in minutes.
 * Includes return leg when present.
 */
export function getTotalTripMinutes(flight: Flight): number {
  const outbound = toSafeNonNegativeNumber(flight.outbound.totalDurationMinutes);
  const inbound = toSafeNonNegativeNumber(flight.return?.totalDurationMinutes ?? 0);
  return outbound + inbound;
}

/**
 * Sort-friendly numeric representation of the first outbound departure.
 * Uses local ISO string parsing without relying on runtime timezone parsing.
 *
 * Example:
 * "2026-05-14T09:35:00" -> 202605140935
 */
export function getFirstDepartureSortValue(flight: Flight): number {
  return getIsoSortValue(flight.outbound.segments[0]?.departure.localTime);
}

/**
 * Sort-friendly numeric representation of the final trip arrival.
 * For roundtrip flights, uses the return leg final arrival.
 * For one-way flights, uses the outbound final arrival.
 */
export function getFinalArrivalSortValue(flight: Flight): number {
  const leg = flight.return ?? flight.outbound;
  const lastSegment = leg.segments[leg.segments.length - 1];
  return getIsoSortValue(lastSegment?.arrival.localTime);
}

// ─────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────

function sortByNumeric<T>(
  flights: T[],
  selector: (flight: T) => number,
  direction: "asc" | "desc" = "asc"
): T[] {
  return flights
    .map((flight, index) => ({ flight, index }))
    .sort((a, b) => {
      const rawA = selector(a.flight);
      const rawB = selector(b.flight);

      const aValid = Number.isFinite(rawA);
      const bValid = Number.isFinite(rawB);

      // Always send invalid values to the bottom, regardless of direction.
      if (!aValid && !bValid) return a.index - b.index;
      if (!aValid) return 1;
      if (!bValid) return -1;

      const delta = direction === "asc" ? rawA - rawB : rawB - rawA;
      if (delta !== 0) return delta;

      return a.index - b.index;
    })
    .map((entry) => entry.flight);
}

function sortBySmartMix<T extends FlightLikeWithOptionalScore>(flights: T[]): T[] {
  const hasAnyScore = flights.some(
    (flight) => typeof flight.score === "number" && Number.isFinite(flight.score)
  );

  if (!hasAnyScore) return [...flights];

  return sortByNumeric(
    flights,
    (flight) =>
      typeof flight.score === "number" && Number.isFinite(flight.score)
        ? flight.score
        : Number.NaN,
    "desc"
  );
}

function sortByBestValue<T extends Flight>(flights: T[]): T[] {
  if (flights.length <= 1) return [...flights];

  const validPrices = flights
    .map((flight) => flight.price.total)
    .filter((value) => Number.isFinite(value));

  const validDurations = flights
    .map(getTotalTripMinutes)
    .filter((value) => Number.isFinite(value));

  if (!validPrices.length || !validDurations.length) {
    return [...flights];
  }

  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);
  const minDuration = Math.min(...validDurations);
  const maxDuration = Math.max(...validDurations);

  return sortByNumeric(
    flights,
    (flight) => {
      const price = flight.price.total;
      const duration = getTotalTripMinutes(flight);

      if (!Number.isFinite(price) || !Number.isFinite(duration)) {
        return Number.NaN;
      }

      const normalizedPrice = normalizeAscending(price, minPrice, maxPrice);
      const normalizedDuration = normalizeAscending(
        duration,
        minDuration,
        maxDuration
      );

      return (
        normalizedPrice * BEST_VALUE_PRICE_WEIGHT +
        normalizedDuration * BEST_VALUE_DURATION_WEIGHT
      );
    },
    "asc"
  );
}

function normalizeAscending(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return Number.NaN;
  }
  if (max === min) return 0;
  return (value - min) / (max - min);
}

function getIsoSortValue(localIso?: string): number {
  if (!localIso) return Number.NaN;

  const match = localIso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  if (!match) return Number.NaN;

  const [, year, month, day, hour, minute] = match;
  return Number(`${year}${month}${day}${hour}${minute}`);
}

function toSafeNonNegativeNumber(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}
