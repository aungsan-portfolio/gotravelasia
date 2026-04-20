import { describe, expect, it } from "vitest";

import type { HotelResult } from "@shared/hotels/types";
import { applyHotelFilters } from "./filterEngine";

function hotel(overrides: Partial<HotelResult>): HotelResult {
  return {
    hotelId: "h-1",
    name: "Base Hotel",
    stars: 3,
    reviewScore: 7.4,
    reviewCount: 100,
    address: "Address",
    imageUrl: "https://example.com/h.jpg",
    amenities: ["WiFi"],
    lowestRate: 110,
    currency: "USD",
    ...overrides,
  } as HotelResult;
}

const hotels = [
  hotel({
    hotelId: "budget-breakfast",
    lowestRate: 80,
    stars: 3,
    reviewScore: 8.6,
    amenities: ["Free Breakfast", "WiFi", "Pool"],
  }),
  hotel({
    hotelId: "luxury-spa",
    lowestRate: 260,
    stars: 5,
    reviewScore: 9.1,
    amenities: ["Spa", "Breakfast Included", "Airport Shuttle"],
  }),
  hotel({
    hotelId: "mid-basic",
    lowestRate: 150,
    stars: 4,
    reviewScore: 7.1,
    amenities: undefined as unknown as string[],
  }),
];

describe("applyHotelFilters", () => {
  it("supports quick filters", () => {
    const filtered = applyHotelFilters({ hotels, quickFilters: ["budget", "free_breakfast", "highly_rated"] } as any);
    expect(filtered.map((h) => h.hotelId)).toEqual(["budget-breakfast"]);
  });

  it("supports rich filters: price range, stars, min guest rating, amenities", () => {
    const filtered = applyHotelFilters({
      hotels,
      richFilters: {
        priceRange: { min: 200, max: 300 },
        starRatings: [5],
        minGuestRating: 9,
        amenities: ["spa", "airport shuttle"],
      },
    } as any);

    expect(filtered.map((h) => h.hotelId)).toEqual(["luxury-spa"]);
  });

  it("combines quick and rich filters", () => {
    const filtered = applyHotelFilters({
      hotels,
      quickFilters: ["highly_rated"],
      richFilters: { priceRange: { max: 100 }, amenities: ["wifi"] },
    } as any);

    expect(filtered.map((h) => h.hotelId)).toEqual(["budget-breakfast"]);
  });

  it("returns original list when filters are empty", () => {
    const filtered = applyHotelFilters({ hotels } as any);
    expect(filtered).toBe(hotels);
  });

  it("matches amenities case-insensitively", () => {
    const filtered = applyHotelFilters({
      hotels,
      richFilters: { amenities: ["BREAKFAST INCLUDED"] },
    } as any);

    expect(filtered.map((h) => h.hotelId)).toEqual(["luxury-spa"]);
  });

  it("does not crash when amenities are missing", () => {
    const filtered = applyHotelFilters({
      hotels,
      richFilters: { amenities: ["wifi"] },
    } as any);

    expect(filtered.map((h) => h.hotelId)).toEqual(["budget-breakfast"]);
  });
});
