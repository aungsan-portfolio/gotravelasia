import { describe, expect, it } from "vitest";
import {
  formatOfferPrice,
  getValidProviderOffers,
  hasRenderableProviderOffers,
  resolveOfferBaseUrl,
} from "./providerOffers";
import type { HotelOffer, HotelResult } from "@shared/hotels/types";

const hotel = {
  hotelId: "hotel-1",
  name: "Test Hotel",
  stars: 4,
  reviewScore: 8.5,
  reviewCount: 100,
  address: "Address",
  imageUrl: "https://example.com/image.jpg",
  amenities: [],
  lowestRate: 100,
  outboundLinks: { booking: "https://booking.example/hotel-1" },
} satisfies HotelResult;

describe("providerOffers", () => {
  it("undefined offers returns []", () => {
    expect(getValidProviderOffers(undefined)).toEqual([]);
  });

  it("empty offers returns []", () => {
    expect(getValidProviderOffers([])).toEqual([]);
  });

  it("invalid price is ignored", () => {
    const offers: HotelOffer[] = [
      { provider: "agoda", hotelId: "h1", price: 0 },
      { provider: "booking", hotelId: "h1", price: Number.NaN },
    ] as any[];
    expect(getValidProviderOffers(offers)).toEqual([]);
  });

  it("unknown provider is ignored", () => {
    const offers = [
      { provider: "unknown", hotelId: "h1", price: 100 },
      { provider: "booking", hotelId: "h1", price: 120 },
    ] as HotelOffer[];

    expect(getValidProviderOffers(offers)).toHaveLength(1);
    expect(getValidProviderOffers(offers)[0]?.provider).toBe("booking");
  });

  it("valid offers are sorted by price ascending", () => {
    const offers: HotelOffer[] = [
      { provider: "agoda", hotelId: "h1", price: 300 },
      { provider: "booking", hotelId: "h1", price: 200 },
    ] as any[];

    expect(getValidProviderOffers(offers).map((o) => o.price)).toEqual([200, 300]);
  });

  it("duplicate offers are deduped", () => {
    const offers: HotelOffer[] = [
      { provider: "agoda", hotelId: "h1", price: 200 },
      { provider: "agoda", hotelId: "h1", price: 200 },
      { provider: "agoda", hotelId: "h1", price: 220 },
    ] as any[];

    expect(getValidProviderOffers(offers)).toHaveLength(2);
  });

  it("hasRenderableProviderOffers returns false for invalid data", () => {
    expect(hasRenderableProviderOffers([{ provider: "agoda", hotelId: "h1", price: 0 }] as any)).toBe(false);
  });

  it("hasRenderableProviderOffers returns true for valid data", () => {
    expect(hasRenderableProviderOffers([{ provider: "agoda", hotelId: "h1", price: 150 }] as any)).toBe(true);
  });

  it("formatOfferPrice returns null for invalid price", () => {
    expect(formatOfferPrice(undefined, "USD")).toBeNull();
    expect(formatOfferPrice(0, "USD")).toBeNull();
  });

  it("formatOfferPrice does not throw for invalid currency", () => {
    expect(() => formatOfferPrice(123, "INVALID")).not.toThrow();
    expect(formatOfferPrice(123, "INVALID")).toBeTruthy();
  });

  it("resolveOfferBaseUrl prefers deeplinkUrl", () => {
    const offer: HotelOffer = {
      provider: "booking",
      hotelId: "h1",
      price: 100,
      deeplinkUrl: "https://deeplink.example/h1",
      outboundLinks: { booking: "https://offer-link.example/h1" },
    } as any;

    expect(resolveOfferBaseUrl(offer, hotel)).toBe("https://deeplink.example/h1");
  });

  it("resolveOfferBaseUrl falls back to hotel.outboundLinks provider URL", () => {
    const offer: HotelOffer = {
      provider: "booking",
      hotelId: "h1",
      price: 100,
    } as any;

    expect(resolveOfferBaseUrl(offer, hotel)).toBe("https://booking.example/hotel-1");
  });
});
