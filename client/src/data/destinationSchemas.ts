// client/src/data/destinationSchemas.ts

import { z } from "zod";

// ── Small primitives ─────────────────────────────────────────────

const numberLike = z.union([z.number().finite(), z.string().trim().min(1)]);
const nullableString = z.union([z.string(), z.null()]);

const aliasObjectPassthrough = z.object({}).passthrough();

// ── Shared nested objects ────────────────────────────────────────

export const AirportLikeSchema = z
  .object({
    city: z.string().trim().optional(),
    originCity: z.string().trim().optional(),
    destinationCity: z.string().trim().optional(),
    name: z.string().trim().optional(),
    code: z.string().trim().optional(),
    iata: z.string().trim().optional(),
    origin: z.string().trim().optional(),
    destination: z.string().trim().optional(),
    country: z.string().trim().optional(),
    countryName: z.string().trim().optional(),
  })
  .passthrough();

export const DealLikeSchema = z
  .object({
    from: z.string().trim().optional(),
    to: z.string().trim().optional(),
    origin: z.string().trim().optional(),
    destination: z.string().trim().optional(),
    originCode: z.string().trim().optional(),
    destinationCode: z.string().trim().optional(),

    d1: nullableString.optional(),
    a1: nullableString.optional(),
    departAt: nullableString.optional(),
    arriveAt: nullableString.optional(),
    departure_at: nullableString.optional(),
    arrival_at: nullableString.optional(),
    departure: nullableString.optional(),
    arrival_time: nullableString.optional(),

    airline: z.string().trim().optional(),
    airlineName: z.string().trim().optional(),
    carrier: z.string().trim().optional(),
    name: z.string().trim().optional(),
    airlineCode: z.string().trim().optional(),
    airline_code: z.string().trim().optional(),
    carrierCode: z.string().trim().optional(),

    stops: numberLike.optional(),
    stopCount: numberLike.optional(),
    transfers: numberLike.optional(),

    duration: z.string().trim().optional(),
    flyDuration: z.string().trim().optional(),
    flight_duration: z.string().trim().optional(),
    durationLabel: z.string().trim().optional(),

    price: numberLike.optional(),
    amount: numberLike.optional(),
    value: numberLike.optional(),

    tag: z.string().trim().optional(),
    label: z.string().trim().optional(),

    bookingUrl: z.string().trim().optional(),
    deepLink: z.string().trim().optional(),
    url: z.string().trim().optional(),
    link: z.string().trim().optional(),
  })
  .passthrough();

export const FareEntryLikeSchema = z
  .object({
    from1: z.string().trim().optional(),
    to1: z.string().trim().optional(),
    d1: nullableString.optional(),
    a1: nullableString.optional(),
    s1: numberLike.optional(),
    dur1: z.string().trim().optional(),

    from2: nullableString.optional(),
    to2: nullableString.optional(),
    d2: nullableString.optional(),
    a2: nullableString.optional(),
    s2: z.union([numberLike, z.null()]).optional(),
    dur2: z.union([z.string().trim(), z.null()]).optional(),

    origin: z.string().trim().optional(),
    destination: z.string().trim().optional(),
    originCode: z.string().trim().optional(),
    destinationCode: z.string().trim().optional(),

    departAt: nullableString.optional(),
    departure_at: nullableString.optional(),
    departure: nullableString.optional(),
    arriveAt: nullableString.optional(),
    arrival_at: nullableString.optional(),

    returnFrom: nullableString.optional(),
    returnTo: nullableString.optional(),
    returnDepartAt: nullableString.optional(),
    return_departure_at: nullableString.optional(),
    returnArriveAt: nullableString.optional(),
    return_arrival_at: nullableString.optional(),

    outboundStops: numberLike.optional(),
    inboundStops: numberLike.optional(),
    returnStops: numberLike.optional(),
    stops: numberLike.optional(),
    transfers: numberLike.optional(),

    outboundDuration: z.string().trim().optional(),
    inboundDuration: z.string().trim().optional(),
    returnDuration: z.string().trim().optional(),
    duration: z.string().trim().optional(),

    airline: z.string().trim().optional(),
    airlineName: z.string().trim().optional(),
    carrier: z.string().trim().optional(),
    airlineCode: z.string().trim().optional(),
    airline_code: z.string().trim().optional(),
    carrierCode: z.string().trim().optional(),

    price: numberLike.optional(),
    amount: numberLike.optional(),
    value: numberLike.optional(),

    bookingUrl: z.string().trim().optional(),
    deepLink: z.string().trim().optional(),
    url: z.string().trim().optional(),
    link: z.string().trim().optional(),
  })
  .passthrough();

