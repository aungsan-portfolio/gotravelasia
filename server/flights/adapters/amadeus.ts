import { randomUUID } from "node:crypto";
import type {
  Airport,
  CabinClass,
  Flight,
  FlightLeg,
  FlightSegment,
  Layover,
} from "../../../shared/flights/types.js";
import { classifyLayoverRisk } from "../../../shared/flights/airportMct.js";

function toAirport(iataCode: string, terminal?: string): Airport {
  return {
    iataCode: iataCode || "",
    name: iataCode || "",
    city: iataCode || "",
    country: "",
    terminal,
  };
}

function diffMinutes(aIso?: string, bIso?: string): number {
  if (!aIso || !bIso) return 0;

  // Z-hack: both timestamps belong to the same connection airport context,
  // so forcing UTC parsing avoids server-local timezone / DST skew.
  const a = new Date(`${aIso}Z`).getTime();
  const b = new Date(`${bIso}Z`).getTime();

  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}

function isoDurationToMinutes(input?: string): number {
  if (!input) return 0;
  const m = input.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;

  const days = Number(m[1] || 0);
  const hours = Number(m[2] || 0);
  const mins = Number(m[3] || 0);

  return days * 1440 + hours * 60 + mins;
}

function toCabinClass(value?: string): CabinClass {
  const normalized = (value || "").toUpperCase();

  switch (normalized) {
    case "ECONOMY":
      return "economy";
    case "PREMIUM_ECONOMY":
      return "premium";
    case "BUSINESS":
      return "business";
    case "FIRST":
      return "first";
    default:
      return "economy";
  }
}

function getFareDetailForSegment(travelerPricings: any[] | undefined, segmentId: string) {
  const firstTraveler = Array.isArray(travelerPricings) ? travelerPricings[0] : null;
  const fareDetails = firstTraveler?.fareDetailsBySegment;

  if (!Array.isArray(fareDetails)) return undefined;
  return fareDetails.find((f: any) => f.segmentId === segmentId);
}

function buildLeg(itinerary: any, travelerPricings?: any[]): FlightLeg {
  const rawSegments = Array.isArray(itinerary?.segments) ? itinerary.segments : [];

  const segments: FlightSegment[] = rawSegments.map((seg: any, index: number) => {
    const fareDetail = getFareDetailForSegment(travelerPricings, seg.id);

    return {
      id: seg.id || `${seg.carrierCode || "XX"}-${seg.number || index}`,
      departure: {
        airport: toAirport(seg.departure?.iataCode || "", seg.departure?.terminal),
        localTime: seg.departure?.at || "",
      },
      arrival: {
        airport: toAirport(seg.arrival?.iataCode || "", seg.arrival?.terminal),
        localTime: seg.arrival?.at || "",
      },
      airline: seg.carrierCode || "",
      marketingAirline: seg.carrierCode || "",
      operatingAirline: seg.operating?.carrierCode || seg.carrierCode || "",
      flightNumber: seg.number || "",
      aircraft: seg.aircraft?.code || "",
      durationMinutes: isoDurationToMinutes(seg.duration),
      cabinClass: toCabinClass(fareDetail?.cabin),
    };
  });

  const layovers: Layover[] = [];

  for (let i = 0; i < segments.length - 1; i += 1) {
    const current = segments[i];
    const next = segments[i + 1];

    const layoverMinutes = diffMinutes(
      current.arrival.localTime,
      next.departure.localTime
    );

    const sameAirport =
      current.arrival.airport.iataCode === next.departure.airport.iataCode;

    const requiresTerminalChange =
      Boolean(current.arrival.airport.terminal) &&
      Boolean(next.departure.airport.terminal) &&
      current.arrival.airport.terminal !== next.departure.airport.terminal;

    const requiresAirportChange = !sameAirport;

    const riskLevel = classifyLayoverRisk({
      airportCode: next.departure.airport.iataCode,
      layoverMinutes,
      isInternational: true,
      hasTerminalChange: requiresTerminalChange,
      hasAirportChange: requiresAirportChange,
      isSelfTransfer: false,
    });

    let warning: string | undefined;
    if (requiresAirportChange) {
      warning = "Airport change connection";
    } else if (layoverMinutes < 90) {
      warning = "Tight connection";
    }

    layovers.push({
      airport: next.departure.airport,
      durationMinutes: layoverMinutes,
      isSelfTransfer: false,
      requiresTerminalChange,
      requiresAirportChange,
      riskLevel,
      warning,
    });
  }

  return {
    segments,
    totalDurationMinutes: isoDurationToMinutes(itinerary?.duration),
    layovers,
  };
}

function extractBaggageIncluded(travelerPricings?: any[]): boolean | undefined {
  if (!Array.isArray(travelerPricings) || travelerPricings.length === 0) {
    return undefined;
  }

  for (const traveler of travelerPricings) {
    const details = traveler?.fareDetailsBySegment;
    if (!Array.isArray(details)) continue;

    for (const detail of details) {
      const qty = detail?.includedCheckedBags?.quantity;
      if (typeof qty === "number") {
        if (qty > 0) return true;
      }
    }
  }

  return false;
}

function collectWarnings(outbound: FlightLeg, inbound?: FlightLeg): string[] {
  const warnings = [
    ...outbound.layovers
      .map((l) => l.warning)
      .filter((value): value is string => Boolean(value)),
    ...(inbound?.layovers
      .map((l) => l.warning)
      .filter((value): value is string => Boolean(value)) || []),
  ];

  return [...new Set(warnings)];
}

export function normalizeAmadeusOffer(offer: any): Flight {
  const outbound = buildLeg(offer.itineraries?.[0], offer.travelerPricings);
  const inbound = offer.itineraries?.[1]
    ? buildLeg(offer.itineraries[1], offer.travelerPricings)
    : undefined;

  const baggageIncluded = extractBaggageIncluded(offer.travelerPricings);
  const total = Number(offer.price?.total || 0);
  const base = Number(offer.price?.base || 0);

  return {
    id: offer.id || randomUUID(),
    type: inbound ? "roundtrip" : "oneway",
    outbound,
    return: inbound,
    price: {
      total,
      currency: offer.price?.currency || "USD",
      baseFare: Number.isFinite(base) ? base : undefined,
      taxes: Number.isFinite(total) && Number.isFinite(base) ? total - base : undefined,
    },
    totalStops:
      Math.max(0, outbound.segments.length - 1) +
      (inbound ? Math.max(0, inbound.segments.length - 1) : 0),
    warnings: collectWarnings(outbound, inbound),
    isSelfTransfer: false,
    bookingProvider: "amadeus",
    sourceType: "amadeus",
    validatingAirline: offer.validatingAirlineCodes?.[0],
    baggageIncluded,
    refundable: offer.pricingOptions?.refundableFare ?? undefined,
    mixedCabin: false,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function normalizeAmadeusOffers(offers: any[]): Flight[] {
  if (!Array.isArray(offers)) return [];
  return offers.map(normalizeAmadeusOffer).filter((flight) => flight.price.total > 0);
}
