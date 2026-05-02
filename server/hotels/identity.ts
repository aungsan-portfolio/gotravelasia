import type {
  CanonicalHotel,
  HotelCoordinates,
  HotelIdentityMatch,
  HotelIdentityMatchReason,
  HotelOffer,
  HotelOfferProvider,
  HotelResult,
  ProviderHotel,
} from "../../shared/hotels/types.js";

const HOTEL_COMMON_WORDS = new Set([
  "hotel",
  "resort",
  "hostel",
  "guesthouse",
  "guest",
  "house",
  "inn",
  "suites",
  "suite",
  "residence",
  "residences",
  "apartment",
  "apartments",
]);

const OFFER_PROVIDERS: HotelOfferProvider[] = ["agoda", "booking", "trip", "expedia", "klook"];

function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeBasicText(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeHotelName(name: string): string {
  const cleaned = normalizeBasicText(name ?? "");
  if (!cleaned) return "";

  const withoutCommonWords = cleaned
    .split(" ")
    .filter((token) => !HOTEL_COMMON_WORDS.has(token))
    .join(" ")
    .trim();

  return withoutCommonWords || cleaned;
}

export function normalizeHotelAddress(address?: string | null): string {
  if (!address) return "";
  return stripDiacritics(address)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0)
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function computeHotelNameSimilarity(a: string, b: string): number {
  const normalizedA = normalizeHotelName(a);
  const normalizedB = normalizeHotelName(b);

  if (!normalizedA && !normalizedB) return 0;
  if (normalizedA === normalizedB) return 1;

  const distance = levenshteinDistance(normalizedA, normalizedB);
  const length = Math.max(normalizedA.length, normalizedB.length);
  if (!length) return 0;

  return clampScore(1 - distance / length);
}

export function computeHotelDistanceKm(a?: HotelCoordinates, b?: HotelCoordinates): number | null {
  if (!a || !b) return null;
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const haversine = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusKm * c;
}

function normalizeComparableCity(hotel: ProviderHotel): string {
  return normalizeBasicText(hotel.cityName || hotel.city || "");
}

export function computeHotelMatchScore(a: ProviderHotel, b: ProviderHotel): HotelIdentityMatch {
  const reasons: HotelIdentityMatchReason[] = [];

  if (a.provider === b.provider && a.providerHotelId === b.providerHotelId) {
    reasons.push("same_provider_id");
    return { score: 1, matched: true, reasons };
  }

  const nameSimilarity = computeHotelNameSimilarity(a.name, b.name);
  if (nameSimilarity >= 0.999) reasons.push("exact_normalized_name");
  else if (nameSimilarity >= 0.72) reasons.push("similar_name");

  let score = nameSimilarity * 0.6;

  const cityA = normalizeComparableCity(a);
  const cityB = normalizeComparableCity(b);
  if (cityA && cityB && cityA === cityB) {
    score += 0.15;
    reasons.push("same_city");
  }

  const distance = computeHotelDistanceKm(a.coordinates, b.coordinates);
  if (distance !== null) {
    if (distance <= 0.2) {
      score += 0.2;
      reasons.push("nearby_coordinates");
    } else if (distance <= 1) {
      score += Math.max(0, (1 - (distance - 0.2) / 0.8) * 0.2);
      reasons.push("nearby_coordinates");
    }
  }

  const addressA = normalizeHotelAddress(a.address);
  const addressB = normalizeHotelAddress(b.address);
  if (addressA && addressB && addressA === addressB) {
    score += 0.05;
    reasons.push("same_address");
  }

  const clampedScore = clampScore(score);
  const matched = clampedScore >= 0.82 && nameSimilarity >= 0.72;

  return { score: clampedScore, matched, reasons };
}

function isHotelOfferProvider(value?: string): value is HotelOfferProvider {
  return Boolean(value && OFFER_PROVIDERS.includes(value as HotelOfferProvider));
}

export function createHotelOfferFromResult(hotel: HotelResult, provider: HotelOfferProvider): HotelOffer {
  const providerHotelId = hotel.hotelId;
  const rawPrice = hotel.providerPrices?.[provider] ?? hotel.lowestRate;
  const price = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;

  return {
    offerId: `${provider}:${providerHotelId}`,
    provider,
    providerHotelId,
    price,
    currency: hotel.currency,
    deeplink: hotel.outboundLinks?.[provider],
    crossedOutRate: hotel.crossedOutRate,
    discountPercentage: hotel.discountPercentage,
    breakfastIncluded: hotel.breakfastIncluded,
    freeCancellation: hotel.freeCancellation,
    payLater: hotel.payLater,
    updatedAt: new Date().toISOString(),
  };
}

export function createProviderHotelFromResult(
  hotel: HotelResult,
  provider?: HotelOfferProvider
): ProviderHotel {
  const resolvedProvider = isHotelOfferProvider(hotel.provider)
    ? hotel.provider
    : provider ?? "agoda";

  return {
    provider: resolvedProvider,
    providerHotelId: hotel.hotelId,
    name: hotel.name,
    city: undefined,
    cityName: undefined,
    address: hotel.address,
    neighborhood: hotel.neighborhood,
    stars: hotel.stars,
    reviewScore: hotel.reviewScore,
    reviewCount: hotel.reviewCount,
    imageUrl: hotel.imageUrl,
    amenities: hotel.amenities ? [...hotel.amenities] : undefined,
    coordinates: hotel.coordinates ? { ...hotel.coordinates } : undefined,
    offer: createHotelOfferFromResult(hotel, resolvedProvider),
    sourceHotel: hotel,
  };
}

// Foundation utilities for future scatter-gather provider fanout and hotel identity grouping.
// Intentionally not wired into the live /api/hotels/search response in this step.
export function mergeProviderHotels(providerHotels: ProviderHotel[]): CanonicalHotel[] {
  const canonicalHotels: CanonicalHotel[] = [];

  for (const providerHotel of providerHotels) {
    let targetCanonical: CanonicalHotel | undefined;

    for (const canonical of canonicalHotels) {
      const seedHotel = canonical.sourceHotels?.[0];
      if (!seedHotel) continue;
      const match = computeHotelMatchScore(seedHotel, providerHotel);
      if (match.matched) {
        targetCanonical = canonical;
        break;
      }
    }

    if (!targetCanonical) {
      canonicalHotels.push({
        canonicalId: `canonical:${providerHotel.provider}:${providerHotel.providerHotelId}`,
        name: providerHotel.name,
        city: providerHotel.city,
        cityName: providerHotel.cityName,
        address: providerHotel.address,
        neighborhood: providerHotel.neighborhood,
        stars: providerHotel.stars,
        reviewScore: providerHotel.reviewScore,
        reviewCount: providerHotel.reviewCount,
        imageUrl: providerHotel.imageUrl,
        amenities: [...(providerHotel.amenities ?? [])],
        coordinates: providerHotel.coordinates ? { ...providerHotel.coordinates } : undefined,
        offers: providerHotel.offer ? [{ ...providerHotel.offer }] : [],
        providerHotelIds: {
          [providerHotel.provider]: providerHotel.providerHotelId,
        },
        sourceHotels: [{ ...providerHotel }],
      });
      continue;
    }

    if (providerHotel.amenities?.length) {
      targetCanonical.amenities = Array.from(
        new Set([...targetCanonical.amenities, ...providerHotel.amenities])
      );
    }

    if (providerHotel.offer) {
      const hasOffer = targetCanonical.offers.some(
        (offer) => offer.offerId === providerHotel.offer?.offerId
      );
      if (!hasOffer) targetCanonical.offers.push({ ...providerHotel.offer });
    }

    targetCanonical.providerHotelIds = {
      ...targetCanonical.providerHotelIds,
      [providerHotel.provider]: providerHotel.providerHotelId,
    };
    targetCanonical.sourceHotels = [
      ...(targetCanonical.sourceHotels ?? []),
      { ...providerHotel },
    ];
  }

  return canonicalHotels;
}
