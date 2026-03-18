// =============================================================================
// GoTravelAsia — useDestinationLandingData
// hooks/useDestinationLandingData.ts
//
// Fetches /api/destination-landing and returns typed, cached data.
// Uses @tanstack/react-query
//
// SWR → React Query cache mapping:
//   dedupingInterval: 5min  →  staleTime:  5 * 60 * 1000
//   (implicit SWR GC)       →  gcTime:    10 * 60 * 1000
//   revalidateOnFocus:false  →  refetchOnWindowFocus: false
//   errorRetryCount: 1       →  retry: 1
// =============================================================================

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { DestinationLandingApiResponse } from "@/types/destination";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Destination landing data is stable — 5 min before a background refetch. */
const STALE_TIME_MS = 5 * 60 * 1000;

/** Keep unused cache entries for 10 min after the component unmounts. */
const GC_TIME_MS = 10 * 60 * 1000;

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class DestinationApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly slug: string,
  ) {
    super(message);
    this.name = "DestinationApiError";
  }
}

// ---------------------------------------------------------------------------
// Query key factory
// Centralised key keeps invalidation and prefetching consistent across the app.
// ---------------------------------------------------------------------------

export const destinationLandingKeys = {
  all: ["destination-landing"] as const,
  bySlug: (slug: string, market?: string | null) =>
    [...destinationLandingKeys.all, slug, market ?? "GLOBAL"] as const,
};

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

function buildApiUrl(slug: string, userCountryCode?: string | null): string {
  const params = new URLSearchParams({ slug });
  if (userCountryCode) params.set("market", userCountryCode);
  return `/api/destination-landing?${params.toString()}`;
}

async function fetchDestinationLanding(
  slug: string,
  userCountryCode?: string | null,
): Promise<DestinationLandingApiResponse> {
  const url = buildApiUrl(slug, userCountryCode);

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    // Surface HTTP status so callers can branch on 404 vs 500
    throw new DestinationApiError(
      `Failed to fetch destination data (${res.status} ${res.statusText})`,
      res.status,
      slug,
    );
  }

  const json = (await res.json()) as unknown;

  // Runtime shape guard — catch malformed API responses early
  if (
    typeof json !== "object" ||
    json === null ||
    !("destination" in json) ||
    !("popularDestinations" in json) ||
    !("popularCities" in json)
  ) {
    throw new DestinationApiError(
      "API response is missing required fields",
      200,
      slug,
    );
  }

  return json as DestinationLandingApiResponse;
}

// ---------------------------------------------------------------------------
// Options type
// ---------------------------------------------------------------------------

type UseDestinationLandingDataOptions = {
  /**
   * ISO 3166-1 alpha-2 country code for origin market segmentation.
   * e.g. "MM" | "TH" | "SG" | "MY"
   */
  userCountryCode?: string | null;
  /**
   * Disable fetching until ready (e.g. waiting for auth / GeoIP resolution).
   * Defaults to true (enabled).
   */
  enabled?: boolean;
};

// ---------------------------------------------------------------------------
// Return type (explicit — avoids spreading opaque UseQueryResult)
// ---------------------------------------------------------------------------

type UseDestinationLandingDataReturn = {
  data: DestinationLandingApiResponse | undefined;
  isLoading: boolean;
  /** True only on the very first load (no cached data + fetching). */
  isInitialLoading: boolean;
  error: DestinationApiError | Error | null;
  /** True when a previous successful result exists but a refetch is running. */
  isRefetching: boolean;
  /** Manually trigger a fresh fetch (e.g. user clicks Retry). */
  refresh: () => void;
  /** Whether this is a 404 specifically — useful for rendering not-found UI. */
  isNotFound: boolean;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDestinationLandingData(
  slug: string,
  options?: UseDestinationLandingDataOptions,
): UseDestinationLandingDataReturn {
  const { userCountryCode, enabled = true } = options ?? {};

  const query: UseQueryResult<DestinationLandingApiResponse, Error> = useQuery({
    queryKey: destinationLandingKeys.bySlug(slug, userCountryCode),
    queryFn: () => fetchDestinationLanding(slug, userCountryCode),

    // --- Cache behaviour (mirrors previous SWR config) ---
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,

    // --- Fetch behaviour ---
    refetchOnWindowFocus: false,
    retry: 1,

    // Don't fetch until slug is present and caller says enabled
    enabled: Boolean(slug) && enabled,
  });

  const isNotFound =
    query.error instanceof DestinationApiError && query.error.status === 404;

  return {
    data: query.data,
    isLoading: query.isLoading,
    isInitialLoading: query.isLoading && query.fetchStatus === "fetching",
    error: query.error,
    isRefetching: query.isRefetching,
    refresh: () => query.refetch(),
    isNotFound,
  };
}
