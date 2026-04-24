import { describe, expect, it } from "vitest";

import {
  buildCanonicalHotelPath,
  canonicalSortToInternalSort,
  internalSortToCanonicalSort,
  parseCanonicalHotelPath,
  toInternalHotelParamsFromCanonical,
} from "./canonicalPattern";

describe("canonicalPattern", () => {
  it("parses a canonical map URL", () => {
    const parsed = parseCanonicalHotelPath(
      "/hotels/bangkok-pid123/2026-07-10/2026-07-14/2adults;map?sort=price_d&ucs=abc",
    );

    expect(parsed).toEqual({
      destinationLabel: "bangkok",
      placeId: "123",
      checkIn: "2026-07-10",
      checkOut: "2026-07-14",
      adults: 2,
      rooms: 1,
      view: "map",
      rawSort: "price_d",
      extraQuery: { ucs: "abc" },
    });
  });

  it("parses a canonical list full URL", () => {
    const parsed = parseCanonicalHotelPath(
      "https://www.example.com/hotels/ho-chi-minh-city-pid987/2026-08-01/2026-08-05/1adults;list?sort=rank_a",
    );

    expect(parsed?.destinationLabel).toBe("ho chi minh city");
    expect(parsed?.placeId).toBe("987");
    expect(parsed?.view).toBe("list");
    expect(parsed?.rawSort).toBe("rank_a");
  });

  it("maps sort tokens in both directions", () => {
    expect(canonicalSortToInternalSort("rank_a")).toBe("rank");
    expect(canonicalSortToInternalSort("price_a")).toBe("price_asc");
    expect(canonicalSortToInternalSort("price_d")).toBe("price_desc");
    expect(canonicalSortToInternalSort("star_d")).toBe("stars_desc");
    expect(canonicalSortToInternalSort("review_a")).toBe("review_desc");
    expect(canonicalSortToInternalSort("unknown")).toBe("best");

    expect(internalSortToCanonicalSort("rank")).toBe("rank_a");
    expect(internalSortToCanonicalSort("price_asc")).toBe("price_a");
    expect(internalSortToCanonicalSort("price_desc")).toBe("price_d");
    expect(internalSortToCanonicalSort("stars_desc")).toBe("star_d");
    expect(internalSortToCanonicalSort("review_desc")).toBe("review_a");
  });

  it("converts parsed data into internal params", () => {
    const converted = toInternalHotelParamsFromCanonical(
      "/hotels/singapore-pid88/2026-09-10/2026-09-12/2adults;map?sort=price_a&ucs=xyz",
      (label, placeId) => (label === "singapore" && placeId === "88" ? "singapore" : undefined),
    );

    expect(converted.params).toEqual({
      city: "singapore",
      checkIn: "2026-09-10",
      checkOut: "2026-09-12",
      adults: 2,
      rooms: 1,
      page: 1,
      sort: "price_asc",
    });
    expect(converted.meta).toEqual({
      destinationLabel: "singapore",
      placeId: "88",
      view: "map",
      rawSort: "price_a",
      extraQuery: { ucs: "xyz" },
    });
  });

  it("builds a canonical URL", () => {
    const built = buildCanonicalHotelPath({
      destinationLabel: "Ho Chi Minh City",
      placeId: "987",
      checkIn: "2026-08-01",
      checkOut: "2026-08-05",
      adults: 2,
      view: "list",
      sort: "stars_desc",
      extraQuery: { ucs: "hello", page: 3 },
    });

    expect(built).toBe(
      "/hotels/ho-chi-minh-city-pid987/2026-08-01/2026-08-05/2adults;list?sort=star_d&ucs=hello&page=3",
    );
  });

  it("round trips build -> parse sanely", () => {
    const built = buildCanonicalHotelPath({
      destinationLabel: "Bangkok",
      placeId: "123",
      checkIn: "2026-07-10",
      checkOut: "2026-07-14",
      adults: 2,
      view: "map",
      sort: "price_desc",
      extraQuery: { ucs: "abc" },
    });

    const parsed = parseCanonicalHotelPath(built);
    expect(parsed).toMatchObject({
      destinationLabel: "bangkok",
      placeId: "123",
      checkIn: "2026-07-10",
      checkOut: "2026-07-14",
      adults: 2,
      rooms: 1,
      view: "map",
      rawSort: "price_d",
      extraQuery: { ucs: "abc" },
    });
  });

  it("handles invalid input safely", () => {
    expect(parseCanonicalHotelPath("not-a-real-route")).toBeNull();

    const converted = toInternalHotelParamsFromCanonical("/bad-route", () => "bangkok");
    expect(converted).toEqual({ params: null, meta: null });
  });

  it("preserves extra query params", () => {
    const parsed = parseCanonicalHotelPath(
      "/hotels/seoul-pid55/2026-10-01/2026-10-03/2adults;map?sort=rank_a&ucs=keepme&ref=partner",
    );

    expect(parsed?.extraQuery).toEqual({
      ucs: "keepme",
      ref: "partner",
    });
  });
});
