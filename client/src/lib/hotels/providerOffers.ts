import type {
  HotelOffer,
  HotelOfferProvider,
  HotelResult,
  HotelSearchSource,
} from "@shared/hotels/types";

export const HOTEL_OFFER_PROVIDER_LABELS: Record<HotelSearchSource, string> = {
  agoda: "Agoda",
  hotellook: "Hotellook",
  booking: "Booking.com",
  trip: "Trip.com",
  expedia: "Expedia",
  klook: "Klook",
  metasearch: "GoTravelAsia",
  mock: "Mock Provider",
};

const HOTEL_OFFER_PROVIDERS = new Set<HotelOfferProvider>([
  "agoda",
  "hotellook",
  "booking",
  "trip",
  "expedia",
  "klook",
]);

export function isHotelOfferProvider(
  value: unknown,
): value is HotelOfferProvider {
  return (
    typeof value === "string" &&
    HOTEL_OFFER_PROVIDERS.has(value as HotelOfferProvider)
  );
}

function isValidOfferPrice(price: number | undefined): price is number {
  return Number.isFinite(price) && Number(price) > 0;
}

export function formatOfferPrice(
  price: number | undefined,
  currency?: string,
): string | null {
  if (!isValidOfferPrice(price)) {
    return null;
  }

  try {
    if (currency) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(price);
    }
  } catch {
    // fallback to numeric formatting below
  }

  try {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return String(Math.round(price));
  }
}

export function getValidProviderOffers(offers?: HotelOffer[]): HotelOffer[] {
  if (!Array.isArray(offers)) {
    return [];
  }

  const deduped = new Map<string, HotelOffer>();

  for (const offer of offers) {
    if (!isHotelOfferProvider(offer.provider) || !isValidOfferPrice(offer.price)) {
      continue;
    }

    const key = `${offer.provider}|${offer.hotelId}|${offer.price}`;
    if (!deduped.has(key)) {
      deduped.set(key, offer);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => a.price - b.price);
}

export function hasRenderableProviderOffers(offers?: HotelOffer[]): boolean {
  return getValidProviderOffers(offers).length > 0;
}

export function resolveOfferBaseUrl(
  offer: HotelOffer,
  hotel: HotelResult,
): string | undefined {
  const url =
    offer.deeplinkUrl ??
    offer.outboundLinks?.[offer.provider] ??
    hotel.outboundLinks?.[offer.provider];

  if (!url || !url.trim()) {
    return undefined;
  }

  return url;
}
