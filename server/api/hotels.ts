import type { Request, Response } from "express";
import {
  buildAgodaLtCityCandidates,
  type AgodaLtCityCandidate,
  getCityBySlug,
  type City,
} from "../../shared/hotels/cities.js";
import { findAgodaLtCityIdByName } from "../../shared/hotels/agodaLtCityMap.js";
import { normalizeHotelSearchParams } from "../../shared/hotels/searchParams.js";
import {
  createProviderHotelFromResult,
  mergeProviderHotels,
} from "../hotels/identity.js";
import type {
  HotelDetailResponse,
  HotelEmptyStateReason,
  HotelDiagnosticsReason,
  HotelCoordinatesConfidence,
  HotelSearchDiagnostics,
  HotelOutboundLinks,
  HotelPriceDisplay,
  HotelResult,
  HotelSearchCity,
  HotelSearchResponse,
  HotelSearchParams,
  HotelSort,
} from "../../shared/hotels/types.js";
import {
  agodaHotelUrl,
  awinDeepLink,
  bookingUrl,
  buildAffiliateLinks,
} from "../../lib/hotels/affiliate.js";
import { normalizeHotel } from "../hotels/normalize.js";
import {
  buildHotelSearchCacheKey,
  buildHotelDetailCacheKey,
  hotelCacheGet,
  hotelCacheSet,
  getHotelCacheStats,
  getCacheTtlSeconds,
} from "../hotels/cache.js";
import { ProviderOrchestrator } from "../hotels/providerOrchestrator.js";
import { AgodaProvider } from "../hotels/providers/agodaAdapter.js";

const orchestrator = new ProviderOrchestrator([
  new AgodaProvider(),
]);

const AGODA_SITE_ID = normalizeAgodaSiteId(process.env.AGODA_SITE_ID ?? "");
const AGODA_API_KEY = normalizeAgodaApiKey(process.env.AGODA_API_KEY ?? "");
const AWIN_TOKEN = process.env.AWIN_TOKEN ?? "";
const AWIN_PUB_ID = process.env.AWIN_PUBLISHER_ID ?? "";
const BOOKING_ADV = process.env.BOOKING_AWIN_ADV_ID ?? "5910";
const TRIP_SITE_ID = process.env.TRIP_COM_SITE_ID ?? "";
const KLOOK_ID = process.env.KLOOK_PARTNER_ID ?? "";
const EXPEDIA_CODE = process.env.EXPEDIA_TP_CODE ?? "ZZxDEika";
const PAGE_SIZE = 20;

const AGODA_SORT_MAP: Record<HotelSort, string> = {
  best: "Recommended",
  rank: "Recommended",
  price_asc: "PriceAsc",
  price_desc: "PriceDesc",
  stars_desc: "StarRatingDesc",
  review_desc: "AllGuestsReviewScore",
};

const cache = new Map<string, { val: any; exp: number }>(); // Legacy: kept for non-hotel uses
const warnedMessages = new Set<string>();

function safeWarnOnce(message: string) {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(`[Hotels] ${message}`);
}

function normalizeAgodaSiteId(id: string): string {
  return id.replace(/,/g, "").trim();
}

function normalizeAgodaApiKey(key: string): string {
  return key.trim();
}

