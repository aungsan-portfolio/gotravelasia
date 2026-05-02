import type {
  CanonicalHotel,
  HotelIdentityMatch,
  HotelOffer,
  HotelOfferProvider,
  HotelResult,
  ProviderHotel,
} from "../../shared/hotels/types.js";

const STOPWORDS = new Set([
  "hotel",
  "resort",
  "the",
  "and",
  "at",
  "by",
  "&",
]);

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value !== "number") return undefined;
  return Number.isFinite(value) ? value : undefined;
};

export function normalizeHotelName(name: string | null | undefined): string {
  if (!name) return "";
  const sanitized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) return "";

  return sanitized
    .split(" ")
    .filter((token) => token && !STOPWORDS.has(token))
    .map((token) => (token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token))
    .join(" ");
}

export function normalizeHotelAddress(address: string | null | undefined): string {
  if (!address) return "";
  return address
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function computeHotelNameSimilarity(a: string, b: string): number {
  const nameA = normalizeHotelName(a);
  const nameB = normalizeHotelName(b);
  if (!nameA || !nameB) return 0;
  if (nameA === nameB) return 1;

  const tokensA = new Set(nameA.split(" ").filter(Boolean));
  const tokensB = new Set(nameB.split(" ").filter(Boolean));
  const union = new Set([...tokensA, ...tokensB]);
  if (union.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }

  return intersection / union.size;
}

export function computeHotelDistanceKm(
  a?: { lat?: number; lng?: number },
  b?: { lat?: number; lng?: number },
): number | undefined {
  const lat1 = toFiniteNumber(a?.lat);
  const lng1 = toFiniteNumber(a?.lng);
  const lat2 = toFiniteNumber(b?.lat);
  const lng2 = toFiniteNumber(b?.lng);

  if (
    lat1 === undefined ||
    lng1 === undefined ||
    lat2 === undefined ||
    lng2 === undefined
  ) {
    return undefined;
  }

  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);

  const aHarv =
    s1 * s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2;
  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  return earthRadiusKm * c;
}

export function computeHotelMatchScore(
  a: ProviderHotel,
  b: ProviderHotel,
): HotelIdentityMatch {
  const providerIdMatch = a.providerHotelId === b.providerHotelId;
  const nameSimilarity = computeHotelNameSimilarity(a.name, b.name);
  const sameCity = normalizeHotelAddress(a.city) === normalizeHotelAddress(b.city);
  const distanceKm = computeHotelDistanceKm(a.coordinates, b.coordinates);
  const nearby = distanceKm !== undefined && distanceKm <= 1.5;

  let score = nameSimilarity;
  if (sameCity) score += 0.2;
  if (nearby) score += 0.2;
  if (providerIdMatch) score = 1;

  score = Math.max(0, Math.min(1, score));

  const matched = providerIdMatch || (nameSimilarity >= 0.5 && sameCity && nearby);

  let reason: HotelIdentityMatch["reason"] = "none";
  if (providerIdMatch) reason = "same_provider_hotel_id";
  else if (matched) reason = "name_city_distance";

  return {
    matched,
    score,
    reason,
    nameSimilarity,
    distanceKm,
    sameCity,
  };
}

export function createHotelOfferFromResult(
  provider: HotelOfferProvider,
  result: HotelResult,
): HotelOffer {
  return {
    provider,
    providerHotelId: result.hotelId,
    hotelId: result.hotelId,
    currency: result.currency,
    lowestRate: Number.isFinite(result.lowestRate) ? result.lowestRate : undefined,
    deepLink: result.outboundLinks?.[provider],
    freeCancellation: Boolean(result.freeCancellation),
    breakfastIncluded: Boolean(result.breakfastIncluded),
    payLater: Boolean(result.payLater),
  };
}

export function createProviderHotelFromResult(
  provider: HotelOfferProvider,
  city: string,
  result: HotelResult,
): ProviderHotel {
  return {
    provider,
    providerHotelId: result.hotelId,
    name: result.name,
    address: result.address,
    city,
    coordinates: result.coordinates
      ? { lat: result.coordinates.lat, lng: result.coordinates.lng }
      : undefined,
    amenities: [...result.amenities],
    stars: result.stars,
    reviewScore: result.reviewScore,
    imageUrl: result.imageUrl,
    offer: createHotelOfferFromResult(provider, result),
  };
}

export function mergeProviderHotels(providerHotels: ProviderHotel[]): CanonicalHotel[] {
  if (providerHotels.length === 0) return [];

  const canonicals: CanonicalHotel[] = [];

  for (const providerHotel of providerHotels) {
    let merged = false;

    for (const canonical of canonicals) {
      const match = computeHotelMatchScore(canonical.primary, providerHotel);
      if (!match.matched) continue;

      const alreadyHasProviderOffer = canonical.offers.some(
        (offer) =>
          offer.provider === providerHotel.offer.provider &&
          offer.providerHotelId === providerHotel.offer.providerHotelId,
      );
      if (!alreadyHasProviderOffer) {
        canonical.offers = [...canonical.offers, providerHotel.offer];
      }

      canonical.providers = Array.from(
        new Set([...canonical.providers, providerHotel.provider]),
      );
      canonical.matches = [...canonical.matches, match];
      canonical.amenities = Array.from(
        new Set([...canonical.amenities, ...providerHotel.amenities]),
      );
      merged = true;
      break;
    }

    if (!merged) {
      canonicals.push({
        canonicalId: `${providerHotel.provider}:${providerHotel.providerHotelId}`,
        primary: providerHotel,
        providers: [providerHotel.provider],
        offers: [providerHotel.offer],
        amenities: [...providerHotel.amenities],
        matches: [],
      });
    }
  }

  return canonicals;
}
