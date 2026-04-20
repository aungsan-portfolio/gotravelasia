import { describe, expect, it } from "vitest";

import type { HotelResult } from "@shared/hotels/types";
import { clusterMarkers, deriveBoundsFromHotels, generateMapMarkers } from "./markers";

function hotel(overrides: Partial<HotelResult>): HotelResult {
  return {
    hotelId: "h-1",
    name: "Hotel",
    stars: 4,
    reviewScore: 8.3,
    reviewCount: 300,
    address: "Address",
    imageUrl: "https://example.com/a.jpg",
    amenities: ["Pool"],
    lowestRate: 120,
    currency: "USD",
    coordinates: { lat: 13.7563, lng: 100.5018 },
    ...overrides,
  } as HotelResult;
}

describe("hotel map markers", () => {
  it("generates markers from normalized hotel fields", () => {
    const markers = generateMapMarkers([
      hotel({ hotelId: "h-1", lowestRate: 99, currency: "USD" }),
    ], { selectedHotelId: null, hoveredHotelId: null });

    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      hotelId: "h-1",
      position: { lat: 13.7563, lng: 100.5018 },
      price: 99,
      currency: "USD",
      isSelected: false,
      isHovered: false,
      zIndex: 1000,
    });
  });

  it("applies selected styling and highest z-index", () => {
    const markers = generateMapMarkers([
      hotel({ hotelId: "selected" }),
      hotel({ hotelId: "other", coordinates: { lat: 13.75, lng: 100.49 } }),
    ], { selectedHotelId: "selected", hoveredHotelId: "other" });

    const selected = markers.find((m) => m.hotelId === "selected");
    const hovered = markers.find((m) => m.hotelId === "other");

    expect(selected?.style.variant).toBe("selected");
    expect(selected?.zIndex).toBe(3000);
    expect(hovered?.zIndex).toBe(2000);
  });

  it("applies hovered styling", () => {
    const markers = generateMapMarkers([
      hotel({ hotelId: "hovered" }),
    ], { selectedHotelId: null, hoveredHotelId: "hovered" });

    expect(markers[0].style.variant).toBe("hovered");
    expect(markers[0].isHovered).toBe(true);
  });

  it("skips hotels with invalid or missing coordinates", () => {
    const markers = generateMapMarkers([
      hotel({ hotelId: "valid" }),
      hotel({ hotelId: "missing", coordinates: undefined }),
      hotel({ hotelId: "invalid", coordinates: { lat: Number.NaN, lng: 100.1 } }),
    ], { selectedHotelId: null, hoveredHotelId: null });

    expect(markers.map((m) => m.hotelId)).toEqual(["valid"]);
  });

  it("returns null bounds when no valid coordinates exist", () => {
    const bounds = deriveBoundsFromHotels([
      hotel({ hotelId: "x", coordinates: undefined }),
      hotel({ hotelId: "y", coordinates: { lat: Number.NaN, lng: 20 } }),
    ]);

    expect(bounds).toBeNull();
  });

  it("clusters nearby markers at low zoom and returns singles at high zoom", () => {
    const markers = generateMapMarkers([
      hotel({ hotelId: "a", coordinates: { lat: 13.75, lng: 100.50 }, lowestRate: 90 }),
      hotel({ hotelId: "b", coordinates: { lat: 13.751, lng: 100.501 }, lowestRate: 130 }),
    ], { selectedHotelId: null, hoveredHotelId: null });

    const clustered = clusterMarkers(markers, 10, 0.05);
    expect(clustered).toHaveLength(1);
    expect(clustered[0]).toMatchObject({ type: "cluster", count: 2, minPrice: 90, maxPrice: 130 });

    const unclustered = clusterMarkers(markers, 13, 0.05);
    expect(unclustered.every((item) => item.type === "single")).toBe(true);
  });
});
