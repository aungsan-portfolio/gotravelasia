import type { Flight } from './types.js';

export interface HackerFareCombination {
  id: string;
  type: 'hacker';
  outbound: Flight;
  inbound: Flight;

  totalPrice: number;

  /**
   * Actual in-air / itinerary travel time only.
   * Does NOT include how long the traveler stays at destination.
   */
  airTravelMinutes: number;

  /**
   * Time between outbound arrival and inbound departure.
   * For round-trip split fares, this is destination stay length.
   */
  destinationStayMinutes: number;

  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
  warnings: string[];
  isRecommended: boolean;
}

export interface FindHackerFaresOptions {
  limit?: number;
  minScore?: number;
  minDestinationStayMinutes?: number;
  maxTotalPrice?: number;

  /**
   * Candidate pool size before combination.
   * Keep modest for performance.
   */
  candidatePoolSize?: number;

  /**
   * If true, airport code must match exactly.
   * If false, caller may later extend this to city/open-jaw logic.
   */
  strictAirportMatch?: boolean;

  /**
   * Optional comparison baseline:
   * use this to determine whether the split fare is actually a good deal.
   */
  cheapestProtectedRoundTripPrice?: number;
}

/**
 * Normalize IATA/airport code safely.
 */
function normalizeAirportCode(code: string | undefined | null): string {
  return (code ?? '').trim().toUpperCase();
}

/**
 * Safe date parsing. Returns epoch ms or null.
 */
function parseDateMs(value: string | undefined | null): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Prefer deterministic/stable IDs for caching, dedupe, and UI stability.
 */
function buildCombinationId(outbound: Flight, inbound: Flight): string {
  return `hacker:${outbound.id}__${inbound.id}`;
}

/**
 * Extract carrier hints if your Flight model exposes them.
 * Safe against partial models.
 */
function getMarketingCarrierCode(flight: Flight): string | undefined {
  return flight.validatingAirline || flight.outbound.segments[0]?.airline;
}

/**
 * Optional stop count reader.
 */
function getStopCount(flight: Flight): number {
  return flight.totalStops || 0;
}

/**
 * Optional baggage included reader.
 */
function hasIncludedBag(flight: Flight): boolean | undefined {
  return flight.baggageIncluded;
}

/**
 * Select a better candidate pool than pure "cheapest only".
 * Keeps performance bounded while improving result quality.
 */
function buildCandidatePool(
  flights: Flight[],
  poolSize: number
): Flight[] {
  const byPrice = [...flights]
    .filter((f) => Number.isFinite(f.price.total))
    .sort((a, b) => a.price.total - b.price.total)
    .slice(0, poolSize);

  const byDuration = [...flights]
    .filter((f) => Number.isFinite(f.outbound.totalDurationMinutes))
    .sort((a, b) => a.outbound.totalDurationMinutes - b.outbound.totalDurationMinutes)
    .slice(0, Math.max(5, Math.floor(poolSize / 2)));

  const byStops = [...flights]
    .sort((a, b) => getStopCount(a) - getStopCount(b) || a.price.total - b.price.total)
    .slice(0, Math.max(5, Math.floor(poolSize / 2)));

  const map = new Map<string, Flight>();

  for (const flight of [...byPrice, ...byDuration, ...byStops]) {
    const key = flight.id;
    if (!map.has(key)) {
      map.set(key, flight);
    }
  }

  return [...map.values()].slice(0, poolSize);
}

/**
 * Separate-ticket risk model for split round-trip hacker fares.
 * This is NOT layover/MCT risk. It reflects ticketing/operational risk.
 */
function classifySeparateTicketRisk(
  outbound: Flight,
  inbound: Flight
): 'low' | 'medium' | 'high' {
  let points = 0;

  const outboundCarrier = getMarketingCarrierCode(outbound);
  const inboundCarrier = getMarketingCarrierCode(inbound);

  if (outboundCarrier && inboundCarrier && outboundCarrier !== inboundCarrier) {
    points += 1;
  }

  const outboundBag = hasIncludedBag(outbound);
  const inboundBag = hasIncludedBag(inbound);

  if (
    typeof outboundBag === 'boolean' &&
    typeof inboundBag === 'boolean' &&
    outboundBag !== inboundBag
  ) {
    points += 1;
  }

  const totalStops = getStopCount(outbound) + getStopCount(inbound);
  if (totalStops >= 3) points += 1;
  if (totalStops >= 5) points += 1;

  if (points >= 3) return 'high';
  if (points >= 1) return 'medium';
  return 'low';
}

