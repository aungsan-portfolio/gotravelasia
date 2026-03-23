import type { Request, Response } from "express";
import { getCityBySlug, type City } from "../../shared/hotels/cities.js";
import { normalizeHotelSearchParams } from "../../shared/hotels/searchParams.js";
import type {
  HotelOutboundLinks,
  HotelResult,
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

function buildFallbackCoordinates(city: City, index: number) {
  // TEMPORARY FALLBACK STRATEGY: until upstream hotel-level lat/lng is consistently available,
  // spread missing-coordinate hotels in a deterministic ring around the destination center.
  const angle = (index * 137.5 * Math.PI) / 180;
  const radiusKm = 1.2 + (index % 6) * 0.45;
  const latOffset = (radiusKm / 111) * Math.cos(angle);
  const lngOffset =
    (radiusKm / (111 * Math.max(0.3, Math.cos((city.lat * Math.PI) / 180)))) *
    Math.sin(angle);
  return {
    lat: city.lat + latOffset,
    lng: city.lng + lngOffset,
    isFallback: true,
  };
}

function normalizeHotel(
  rawHotel: any,
  city: City,
  checkIn: string,
  checkOut: string,
  adults: number,
  rooms: number,
  fallbackLinks: HotelOutboundLinks,
  index: number
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
  const outboundLinks: HotelOutboundLinks = {
    agoda: hotelId
      ? agodaHotelUrl(
          hotelId,
          city.agodaCityId,
          checkIn,
          checkOut,
          adults,
          rooms
        )
      : fallbackLinks.agoda,
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
  const coordinates =
    Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : buildFallbackCoordinates(city, index);

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
    currency: rawHotel.currency ?? rawHotel.price?.currency,
    rankingPosition: Number(rawHotel.rankingPosition ?? index + 1),
    coordinates,
    outboundLinks,
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
  const key = `agoda:${agodaCityId}:${checkIn}:${checkOut}:${adults}:${rooms}:${page}:${sort}`;
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
        const body = {
          criteria: {
            checkInDate: checkIn,
            checkOutDate: checkOut,
            cityId: agodaCityId,
            numberOfAdult: adults,
            numberOfRoom: rooms,
            pageNo: page,
            pageSize: PAGE_SIZE,
            sortBy: AGODA_SORT_MAP[sort] ?? "rank",
            additional: {
              currency: "USD",
              language: "en-us",
              discountOnly: false,
            },
          },
          publisherId: AGODA_SITE_ID,
        };

        const response = await fetch(
          "https://affiliateapi7643.agoda.com/api/v3/json/Search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: AGODA_API_KEY,
              "X-API-Key": AGODA_API_KEY,
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          safeWarnOnce(
            `Agoda search returned status ${response.status}; serving fallback hotel data.`
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
          results?: {
            hotels?: unknown[];
            totalCount?: number;
            pageNo?: number;
          };
        };
        const hotels = Array.isArray(payload.results?.hotels)
          ? payload.results.hotels
          : [];
        if (!hotels.length) {
          return {
            source: "mock" as const,
            hotels: getMockHotels(agodaCityId, page, sort),
            warnings: [
              "No live Agoda hotels were returned. Showing fallback results.",
            ],
          };
        }

        return {
          source: "agoda" as const,
          hotels,
          totalCount: payload.results?.totalCount,
        };
      } catch {
        safeWarnOnce(
          "Agoda search failed unexpectedly; serving fallback hotel data."
        );
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
  }));

  return sortHotels(withLinks, sort);
}

export async function searchHotels(req: Request, res: Response) {
  const normalized = normalizeHotelSearchParams(
    req.query as Record<string, string | string[] | undefined>
  );
  const city = getCityBySlug(normalized.city);

  if (!city)
    return res
      .status(404)
      .json({ error: `City not found: ${normalized.city}` });
  if (!city.hasHotels)
    return res
      .status(400)
      .json({ error: `No hotels available for ${city.name}` });

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
          index
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
