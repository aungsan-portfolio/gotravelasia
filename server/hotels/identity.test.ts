import { describe, expect, it } from "vitest";
import type { ProviderHotel } from "../../shared/hotels/types.js";
import {
  computeHotelDistanceKm,
  computeHotelMatchScore,
  computeHotelNameSimilarity,
  mergeProviderHotels,
  normalizeHotelName,
} from "./identity.js";

function makeProviderHotel(overrides: Partial<ProviderHotel>): ProviderHotel {
  const base: ProviderHotel = {
    provider: "agoda",
    providerHotelId: "h-1",
    name: "The Grand Hotel Bangkok",
    cityName: "Bangkok",
    address: "123 Sukhumvit Road",
    amenities: ["wifi", "pool"],
    coordinates: { lat: 13.7563, lng: 100.5018 },
  };
  const merged = { ...base, ...overrides };

  if (!merged.offer) {
    merged.offer = {
      offerId: `${merged.provider}:${merged.providerHotelId}`,
      provider: merged.provider,
      providerHotelId: merged.providerHotelId,
      price: 100,
    };
  }

  return merged;
}

describe("normalizeHotelName", () => {
  it("removes common hotel words safely", () => {
    expect(normalizeHotelName("The Grand Hotel Resort")).toBe("the grand");
    expect(normalizeHotelName("Hotel")).toBe("hotel");
  });
});

describe("computeHotelNameSimilarity", () => {
  it("returns 1 for exact normalized names", () => {
    expect(computeHotelNameSimilarity("Grand Hotel", "grand")).toBe(1);
  });

  it("returns high similarity for close typo names", () => {
    expect(computeHotelNameSimilarity("Marina Bay Sands", "Marina Bay Sandz")).toBeGreaterThan(0.85);
  });

  it("returns low similarity for very different names", () => {
    expect(computeHotelNameSimilarity("Ocean View", "Mountain Cabin Retreat")).toBeLessThan(0.4);
  });
});

describe("computeHotelDistanceKm", () => {
  it("returns a small distance for nearby coordinates", () => {
    const distance = computeHotelDistanceKm(
      { lat: 13.7563, lng: 100.5018 },
      { lat: 13.757, lng: 100.5023 }
    );
    expect(distance).not.toBeNull();
    expect(distance!).toBeLessThan(0.2);
  });
});

describe("computeHotelMatchScore", () => {
  it("matches same provider and providerHotelId with score 1", () => {
    const a = makeProviderHotel({ provider: "booking", providerHotelId: "42" });
    const b = makeProviderHotel({ provider: "booking", providerHotelId: "42" });
    const result = computeHotelMatchScore(a, b);
    expect(result.score).toBe(1);
    expect(result.matched).toBe(true);
  });

  it("matches similar name + same city + nearby coordinates", () => {
    const a = makeProviderHotel({
      provider: "agoda",
      providerHotelId: "a1",
      name: "Marina Bay Sands Hotel",
      cityName: "Singapore",
      coordinates: { lat: 1.2834, lng: 103.8607 },
    });
    const b = makeProviderHotel({
      provider: "booking",
      providerHotelId: "b1",
      name: "Marina Bay Sandz",
      cityName: "Singapore",
      coordinates: { lat: 1.2835, lng: 103.8609 },
    });

    const result = computeHotelMatchScore(a, b);
    expect(result.matched).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.82);
  });

  it("does not match different name and different city", () => {
    const a = makeProviderHotel({ name: "Bangkok Riverside Hotel", cityName: "Bangkok" });
    const b = makeProviderHotel({
      provider: "trip",
      providerHotelId: "t2",
      name: "Phuket Beach Villa",
      cityName: "Phuket",
      coordinates: { lat: 7.8804, lng: 98.3923 },
    });

    const result = computeHotelMatchScore(a, b);
    expect(result.matched).toBe(false);
    expect(result.score).toBeLessThan(0.82);
  });
});

describe("mergeProviderHotels", () => {
  it("merges two provider hotels for the same property", () => {
    const merged = mergeProviderHotels([
      makeProviderHotel({ provider: "agoda", providerHotelId: "a1", name: "Marina Bay Sands" }),
      makeProviderHotel({ provider: "booking", providerHotelId: "b1", name: "Marina Bay Sands Hotel" }),
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].offers).toHaveLength(2);
  });

  it("keeps different properties separate", () => {
    const merged = mergeProviderHotels([
      makeProviderHotel({ provider: "agoda", providerHotelId: "a1", name: "Hotel Alpha", cityName: "Bangkok" }),
      makeProviderHotel({ provider: "booking", providerHotelId: "b2", name: "Resort Zeta", cityName: "Phuket" }),
    ]);

    expect(merged).toHaveLength(2);
  });

  it("dedupes offers by offerId and dedupes amenities", () => {
    const first = makeProviderHotel({
      provider: "agoda",
      providerHotelId: "a1",
      amenities: ["wifi", "pool"],
      offer: {
        offerId: "agoda:a1",
        provider: "agoda",
        providerHotelId: "a1",
        price: 100,
      },
    });

    const second = makeProviderHotel({
      provider: "agoda",
      providerHotelId: "a1",
      amenities: ["wifi", "gym"],
      offer: {
        offerId: "agoda:a1",
        provider: "agoda",
        providerHotelId: "a1",
        price: 120,
      },
    });

    const merged = mergeProviderHotels([first, second]);

    expect(merged).toHaveLength(1);
    expect(merged[0].offers).toHaveLength(1);
    expect(merged[0].amenities.sort()).toEqual(["gym", "pool", "wifi"]);
  });
});
