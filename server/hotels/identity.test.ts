import { describe, expect, it } from "vitest";

import type { ProviderHotel } from "@shared/hotels/types";

import {
  computeHotelDistanceKm,
  computeHotelMatchScore,
  computeHotelNameSimilarity,
  createHotelOfferFromResult,
  mergeProviderHotels,
  normalizeHotelName,
} from "./identity";

describe("hotel identity utilities", () => {
  it("normalizeHotelName removes common hotel words safely", () => {
    expect(normalizeHotelName("The Bangkok Hotel Resort")).toBe("the bangkok");
  });

  it('normalizeHotelName("Hotel") does not return an empty string', () => {
    expect(normalizeHotelName("Hotel")).toBe("hotel");
  });

  it("exact normalized names get similarity 1", () => {
    expect(computeHotelNameSimilarity("The Bangkok Hotel", "the bangkok")).toBe(1);
  });

  it("similar typo names have high similarity", () => {
    expect(computeHotelNameSimilarity("Marriot Bangkok", "Marriott Bangkok")).toBeGreaterThan(0.9);
  });

  it("very different names have low similarity", () => {
    expect(computeHotelNameSimilarity("Marina Bay Sands", "Backpacker Hostel")).toBeLessThan(0.4);
  });

  it("missing coordinates return null distance", () => {
    expect(computeHotelDistanceKm(undefined, { lat: 13.75, lng: 100.5 })).toBeNull();
  });

  it("nearby coordinates produce small distance", () => {
    const distance = computeHotelDistanceKm(
      { lat: 13.7563, lng: 100.5018 },
      { lat: 13.7569, lng: 100.5024 },
    );
    expect(distance).not.toBeNull();
    expect(distance as number).toBeLessThan(0.2);
  });

  it("same provider + same providerHotelId matches with score 1", () => {
    const a: ProviderHotel = { provider: "agoda", providerHotelId: "123", name: "Test" };
    const b: ProviderHotel = { provider: "agoda", providerHotelId: "123", name: "Other" };
    const match = computeHotelMatchScore(a, b);
    expect(match.matched).toBe(true);
    expect(match.score).toBe(1);
    expect(match.reasons).toContain("same_provider_id");
  });

  it("same/similar name + same city + nearby coordinates matches", () => {
    const a: ProviderHotel = {
      provider: "agoda",
      providerHotelId: "a1",
      name: "The Riverside Bangkok Hotel",
      city: "Bangkok",
      coordinates: { lat: 13.7563, lng: 100.5018 },
    };
    const b: ProviderHotel = {
      provider: "booking",
      providerHotelId: "b1",
      name: "Riverside Bangkok",
      cityName: "Bangkok",
      coordinates: { lat: 13.7568, lng: 100.5021 },
    };
    const match = computeHotelMatchScore(a, b);
    expect(match.matched).toBe(true);
    expect(match.score).toBeGreaterThanOrEqual(0.82);
  });

  it("different name + different city does not match", () => {
    const a: ProviderHotel = { provider: "agoda", providerHotelId: "a1", name: "Hilton", city: "Bangkok" };
    const b: ProviderHotel = { provider: "booking", providerHotelId: "b1", name: "Capsule Inn", city: "Tokyo" };
    const match = computeHotelMatchScore(a, b);
    expect(match.matched).toBe(false);
  });

  it("empty providerHotels returns []", () => {
    expect(mergeProviderHotels([])).toEqual([]);
  });

  it("mergeProviderHotels merges two provider hotels that represent the same property", () => {
    const merged = mergeProviderHotels([
      {
        provider: "agoda",
        providerHotelId: "a1",
        name: "The Riverside Bangkok Hotel",
        city: "Bangkok",
        coordinates: { lat: 13.7563, lng: 100.5018 },
        amenities: ["pool", "wifi"],
        offer: { offerId: "agoda:a1", provider: "agoda", providerHotelId: "a1", price: 100 },
      },
      {
        provider: "booking",
        providerHotelId: "b1",
        name: "Riverside Bangkok",
        cityName: "Bangkok",
        coordinates: { lat: 13.7564, lng: 100.5019 },
        amenities: ["wifi", "gym"],
        offer: { offerId: "booking:b1", provider: "booking", providerHotelId: "b1", price: 105 },
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].offers).toHaveLength(2);
    expect(merged[0].sourceHotels).toHaveLength(2);
  });

  it("mergeProviderHotels keeps different properties separate", () => {
    const merged = mergeProviderHotels([
      { provider: "agoda", providerHotelId: "a1", name: "Hotel Alpha", city: "Bangkok" },
      { provider: "booking", providerHotelId: "b1", name: "Hotel Beta", city: "Tokyo" },
    ]);
    expect(merged).toHaveLength(2);
  });

  it("offers are deduped by offerId", () => {
    const merged = mergeProviderHotels([
      {
        provider: "agoda",
        providerHotelId: "a1",
        name: "Riverside Bangkok",
        city: "Bangkok",
        offer: { offerId: "agoda:a1", provider: "agoda", providerHotelId: "a1", price: 100 },
      },
      {
        provider: "agoda",
        providerHotelId: "a1",
        name: "Riverside Bangkok",
        city: "Bangkok",
        offer: { offerId: "agoda:a1", provider: "agoda", providerHotelId: "a1", price: 100 },
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].offers).toHaveLength(1);
  });

  it("amenities are deduped", () => {
    const merged = mergeProviderHotels([
      { provider: "agoda", providerHotelId: "a1", name: "Riverside", amenities: ["wifi", "pool"] },
      { provider: "agoda", providerHotelId: "a1", name: "Riverside", amenities: ["pool", "gym"] },
    ]);
    expect(merged[0].amenities.sort()).toEqual(["gym", "pool", "wifi"]);
  });

  it("createHotelOfferFromResult handles invalid prices safely", () => {
    const offer = createHotelOfferFromResult(
      {
        hotelId: "h1",
        name: "Test",
        stars: 4,
        reviewScore: 8,
        reviewCount: 100,
        address: "Addr",
        imageUrl: "img",
        amenities: [],
        lowestRate: Number.NaN,
      },
      "agoda",
    );
    expect(offer.price).toBe(0);
    expect(typeof offer.updatedAt).toBe("string");
  });
});
