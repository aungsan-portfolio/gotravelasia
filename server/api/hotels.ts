import type { Request, Response } from "express";
import { getCityBySlug, type City } from "../../shared/hotels/cities.js";
import { normalizeHotelSearchParams } from "../../shared/hotels/searchParams.js";
import type {
  HotelCoordinatesConfidence,
  HotelOutboundLinks,
  HotelPriceDisplay,
  HotelResult,
  HotelSearchCity,
  HotelSearchResponse,
  HotelSort,
} from "../../shared/hotels/types.js";

const AGODA_SITE_ID = process.env.AGODA_SITE_ID ?? "";
const AGODA_API_KEY = process.env.AGODA_API_KEY ?? "";
const AWIN_TOKEN = process.env.AWIN_TOKEN ?? "";
const AWIN_PUB_ID = process.env.AWIN_PUBLISHER_ID ?? "";
const BOOKING_ADV = process.env.BOOKING_AWIN_ADV_ID ?? "5910";
const TRIP_SITE_ID = process.env.TRIP_COM_SITE_ID ?? "";
const KLOOK_ID = process.env.KLOOK_PARTNER_ID ?? "";
const EXPEDIA_CODE = process.env.EXPEDIA_TP_CODE ?? "ZZxDEika";
const PAGE_SIZE = 20;

const AGODA_SORT_MAP: Record<HotelSort, string> = {
  best: "rank",
  rank: "rank",
  price_asc: "priceLowToHigh",
  price_desc: "priceHighToLow",
  stars_desc: "starRating",
  review_desc: "reviewScore",
};

const cache = new Map<string, { val: unknown; exp: number }>();
const warnedMessages = new Set<string>();

async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.exp) return hit.val as T;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttlSeconds * 1000 });
  return val;
}

function safeWarnOnce(message: string) {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(`[Hotels] ${message}`);
}

