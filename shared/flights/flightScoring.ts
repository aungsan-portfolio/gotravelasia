import type {
  DealTag,
  Flight,
  Layover,
  ScoredFlight,
  ScoringWeights,
} from "./types.js";
import { DEFAULT_WEIGHTS } from "./types.js";
import { normalizeLowerIsBetter, clamp01, getMedian } from "./stats.js";

function getDepartureHourScore(localIso?: string): number {
  if (!localIso) return 0.6;

  const date = new Date(localIso);
  const hour = date.getHours();

  if (hour >= 7 && hour <= 11) return 1.0;
  if (hour >= 12 && hour <= 17) return 0.9;
  if (hour >= 18 && hour <= 21) return 0.75;
  if (hour >= 5 && hour < 7) return 0.65;
  return 0.35; // red-eye / very late / very early
}

function getAirlineScore(flight: Flight): number {
  const airline = (flight.validatingAirline || flight.outbound.segments[0]?.airline || "").toUpperCase();

  const preferred = new Set(["SQ", "TG", "MH", "CX", "QR", "EK", "JL", "NH"]);
  const acceptable = new Set(["FD", "AK", "TR", "VZ", "SL", "OD", "PR", "VN"]);

  if (preferred.has(airline)) return 0.95;
  if (acceptable.has(airline)) return 0.75;
  if (airline) return 0.6;
  return 0.5;
}

function getStopsScore(stops: number): number {
  if (stops <= 0) return 1.0;
  if (stops === 1) return 0.75;
  if (stops === 2) return 0.45;
  return 0.2;
}

function getLayoverPenalty(layovers: Layover[]): number {
  if (!layovers.length) return 0;

  let penalty = 0;

  for (const layover of layovers) {
    if (layover.riskLevel === "high") penalty += 0.55;
    else if (layover.riskLevel === "medium") penalty += 0.25;

    if (layover.isSelfTransfer) penalty += 0.15;
    if (layover.requiresTerminalChange) penalty += 0.10;
    if (layover.requiresAirportChange) penalty += 0.40;
  }

  return Math.min(0.9, penalty);
}

function getRiskScore(flight: Flight): number {
  const outboundPenalty = getLayoverPenalty(flight.outbound.layovers);
  const returnPenalty = flight.return ? getLayoverPenalty(flight.return.layovers) : 0;
  const totalPenalty = Math.min(0.95, outboundPenalty + returnPenalty);

  let score = 1 - totalPenalty;

  if (flight.isSelfTransfer) score -= 0.08;
  if (flight.mixedCabin) score -= 0.05;

  return clamp01(score);
}

function getBaggageScore(flight: Flight): number {
  if (flight.baggageIncluded === true) return 1;
  if (flight.baggageIncluded === false) return 0.55;
  return 0.7;
}

function assignDealTag(flight: Flight, allFlights: Flight[]): DealTag {
  const prices = allFlights.map((f) => f.price.total).filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return "typical";

  const median = getMedian(prices);
  const min = Math.min(...prices);

  if (flight.price.total <= min) return "best";
  if (flight.price.total <= median * 0.85) return "great";
  if (flight.price.total <= median * 1.15) return "typical";
  return "expensive";
}

export function calculateSmartMixScore(
  flight: Flight,
  allFlights: Flight[],
  customWeights: Partial<ScoringWeights> = {}
): ScoredFlight {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  const prices = allFlights.map((f) => f.price.total);
  const durations = allFlights.map((f) => f.outbound.totalDurationMinutes);

  const priceScore = normalizeLowerIsBetter(flight.price.total, prices);
  const durationScore = normalizeLowerIsBetter(
    flight.outbound.totalDurationMinutes,
    durations
  );
  const stopsScore = getStopsScore(flight.totalStops);
  const timeScore = getDepartureHourScore(flight.outbound.segments[0]?.departure.localTime);
  const airlineScore = getAirlineScore(flight);
  const riskScore = getRiskScore(flight);
  const baggageScore = getBaggageScore(flight);

  const weighted =
    priceScore * weights.price +
    durationScore * weights.duration +
    stopsScore * weights.stops +
    timeScore * weights.departureTime +
    airlineScore * weights.airline +
    riskScore * weights.risk +
    baggageScore * weights.baggage;

  const totalWeight =
    weights.price +
    weights.duration +
    weights.stops +
    weights.departureTime +
    weights.airline +
    weights.risk +
    weights.baggage;

  const finalScore = totalWeight > 0 ? weighted / totalWeight : weighted;

  return {
    ...flight,
    score: Number(finalScore.toFixed(4)),
    priceScore: Number(priceScore.toFixed(4)),
    durationScore: Number(durationScore.toFixed(4)),
    stopsScore: Number(stopsScore.toFixed(4)),
    timeScore: Number(timeScore.toFixed(4)),
    airlineScore: Number(airlineScore.toFixed(4)),
    riskScore: Number(riskScore.toFixed(4)),
    baggageScore: Number(baggageScore.toFixed(4)),
    dealTag: assignDealTag(flight, allFlights),
  };
}

export function scoreFlights(
  flights: Flight[],
  customWeights: Partial<ScoringWeights> = {}
): ScoredFlight[] {
  return flights
    .map((flight) => calculateSmartMixScore(flight, flights, customWeights))
    .sort((a, b) => b.score - a.score);
}