function shouldExposeHotelDiagnostics(): boolean {
  return (
    process.env.HOTEL_DEBUG_DIAGNOSTICS === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

export function buildAgodaLtV1RequestBody(params: {
  checkIn: string;
  checkOut: string;
  cityId: number;
  adults: number;
  pageSize: number;
  sort: HotelSort;
}) {
  return {
    criteria: {
      additional: {
        currency: "USD",
        dailyRate: { minimum: 1, maximum: 10000 },
        discountOnly: false,
        language: "en-us",
        maxResult: params.pageSize,
        minimumReviewScore: 0,
        minimumStarRating: 0,
        occupancy: {
          numberOfAdult: params.adults,
          numberOfChildren: 0,
        },
        sortBy: AGODA_SORT_MAP[params.sort] || "Recommended",
      },
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      cityId: params.cityId,
    },
  };
}

function buildDiagnostics(
  reason: HotelDiagnosticsReason,
  status?: number,
  extra: Record<string, unknown> = {}
): HotelSearchDiagnostics {
  return {
    reason,
    status,
    apiKeyPresent: Boolean(AGODA_API_KEY),
    siteIdLooksNumeric: /^\d+$/.test(AGODA_SITE_ID),
    authFormat: "siteid_colon_apikey",
    requestFormat: "criteria_city_search",
    hasAgodaSiteId: Boolean(AGODA_SITE_ID),
    hasAgodaApiKey: Boolean(AGODA_API_KEY),
    ...extra,
  };
}

function extractAgodaErrorDiagnostics(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const error = payload.error as any;
  if (!error) return {};
  return {
    agodaErrorCode: error.id,
    agodaErrorMessage: error.message,
    agodaErrorType: error.type,
  };
}

const AGODA_LT_V1_ENDPOINT =
  "https://affiliateapi7643.agoda.com/affiliateservice/lt_v1";

async function fetchAgodaHotels(
  agodaCityId: number,
  ltCityId: number,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number,
  page: number,
  sort: HotelSort
) {
  const cacheKey = buildHotelSearchCacheKey({
    source: "agoda",
    ltCityId,
    checkIn,
    checkOut,
    adults,
    rooms,
    page,
    sort,
  });

  const cached = await hotelCacheGet(cacheKey);
  if (cached) {
    console.log(`[Hotels] Cache ${cached.source} hit for ${cacheKey} (age=${cached.age}ms)`);
    return cached.data;
  }

  const liveAgodaWarning = "Live Agoda results are temporarily unavailable.";
  const allowMockFallback = true; // Always allow mock fallback so user gets results immediately

  try {
    if (!AGODA_SITE_ID || !AGODA_API_KEY) {
      console.warn("[Hotels] Missing Agoda credentials, skipping live search.");
      const diagnostics = buildDiagnostics("missing_credentials");
      if (allowMockFallback) {
        return {
          source: "mock" as const,
          hotels: getMockHotels(agodaCityId, page, sort),
          warnings: ["Missing Agoda credentials. Showing fallback results."],
          diagnostics,
        };
      }
      return {
        source: "agoda" as const,
        hotels: [],
        warning: liveAgodaWarning,
        warnings: [liveAgodaWarning],
        diagnostics,
        totalCount: 0,
      };
    }

    const body = buildAgodaLtV1RequestBody({
      checkIn,
      checkOut,
      cityId: ltCityId,
      adults,
      pageSize: PAGE_SIZE,
      sort,
    });

    const hasAgodaApiKey = Boolean(AGODA_API_KEY);
    const hasAgodaSiteId = Boolean(AGODA_SITE_ID);

    console.log(`[Hotels] Agoda search cityId=${ltCityId}`, {
      hasAgodaSiteId,
      hasAgodaApiKey,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(AGODA_LT_V1_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: AGODA_API_KEY.startsWith(`${AGODA_SITE_ID}:`)
          ? AGODA_API_KEY
          : `${AGODA_SITE_ID}:${AGODA_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const responseBody = await response.text();
      const bodySnippet = responseBody.slice(0, 300).replace(/\s+/g, " ");
      console.warn(`[Hotels] Agoda lt_v1 non-ok response status=${response.status}`);
      safeWarnOnce(`Agoda lt_v1 search returned status ${response.status}.`);
      const diagnostics = buildDiagnostics(
        "non_ok_response",
        response.status,
        shouldExposeHotelDiagnostics() ? { agodaResponsePreview: bodySnippet } : {}
      );
      if (allowMockFallback) {
        return {
          source: "mock" as const,
          hotels: getMockHotels(agodaCityId, page, sort),
          warnings: ["Live Agoda search is temporarily unavailable. Showing fallback results."],
          diagnostics,
        };
      }
      return {
        source: "agoda" as const,
        hotels: [],
        warning: `Agoda API Error: ${response.status} - ${bodySnippet}`,
        warnings: [`Agoda API Error: ${response.status}`],
        diagnostics,
        totalCount: 0,
      };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const payloadTopLevelKeys =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? Object.keys(payload)
        : [];
    const hasErrorPayload = payloadTopLevelKeys.includes("error");
    const agodaErrorDiagnostics = hasErrorPayload ? extractAgodaErrorDiagnostics(payload) : {};
    const resultCandidateMap: Record<string, unknown> = {
      results: payload?.results,
      hotels: payload?.hotels,
      properties: payload?.properties,
      data: payload?.data,
      dataResults: (payload?.data as any)?.results,
      dataHotels: (payload?.data as any)?.hotels,
      searchResults: payload?.searchResults,
      hotelList: payload?.hotelList,
    };
    const resultCandidateCounts = Object.entries(resultCandidateMap).reduce<Record<string, number>>(
      (acc, [candidateKey, candidateValue]) => {
        if (Array.isArray(candidateValue)) {
          acc[candidateKey] = candidateValue.length;
        }
        return acc;
      },
      {}
    );
    const hotels =
      (Object.values(resultCandidateMap).find(
        (candidate): candidate is unknown[] => Array.isArray(candidate) && candidate.length > 0
      ) as unknown[]) ?? [];

    if (!hotels.length) {
      if (hasErrorPayload) {
        console.warn("[Hotels] Agoda lt_v1 error payload", {
          code: agodaErrorDiagnostics.agodaErrorCode,
          message: agodaErrorDiagnostics.agodaErrorMessage,
          type: agodaErrorDiagnostics.agodaErrorType,
        });
      }
      console.warn("[Hotels] Agoda lt_v1 empty results shape", {
        payloadTopLevelKeys,
        resultCandidateCounts,
      });
      const diagnostics = buildDiagnostics(
        "empty_results",
        undefined,
        shouldExposeHotelDiagnostics()
          ? {
              payloadTopLevelKeys,
              resultCandidateCounts,
              ...agodaErrorDiagnostics,
            }
          : {}
      );
      if (allowMockFallback) {
        return {
          source: "mock" as const,
          hotels: getMockHotels(agodaCityId, page, sort),
          warnings: ["No live Agoda hotels were returned for this criteria. Showing fallback results."],
          diagnostics,
        };
      }
      return {
        source: "agoda" as const,
        hotels: [],
        warning: liveAgodaWarning,
        warnings: [liveAgodaWarning],
        diagnostics,
        totalCount: 0,
      };
    }

    const result = {
      source: "agoda" as const,
      hotels,
      totalCount:
        (typeof payload?.totalResults === "number" ? payload.totalResults : undefined) ??
        (typeof payload?.totalCount === "number" ? payload.totalCount : undefined) ??
        hotels.length,
    };

    await hotelCacheSet(cacheKey, result, getCacheTtlSeconds("agoda"));
    return result;
  } catch (err) {
    console.error("[Hotels] Agoda lt_v1 search failed:", err);
    const diagnostics = buildDiagnostics("fetch_error");
    if (allowMockFallback) {
      return {
        source: "mock" as const,
        hotels: getMockHotels(agodaCityId, page, sort),
        warnings: ["Live Agoda search failed. Showing fallback results."],
        diagnostics,
      };
    }
    return {
      source: "agoda" as const,
      hotels: [],
      warning: liveAgodaWarning,
      warnings: [liveAgodaWarning],
      diagnostics,
      totalCount: 0,
    };
  }
}

export async function fetchAgodaHotelsWithCityCandidates(params: {
  agodaCityId: number;
  ltCityCandidates: AgodaLtCityCandidate[];
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  page: number;
  sort: HotelSort;
}) {
  const attemptedLtCityIds: number[] = [];
  let latestDiagnostics: HotelSearchDiagnostics | undefined;
  let cityResolutionStatus: "resolved" | "unresolved_empty_results" | "auth_error" | "api_error" =
    "unresolved_empty_results";

  for (const candidate of params.ltCityCandidates) {
    attemptedLtCityIds.push(candidate.cityId);
    const result = (await fetchAgodaHotels(
      params.agodaCityId,
      candidate.cityId,
      params.checkIn,
      params.checkOut,
      params.adults,
      params.rooms,
      params.page,
      params.sort
    )) as any;

    const candidateDiagnostics = (result as any).diagnostics as HotelSearchDiagnostics | undefined;
    latestDiagnostics = candidateDiagnostics ?? latestDiagnostics;
    const responseStatus = candidateDiagnostics?.status;

    if (result.hotels.length > 0) {
      cityResolutionStatus = "resolved";
      return {
        ...result,
        diagnostics: {
          ...(candidateDiagnostics ?? {}),
          attemptedLtCityIds,
          resolvedLtCityId: candidate.cityId,
          resolvedLtCityIdSource: candidate.source,
          cityResolutionStatus,
        },
      };
    }

    if (responseStatus === 401 || responseStatus === 403) {
      cityResolutionStatus = "auth_error";
      break;
    }

    if (candidateDiagnostics?.reason === "non_ok_response") {
      cityResolutionStatus = "api_error";
    }
  }

  const finalWarning = (result as any)?.warning || "Live Agoda results are temporarily unavailable.";

  return {
    source: "agoda" as const,
    hotels: [],
    totalCount: 0,
    warning: finalWarning,
    warnings: [finalWarning],
    diagnostics: {
      ...(latestDiagnostics ?? {
        reason: "unresolved_city" as const,
      }),
      attemptedLtCityIds,
      resolvedLtCityId: params.ltCityCandidates[0]?.cityId,
      resolvedLtCityIdSource: params.ltCityCandidates[0]?.source,
      cityResolutionStatus,
    },
  };
}

function sortHotels(hotels: HotelResult[], sort: HotelSort) {
  const sorted = [...hotels];
  sorted.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return (a.lowestRate || Number.MAX_SAFE_INTEGER) - (b.lowestRate || Number.MAX_SAFE_INTEGER);
      case "price_desc":
        return (b.lowestRate || 0) - (a.lowestRate || 0);
      case "stars_desc":
        return (b.stars || 0) - (a.stars || 0) || (b.reviewScore || 0) - (a.reviewScore || 0);
      case "review_desc":
        return (b.reviewScore || 0) - (a.reviewScore || 0) || (b.reviewCount || 0) - (a.reviewCount || 0);
      case "rank":
      case "best":
      default:
        return (a.rankingPosition || 0) - (b.rankingPosition || 0);
    }
  });
  return sorted;
}

function getMockHotels(cityId: number, page: number, sort: HotelSort) {
  const base = [
    {
      hotelId: `${cityId}-1`,
      name: "Grand Palace Hotel",
      stars: 5,
      reviewScore: 9.1,
      reviewCount: 2341,
      address: "City Center",
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
      amenities: ["Pool", "Spa", "WiFi", "Gym"],
      lowestRate: 120,
      currency: "USD",
      rankingPosition: 1,
      breakfastIncluded: true,
      freeCancellation: true,
      payLater: true,
      provider: "mock" as const,
    },
    {
      hotelId: `${cityId}-2`,
      name: "Central Riverside",
      stars: 4,
      reviewScore: 8.7,
      reviewCount: 1654,
      address: "Riverside District",
      imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
      amenities: ["Pool", "Restaurant", "WiFi"],
      lowestRate: 78,
      currency: "USD",
      rankingPosition: 2,
      freeCancellation: true,
      provider: "mock" as const,
    },
    {
      hotelId: `${cityId}-3`,
      name: "Ibis Budget City",
      stars: 3,
      reviewScore: 8.2,
      reviewCount: 4102,
      address: "Airport Road",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
      amenities: ["Restaurant", "WiFi"],
      lowestRate: 35,
      currency: "USD",
      rankingPosition: 3,
      payLater: true,
      provider: "mock" as const,
    },
    {
      hotelId: `${cityId}-4`,
      name: "Luxury Boutique Inn",
      stars: 5,
      reviewScore: 9.4,
      reviewCount: 876,
      address: "Old Town",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600",
      amenities: ["Spa", "Bar", "WiFi", "Pool"],
      lowestRate: 185,
      currency: "USD",
      rankingPosition: 4,
      breakfastIncluded: true,
      freeCancellation: true,
      provider: "mock" as const,
    },
    {
      hotelId: `${cityId}-5`,
      name: "The Standard Hotel",
      stars: 4,
      reviewScore: 8.9,
      reviewCount: 1234,
      address: "Downtown",
      imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600",
      amenities: ["Rooftop", "Bar", "WiFi"],
      lowestRate: 95,
      currency: "USD",
      rankingPosition: 5,
      freeCancellation: true,
      payLater: true,
      provider: "mock" as const,
    },
    {
      hotelId: `${cityId}-6`,
      name: "Heritage Garden Hotel",
      stars: 3,
      reviewScore: 7.8,
      reviewCount: 987,
      address: "Heritage Quarter",
      imageUrl: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600",
      amenities: ["Garden", "WiFi", "Breakfast"],
      lowestRate: 42,
      currency: "USD",
      rankingPosition: 6,
      breakfastIncluded: true,
      payLater: true,
      provider: "mock" as const,
    },
  ];

  const pageOffset = (page - 1) * base.length;
  const withLinks = base.map((hotel, index) => ({
    ...hotel,
    hotelId: `${hotel.hotelId}-p${page}`,
    rankingPosition: pageOffset + index + 1,
    outboundLinks: {
      agoda: agodaHotelUrl(
        `${hotel.hotelId}-p${page}`,
        cityId,
        "2026-01-01",
        "2026-01-04",
        2,
        1
      ),
    },
    providerPrices:
      Number.isFinite(hotel.lowestRate) && hotel.lowestRate > 0 ? { agoda: hotel.lowestRate } : undefined,
  }));

  return sortHotels(withLinks as HotelResult[], sort);
}

export async function executeHotelSearch(reqQuery: Record<string, unknown>) {
  const normalized = normalizeHotelSearchParams(reqQuery);
  const rawCity = typeof reqQuery?.city === "string" ? reqQuery.city.trim() : "";
  const rawCityName = typeof reqQuery?.cityName === "string" ? reqQuery.cityName.trim() : "";
  const hasRawCity = rawCity.length > 0;
  const hasRawCityName = rawCityName.length > 0;

  const isCityNameOnlySearch = !hasRawCity && hasRawCityName;
  const cityNameOnlyMatch = isCityNameOnlySearch ? findAgodaLtCityIdByName(rawCityName) : undefined;

  const isNumericCityId = /^\d+$/.test(normalized.city);
  let city: HotelSearchCity | City;

  if (isCityNameOnlySearch) {
    const fallbackName = rawCityName;
    city = {
      slug: fallbackName.toLowerCase().replace(/\s+/g, "-"),
      name: fallbackName,
      bookingName: fallbackName,
      country: cityNameOnlyMatch?.country ?? "",
      agodaCityId: cityNameOnlyMatch?.agodaLtCityId ?? 0,
      hasHotels: true,
    } as HotelSearchCity;
  } else if (isNumericCityId) {
    const agodaCityId = parseInt(normalized.city, 10);
    if (!Number.isFinite(agodaCityId)) {
      throw new Error(`Invalid Agoda city id: ${normalized.city}`);
    }
    const fallbackName = normalized.cityName?.trim() || `City ${normalized.city}`;
    city = {
      slug: normalized.city,
      name: fallbackName,
      bookingName: fallbackName,
      country: "",
      agodaCityId,
      hasHotels: true,
    } as HotelSearchCity;
  } else {
    const localCity = getCityBySlug(normalized.city);
    if (!localCity) {
      if (normalized.cityName) {
        city = {
          slug: normalized.city,
          name: normalized.cityName,
          bookingName: normalized.cityName,
          country: "",
          agodaCityId: 0,
          hasHotels: true,
        } as HotelSearchCity;
      } else {
        throw new Error(`City not found: ${normalized.city}`);
      }
    } else {
      city = localCity;
    }
  }

  const affiliateLinks = buildAffiliateLinks(
    (city as any).name,
    (city as any).bookingName,
    (city as any).agodaCityId,
    normalized.checkIn,
    normalized.checkOut,
    normalized.adults,
    normalized.rooms
  );

  const ltCityCandidates = buildAgodaLtCityCandidates({
    city: isCityNameOnlySearch ? null : (city as City),
    queryCity: normalized.city,
    queryCityName: normalized.cityName,
    country: (city as any).country,
  });

  if (ltCityCandidates.length === 0 && Number((city as any).agodaCityId) > 0) {
    ltCityCandidates.push({
      cityId: Number((city as any).agodaCityId),
      source: "local_agoda_city_id",
      verified: false,
    });
  }

  const [bookingLink, orchestratorResult] = await Promise.all([
    awinDeepLink(
      affiliateLinks.booking ??
        bookingUrl(
          (city as any).bookingName,
          normalized.checkIn,
          normalized.checkOut,
          normalized.adults,
          normalized.rooms
        )
    ),
    orchestrator.searchHotels({
      city: normalized.city,
      checkIn: normalized.checkIn,
      checkOut: normalized.checkOut,
      adults: normalized.adults,
      rooms: normalized.rooms,
      agodaCityId: (city as any).agodaCityId,
      ltCityCandidates,
      page: normalized.page,
      sort: normalized.sort,
    }),
  ]);

  const result = orchestratorResult.data;

  const normalizedProviderHotels = result.hotels.map((hotel: any, index: number) =>
    normalizeHotel(
      hotel,
      city,
      normalized.checkIn,
      normalized.checkOut,
      normalized.adults,
      normalized.rooms,
      affiliateLinks,
      index,
      normalized.page
    )
  );

  const canonicalHotels = mergeProviderHotels(
    normalizedProviderHotels.map((hotel: any) =>
      createProviderHotelFromResult("agoda", (city as any).name, hotel)
    )
  );

  const hotels = sortHotels(
    canonicalHotels.map((canonical) => ({
      ...canonical.primaryHotel.result,
      offers: canonical.offers,
    })),
    normalized.sort
  );

  // Instant Cache Warming for Hotel Details
  // Fire and forget cache sets for each hotel so that detail lookups are instant O(1)
  hotels.forEach(hotel => {
    hotelCacheSet(
      buildHotelDetailCacheKey(hotel.hotelId, (city as any).name),
      hotel,
      getCacheTtlSeconds(result.source)
    ).catch(e => console.error("[HotelDetail] Warming failed:", e));
  });

  return {
    normalized,
    city,
    hotels,
    result,
    affiliateLinks: { ...affiliateLinks, booking: bookingLink },
  };
}

export function deriveEmptyStateReason(
  hotels: HotelResult[],
  diagnostics?: HotelSearchDiagnostics
): HotelEmptyStateReason | undefined {
  if (hotels.length > 0) return undefined;
  if (!diagnostics) return "provider_unavailable";

  switch (diagnostics.reason) {
    case "unsupported_city":
      return "unsupported_city";
    case "unresolved_city":
      return "unresolved_city";
    case "missing_credentials":
    case "non_ok_response":
    case "fetch_error":
      return "provider_unavailable";
    case "empty_results":
      return diagnostics.cityResolutionStatus === "resolved" ? "no_live_inventory" : "unresolved_city";
    default:
      return "no_live_inventory";
  }
}


function buildHotelSearchResponsePayload(params: {
  city: HotelSearchCity;
  hotels: HotelResult[];
  result: Awaited<ReturnType<typeof fetchAgodaHotelsWithCityCandidates>>;
  affiliateLinks: HotelOutboundLinks;
  normalized: ReturnType<typeof normalizeHotelSearchParams>;
}): HotelSearchResponse {
  const exposeDiagnostics = shouldExposeHotelDiagnostics();
  const diagnostics = (params.result as any).diagnostics;

  const responseMeta: HotelSearchResponse["meta"] = {
    source: params.result.source,
    checkIn: params.normalized.checkIn,
    checkOut: params.normalized.checkOut,
    adults: params.normalized.adults,
    rooms: params.normalized.rooms,
    page: params.normalized.page,
    sort: params.normalized.sort,
    pageSize: PAGE_SIZE,
    totalCount: params.result.totalCount ?? params.hotels.length,
    totalPages: Math.max(1, Math.ceil((params.result.totalCount ?? params.hotels.length) / PAGE_SIZE)),
    warning: (params.result as any).warning,
    warnings: params.result.warnings,
    emptyStateReason: deriveEmptyStateReason(
      params.hotels,
      diagnostics
    ),
  };

  if (exposeDiagnostics) {
    responseMeta.diagnostics = diagnostics;
  }

  return {
    city: params.city as HotelSearchCity,
    hotels: params.hotels,
    affiliateLinks: params.affiliateLinks,
    meta: responseMeta,
  };
}

export async function searchHotels(req: any, res: any) {
  try {
    const search = await executeHotelSearch(req.query);
    const response = buildHotelSearchResponsePayload(search);
    return res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Hotels] Search failed:", message);

    if (message.startsWith("City not found:")) {
      return res.status(404).json({
        error: message,
        meta: { emptyStateReason: "unresolved_city" },
      });
    }
    if (message.startsWith("Invalid Agoda city id:")) {
      return res.status(400).json({ error: message });
    }

    return res.status(500).json({ error: "Search failed" });
  }
}

export async function getHotelDetail(req: Request, res: Response) {
  const hotelId = String(req.params.hotelId ?? "").trim();
  if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId path parameter." });
  }

  try {
    const reqQuery = req.query as Record<string, unknown>;
    const normalizedParams = normalizeHotelSearchParams(reqQuery);
    
    // Resolve city name for cache key
    const rawCityName = typeof reqQuery?.cityName === "string" ? reqQuery.cityName.trim() : "";
    let cacheCityName = rawCityName;
    if (!cacheCityName) {
        // Fallback to resolving the city if only numeric ID was passed
        if (/^\d+$/.test(normalizedParams.city)) {
           // We could try to resolve it, but for cache lookup we just use the original param if name is missing
           cacheCityName = normalizedParams.city;
        } else {
           cacheCityName = normalizedParams.city;
        }
    }

    const cacheKey = buildHotelDetailCacheKey(hotelId, cacheCityName);
    const cached = await hotelCacheGet(cacheKey);

    if (cached && cached.data) {
      console.log(`[Hotels] Detail Cache hit for ${cacheKey} (age=${cached.age}ms)`);
      return res.json({
        city: { id: 0, name: cacheCityName, type: "cache_hit" },
        hotels: [],
        hotel: cached.data,
        affiliateLinks: {},
        meta: { source: "cache", hotelId }
      });
    }

    console.log(`[Hotels] Detail Cache miss for ${cacheKey}. Executing orchestrator fallback...`);
    
    // Fallback: Use orchestrator for robust detail fetch
    const criteria = {
        city: normalizedParams.city,
        checkIn: normalizedParams.checkIn,
        checkOut: normalizedParams.checkOut,
        adults: normalizedParams.adults,
        rooms: normalizedParams.rooms,
        currency: "USD",
        language: "en",
        agodaCityId: typeof reqQuery.agodaCityId === "string" ? Number(reqQuery.agodaCityId) : undefined,
        ltCityCandidates: [] // Optional since it's a fallback
    };

    const orchestratorResult = await orchestrator.getHotelDetail(hotelId, criteria);
    
    return res.json({
      city: { id: 0, name: cacheCityName, type: "orchestrator_fallback" },
      hotels: [],
      hotel: orchestratorResult.data,
      affiliateLinks: {},
      meta: { source: orchestratorResult.source, isFallback: orchestratorResult.isFallback, hotelId }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Hotels] Hotel detail lookup failed:", message);
    if (message.startsWith("City not found:")) {
      return res.status(404).json({ error: message });
    }
    return res.status(500).json({ error: "Hotel detail lookup failed" });
  }
}


/**
 * GET /api/hotels/cache-stats
 * Returns hotel cache diagnostics (only in non-production or with debug flag).
 */
export function getHotelCacheStatsHandler(req: Request, res: Response) {
  if (!shouldExposeHotelDiagnostics()) {
    return res.status(403).json({ error: "Not available in production" });
  }

  return res.json({
    ok: true,
    stats: getHotelCacheStats(),
  });
}
