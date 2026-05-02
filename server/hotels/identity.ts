import type {
  CanonicalHotel,
  HotelCoordinates,
  HotelIdentityMatch,
  HotelOffer,
  HotelOfferProvider,
  HotelResult,
  ProviderHotel,
} from "../../shared/hotels/types.js";

export function normalizeHotelName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeHotelAddress(address: string): string {
  let normalized = address
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Handle common abbreviations
  const mappings: Record<string, string> = {
    "rd": "road",
    "st": "street",
    "ave": "avenue",
    "blvd": "boulevard",
    "dr": "drive",
  };

  return normalized.split(" ").map(word => mappings[word] || word).join(" ");
}

function tokenSet(text: string): Set<string> {
  return new Set(text.split(" ").filter(Boolean));
}

export function computeHotelNameSimilarity(left: string, right: string): number {
  const a = tokenSet(normalizeHotelName(left));
  const b = tokenSet(normalizeHotelName(right));
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export function computeHotelDistanceKm(
  a?: { lat: number; lng: number },
  b?: { lat: number; lng: number },
): number | undefined {
  if (!a || !b) return undefined;

  const toRad = (n: number) => (n * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(x));
}

export function computeHotelMatchScore(input: {
  nameSimilarity: number;
  distanceKm?: number;
}): number {
  const nameWeight = 0.85;
  const distanceWeight = 0.15;
  const distanceScore =
    typeof input.distanceKm === "number"
      ? Math.max(0, Math.min(1, 1 - input.distanceKm / 3))
      : 0.5;

  return input.nameSimilarity * nameWeight + distanceScore * distanceWeight;
}

export function createHotelOfferFromResult(
  provider: HotelOfferProvider,
  result: HotelResult,
): HotelOffer {
  return {
    provider,
    hotelId: result.hotelId,
    price: result.lowestRate,
    currency: result.currency,
    outboundLinks: result.outboundLinks,
    freeCancellation: result.freeCancellation,
    payLater: result.payLater,
    breakfastIncluded: result.breakfastIncluded,
  };
}

export function createProviderHotelFromResult(
  provider: HotelOfferProvider,
  city: string,
  result: HotelResult,
): ProviderHotel {
  return {
    provider,
    city,
    result,
    offer: createHotelOfferFromResult(provider, result),
  };
}

function buildCanonicalId(city: string, hotel: HotelResult): string {
  const name = normalizeHotelName(hotel.name).replace(/\s+/g, "-");
  const address = normalizeHotelAddress(hotel.address ?? "").split(" ").slice(0, 6).join("-");
  return `${city.toLowerCase()}::${name}::${address}`;
}

export function mergeProviderHotels(providerHotels: ProviderHotel[]): CanonicalHotel[] {
  const canonicalMap = new Map<string, CanonicalHotel>();

  for (const providerHotel of providerHotels) {
    const key = buildCanonicalId(providerHotel.city, providerHotel.result);
    const found = canonicalMap.get(key);
    if (!found) {
      canonicalMap.set(key, {
        canonicalId: key,
        city: providerHotel.city,
        name: providerHotel.result.name,
        address: providerHotel.result.address,
        coordinates: providerHotel.result.coordinates,
        primaryHotel: providerHotel,
        offers: [providerHotel.offer],
        providers: [providerHotel],
      });
      continue;
    }

    found.offers.push(providerHotel.offer);
    found.providers.push(providerHotel);

    const currentPrice = found.primaryHotel.result.lowestRate;
    if (providerHotel.result.lowestRate < currentPrice) {
      found.primaryHotel = providerHotel;
      found.name = providerHotel.result.name;
      found.address = providerHotel.result.address;
      found.coordinates = providerHotel.result.coordinates;
    }
  }

  return Array.from(canonicalMap.values());
}