function agodaSearchUrl(
  cityId: number,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number
) {
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

function agodaHotelUrl(
  hotelId: string,
  cityId: number,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number
) {
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

function bookingUrl(
  destinationName: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number
) {
  const params = new URLSearchParams({
    ss: destinationName,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: String(rooms),
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function tripUrl(
  cityName: string,
  checkIn: string,
  checkOut: string,
  adults: number
) {
  const destination = `https://www.trip.com/hotels/list?city=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adult=${adults}`;
  return TRIP_SITE_ID
    ? `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(destination)}`
    : destination;
}

function klookUrl(
  cityName: string,
  checkIn: string,
  checkOut: string,
  adults: number
) {
  const params = new URLSearchParams({
    city: cityName,
    checkin: checkIn,
    checkout: checkOut,
    adults: String(adults),
  });
  if (KLOOK_ID) params.set("aid", KLOOK_ID);
  return `https://www.klook.com/hotels/search/?${params.toString()}`;
}

function expediaUrl(
  destinationName: string,
  checkIn: string,
  checkOut: string,
  adults: number
) {
  const destination = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destinationName)}&startDate=${checkIn}&endDate=${checkOut}&adults=${adults}`;
  return `https://expedia.tpx.gr/${EXPEDIA_CODE}?url=${encodeURIComponent(destination)}`;
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
              advertiserId: Number.parseInt(BOOKING_ADV, 10),
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
  return {
    agoda: agodaSearchUrl(cityId, checkIn, checkOut, adults, rooms),
    booking: bookingUrl(bookingName, checkIn, checkOut, adults, rooms),
    trip: tripUrl(cityName, checkIn, checkOut, adults),
    klook: klookUrl(cityName, checkIn, checkOut, adults),
    expedia: expediaUrl(bookingName, checkIn, checkOut, adults),
  };
}

type SearchCity = HotelSearchCity & { hasHotels?: boolean };

function buildFallbackCoordinates(city: SearchCity, index: number) {
  const cityLat = city.lat;
  const cityLng = city.lng;

  if (typeof cityLat !== "number" || typeof cityLng !== "number") {
    return undefined;
  }

  // TEMPORARY FALLBACK STRATEGY: until upstream hotel-level lat/lng is consistently available,
  // spread missing-coordinate hotels in a deterministic ring around the destination center.
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

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function asPositiveFiniteNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
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
      // Currency code can occasionally be invalid from upstream payloads.
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
      `${city.agodaCityId}-${index + 1}`
  );
  const imageUrl =
    rawHotel.imageUrl ??
    rawHotel.imageURL ??
    rawHotel.images?.[0]?.url ??
    rawHotel.image?.url ??
    "";
  const amenities = Array.isArray(rawHotel.amenities)
    ? rawHotel.amenities
        .map((amenity: unknown) => String((amenity as any)?.name ?? amenity))
        .filter(Boolean)
    : [];
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

  // If Agoda provides a direct landingURL (lt_v1), use it. Otherwise, build one.
  const agodaUrl =
    rawHotel.landingURL ??
    (hotelId
      ? agodaHotelUrl(
          hotelId,
          city.agodaCityId,
          checkIn,
          checkOut,
          adults,
          rooms
        )
      : fallbackLinks.agoda);

  // Metasearch-ready outbound links:
  // Agoda is hotel-specific when available, the others are destination-level fallbacks
  // until live provider APIs are connected.
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
    address: String(
      rawHotel.address ?? rawHotel.addressLine1 ?? rawHotel.areaName ?? ""
    ),
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
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number,
  page: number,
  sort: HotelSort
) {
  const key = `agoda-lt:${agodaCityId}:${checkIn}:${checkOut}:${adults}:${rooms}:${page}:${sort}`;
  return cached(
    key,
    async () => {
      if (!AGODA_SITE_ID || !AGODA_API_KEY) {
        safeWarnOnce(
          "Agoda credentials are missing; serving fallback hotel data."
        );
        return {
          source: "mock" as const,
          hotels: getMockHotels(agodaCityId, page, sort),
          warnings: [
            "Live Agoda credentials are not configured. Showing fallback results.",
          ],
        };
      }

      try {
        // Agoda lt_v1 (Long Tail) JSON Search API - confirmed working for CID 1959281
        const body = {
          criteria: {
            checkInDate: checkIn,
            checkOutDate: checkOut,
            cityId: agodaCityId,
            adults: adults,
            rooms: rooms,
            pageNo: page,
            pageSize: PAGE_SIZE,
          },
          publisherId: AGODA_SITE_ID,
        };

        const response = await fetch(
          "http://affiliateapi7643.agoda.com/affiliateservice/lt_v1",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: AGODA_API_KEY,
              "Accept-Encoding": "gzip,deflate",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          safeWarnOnce(
            `Agoda lt_v1 search returned status ${response.status}; serving fallback hotel data.`
          );
          return {
            source: "mock" as const,
            hotels: getMockHotels(agodaCityId, page, sort),
            warnings: [
              "Live Agoda search is temporarily unavailable. Showing fallback results.",
            ],
          };
        }

        const payload = (await response.json()) as {
          results?: unknown[];
          totalResults?: number;
        };
        const hotels = Array.isArray(payload.results) ? payload.results : [];
        if (!hotels.length) {
          return {
            source: "mock" as const,
            hotels: getMockHotels(agodaCityId, page, sort),
            warnings: [
              "No live Agoda hotels were returned for this criteria. Showing fallback results.",
            ],
          };
        }

        return {
          source: "agoda" as const,
          hotels,
          totalCount: payload.totalResults ?? hotels.length,
        };
      } catch (err) {
        console.error("[Hotels] Agoda lt_v1 search failed:", err);
        return {
          source: "mock" as const,
          hotels: getMockHotels(agodaCityId, page, sort),
          warnings: ["Live Agoda search failed. Showing fallback results."],
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
      default:
        return (a.rankingPosition || 0) - (b.rankingPosition || 0);
    }
  });
  return sorted;
}

function getMockHotels(
  cityId: number,
  page: number,
  sort: HotelSort
): HotelResult[] {
  const base: HotelResult[] = [
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
      provider: "mock",
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
      provider: "mock",
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
      provider: "mock",
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
      provider: "mock",
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
      provider: "mock",
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
      provider: "mock",
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

  return sortHotels(withLinks, sort);
}

export async function searchHotels(req: any, res: any) {
  const normalized = normalizeHotelSearchParams(
    req.query as Record<string, string | string[] | undefined>
  );

  const isNumericCityId = /^\d+$/.test(normalized.city);
  let city: SearchCity | undefined;

  if (isNumericCityId) {
    const agodaCityId = Number.parseInt(normalized.city, 10);
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
    };
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
      city.name,
      city.bookingName,
      city.agodaCityId,
      normalized.checkIn,
      normalized.checkOut,
      normalized.adults,
      normalized.rooms
    );
    const [bookingLink, result] = await Promise.all([
      awinDeepLink(
        affiliateLinks.booking ??
          bookingUrl(
            city.bookingName,
            normalized.checkIn,
            normalized.checkOut,
            normalized.adults,
            normalized.rooms
          )
      ),
      fetchAgodaHotels(
        city.agodaCityId,
        normalized.checkIn,
        normalized.checkOut,
        normalized.adults,
        normalized.rooms,
        normalized.page,
        normalized.sort
      ),
    ]);

    const normalizedHotels = sortHotels(
      result.hotels.map((hotel, index) =>
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

    const response: HotelSearchResponse = {
      city,
      hotels: normalizedHotels,
      affiliateLinks: { ...affiliateLinks, booking: bookingLink },
      meta: {
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
        warnings: result.warnings,
      },
    };

    return res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Hotels] Search failed:", message);
    return res.status(500).json({ error: "Search failed" });
  }
}
