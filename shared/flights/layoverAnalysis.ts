import type { Flight, Layover } from "./types.js";
import { clamp01 } from "./stats.js";

export interface LayoverWorthItAnalysis {
  isWorthIt: boolean;
  moneySaved: number;
  timeAddedMinutes: number;
  savingsPerHour: number;
  reason: string;
  confidence: number;
}

function getTotalJourneyMinutes(flight: Flight): number {
  return flight.outbound.totalDurationMinutes + (flight.return?.totalDurationMinutes ?? 0);
}

function getAllLayovers(flight: Flight): Layover[] {
  return [...flight.outbound.layovers, ...(flight.return?.layovers ?? [])];
}

function compareByLowerPriceThenDuration(a: Flight, b: Flight): number {
  if (a.price.total !== b.price.total) return a.price.total - b.price.total;
  return getTotalJourneyMinutes(a) - getTotalJourneyMinutes(b);
}

export function findBestComparableDirectFlight(
  targetFlight: Flight,
  comparableFlights: Flight[]
): Flight | null {
  const directOptions = comparableFlights
    .filter((flight) => flight.id !== targetFlight.id && flight.totalStops === 0)
    .sort(compareByLowerPriceThenDuration);

  return directOptions[0] ?? null;
}

export function findBestComparableLowerStopFlight(
  targetFlight: Flight,
  comparableFlights: Flight[]
): Flight | null {
  const lowerStopOptions = comparableFlights
    .filter(
      (flight) =>
        flight.id !== targetFlight.id &&
        Number.isFinite(flight.totalStops) &&
        flight.totalStops >= 0 &&
        flight.totalStops < targetFlight.totalStops
    )
    .sort(compareByLowerPriceThenDuration);

  return lowerStopOptions[0] ?? null;
}

function getLayoverBurdenMinutes(flight: Flight): number {
  const layovers = getAllLayovers(flight);

  let burden = 0;
  for (const layover of layovers) {
    if (layover.isSelfTransfer) burden += 75;
    if (layover.requiresTerminalChange) burden += 35;
    if (layover.requiresAirportChange) burden += 90;
    if (layover.riskLevel === "high") burden += 70;
    else if (layover.riskLevel === "medium") burden += 30;
  }

  return burden;
}

export function formatDuration(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatMoney(value: number): string {
  const rounded = Math.round(value);
  return `$${rounded.toLocaleString("en-US")}`;
}

export function analyzeLayoverWorthIt(
  targetFlight: Flight,
  comparableFlights: Flight[]
): LayoverWorthItAnalysis {
  if (targetFlight.totalStops <= 0) {
    return {
      isWorthIt: false,
      moneySaved: 0,
      timeAddedMinutes: 0,
      savingsPerHour: 0,
      reason: "Target itinerary is not layover-heavy.",
      confidence: 0.35,
    };
  }

  const directBaseline = findBestComparableDirectFlight(targetFlight, comparableFlights);
  const lowerStopBaseline = findBestComparableLowerStopFlight(targetFlight, comparableFlights);
  const baseline = directBaseline ?? lowerStopBaseline;

  if (!baseline) {
    return {
      isWorthIt: false,
      moneySaved: 0,
      timeAddedMinutes: 0,
      savingsPerHour: 0,
      reason: "No lower-stop baseline was available for a fair comparison.",
      confidence: 0.25,
    };
  }

  const moneySaved = Number((baseline.price.total - targetFlight.price.total).toFixed(2));
  const rawTimeAddedMinutes = getTotalJourneyMinutes(targetFlight) - getTotalJourneyMinutes(baseline);
  const riskBurdenMinutes = getLayoverBurdenMinutes(targetFlight);
  const effectiveTimeAddedMinutes = Math.max(0, rawTimeAddedMinutes) + riskBurdenMinutes;

  const savingsPerHour =
    effectiveTimeAddedMinutes > 0
      ? Number((moneySaved / (effectiveTimeAddedMinutes / 60)).toFixed(2))
      : Number(moneySaved.toFixed(2));

  if (moneySaved <= 0) {
    return {
      isWorthIt: false,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: "Layover itinerary is not cheaper than lower-stop alternatives.",
      confidence: 0.9,
    };
  }

  const hasSevereTransferPenalty = getAllLayovers(targetFlight).some(
    (layover) => layover.isSelfTransfer || layover.requiresAirportChange
  );

  if (effectiveTimeAddedMinutes >= 600 && moneySaved < 250) {
    return {
      isWorthIt: false,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: `Adds ${formatDuration(effectiveTimeAddedMinutes)} for only ${formatMoney(moneySaved)} in savings.`,
      confidence: 0.85,
    };
  }

  if (hasSevereTransferPenalty && moneySaved < 150) {
    return {
      isWorthIt: false,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: "Transfer complexity is too high relative to the available savings.",
      confidence: 0.8,
    };
  }

  const isStrongSavingsForBurden =
    (savingsPerHour >= 40 && moneySaved >= 50) ||
    (savingsPerHour >= 25 && moneySaved >= 80 && effectiveTimeAddedMinutes <= 480) ||
    (effectiveTimeAddedMinutes <= 90 && moneySaved >= 60);

  if (isStrongSavingsForBurden) {
    return {
      isWorthIt: true,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: `Saves ${formatMoney(moneySaved)} with a manageable added burden of ${formatDuration(
        effectiveTimeAddedMinutes
      )}.`,
      confidence: clamp01(0.62 + Math.min(0.25, moneySaved / 800)),
    };
  }

  return {
    isWorthIt: false,
    moneySaved,
    timeAddedMinutes: effectiveTimeAddedMinutes,
    savingsPerHour,
    reason: "Savings are real, but not strong enough relative to added layover burden.",
    confidence: clamp01(0.45 + Math.min(0.2, effectiveTimeAddedMinutes / 1200)),
  };
}