function buildWarnings(
  outbound: Flight,
  inbound: Flight,
  riskLevel: 'low' | 'medium' | 'high'
): string[] {
  const warnings = new Set<string>();

  warnings.add('Separate tickets');
  warnings.add('No protection if one flight is delayed or cancelled');
  warnings.add('Baggage may not be checked through');

  const outboundCarrier = getMarketingCarrierCode(outbound);
  const inboundCarrier = getMarketingCarrierCode(inbound);

  if (outboundCarrier && inboundCarrier && outboundCarrier !== inboundCarrier) {
    warnings.add('Different airlines on outbound and inbound');
  }

  const outboundBag = hasIncludedBag(outbound);
  const inboundBag = hasIncludedBag(inbound);

  if (
    typeof outboundBag === 'boolean' &&
    typeof inboundBag === 'boolean' &&
    outboundBag !== inboundBag
  ) {
    warnings.add('Baggage allowance differs between the two tickets');
  }

  if (riskLevel === 'high') {
    warnings.add('Higher support/irregular-operations risk than a protected round-trip ticket');
  }

  return [...warnings];
}

function buildTags(params: {
  riskLevel: 'low' | 'medium' | 'high';
  totalPrice: number;
  cheapestProtectedRoundTripPrice?: number;
  outbound: Flight;
  inbound: Flight;
}): string[] {
  const {
    riskLevel,
    totalPrice,
    cheapestProtectedRoundTripPrice,
    outbound,
    inbound,
  } = params;

  const tags = new Set<string>();
  tags.add('hacker-fare');

  if (riskLevel === 'medium') tags.add('separate-ticket-risk');
  if (riskLevel === 'high') tags.add('risky');

  if (
    typeof cheapestProtectedRoundTripPrice === 'number' &&
    cheapestProtectedRoundTripPrice > 0
  ) {
    const ratio = totalPrice / cheapestProtectedRoundTripPrice;

    if (ratio <= 0.9) tags.add('great-deal');
    else if (ratio <= 0.97) tags.add('good-deal');
    else tags.add('small-savings');
  }

  const outboundCarrier = getMarketingCarrierCode(outbound);
  const inboundCarrier = getMarketingCarrierCode(inbound);

  if (outboundCarrier && inboundCarrier && outboundCarrier !== inboundCarrier) {
    tags.add('mixed-carriers');
  }

  return [...tags];
}

/**
 * Purpose-built score for hacker fares.
 * Higher is better. Range is clamped to 0..100.
 */
function calculateHackerFareScore(params: {
  totalPrice: number;
  airTravelMinutes: number;
  riskLevel: 'low' | 'medium' | 'high';
  totalStops: number;
  cheapestProtectedRoundTripPrice?: number;
}): number {
  const {
    totalPrice,
    airTravelMinutes,
    riskLevel,
    totalStops,
    cheapestProtectedRoundTripPrice,
  } = params;

  let score = 100;

  // Price component
  if (
    typeof cheapestProtectedRoundTripPrice === 'number' &&
    cheapestProtectedRoundTripPrice > 0
  ) {
    const savingsRatio = (cheapestProtectedRoundTripPrice - totalPrice) / cheapestProtectedRoundTripPrice;

    if (savingsRatio >= 0.15) score += 8;
    else if (savingsRatio >= 0.08) score += 4;
    else if (savingsRatio <= 0) score -= 8;
  } else {
    // fallback heuristic when no baseline is available
    if (totalPrice > 1200) score -= 6;
    else if (totalPrice > 800) score -= 3;
  }

  // Travel-time penalty (do not include destination stay)
  if (airTravelMinutes > 1800) score -= 10;
  else if (airTravelMinutes > 1200) score -= 6;
  else if (airTravelMinutes > 800) score -= 3;

  // Stop penalty
  score -= Math.min(12, totalStops * 3);

  // Risk penalty
  if (riskLevel === 'medium') score -= 10;
  if (riskLevel === 'high') score -= 22;

  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}

function shouldRecommend(params: {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  totalPrice: number;
  cheapestProtectedRoundTripPrice?: number;
}): boolean {
  const { score, riskLevel, totalPrice, cheapestProtectedRoundTripPrice } = params;

  if (riskLevel === 'high') return false;
  if (score < 70) return false;

  if (
    typeof cheapestProtectedRoundTripPrice === 'number' &&
    cheapestProtectedRoundTripPrice > 0
  ) {
    const savingsRatio = (cheapestProtectedRoundTripPrice - totalPrice) / cheapestProtectedRoundTripPrice;
    return savingsRatio >= 0.05;
  }

  return score >= 80;
}

