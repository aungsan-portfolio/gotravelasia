import type { DealTag, Flight } from "./types.js";
import { getMedian } from "./stats.js";
import { getTotalTripMinutes } from "./flightSorting.js";

const MAX_DEAL_TAGS = 3;

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function getValidPrices(flights: Flight[]): number[] {
  return flights.map((flight) => flight.price.total).filter(isFinitePositiveNumber);
}

function getValidDurations(flights: Flight[]): number[] {
  return flights.map(getTotalTripMinutes).filter((value) => Number.isFinite(value) && value >= 0);
}

function hasHighRiskConnection(flight: Flight): boolean {
  return (
    flight.outbound.layovers.some((layover) => layover.riskLevel === "high") ||
    Boolean(flight.return?.layovers.some((layover) => layover.riskLevel === "high"))
  );
}

function isRedEye(flight: Flight): boolean {
  const departure = flight.outbound.segments[0]?.departure.localTime;
  const match = departure?.match(/T(\d{2}):/);
  const hour = match ? Number.parseInt(match[1], 10) : Number.NaN;

  if (!Number.isFinite(hour)) return false;
  return hour >= 22 || hour <= 5;
}

export function getPrimaryDealTag(flight: Flight, allFlights: Flight[]): DealTag {
  const prices = getValidPrices(allFlights);
  if (!prices.length || !isFinitePositiveNumber(flight.price.total)) return "typical";

  const median = getMedian(prices);
  const min = Math.min(...prices);

  if (flight.price.total <= min) return "best";
  if (flight.price.total <= median * 0.85) return "great";
  if (flight.price.total <= median * 1.15) return "typical";
  return "expensive";
}

export function getDealTags(flight: Flight, allFlights: Flight[]): DealTag[] {
  const tags: DealTag[] = [];
  const primary = getPrimaryDealTag(flight, allFlights);
  tags.push(primary);

  const durations = getValidDurations(allFlights);
  const flightDuration = getTotalTripMinutes(flight);
  const minDuration = durations.length ? Math.min(...durations) : Number.NaN;

  if (flight.totalStops === 0) tags.push("direct");
  if (Number.isFinite(minDuration) && flightDuration === minDuration) tags.push("fastest");
  if (isRedEye(flight) && primary !== "expensive") tags.push("redEyeSaver");
  if (flight.isSelfTransfer) tags.push("selfTransfer");
  if (hasHighRiskConnection(flight)) tags.push("riskyConnection");

  return [...new Set(tags)].slice(0, MAX_DEAL_TAGS);
}
