import { describe, expect, it } from "vitest";

import { resolveHotelRouteState } from "../pages/hotels/useHotelRouteState";

describe("resolveHotelRouteState", () => {
  it("parses canonical route and hydrates core state", () => {
    const state = resolveHotelRouteState(
      "/hotels/bangkok-pid106261/2026-07-10/2026-07-14/3adults;map",
      "?sort=price_desc&page=2&utm=campaign",
    );

    expect(state.routeMode).toBe("canonical");
    expect(state.query).toMatchObject({
      city: "bangkok",
      checkIn: "2026-07-10",
      checkOut: "2026-07-14",
      adults: 3,
      sort: "price_desc",
      page: 2,
    });
    expect(state.routeMeta).toMatchObject({
      destinationLabel: "bangkok",
      placeId: "106261",
      view: "map",
      extraQuery: { utm: "campaign" },
    });
  });

  it("parses legacy query route when canonical path is absent", () => {
    const state = resolveHotelRouteState(
      "/hotels",
      "?city=singapore&checkIn=2026-06-01&checkOut=2026-06-04&adults=2&rooms=1&page=3&sort=stars_desc",
    );

    expect(state.routeMode).toBe("legacy");
    expect(state.query).toMatchObject({
      city: "singapore",
      checkIn: "2026-06-01",
      checkOut: "2026-06-04",
      adults: 2,
      rooms: 1,
      page: 3,
      sort: "stars_desc",
    });
    expect(state.routeMeta).toBeNull();
  });

  it("prefers canonical route data over conflicting legacy query", () => {
    const state = resolveHotelRouteState(
      "/hotels/bangkok-pid106261/2026-08-10/2026-08-12/2adults;list",
      "?city=manila&checkIn=2027-01-01&checkOut=2027-01-10&adults=5&sort=rank",
    );

    expect(state.routeMode).toBe("canonical");
    expect(state.query.city).toBe("bangkok");
    expect(state.query.checkIn).toBe("2026-08-10");
    expect(state.query.checkOut).toBe("2026-08-12");
    expect(state.query.adults).toBe(2);
  });

  it("falls back safely when canonical path is malformed", () => {
    const state = resolveHotelRouteState(
      "/hotels/bangkok-pid106261/not-a-date/2026-08-12/2adults;map",
      "?city=kuala-lumpur&checkIn=2026-10-01&checkOut=2026-10-04&adults=2",
    );

    expect(state.routeMode).toBe("legacy");
    expect(state.query.city).toBe("kuala-lumpur");
    expect(state.query.checkIn).toBe("2026-10-01");
    expect(state.query.checkOut).toBe("2026-10-04");
  });

  it("keeps defaults safe for empty legacy links", () => {
    const state = resolveHotelRouteState("/hotels", "");

    expect(state.routeMode).toBe("legacy");
    expect(state.query.city).toBeTruthy();
    expect(state.query.adults).toBeGreaterThanOrEqual(1);
    expect(state.query.rooms).toBeGreaterThanOrEqual(1);
    expect(state.query.page).toBeGreaterThanOrEqual(1);
  });
});
