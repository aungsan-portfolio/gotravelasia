import type { Request, Response } from "express";
import { getCityBySlug, type City } from "../../shared/hotels/cities.js";
import { normalizeHotelSearchParams } from "../../shared/hotels/searchParams.js";
import type {
  HotelDiagnosticsReason,
  HotelCoordinatesConfidence,
  HotelSearchDiagnostics,
  HotelOutboundLinks,
  HotelPriceDisplay,
  HotelResult,
  HotelSearchCity,
  HotelSearchResponse,
  HotelSort,
} from "../../shared/hotels/types.js";

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

const cache = new Map<string, { val: any; exp: number }>();
const warnedMessages = new Set<string>();

async function cached<T>(key: string, fn: () => Promise<T>, ttlSeconds: number): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.exp) return hit.val;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttlSeconds * 1000 });
  return val;
}

function safeWarnOnce(message: string) {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(`[Hotels] ${message}`);
}

function shouldUseMockHotelFallback() {
  return process.env.ALLOW_HOTEL_MOCKS === "true";
}

function normalizeAgodaSiteId(rawValue: string): string {
  return rawValue.trim().replace(/,/g, "").replace(/\D/g, "");
}

function normalizeAgodaApiKey(rawValue: string): string {
  return rawValue.trim();
}

function shouldExposeHotelDiagnostics(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.HOTEL_DEBUG_DIAGNOSTICS === "true"
  );
}

function agodaSearchUrl(cityId: number, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    city: String(cityId),
    checkIn,
    checkOut,
    rooms: String(rooms),
    adults: String(adults),
    cid: AGODA_SITE_ID,
  });
  return `https://www.agoda.com/search?${params.toString()}`;
}

function agodaHotelUrl(hotelId: string, cityId: number, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    hotel_id: hotelId,
    city: String(cityId),
    checkIn,
    checkOut,
    adults: String(adults),
    rooms: String(rooms),
  });
  if (AGODA_SITE_ID) params.set("cid", AGODA_SITE_ID);
  return `https://www.agoda.com/search?${params.toString()}`;
}