export const PriceMonthLikeSchema = z
  .object({
    month: z.string().trim().optional(),
    m: z.string().trim().optional(),
    label: z.string().trim().optional(),
    value: numberLike.optional(),
    price: numberLike.optional(),
    p: numberLike.optional(),
    amount: numberLike.optional(),
  })
  .passthrough();

export const HeatmapCellLikeSchema = z
  .object({
    day: z.string().trim().optional(),
    label: z.string().trim().optional(),
    price: numberLike.optional(),
    value: numberLike.optional(),
    amount: numberLike.optional(),
    level: z.enum(["low", "mid", "high"]).optional(),
  })
  .passthrough();

export const HeatmapRowLikeSchema = z
  .object({
    month: z.string().trim().optional(),
    label: z.string().trim().optional(),
    segment: z.string().trim().optional(),
    values: z.array(HeatmapCellLikeSchema).optional(),
  })
  .passthrough();

export const AirlineSummaryLikeSchema = z
  .object({
    code: z.string().trim().optional(),
    airlineCode: z.string().trim().optional(),
    airline_code: z.string().trim().optional(),
    name: z.string().trim().optional(),
    airline: z.string().trim().optional(),
    airlineName: z.string().trim().optional(),
    dealCount: numberLike.optional(),
    count: numberLike.optional(),
    deals: numberLike.optional(),
    commonStops: numberLike.optional(),
    stops: numberLike.optional(),
    stopCount: numberLike.optional(),
    confidenceLabel: z.string().trim().optional(),
    confidence: z.string().trim().optional(),
    tags: z.array(z.string().trim()).optional(),
  })
  .passthrough();

export const ReviewLikeSchema = z
  .object({
    airline: z.string().trim().optional(),
    name: z.string().trim().optional(),
    airlineName: z.string().trim().optional(),
    airlineCode: z.string().trim().optional(),
    airline_code: z.string().trim().optional(),
    code: z.string().trim().optional(),
    score: numberLike.optional(),
    rating: numberLike.optional(),
    value: numberLike.optional(),
    highlights: z.array(z.string().trim()).optional(),
  })
  .passthrough();

export const WeatherMonthLikeSchema = z
  .object({
    month: z.string().trim().optional(),
    m: z.string().trim().optional(),
    label: z.string().trim().optional(),
    avgTempC: numberLike.optional(),
    tempC: numberLike.optional(),
    temperature: numberLike.optional(),
    avg_temp_c: numberLike.optional(),
    rainfallMm: numberLike.optional(),
    rainMm: numberLike.optional(),
    rainfall: numberLike.optional(),
    rainfall_mm: numberLike.optional(),
  })
  .passthrough();

export const FaqLikeSchema = z
  .object({
    q: z.string().trim().optional(),
    question: z.string().trim().optional(),
    title: z.string().trim().optional(),
    a: z.string().trim().optional(),
    answer: z.string().trim().optional(),
    body: z.string().trim().optional(),
  })
  .passthrough();

export const RelatedRouteLikeSchema = z
  .object({
    city: z.string().trim().optional(),
    name: z.string().trim().optional(),
    code: z.string().trim().optional(),
    iata: z.string().trim().optional(),
    href: z.string().trim().optional(),
    tag: z.string().trim().optional(),
    label: z.string().trim().optional(),
  })
  .passthrough();

// ── Section containers ───────────────────────────────────────────

export const DealsSectionLikeSchema = z
  .object({
    cheapest: z.array(DealLikeSchema).optional(),
    cheap: z.array(DealLikeSchema).optional(),
    budget: z.array(DealLikeSchema).optional(),

    fastest: z.array(DealLikeSchema).optional(),
    quick: z.array(DealLikeSchema).optional(),
    shortest: z.array(DealLikeSchema).optional(),

    bestValue: z.array(DealLikeSchema).optional(),
    best: z.array(DealLikeSchema).optional(),
    best_value: z.array(DealLikeSchema).optional(),

    weekend: z.array(DealLikeSchema).optional(),
    weekendDeals: z.array(DealLikeSchema).optional(),
    weekend_deals: z.array(DealLikeSchema).optional(),

    premium: z.array(DealLikeSchema).optional(),
    business: z.array(DealLikeSchema).optional(),
    fullService: z.array(DealLikeSchema).optional(),
  })
  .passthrough();

export const InsightsSectionLikeSchema = z
  .object({
    priceMonths: z.array(PriceMonthLikeSchema).optional(),
    pricesByMonth: z.array(PriceMonthLikeSchema).optional(),
    heatmap: z.array(HeatmapRowLikeSchema).optional(),
  })
  .passthrough();

