import type { Flight, FlightLeg } from "./types.js";

export type FlightStopFilter = "nonstop" | "1stop" | "2plus";

export interface TimeWindow {
  startHour: number;
  endHour: number;
}

export interface FlightFilterInput {
  price?: {
    min?: number;
    max?: number;
  };
  stops?: FlightStopFilter[];
  includeAirlines?: string[];
  excludeAirlines?: string[];
  outboundDepartureTimeWindow?: TimeWindow;
  outboundArrivalTimeWindow?: TimeWindow;
  maxTotalTripMinutes?: number;
  maxLayoverMinutes?: number;
  excludeHighRiskConnections?: boolean;
  excludeSelfTransfer?: boolean;
  refundableOnly?: boolean;
  baggageIncludedOnly?: boolean;
  excludeMixedCabin?: boolean;
}

/**
 * Returns true only if the flight satisfies every active filter.
 */
export function doesFlightMatchFilters<T extends Flight>(
  flight: T,
  filters: FlightFilterInput = {}
): boolean {
  if (!flight) return false;

  // Price
  if (filters.price) {
    const { min, max } = filters.price;

    if (isFiniteNumber(min) && flight.price.total < min) return false;
    if (isFiniteNumber(max) && flight.price.total > max) return false;
  }

  // Stops
  if (filters.stops?.length) {
    const matches = filters.stops.some((stopFilter) =>
      matchesStopFilter(flight.totalStops, stopFilter)
    );
    if (!matches) return false;
  }

  // Airlines
  const flightAirlines = getFlightAirlines(flight);

  const includeAirlines = new Set(
    (filters.includeAirlines ?? []).map(normalizeAirline).filter(isDefined)
  );
  if (includeAirlines.size > 0) {
    const hasIncludedAirline = [...flightAirlines].some((code) =>
      includeAirlines.has(code)
    );
    if (!hasIncludedAirline) return false;
  }

  const excludeAirlines = new Set(
    (filters.excludeAirlines ?? []).map(normalizeAirline).filter(isDefined)
  );
  if (excludeAirlines.size > 0) {
    const hasExcludedAirline = [...flightAirlines].some((code) =>
      excludeAirlines.has(code)
    );
    if (hasExcludedAirline) return false;
  }

  // Outbound departure time window
  if (filters.outboundDepartureTimeWindow) {
    const departureHour = getHourFromLocalIso(
      flight.outbound.segments[0]?.departure.localTime
    );
    if (
      departureHour === undefined ||
      !isHourWithinWindow(departureHour, filters.outboundDepartureTimeWindow)
    ) {
      return false;
    }
  }

  // Outbound final arrival time window
  if (filters.outboundArrivalTimeWindow) {
    const lastSegment =
      flight.outbound.segments[flight.outbound.segments.length - 1];
    const arrivalHour = getHourFromLocalIso(lastSegment?.arrival.localTime);

    if (
      arrivalHour === undefined ||
      !isHourWithinWindow(arrivalHour, filters.outboundArrivalTimeWindow)
    ) {
      return false;
    }
  }

  // Total trip duration
  if (isFiniteNumber(filters.maxTotalTripMinutes)) {
    if (getTotalTripMinutes(flight) > filters.maxTotalTripMinutes) return false;
  }

  // Max single layover duration across outbound + return
  if (isFiniteNumber(filters.maxLayoverMinutes)) {
    const maxLayover = getMaxLayoverMinutes(flight);
    if (maxLayover > filters.maxLayoverMinutes) return false;
  }

  // Risk / transfer / fare conditions
  if (filters.excludeHighRiskConnections && hasHighRiskConnection(flight)) {
    return false;
  }

  if (filters.excludeSelfTransfer && hasAnySelfTransfer(flight)) {
    return false;
  }

  if (filters.refundableOnly && flight.refundable !== true) {
    return false;
  }

  if (filters.baggageIncludedOnly && flight.baggageIncluded !== true) {
    return false;
  }

  if (filters.excludeMixedCabin && flight.mixedCabin === true) {
    return false;
  }

  return true;
}

/**
 * Applies all active filters to an array of flights.
 * If no active filters exist, returns the original array.
 */