function bookingUrl(destinationName: string, checkIn: string, checkOut: string, adults: number, rooms: number) {
  const params = new URLSearchParams({
    ss: destinationName,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: String(rooms),
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function tripUrl(cityName: string, checkIn: string, checkOut: string, adults: number) {
  const destination = `https://www.trip.com/hotels/list?city=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adult=${adults}`;
  return TRIP_SITE_ID
    ? `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(destination)}`
    : destination;
}

function klookUrl(cityName: string, checkIn: string, checkOut: string, adults: number) {
  const params = new URLSearchParams({
    city: cityName,
    checkin: checkIn,
    checkout: checkOut,
    adults: String(adults),
  });
  if (KLOOK_ID) params.set("aid", KLOOK_ID);
  return `https://www.klook.com/hotels/search/?${params.toString()}`;
}

function expediaUrl(destinationName: string, checkIn: string, checkOut: string, adults: number) {
  const destination = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destinationName)}&startDate=${checkIn}&endDate=${checkOut}&adults=${adults}`;
  return `https://expedia.tpx.gr/${EXPEDIA_CODE}?url=${encodeURIComponent(destination)}`;
}

function shouldIncludeExpediaLink(expediaCode: string): boolean {
  const normalized = expediaCode.trim();
  if (!normalized) return false;
  if (/placeholder|your|replace|sample|example|todo/i.test(normalized)) return false;
  if (/[\u1000-\u109f]/.test(normalized)) return false; // Exclude non-Latin chars (e.g. Burmese)
  return true;
}

async function awinDeepLink(destinationUrl: string): Promise<string> {
  const key = `awin:${Buffer.from(destinationUrl).toString("base64").slice(0, 60)}`;
  return cached(
    key,
    async () => {
      if (!AWIN_TOKEN || !AWIN_PUB_ID) return destinationUrl;
      try {
        const response = await fetch(
          `https://api.awin.com/publishers/${AWIN_PUB_ID}/linkbuilder/generate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${AWIN_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              advertiserId: parseInt(BOOKING_ADV, 10),
              destinationUrl,
            }),
          }
        );

        const payload = (await response.json()) as { url?: string };
        return payload.url ?? destinationUrl;
      } catch {
        return destinationUrl;
      }
    },
    86400
  );
}

function buildAffiliateLinks(
  cityName: string,
  bookingName: string,
  cityId: number,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number
): HotelOutboundLinks {
  const links: HotelOutboundLinks = {
    agoda: agodaSearchUrl(cityId, checkIn, checkOut, adults, rooms),
    booking: bookingUrl(bookingName, checkIn, checkOut, adults, rooms),
    trip: tripUrl(cityName, checkIn, checkOut, adults),
    klook: klookUrl(cityName, checkIn, checkOut, adults),
  };

  if (shouldIncludeExpediaLink(EXPEDIA_CODE)) {
    links.expedia = expediaUrl(bookingName, checkIn, checkOut, adults);
  }

  return links;
}

function normalizeImageUrl(url: string): string {
  if (url.startsWith("http://")) return `https://${url.slice("http://".length)}`;
  return url;
}

function buildFallbackCoordinates(city: SearchCity, index: number) {
  const cityLat = (city as any).lat;
  const cityLng = (city as any).lng;

  if (typeof cityLat !== "number" || typeof cityLng !== "number") {
    return undefined;
  }

  const angle = (index * 137.5 * Math.PI) / 180;
  const radiusKm = 1.2 + (index % 6) * 0.45;
  const latOffset = (radiusKm / 111) * Math.cos(angle);
  const lngOffset =
    (radiusKm / (111 * Math.max(0.3, Math.cos((cityLat * Math.PI) / 180)))) *
    Math.sin(angle);

  return {
    lat: cityLat + latOffset,
    lng: cityLng + lngOffset,
    isFallback: true,
  };
}

type SearchCity = City | HotelSearchCity;

function asNonEmptyString(value: any): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function asPositiveFiniteNumber(value: any): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
}

function asSafeErrorValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

function extractAgodaErrorDiagnostics(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const error = (payload as Record<string, unknown>).error;
  if (!error) {
    return {};
  }
  if (typeof error === "string" || typeof error === "number") {
    return {
      agodaErrorMessage: asSafeErrorValue(error),
    };
  }
  if (typeof error !== "object" || Array.isArray(error)) {
    return {};
  }

  const errorObject = error as Record<string, unknown>;
  const code =
    asSafeErrorValue(errorObject.code) ??
    asSafeErrorValue(errorObject.errorCode) ??
    asSafeErrorValue(errorObject.status);
  const message =
    asSafeErrorValue(errorObject.message) ??
    asSafeErrorValue(errorObject.errorMessage);
  const type = asSafeErrorValue(errorObject.type);

  return {
    agodaErrorCode: code,
    agodaErrorMessage: message,
    agodaErrorType: type,
  };
}

const AGODA_LT_V1_ENDPOINT =
  "http://affiliateapi7643.agoda.com/affiliateservice/lt_v1";

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
        dailyRate: {
          minimum: 1,
          maximum: 10000,
        },
        discountOnly: false,
        language: "en-us",
        maxResult: params.pageSize,
        minimumReviewScore: 0,
        minimumStarRating: 0,
        occupancy: {
          numberOfAdult: params.adults,
          numberOfChildren: 0,
        },
        sortBy: AGODA_SORT_MAP[params.sort] ?? "Recommended",
      },
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      cityId: params.cityId,
    },
  };
}

function normalizeNeighborhood(rawHotel: any): string | undefined {
  return (
    asNonEmptyString(rawHotel.areaName) ??
    asNonEmptyString(rawHotel.district) ??
    asNonEmptyString(rawHotel.neighborhood) ??
    asNonEmptyString(rawHotel.zone) ??
    asNonEmptyString(rawHotel.location?.district) ??
    asNonEmptyString(rawHotel.location?.neighborhood)
  );
}

