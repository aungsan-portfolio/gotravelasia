// server/api/destination-landing.ts
//
// Phase 1: registry + live fares. Analytics stubs wired but return 0.
// Phase 2: replace analytics stubs with real PostHog / DB queries.
// =============================================================================

import { buildPopularSections } from "@/lib/destination/popularSections";
import {
  resolveOriginMarket,
  getOriginAirportsForMarket,
} from "@/lib/destination/originMarket";
import {
  toDestinationSignal,
  type RawDestinationInput,
} from "@/lib/destination/signalMerger";
import type {
  DestinationLandingApiResponse,
  DestinationMeta,
  FareEntry,
  PriceInsights,
} from "@/types/destination";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SECTIONS_CONFIG = {
  countries: 8,
  cities:    8,
} as const;

// ---------------------------------------------------------------------------
// Source A — Registry stubs (replace with your Drizzle queries)
// ---------------------------------------------------------------------------

/**
 * Fetch the registry record for a single destination by slug.
 *
 * Replace with:
 *   return await db.query.destinations.findFirst({
 *     where: eq(destinations.slug, slug),
 *   });
 */
async function getRegistryDestination(slug: string): Promise<DestinationMeta> {
  // TODO: implement with Drizzle
  throw new Error(
    `getRegistryDestination("${slug}") not implemented. ` +
    `Replace with a Drizzle query against your destinations table.`,
  );
}

/**
 * Fetch all destinations excluding the current landing page slug.
 * Returns registry metadata only (no fares, no analytics yet).
 *
 * Replace with:
 *   return await db.query.destinations.findMany({
 *     where: ne(destinations.slug, excludeSlug),
 *   });
 */
async function getAllRegistryDestinations(
  excludeSlug: string,
): Promise<Pick<RawDestinationInput, "slug" | "city" | "country" | "iata" | "contentStrength">[]> {
  // TODO: implement with Drizzle
  throw new Error("getAllRegistryDestinations not implemented.");
}

// ---------------------------------------------------------------------------
// Source B — Live fares (replace with Travelpayouts / Aviasales / cache)
// ---------------------------------------------------------------------------

type FareSignal = {
  iata: string;
  minPrice: number | null;
  avgBenchmarkPrice: number | null;
  routeAvailability: number;
};

/**
 * Fetches live or cached fare signals for all destinations reachable from
 * the given origin airports.
 *
 * Replace with your fare provider SDK call + Redis cache layer.
 * IMPORTANT: use parameterized queries for any DB calls here.
 */
async function getLiveFareSignals(
  _originAirports: string[],
): Promise<Map<string, FareSignal>> {
  // TODO: call Travelpayouts / Aviasales API, cache in Redis
  // Return a Map<destinationIata, FareSignal>
  return new Map();
}

async function getPriceInsights(
  _slug: string,
  _originAirports: string[],
): Promise<PriceInsights> {
  // TODO: query cheapest month + current min price
  return { cheapestMonth: null, currentMinPrice: null };
}

async function getFareFinder(
  _slug: string,
  _originAirports: string[],
): Promise<FareEntry[]> {
  // TODO: return top fare entries for FareFinder widget
  return [];
}

// ---------------------------------------------------------------------------
// Source C — Analytics (Phase 1: returns zeros)
// ---------------------------------------------------------------------------

type AnalyticsSignal = {
  iata: string;
  searchVolume: number;
  pageViews: number;
  outboundClicks: number;
  impressions: number;
};

/**
 * Phase 1: returns empty analytics → scoring falls back to
 * seasonalScore + priceCompetitiveness + routeAvailability + contentStrength.
 *
 * Phase 2: replace with PostHog query or your analytics DB table.
 */
async function getAnalyticsSignals(
  _originMarket: string,
): Promise<Map<string, AnalyticsSignal>> {
  // TODO Phase 2: query PostHog / internal analytics
  return new Map();
}

// ---------------------------------------------------------------------------
// Signal merge helper
// ---------------------------------------------------------------------------

function mergeSignals(
  registry: Pick<RawDestinationInput, "slug" | "city" | "country" | "iata" | "contentStrength">[],
  fares: Map<string, FareSignal>,
  analytics: Map<string, AnalyticsSignal>,
): RawDestinationInput[] {
  return registry.map((reg) => {
    const fare = fares.get(reg.iata);
    const analytics_ = analytics.get(reg.iata);

    return {
      ...reg,
      minPrice:             fare?.minPrice             ?? null,
      avgBenchmarkPrice:    fare?.avgBenchmarkPrice    ?? null,
      routeAvailability:    fare?.routeAvailability    ?? 0,
      searchVolume:         analytics_?.searchVolume   ?? 0,
      pageViews:            analytics_?.pageViews      ?? 0,
      outboundClicks:       analytics_?.outboundClicks ?? 0,
      impressions:          analytics_?.impressions    ?? 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function getDestinationLandingData(params: {
  slug: string;
  userCountryCode?: string | null;
}): Promise<DestinationLandingApiResponse> {
  const originMarket   = resolveOriginMarket(params.userCountryCode);
  const originAirports = getOriginAirportsForMarket(originMarket);

  // Parallel fetch — all sources at once
  const [
    registryDestination,
    allRegistry,
    fareSignals,
    analyticsSignals,
    priceInsights,
    fareFinder,
  ] = await Promise.all([
    getRegistryDestination(params.slug),
    getAllRegistryDestinations(params.slug),
    getLiveFareSignals(originAirports),
    getAnalyticsSignals(originMarket),
    getPriceInsights(params.slug, originAirports),
    getFareFinder(params.slug, originAirports),
  ]);

  // Merge into DestinationSignal[]
  const rawInputs = mergeSignals(allRegistry, fareSignals, analyticsSignals);
  const signals   = rawInputs.map((r) => toDestinationSignal(r));

  // Build ranked sections
  const { popularDestinations, popularCities } = buildPopularSections(
    signals,
    SECTIONS_CONFIG,
  );

  return {
    destination: registryDestination,
    originMarket,
    popularDestinations,
    popularCities,
    priceInsights,
    fareFinder,
  };
}