export const SectionsLikeSchema = z
  .object({
    airlines: z.array(AirlineSummaryLikeSchema).optional(),
    reviews: z.array(ReviewLikeSchema).optional(),
    weather: z.array(WeatherMonthLikeSchema).optional(),
    faqs: z.array(FaqLikeSchema).optional(),
    nearbyRoutes: z.array(RelatedRouteLikeSchema).optional(),
    cheapest: z.array(DealLikeSchema).optional(),
    fastest: z.array(DealLikeSchema).optional(),
    bestValue: z.array(DealLikeSchema).optional(),
    weekend: z.array(DealLikeSchema).optional(),
    premium: z.array(DealLikeSchema).optional(),
  })
  .passthrough();

// ── Main payload schema ──────────────────────────────────────────

export const DestinationLivePayloadSchema = z
  .object({
    slug: z.string().trim().optional(),
    destinationSlug: z.string().trim().optional(),
    heroNote: z.string().trim().optional(),
    summary: z.string().trim().optional(),
    description: z.string().trim().optional(),

    origin: AirportLikeSchema.optional(),
    from: AirportLikeSchema.optional(),
    dest: AirportLikeSchema.optional(),
    destination: AirportLikeSchema.optional(),
    to: AirportLikeSchema.optional(),

    deals: DealsSectionLikeSchema.optional(),
    flightDeals: DealsSectionLikeSchema.optional(),
    sections: SectionsLikeSchema.optional(),

    fareTable: z.array(FareEntryLikeSchema).optional(),
    fares: z.array(FareEntryLikeSchema).optional(),
    fareFinder: z.array(FareEntryLikeSchema).optional(),
    fare_matrix: z.array(FareEntryLikeSchema).optional(),

    priceMonths: z.array(PriceMonthLikeSchema).optional(),
    pricesByMonth: z.array(PriceMonthLikeSchema).optional(),
    priceTrend: z.array(PriceMonthLikeSchema).optional(),

    heatmap: z.array(HeatmapRowLikeSchema).optional(),
    bookingHeatmap: z.array(HeatmapRowLikeSchema).optional(),

    airlines: z.array(AirlineSummaryLikeSchema).optional(),
    airlineSummary: z.array(AirlineSummaryLikeSchema).optional(),

    reviews: z.array(ReviewLikeSchema).optional(),
    airlineReviews: z.array(ReviewLikeSchema).optional(),

    weather: z.array(WeatherMonthLikeSchema).optional(),
    weatherMonths: z.array(WeatherMonthLikeSchema).optional(),

    faqs: z.array(FaqLikeSchema).optional(),
    faq: z.array(FaqLikeSchema).optional(),

    nearbyRoutes: z.array(RelatedRouteLikeSchema).optional(),
    relatedRoutes: z.array(RelatedRouteLikeSchema).optional(),
    routes: z.array(RelatedRouteLikeSchema).optional(),
  })
  .passthrough();

// ── Top-level API response schemas ───────────────────────────────

export const DestinationLandingApiResponseSchema = z
  .object({
    success: z.boolean().optional(),
    error: z.string().trim().optional(),
    message: z.string().trim().optional(),
    origin: z.string().trim().optional(),
    destination: z.string().trim().optional(),
    data: z.unknown().optional(),
    payload: z.unknown().optional(),
    result: z.unknown().optional(),
    destinationData: z.unknown().optional(),
    page: z.unknown().optional(),
    meta: aliasObjectPassthrough.optional(),
    lastUpdated: z.string().trim().optional(),
  })
  .passthrough();

export const DestinationLandingApiEnvelopeSchema = z.union([
  DestinationLandingApiResponseSchema,
  DestinationLivePayloadSchema,
]);

export type AirportLike = z.infer<typeof AirportLikeSchema>;
export type DealLike = z.infer<typeof DealLikeSchema>;
export type FareEntryLike = z.infer<typeof FareEntryLikeSchema>;
export type PriceMonthLike = z.infer<typeof PriceMonthLikeSchema>;
export type HeatmapRowLike = z.infer<typeof HeatmapRowLikeSchema>;
export type AirlineSummaryLike = z.infer<typeof AirlineSummaryLikeSchema>;
export type ReviewLike = z.infer<typeof ReviewLikeSchema>;
export type WeatherMonthLike = z.infer<typeof WeatherMonthLikeSchema>;
export type FaqLike = z.infer<typeof FaqLikeSchema>;
export type RelatedRouteLike = z.infer<typeof RelatedRouteLikeSchema>;
export type DestinationLivePayload = z.infer<typeof DestinationLivePayloadSchema>;
export type DestinationLandingApiResponse = z.infer<typeof DestinationLandingApiResponseSchema>;
export type DestinationLandingApiEnvelope = z.infer<typeof DestinationLandingApiEnvelopeSchema>;
