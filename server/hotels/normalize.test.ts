import { describe, expect, it } from "vitest";
import { normalizeHotel } from "./normalize.js";
import type { HotelSearchCity } from "../../shared/hotels/types.js";

const mockCity: HotelSearchCity = {
  slug: "test-city",
  name: "Test City",
  bookingName: "Test City",
  country: "Test Country",
  agodaCityId: 123,
  hasHotels: true,
};

const mockFallbackLinks = {
  agoda: "https://agoda.com/fallback",
};

describe("normalizeHotel", () => {
  describe("image normalization", () => {
    it("extracts images from various provider fields and removes duplicates/invalid URLs", () => {
      const rawHotel = {
        imageUrl: "http://example.com/img1.jpg", // upgrades to https
        imageURL: "https://example.com/img1.jpg", // duplicate, should be removed
        photoList: [
          "//cdn.example.com/img2.jpg", // protocol-relative upgrade
          { url: "https://example.com/img3.jpg" }, // nested
          { link: "https://example.com/img4.jpg" }, // alternative nested
          "invalid-url-format", // should be removed
          "https://", // malformed, should be removed
          "https://bad url", // malformed, should be removed
          "", // empty string removed
          null, // null removed
        ],
        hotelImages: [
          { url: "http://example.com/img5.jpg" } // upgrade to https
        ]
      };

      const result = normalizeHotel(
        rawHotel, mockCity, "2026-05-10", "2026-05-12", 2, 1, mockFallbackLinks, 0, 1
      );

      expect(result.images).toEqual([
        "https://example.com/img1.jpg",
        "https://cdn.example.com/img2.jpg",
        "https://example.com/img3.jpg",
        "https://example.com/img4.jpg",
        "https://example.com/img5.jpg"
      ]);
      expect(result.imageUrl).toBe("https://example.com/img1.jpg");
    });

    it("handles empty or missing image fields gracefully", () => {
      const result = normalizeHotel(
        {}, mockCity, "2026-05-10", "2026-05-12", 2, 1, mockFallbackLinks, 0, 1
      );
      expect(result.images).toEqual([]);
      expect(result.imageUrl).toBe("");
    });
  });

  describe("address normalization", () => {
    it("prefers exact address", () => {
      const rawHotel = {
        address: "123 Main St",
        areaName: "Downtown",
        cityName: "Other City"
      };
      const result = normalizeHotel(
        rawHotel, mockCity, "2026-05-10", "2026-05-12", 2, 1, mockFallbackLinks, 0, 1
      );
      expect(result.address).toBe("123 Main St");
    });

    it("falls back to area if exact address is missing", () => {
      const rawHotel = {
        location: { district: "Riverside" },
        cityName: "Other City"
      };
      const result = normalizeHotel(
        rawHotel, mockCity, "2026-05-10", "2026-05-12", 2, 1, mockFallbackLinks, 0, 1
      );
      expect(result.address).toBe("Near Riverside");
    });

    it("falls back to city if address and area are missing", () => {
      const rawHotel = {
        cityName: "Fallback City"
      };
      const result = normalizeHotel(
        rawHotel, mockCity, "2026-05-10", "2026-05-12", 2, 1, mockFallbackLinks, 0, 1
      );
      expect(result.address).toBe("Near Fallback City");
    });

    it("uses default city from parameters if provider city is missing", () => {
      const result = normalizeHotel(
        {}, mockCity, "2026-05-10", "2026-05-12", 2, 1, mockFallbackLinks, 0, 1
      );
      expect(result.address).toBe("Near Test City");
    });
  });
});
