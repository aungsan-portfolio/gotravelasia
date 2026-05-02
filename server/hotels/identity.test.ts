import { describe, expect, it } from "vitest";

import type { ProviderHotel } from "../../shared/hotels/types.js";
import {
  mergeProviderHotels,
  normalizeHotelAddress,
  normalizeHotelName,
} from "./identity.js";

const createProviderHotel = (overrides: Partial<ProviderHotel>): ProviderHotel => {
  const provider = "agoda";
  const city = overrides.city ?? "Bangkok";

  const result = {
    hotelId: "h1",
    name: "The Riverside Hotel",
    address: "123 Main St, Sukhumvit, Bangkok",
    amenities: ["Pool", "WiFi"],
    lowestRate: 100,
    currency: "USD",
    stars: 4,
    reviewScore: 8.4,
    reviewCount: 100,
    imageUrl: "https://example.com/a.jpg",
    ...overrides.result,
  };

  return {
    provider,
    city,
    result,
    offer: {
      provider,
      hotelId: result.hotelId,
      price: result.lowestRate,
      currency: result.currency,
      freeCancellation: true,
      payLater: false,
      breakfastIncluded: false,
    },
    ...overrides,
  };
};

describe("identity foundation (ID-based)", () => {
  it("normalizeHotelName", () => {
    expect(normalizeHotelName("The Grand Hôtel Resort & Spa")).toBe("the grand hotel resort spa");
  });

  it("normalizeHotelAddress", () => {
    expect(normalizeHotelAddress("123 Main St., Bangkok")).toBe("123 main street bangkok");
  });

  it("mergeProviderHotels merges same canonical ID", () => {
    const a = createProviderHotel({
      result: { hotelId: "a1", name: "Riverside Hotel", address: "123 Sukhumvit Road", lowestRate: 100 } as any
    });
    const b = createProviderHotel({
      provider: "booking" as any,
      result: { hotelId: "b1", name: "Riverside Hotel", address: "123 Sukhumvit Rd", lowestRate: 90 } as any
    });

    const merged = mergeProviderHotels([a, b]);
    expect(merged).toHaveLength(1);
    expect(merged[0].offers).toHaveLength(2);
    expect(merged[0].primaryHotel.result.hotelId).toBe("b1"); // Lower price wins primary
  });

  it("mergeProviderHotels keeps different addresses separate", () => {
    const a = createProviderHotel({
      result: { hotelId: "a1", name: "Alpha", address: "Road A", lowestRate: 100 } as any
    });
    const b = createProviderHotel({
      result: { hotelId: "b1", name: "Alpha", address: "Road B", lowestRate: 90 } as any
    });

    expect(mergeProviderHotels([a, b])).toHaveLength(2);
  });
});