function normalizeBreakfastIncluded(rawHotel: any): boolean | undefined {
  if (typeof rawHotel.breakfastIncluded === "boolean") {
    return rawHotel.breakfastIncluded;
  }
  if (typeof rawHotel.includeBreakfast === "boolean") {
    return rawHotel.includeBreakfast;
  }
  if (typeof rawHotel.mealPlan?.breakfastIncluded === "boolean") {
    return rawHotel.mealPlan.breakfastIncluded;
  }
  if (typeof rawHotel.boardBasis?.breakfastIncluded === "boolean") {
    return rawHotel.boardBasis.breakfastIncluded;
  }

  const planText =
    asNonEmptyString(rawHotel.mealPlan) ??
    asNonEmptyString(rawHotel.mealPlanName) ??
    asNonEmptyString(rawHotel.boardBasis) ??
    asNonEmptyString(rawHotel.boardType);

  if (!planText) return undefined;
  const normalized = planText.toLowerCase();

  if (!/\bbreakfast\b/.test(normalized)) return undefined;

  if (
    /\b(no breakfast|without breakfast|breakfast excluded|room only)\b/.test(
      normalized
    )
  ) {
    return false;
  }

  return true;
}

function normalizeFreeCancellation(rawHotel: any): boolean | undefined {
  if (typeof rawHotel.freeCancellation === "boolean") {
    return rawHotel.freeCancellation;
  }
  if (typeof rawHotel.cancellation?.freeCancellation === "boolean") {
    return rawHotel.cancellation.freeCancellation;
  }
  if (typeof rawHotel.refundable === "boolean") {
    return rawHotel.refundable;
  }
  if (typeof rawHotel.isRefundable === "boolean") {
    return rawHotel.isRefundable;
  }

  const policyText =
    asNonEmptyString(rawHotel.cancellationType) ??
    asNonEmptyString(rawHotel.cancellationPolicy) ??
    asNonEmptyString(rawHotel.ratePlan?.cancellationPolicy) ??
    asNonEmptyString(rawHotel.refundType);

  if (!policyText) return undefined;
  const normalized = policyText.toLowerCase();

  if (
    /\bnon[- ]?refundable\b/.test(normalized) ||
    /\bno free cancellation\b/.test(normalized)
  ) {
    return false;
  }

  if (
    /\bfree cancellation\b/.test(normalized) ||
    /\bfully refundable\b/.test(normalized)
  ) {
    return true;
  }

  return undefined;
}

function normalizePayLater(rawHotel: any): boolean | undefined {
  if (typeof rawHotel.payLater === "boolean") {
    return rawHotel.payLater;
  }
  if (typeof rawHotel.payAtHotel === "boolean") {
    return rawHotel.payAtHotel;
  }
  if (typeof rawHotel.payAtProperty === "boolean") {
    return rawHotel.payAtProperty;
  }
  if (typeof rawHotel.payment?.payLater === "boolean") {
    return rawHotel.payment.payLater;
  }
  if (typeof rawHotel.payment?.payAtHotel === "boolean") {
    return rawHotel.payment.payAtHotel;
  }

  const paymentText =
    asNonEmptyString(rawHotel.paymentType) ??
    asNonEmptyString(rawHotel.paymentDescription) ??
    asNonEmptyString(rawHotel.ratePlan?.paymentType) ??
    asNonEmptyString(rawHotel.ratePlan?.paymentDescription);

  if (!paymentText) return undefined;
  const normalized = paymentText.toLowerCase();

  if (
    /\bpay later\b/.test(normalized) ||
    /\bpay at hotel\b/.test(normalized) ||
    /\breserve now[, ]*pay later\b/.test(normalized)
  ) {
    return true;
  }

  if (
    /\bprepaid\b/.test(normalized) ||
    /\bpay now\b/.test(normalized) ||
    /\bfull prepayment\b/.test(normalized)
  ) {
    return false;
  }

  return undefined;
}

function deriveCoordinatesConfidence(
  hasExactCoordinates: boolean,
  hasFallbackCoordinates: boolean
): HotelCoordinatesConfidence {
  if (hasExactCoordinates) return "exact";
  if (hasFallbackCoordinates) return "fallback";
  return "missing";
}

function calculateStayNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(`${checkIn}T00:00:00Z`);
  const checkOutDate = new Date(`${checkOut}T00:00:00Z`);
  const msPerNight = 24 * 60 * 60 * 1000;
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / msPerNight
  );
  return nights > 0 ? nights : 0;
}

function formatMoney(amount: number, currency?: string): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  if (currency) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      // currency invalid
    }
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    amount
  );
}

function buildPriceDisplay(
  lowestRate: number,
  currency: string | undefined,
  nights: number
): HotelPriceDisplay | undefined {
  if (!Number.isFinite(lowestRate) || lowestRate <= 0) return undefined;

  const nightly = formatMoney(lowestRate, currency);
  if (!nightly) return undefined;

  const priceDisplay: HotelPriceDisplay = {
    priceLabel: `${nightly} / night`,
  };

  if (nights > 0) {
    const total = formatMoney(lowestRate * nights, currency);
    if (total) {
      priceDisplay.totalStayEstimateLabel = `${total} total (${nights} ${nights === 1 ? "night" : "nights"})`;
    }
  }

  return priceDisplay;
}

function normalizeHotel(
  rawHotel: any,
  city: SearchCity,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number,
  fallbackLinks: HotelOutboundLinks,
  index: number,
  page: number
): HotelResult {
  const hotelId = String(
    rawHotel.hotelId ??
      rawHotel.propertyId ??
      rawHotel.id ??
      `${(city as any).agodaCityId}-${index + 1}`
  );
  const imageUrl = normalizeImageUrl(
    asNonEmptyString(rawHotel.imageUrl) ??
      asNonEmptyString(rawHotel.imageURL) ??
      asNonEmptyString(rawHotel.photoURL) ??
      asNonEmptyString(rawHotel.photoUrl) ??
      asNonEmptyString(rawHotel.thumbnailURL) ??
      asNonEmptyString(rawHotel.thumbnailUrl) ??
      asNonEmptyString(rawHotel.mainPhotoUrl) ??
      asNonEmptyString(rawHotel.mainPhotoURL) ??
      asNonEmptyString(rawHotel.hotelImageUrl) ??
      asNonEmptyString(rawHotel.hotelImageURL) ??
      asNonEmptyString(rawHotel.images?.[0]?.url) ??
      asNonEmptyString(rawHotel.images?.[0]) ??
      asNonEmptyString(rawHotel.image?.url) ??
      asNonEmptyString(rawHotel.photos?.[0]?.url) ??
      asNonEmptyString(rawHotel.photos?.[0]) ??
      ""
  );
  const amenities = Array.isArray(rawHotel.amenities)
    ? rawHotel.amenities
        .map((amenity: unknown) => String((amenity as any)?.name ?? amenity))
        .filter(Boolean)
    : [];
  if (rawHotel.freeWifi === true && !amenities.includes("Free WiFi")) {
    amenities.push("Free WiFi");
  }
  const reviewScore = Number(
    rawHotel.reviewScore ??
      rawHotel.reviewScoreRaw ??
      rawHotel.review?.score ??
      0
  );
  const reviewCount = Number(
    rawHotel.reviewCount ??
      rawHotel.reviewCountRaw ??
      rawHotel.review?.count ??
      0
  );
  const stars = Number(
    rawHotel.stars ?? rawHotel.starRating ?? rawHotel.rating ?? 0
  );
  const lowestRate = Number(
    rawHotel.lowestRate ??
      rawHotel.price?.amount ??
      rawHotel.displayPrice?.amount ??
      rawHotel.priceDisplay?.amount ??
      rawHotel.dailyRate ??
      0
  );

  const agodaUrl =
    rawHotel.landingURL ??
    (hotelId
      ? agodaHotelUrl(
          hotelId,
          (city as any).agodaLtCityId ?? (city as any).agodaCityId,
          checkIn,
          checkOut,
          adults,
          rooms
        )
      : fallbackLinks.agoda);

  const outboundLinks: HotelOutboundLinks = {
    ...fallbackLinks,
    agoda: agodaUrl,
  };

  const lat = Number(
    rawHotel.latitude ??
      rawHotel.lat ??
      rawHotel.coordinate?.lat ??
      rawHotel.coordinates?.lat ??
      rawHotel.location?.lat
  );
  const lng = Number(
    rawHotel.longitude ??
      rawHotel.lng ??
      rawHotel.lon ??
      rawHotel.coordinate?.lng ??
      rawHotel.coordinates?.lng ??
      rawHotel.location?.lng
  );

  const hasExactCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
  const fallbackCoordinates = buildFallbackCoordinates(city, index);
  const coordinates = hasExactCoordinates ? { lat, lng } : fallbackCoordinates;
  const hasFallbackCoordinates =
    !hasExactCoordinates && Boolean(fallbackCoordinates);

  const coordinatesConfidence = deriveCoordinatesConfidence(
    hasExactCoordinates,
    hasFallbackCoordinates
  );

  const rankingPosition =
    asPositiveFiniteNumber(rawHotel.rankingPosition) ??
    asPositiveFiniteNumber(rawHotel.rank) ??
    asPositiveFiniteNumber(rawHotel.ranking) ??
    (page - 1) * PAGE_SIZE + index + 1;

  const currency =
    asNonEmptyString(rawHotel.currency) ??
    asNonEmptyString(rawHotel.price?.currency);

  const neighborhood = normalizeNeighborhood(rawHotel);
  const breakfastIncluded = normalizeBreakfastIncluded(rawHotel);
  const freeCancellation = normalizeFreeCancellation(rawHotel);
  const payLater = normalizePayLater(rawHotel);

  const priceDisplay = buildPriceDisplay(
    lowestRate,
    currency,
    calculateStayNights(checkIn, checkOut)
  );

  return {
    hotelId,
    name: String(
      rawHotel.name ?? rawHotel.hotelName ?? rawHotel.propertyName ?? "Hotel"
    ),
    stars,
    reviewScore,
    reviewCount,
    address:
      asNonEmptyString(rawHotel.address) ??
      asNonEmptyString(rawHotel.addressLine1) ??
      asNonEmptyString(rawHotel.areaName) ??
      asNonEmptyString(rawHotel.cityName) ??
      asNonEmptyString(rawHotel.location?.address) ??
      asNonEmptyString(rawHotel.location?.areaName) ??
      asNonEmptyString(rawHotel.location?.cityName) ??
      "",
    imageUrl,
    amenities,
    lowestRate,
    currency,
    rankingPosition,
    coordinates,
    outboundLinks,
    neighborhood,
    breakfastIncluded,
    freeCancellation,
    payLater,
    provider: "agoda",
    crossedOutRate: Number.isFinite(Number(rawHotel.crossedOutRate))
      ? Number(rawHotel.crossedOutRate)
      : undefined,
    discountPercentage:
      Number.isFinite(Number(rawHotel.discountPercentage)) &&
      Number(rawHotel.discountPercentage) > 0
        ? Number(rawHotel.discountPercentage)
        : undefined,
    providerPrices:
      Number.isFinite(lowestRate) && lowestRate > 0
        ? { agoda: lowestRate }
        : undefined,
    coordinatesConfidence,
    priceDisplay,
  };
}

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
  const hasAgodaSiteId = Boolean(AGODA_SITE_ID);
  const hasAgodaApiKey = Boolean(AGODA_API_KEY);
  const allowMockFallback = shouldUseMockHotelFallback();
  const requestShape = {
    ltCityId,
    cityId: agodaCityId,
    checkIn,
    checkOut,
    adults,
    rooms,
    page,
    pageSize: PAGE_SIZE,
    authFormat: "siteid_colon_apikey",
    requestFormat: "criteria_city_search",
  };
  const buildDiagnostics = (
    reason: HotelDiagnosticsReason,
    status?: number,
    extras: Partial<HotelSearchDiagnostics> = {}
  ): HotelSearchDiagnostics => ({
    reason,
    status,
    hasAgodaSiteId,
    hasAgodaApiKey,
    siteIdLooksNumeric: /^\d+$/.test(AGODA_SITE_ID),
    apiKeyPresent: hasAgodaApiKey,
    authFormat: "siteid_colon_apikey",
    requestShape,
    ...extras,
  });
  const liveAgodaWarning = "Live Agoda results are temporarily unavailable.";

  const key = `agoda-lt:${ltCityId}:${checkIn}:${checkOut}:${adults}:${rooms}:${page}:${sort}`;
  return cached(
    key,
    async () => {
      if (!hasAgodaSiteId || !hasAgodaApiKey) {
        safeWarnOnce(
          "Agoda credentials are missing; live results are unavailable."
        );
        const diagnostics = buildDiagnostics("missing_credentials");
        if (allowMockFallback) {
          return {
            source: "mock" as const,
            hotels: getMockHotels(agodaCityId, page, sort),
            warnings: [
              "Live Agoda credentials are not configured. Showing fallback results.",
            ],
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

      try {
        const body = buildAgodaLtV1RequestBody({
          checkIn,
          checkOut,
          cityId: ltCityId,
          adults,
          pageSize: PAGE_SIZE,
          sort,
        });
        console.info("[Hotels] Agoda lt_v1 request", {
          endpointUrl: AGODA_LT_V1_ENDPOINT,
          ...requestShape,
          hasAgodaSiteId,
          hasAgodaApiKey,
        });

        const response = await fetch(AGODA_LT_V1_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AGODA_API_KEY.startsWith(`${AGODA_SITE_ID}:`)
              ? AGODA_API_KEY
              : `${AGODA_SITE_ID}:${AGODA_API_KEY}`,
            "Accept-Encoding": "gzip,deflate",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const responseBody = await response.text();
          const bodySnippet = responseBody.slice(0, 300).replace(/\s+/g, " ");
          console.warn(
            `[Hotels] Agoda lt_v1 non-ok response status=${response.status} body="${bodySnippet}"`
          );
          safeWarnOnce(
            `Agoda lt_v1 search returned status ${response.status}.`
          );
          const diagnostics = buildDiagnostics("non_ok_response", response.status, {
            agodaResponsePreview: bodySnippet,
          });
          if (allowMockFallback) {
            return {
              source: "mock" as const,
              hotels: getMockHotels(agodaCityId, page, sort),
              warnings: [
                "Live Agoda search is temporarily unavailable. Showing fallback results.",
              ],
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

        const payload = (await response.json()) as Record<string, unknown>;
        const payloadTopLevelKeys =
          payload && typeof payload === "object" && !Array.isArray(payload)
            ? Object.keys(payload)
            : [];
        const hasErrorPayload = payloadTopLevelKeys.includes("error");
        const agodaErrorDiagnostics = hasErrorPayload
          ? extractAgodaErrorDiagnostics(payload)
          : {};
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
        const resultCandidateCounts = Object.entries(resultCandidateMap).reduce<
          Record<string, number>
        >((acc, [candidateKey, candidateValue]) => {
          if (Array.isArray(candidateValue)) {
            acc[candidateKey] = candidateValue.length;
          }
          return acc;
        }, {});
        const hotels =
          (Object.values(resultCandidateMap).find(
            (candidate): candidate is unknown[] =>
              Array.isArray(candidate) && candidate.length > 0
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
          const diagnostics = buildDiagnostics("empty_results", undefined, {
            payloadTopLevelKeys,
            resultCandidateCounts,
            ...agodaErrorDiagnostics,
          });
          if (allowMockFallback) {
            return {
              source: "mock" as const,
              hotels: getMockHotels(agodaCityId, page, sort),
              warnings: [
                "No live Agoda hotels were returned for this criteria. Showing fallback results.",
              ],
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

        return {
          source: "agoda" as const,
          hotels,
          totalCount:
            (typeof payload?.totalResults === "number"
              ? payload.totalResults
              : undefined) ??
            (typeof payload?.totalCount === "number"
              ? payload.totalCount
              : undefined) ??
            hotels.length,
        };
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
    },
    1800
  );
}

function sortHotels(hotels: HotelResult[], sort: HotelSort) {
  const sorted = [...hotels];
  sorted.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return (
          (a.lowestRate || Number.MAX_SAFE_INTEGER) -
          (b.lowestRate || Number.MAX_SAFE_INTEGER)
        );
      case "price_desc":
        return (b.lowestRate || 0) - (a.lowestRate || 0);
      case "stars_desc":
        return (
          (b.stars || 0) - (a.stars || 0) ||
          (b.reviewScore || 0) - (a.reviewScore || 0)
        );
      case "review_desc":
        return (
          (b.reviewScore || 0) - (a.reviewScore || 0) ||
          (b.reviewCount || 0) - (a.reviewCount || 0)
        );
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
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
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
      imageUrl:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
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
      imageUrl:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
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
      imageUrl:
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600",
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
      imageUrl:
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600",
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
      imageUrl:
        "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600",
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
      Number.isFinite(hotel.lowestRate) && hotel.lowestRate > 0
        ? { agoda: hotel.lowestRate }
        : undefined,
  }));

  return sortHotels(withLinks as HotelResult[], sort);
}

export async function searchHotels(req: any, res: any) {
  const normalized = normalizeHotelSearchParams(req.query);

  const isNumericCityId = /^\d+$/.test(normalized.city);
  let city: SearchCity;

  if (isNumericCityId) {
    const agodaCityId = parseInt(normalized.city, 10);
    if (!Number.isFinite(agodaCityId)) {
      return res
        .status(400)
        .json({ error: `Invalid Agoda city id: ${normalized.city}` });
    }

    const fallbackName =
      normalized.cityName?.trim() || `City ${normalized.city}`;
    city = {
      slug: normalized.city,
      name: fallbackName,
      bookingName: fallbackName,
      country: "",
      agodaCityId,
      hasHotels: true,
    } as SearchCity;
  } else {
    const localCity = getCityBySlug(normalized.city);
    if (!localCity)
      return res
        .status(404)
        .json({ error: `City not found: ${normalized.city}` });

    if (!localCity.hasHotels)
      return res
        .status(400)
        .json({ error: `No hotels available for ${localCity.name}` });

    city = localCity;
  }

  try {
    const affiliateLinks = buildAffiliateLinks(
      (city as any).name,
      (city as any).bookingName,
      (city as any).agodaCityId,
      normalized.checkIn,
      normalized.checkOut,
      normalized.adults,
      normalized.rooms
    );

    const [bookingLink, result] = await Promise.all([
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
      fetchAgodaHotels(
        (city as any).agodaCityId,
        (city as any).agodaLtCityId ?? (city as any).agodaCityId,
        normalized.checkIn,
        normalized.checkOut,
        normalized.adults,
        normalized.rooms,
        normalized.page,
        normalized.sort
      ),
    ]);

    const normalizedHotels = sortHotels(
      result.hotels.map((hotel: any, index: number) =>
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
      ),
      normalized.sort
    );

    const exposeDiagnostics = shouldExposeHotelDiagnostics();
    const responseMeta: HotelSearchResponse["meta"] = {
      source: result.source,
      checkIn: normalized.checkIn,
      checkOut: normalized.checkOut,
      adults: normalized.adults,
      rooms: normalized.rooms,
      page: normalized.page,
      sort: normalized.sort,
      pageSize: PAGE_SIZE,
      totalCount: result.totalCount ?? normalizedHotels.length,
      totalPages: Math.max(
        1,
        Math.ceil((result.totalCount ?? normalizedHotels.length) / PAGE_SIZE)
      ),
      warning: (result as any).warning,
      warnings: result.warnings,
    };

    if (exposeDiagnostics) {
      responseMeta.diagnostics = (result as any).diagnostics;
    }

    const response: HotelSearchResponse = {
      city: city as HotelSearchCity,
      hotels: normalizedHotels,
      affiliateLinks: { ...affiliateLinks, booking: bookingLink },
      meta: responseMeta,
    };

    return res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Hotels] Search failed:", message);
    return res.status(500).json({ error: "Search failed" });
  }
}