/**
 * Build round-trip split-fare combinations:
 * outbound one-way + inbound one-way
 */
export function findHackerFares(
  outboundFlights: Flight[],
  inboundFlights: Flight[],
  options: FindHackerFaresOptions = {}
): HackerFareCombination[] {
  const {
    limit = 25,
    minScore = 0,
    minDestinationStayMinutes = 180,
    maxTotalPrice,
    candidatePoolSize = 40,
    strictAirportMatch = true,
    cheapestProtectedRoundTripPrice,
  } = options;

  if (!Array.isArray(outboundFlights) || !Array.isArray(inboundFlights)) {
    return [];
  }

  const combinations: HackerFareCombination[] = [];
  const seenIds = new Set<string>();

  const candidateOutbound = buildCandidatePool(outboundFlights, candidatePoolSize);
  const candidateInbound = buildCandidatePool(inboundFlights, candidatePoolSize);

  for (const outbound of candidateOutbound) {
    for (const inbound of candidateInbound) {
      const outboundDestAirport = outbound.outbound.segments[outbound.outbound.segments.length - 1]?.arrival.airport.iataCode;
      const inboundOriginAirport = inbound.outbound.segments[0]?.departure.airport.iataCode;
      
      const outboundDestination = normalizeAirportCode(outboundDestAirport);
      const inboundOrigin = normalizeAirportCode(inboundOriginAirport);

      if (strictAirportMatch && outboundDestination !== inboundOrigin) {
        continue;
      }

      const totalPrice = outbound.price.total + inbound.price.total;
      if (!Number.isFinite(totalPrice)) continue;
      if (typeof maxTotalPrice === 'number' && totalPrice > maxTotalPrice) continue;

      const outboundArrivalTime = outbound.outbound.segments[outbound.outbound.segments.length - 1]?.arrival.utcTime || outbound.outbound.segments[outbound.outbound.segments.length - 1]?.arrival.localTime;
      const inboundDepartureTime = inbound.outbound.segments[0]?.departure.utcTime || inbound.outbound.segments[0]?.departure.localTime;
      
      const outboundArrivalMs = parseDateMs(outboundArrivalTime);
      const inboundDepartureMs = parseDateMs(inboundDepartureTime);

      if (outboundArrivalMs === null || inboundDepartureMs === null) continue;
      if (inboundDepartureMs <= outboundArrivalMs) continue;

      const destinationStayMinutes = Math.round(
        (inboundDepartureMs - outboundArrivalMs) / (1000 * 60)
      );

      if (destinationStayMinutes < minDestinationStayMinutes) continue;

      const outboundDuration = outbound.outbound.totalDurationMinutes ?? 0;
      const inboundDuration = inbound.outbound.totalDurationMinutes ?? 0;

      if (!Number.isFinite(outboundDuration) || !Number.isFinite(inboundDuration)) {
        continue;
      }

      const airTravelMinutes = outboundDuration + inboundDuration;
      const totalStops = getStopCount(outbound) + getStopCount(inbound);

      const riskLevel = classifySeparateTicketRisk(outbound, inbound);

      const score = calculateHackerFareScore({
        totalPrice,
        airTravelMinutes,
        riskLevel,
        totalStops,
        cheapestProtectedRoundTripPrice,
      });

      if (score < minScore) continue;

      const id = buildCombinationId(outbound, inbound);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      const warnings = buildWarnings(outbound, inbound, riskLevel);
      const tags = buildTags({
        riskLevel,
        totalPrice,
        cheapestProtectedRoundTripPrice,
        outbound,
        inbound,
      });

      const combination: HackerFareCombination = {
        id,
        type: 'hacker',
        outbound,
        inbound,
        totalPrice,
        airTravelMinutes,
        destinationStayMinutes,
        score,
        riskLevel,
        tags,
        warnings,
        isRecommended: shouldRecommend({
          score,
          riskLevel,
          totalPrice,
          cheapestProtectedRoundTripPrice,
        }),
      };

      combinations.push(combination);
    }
  }

  combinations.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.01) return b.score - a.score;
    if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
    return a.airTravelMinutes - b.airTravelMinutes;
  });

  return combinations.slice(0, limit);
}

/** Type guard */
export function isHackerFare(value: unknown): value is HackerFareCombination {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { type?: string }).type === 'hacker'
  );
}
