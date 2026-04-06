import { z } from "zod";

export type DealTag = "best" | "great" | "typical" | "expensive";
export type CabinClass = "economy" | "premium" | "business" | "first";
export type TripKind = "oneway" | "roundtrip" | "hacker";
export type RiskLevel = "low" | "medium" | "high";
export type SourceType = "amadeus" | "travelpayouts" | "bot_json" | "cache" | "manual" | "unknown";

export interface Airport {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  terminal?: string;
  timeZone?: string;
}

export interface FlightSegment {
  id: string;
  departure: {
    airport: Airport;
    localTime: string;   // local ISO string
    utcTime?: string;    // optional normalized UTC ISO string
  };
  arrival: {
    airport: Airport;
    localTime: string;
    utcTime?: string;
  };
  airline: string;
  marketingAirline?: string;
  operatingAirline?: string;
  flightNumber: string;
  aircraft?: string;
  durationMinutes: number;
  cabinClass: CabinClass;
}

export interface Layover {
  airport: Airport;
  durationMinutes: number;
  isSelfTransfer: boolean;
  requiresTerminalChange?: boolean;
  requiresAirportChange?: boolean;
  riskLevel: RiskLevel;
  warning?: string;
}

export interface PriceInfo {
  total: number;
  currency: string;
  baseFare?: number;
  taxes?: number;
  originalTotal?: number;
  originalCurrency?: string;
}

export interface FlightLeg {
  segments: FlightSegment[];
  totalDurationMinutes: number;
  layovers: Layover[];
}

export interface Flight {
  id: string;
  type: TripKind;
  outbound: FlightLeg;
  return?: FlightLeg;
  price: PriceInfo;
  totalStops: number;
  warnings: string[];
  isSelfTransfer: boolean;

  bookingProvider?: string;
  sourceType?: SourceType;
  deepLink?: string;

  validatingAirline?: string;
  baggageIncluded?: boolean;
  refundable?: boolean;
  mixedCabin?: boolean;

  lastUpdatedAt?: string;
}

export interface ScoringWeights {
  price: number;
  duration: number;
  stops: number;
  departureTime: number;
  airline: number;
  risk: number;
  baggage: number;
}

export interface ScoredFlight extends Flight {
  score: number;
  priceScore: number;
  durationScore: number;
  stopsScore: number;
  timeScore: number;
  airlineScore: number;
  riskScore: number;
  baggageScore: number;
  dealTag?: DealTag;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  price: 0.32,
  duration: 0.22,
  stops: 0.16,
  departureTime: 0.08,
  airline: 0.08,
  risk: 0.10,
  baggage: 0.04,
};

export const AirportSchema = z.object({
  iataCode: z.string().min(3).max(3),
  name: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  terminal: z.string().optional(),
  timeZone: z.string().optional(),
});

export const FlightSegmentSchema = z.object({
  id: z.string().min(1),
  departure: z.object({
    airport: AirportSchema,
    localTime: z.string().min(1),
    utcTime: z.string().optional(),
  }),
  arrival: z.object({
    airport: AirportSchema,
    localTime: z.string().min(1),
    utcTime: z.string().optional(),
  }),
  airline: z.string().min(1),
  marketingAirline: z.string().optional(),
  operatingAirline: z.string().optional(),
  flightNumber: z.string().min(1),
  aircraft: z.string().optional(),
  durationMinutes: z.number().int().positive(),
  cabinClass: z.enum(["economy", "premium", "business", "first"]),
});

export const LayoverSchema = z.object({
  airport: AirportSchema,
  durationMinutes: z.number().int().nonnegative(),
  isSelfTransfer: z.boolean(),
  requiresTerminalChange: z.boolean().optional(),
  requiresAirportChange: z.boolean().optional(),
  riskLevel: z.enum(["low", "medium", "high"]),
  warning: z.string().optional(),
});

export const FlightLegSchema = z.object({
  segments: z.array(FlightSegmentSchema).min(1),
  totalDurationMinutes: z.number().int().positive(),
  layovers: z.array(LayoverSchema),
});

export const FlightSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["oneway", "roundtrip", "hacker"]),
  outbound: FlightLegSchema,
  return: FlightLegSchema.optional(),
  price: z.object({
    total: z.number().positive(),
    currency: z.string().min(3).max(3),
    baseFare: z.number().nonnegative().optional(),
    taxes: z.number().nonnegative().optional(),
    originalTotal: z.number().positive().optional(),
    originalCurrency: z.string().min(3).max(3).optional(),
  }),
  totalStops: z.number().int().nonnegative(),
  warnings: z.array(z.string()),
  isSelfTransfer: z.boolean(),
  bookingProvider: z.string().optional(),
  sourceType: z.enum(["amadeus", "travelpayouts", "bot_json", "cache", "manual", "unknown"]).optional(),
  deepLink: z.string().optional(),
  validatingAirline: z.string().optional(),
  baggageIncluded: z.boolean().optional(),
  refundable: z.boolean().optional(),
  mixedCabin: z.boolean().optional(),
  lastUpdatedAt: z.string().optional(),
});

export type FlightInput = z.infer<typeof FlightSchema>;
