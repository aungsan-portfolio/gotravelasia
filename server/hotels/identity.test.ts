import { describe, expect, it } from "vitest";

import type { ProviderHotel } from "../../shared/hotels/types.js";
import {
  computeHotelDistanceKm,
  computeHotelMatchScore,
  computeHotelNameSimilarity,
  mergeProviderHotels,
  normalizeHotelAddress,
  normalizeHotelName,
} from "./identity.js";

const createProviderHotel = (overrides: Partial<ProviderHotel>): ProviderHotel => {
  const provider = overrides.provider ?? "agoda";
  const providerHotelId = overrides.providerHotelId ?? "h1";

  return {
    provider,
    providerHotelId,
    name: "The Riverside Hotel",
    address: "123 Main St",
    city: "Bangkok",
    coordinates: { lat: 13.7563, lng: 100.5018 },
    amenities: ["Pool", "WiFi"],
    stars: 4,
    reviewScore: 8.4,
    imageUrl: "https://example.com/a.jpg",
    offer: {
      provider,
      providerHotelId,
      hotelId: providerHotelId,
      lowestRate: 100,
      currency: "USD",
      freeCancellation: true,
      breakfastIncluded: false,
      payLater: false,
    },
    ...overrides,
  };
};

describe("identity foundation", () => {
  it("normalizeHotelName", () => {
    expect(normalizeHotelName("The Grand Hôtel Resort & Spa")).toBe("grand spa");
  });

  it("empty/safe normalization", () => {
    expect(normalizeHotelName("")).toBe("");
    expect(normalizeHotelName(undefined)).toBe("");
    expect(normalizeHotelAddress(null)).toBe("");
  });

  it("name similarity", () => {
    expect(computeHotelNameSimilarity("Grand Palace Hotel", "Grand Palace")).toBe(1);
    expect(computeHotelNameSimilarity("Alpha", "Beta")).toBe(0);
  });

  it("missing coordinates", () => {
    expect(computeHotelDistanceKm(undefined, { lat: 1, lng: 2 })).toBeUndefined();
  });

  it("nearby coordinates", () => {
    const d = computeHotelDistanceKm(
      { lat: 13.7563, lng: 100.5018 },
      { lat: 13.7569, lng: 100.5021 },
    );
    expect(d).toBeDefined();
    expect(d as number).toBeLessThan(0.2);
  });

  it("same provider id match", () => {
    const a = createProviderHotel({ provider: "agoda", providerHotelId: "same" });
    const b = createProviderHotel({ provider: "booking", providerHotelId: "same" });
    const match = computeHotelMatchScore(a, b);
    expect(match.matched).toBe(true);
    expect(match.reason).toBe("same_provider_hotel_id");
  });

  it("similar name + same city + nearby coordinates match", () => {
    const a = createProviderHotel({ name: "Riverside Suites Bangkok" });
    const b = createProviderHotel({
      provider: "booking",
      providerHotelId: "b2",
      name: "Riverside Suite",
      coordinates: { lat: 13.7567, lng: 100.502 },
    });
    const match = computeHotelMatchScore(a, b);
    expect(match.matched).toBe(true);
    expect(match.reason).toBe("name_city_distance");
  });

  it("different hotels not matched", () => {
    const a = createProviderHotel({ name: "Sunrise Hotel", city: "Bangkok" });
    const b = createProviderHotel({
      provider: "trip",
      providerHotelId: "t2",
      name: "Mountain Lodge",
      city: "Chiang Mai",
      coordinates: { lat: 18.7883, lng: 98.9853 },
    });
    expect(computeHotelMatchScore(a, b).matched).toBe(false);
  });

  it("mergeProviderHotels merges same property", () => {
    const a = createProviderHotel({ provider: "agoda", providerHotelId: "a1" });
    const b = createProviderHotel({ provider: "booking", providerHotelId: "b1" });
    const merged = mergeProviderHotels([a, b]);
    expect(merged).toHaveLength(1);
    expect(merged[0].offers).toHaveLength(2);
  });

  it("mergeProviderHotels keeps different properties separate", () => {
    const a = createProviderHotel({ providerHotelId: "a1", name: "Alpha Hotel" });
    const b = createProviderHotel({
      provider: "booking",
      providerHotelId: "b1",
      name: "Beta Lodge",
      city: "Phuket",
      coordinates: { lat: 7.8804, lng: 98.3923 },
    });
    expect(mergeProviderHotels([a, b])).toHaveLength(2);
  });

  it("offer deduplication", () => {
    const a = createProviderHotel({ provider: "agoda", providerHotelId: "a1" });
    const b = createProviderHotel({ provider: "agoda", providerHotelId: "a1" });
    const merged = mergeProviderHotels([a, b]);
    expect(merged[0].offers).toHaveLength(1);
  });

  it("amenity deduplication", () => {
    const a = createProviderHotel({ amenities: ["Pool", "WiFi"] });
    const b = createProviderHotel({
      provider: "booking",
      providerHotelId: "b1",
      amenities: ["WiFi", "Gym"],
    });
    const merged = mergeProviderHotels([a, b]);
    expect(merged[0].amenities.sort()).toEqual(["Gym", "Pool", "WiFi"]);
  });
});
