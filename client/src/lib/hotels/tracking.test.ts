import { beforeEach, describe, expect, it, vi } from "vitest";

const { captureMock } = vi.hoisted(() => ({
  captureMock: vi.fn(),
}));

vi.mock("posthog-js", () => ({
  default: {
    __loaded: true,
    capture: captureMock,
  },
}));

import {
  buildHotelTrackingPayload,
  trackHotelOfferClick,
  trackHotelOfferImpression,
} from "./tracking";

describe("buildHotelTrackingPayload", () => {
  it("includes valid offer fields and keeps existing fields", () => {
    expect(
      buildHotelTrackingPayload({
        hotelId: "hotel-1",
        city: "Bangkok",
        provider: "booking",
        resultPosition: 3,
        price: 120.5,
        currency: " USD ",
        offerRank: 1,
        freeCancellation: true,
        payLater: false,
        breakfastIncluded: true,
      }),
    ).toEqual({
      hotelId: "hotel-1",
      city: "Bangkok",
      provider: "booking",
      resultPosition: 3,
      price: 120.5,
      currency: "USD",
      offerRank: 1,
      freeCancellation: true,
      payLater: false,
      breakfastIncluded: true,
    });
  });

  it("excludes invalid offer fields and undefined values", () => {
    const payload = buildHotelTrackingPayload({
      hotelId: "hotel-2",
      city: "Singapore",
      provider: "agoda",
      resultPosition: 1,
      price: Number.NaN,
      currency: "   ",
      offerRank: Number.POSITIVE_INFINITY,
      freeCancellation: undefined,
      payLater: undefined,
      breakfastIncluded: undefined,
    });

    expect(payload).toEqual({
      hotelId: "hotel-2",
      city: "Singapore",
      provider: "agoda",
      resultPosition: 1,
    });
    expect(payload).not.toHaveProperty("price");
    expect(payload).not.toHaveProperty("currency");
    expect(payload).not.toHaveProperty("offerRank");
    expect(payload).not.toHaveProperty("freeCancellation");
    expect(payload).not.toHaveProperty("payLater");
    expect(payload).not.toHaveProperty("breakfastIncluded");
  });

  it("excludes Infinity for price and NaN for offerRank", () => {
    const payload = buildHotelTrackingPayload({
      price: Number.POSITIVE_INFINITY,
      offerRank: Number.NaN,
    });

    expect(payload).toEqual({});
  });
});

describe("offer tracking exports", () => {
  beforeEach(() => {
    captureMock.mockClear();
    vi.stubGlobal("window", {});
  });

  it("exports trackHotelOfferImpression and sends expected event", () => {
    expect(trackHotelOfferImpression).toBeTypeOf("function");
    trackHotelOfferImpression({ hotelId: "h-1" });
    expect(captureMock).toHaveBeenCalledWith("hotel_offer_impression", { hotelId: "h-1" });
  });

  it("exports trackHotelOfferClick and sends expected event", () => {
    expect(trackHotelOfferClick).toBeTypeOf("function");
    trackHotelOfferClick({ hotelId: "h-2" });
    expect(captureMock).toHaveBeenCalledWith("hotel_offer_click", { hotelId: "h-2" });
  });
});