export function applyFlightFilters<T extends Flight>(
  flights: T[],
  filters: FlightFilterInput = {}
): T[] {
  if (!Array.isArray(flights) || flights.length === 0) return [];
  if (!hasActiveFilters(filters)) return flights;

  return flights.filter((flight) => doesFlightMatchFilters(flight, filters));
}

// ─────────────────────────────────────────────────────────────
// Private helpers
// ─────────────────────────────────────────────────────────────

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeAirline(code?: string): string | undefined {
  const trimmed = code?.trim().toUpperCase();
  return trimmed || undefined;
}

function getFlightAirlines(flight: Flight): Set<string> {
  const codes = new Set<string>();

  const addAirline = (value?: string) => {
    const normalized = normalizeAirline(value);
    if (normalized) codes.add(normalized);
  };

  addAirline(flight.validatingAirline);

  for (const segment of flight.outbound.segments) {
    addAirline(segment.airline);
    addAirline(segment.marketingAirline);
    addAirline(segment.operatingAirline);
  }

  for (const segment of flight.return?.segments ?? []) {
    addAirline(segment.airline);
    addAirline(segment.marketingAirline);
    addAirline(segment.operatingAirline);
  }

  return codes;
}

function getHourFromLocalIso(iso?: string): number | undefined {
  if (!iso) return undefined;

  const match = iso.match(/T(\d{2}):\d{2}/);
  if (!match) return undefined;

  const hour = parseInt(match[1], 10);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return undefined;

  return hour;
}

function isHourWithinWindow(hour: number, window: TimeWindow): boolean {
  const start = clampHour(window.startHour);
  const end = clampHour(window.endHour);

  if (start <= end) return hour >= start && hour <= end;
  return hour >= start || hour <= end; // overnight window, e.g. 22 -> 5
}

function clampHour(value: number): number {
  return Math.max(0, Math.min(23, Math.floor(value)));
}

function legMaxLayoverMinutes(leg?: FlightLeg): number {
  if (!leg?.layovers.length) return 0;
  return Math.max(...leg.layovers.map((l) => l.durationMinutes));
}

/**
 * Returns the maximum single layover across outbound + return legs.
 */
function getMaxLayoverMinutes(flight: Flight): number {
  return Math.max(
    legMaxLayoverMinutes(flight.outbound),
    legMaxLayoverMinutes(flight.return)
  );
}

function hasHighRiskConnection(flight: Flight): boolean {
  return (
    flight.outbound.layovers.some((layover) => layover.riskLevel === "high") ||
    Boolean(flight.return?.layovers.some((layover) => layover.riskLevel === "high"))
  );
}

function hasAnySelfTransfer(flight: Flight): boolean {
  return (
    flight.isSelfTransfer === true ||
    flight.outbound.layovers.some((layover) => layover.isSelfTransfer) ||
    Boolean(flight.return?.layovers.some((layover) => layover.isSelfTransfer))
  );
}

function matchesStopFilter(
  totalStops: number,
  stopFilter: FlightStopFilter
): boolean {
  if (stopFilter === "nonstop") return totalStops === 0;
  if (stopFilter === "1stop") return totalStops === 1;
  return totalStops >= 2;
}

function getTotalTripMinutes(flight: Flight): number {
  return (
    flight.outbound.totalDurationMinutes +
    (flight.return?.totalDurationMinutes ?? 0)
  );
}

function hasActiveFilters(filters: FlightFilterInput | undefined | null): boolean {
  if (!filters) return false;

  if (isFiniteNumber(filters.price?.min)) return true;
  if (isFiniteNumber(filters.price?.max)) return true;
  if (filters.stops?.length) return true;
  if (filters.includeAirlines?.some((code) => Boolean(normalizeAirline(code)))) return true;
  if (filters.excludeAirlines?.some((code) => Boolean(normalizeAirline(code)))) return true;
  if (filters.outboundDepartureTimeWindow) return true;
  if (filters.outboundArrivalTimeWindow) return true;
  if (isFiniteNumber(filters.maxTotalTripMinutes)) return true;
  if (isFiniteNumber(filters.maxLayoverMinutes)) return true;
  if (filters.excludeHighRiskConnections) return true;
  if (filters.excludeSelfTransfer) return true;
  if (filters.refundableOnly) return true;
  if (filters.baggageIncludedOnly) return true;
  if (filters.excludeMixedCabin) return true;

  return false;
}
