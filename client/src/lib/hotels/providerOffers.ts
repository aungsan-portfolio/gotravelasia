import type { HotelOffer, HotelSearchSource, HotelResult, HotelOutboundLinks } from "@shared/hotels/types";

export const ALLOWED_PROVIDERS: Set<HotelSearchSource> = new Set([
  "agoda",
  "booking",
  "trip",
  "expedia",
  "klook",
]);

export const HOTEL_OFFER_PROVIDER_LABELS: Record<string, string> = {
  agoda: "Agoda",
  booking: "Booking.com",
  trip: "Trip.com",
  expedia: "Expedia",
  klook: "Klook",
};

/** @deprecated Use HOTEL_OFFER_PROVIDER_LABELS */
export const PROVIDER_LABELS = HOTEL_OFFER_PROVIDER_LABELS;

export function formatOfferPrice(price: number | undefined, currency?: string): string | null {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) return null;
  const symbol = currency === "THB" ? "฿" : "$";
  return `${symbol}${price.toLocaleString()}`;
}

export function resolveOfferBaseUrl(offer: HotelOffer, hotel: HotelResult): string | undefined {
  return offer.deeplinkUrl || hotel.outboundLinks?.[offer.provider as keyof HotelOutboundLinks];
}

export function getValidProviderOffers(offers: HotelOffer[] | undefined): HotelOffer[] {
  if (!offers) return [];

  const valid = offers.filter(
    (offer) =>
      ALLOWED_PROVIDERS.has(offer.provider) &&
      typeof offer.price === "number" &&
      Number.isFinite(offer.price) &&
      offer.price > 0,
  );

  // Deduplicate by provider + hotelId (if present) + price
  const seen = new Map<string, HotelOffer>();
  valid.forEach((offer) => {
    const key = `${offer.provider}-${offer.hotelId || ""}-${offer.price}`;
    if (!seen.has(key)) {
      seen.set(key, offer);
    }
  });

  return Array.from(seen.values()).sort((a, b) => a.price - b.price);
}

export function hasRenderableProviderOffers(offers: HotelOffer[] | undefined): boolean {
  return getValidProviderOffers(offers).length > 0;
}
