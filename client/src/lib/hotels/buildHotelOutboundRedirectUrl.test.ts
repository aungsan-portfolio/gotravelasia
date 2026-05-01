import { describe, expect, it } from "vitest";

import { buildHotelOutboundRedirectUrl } from "./buildHotelOutboundRedirectUrl";

describe("buildHotelOutboundRedirectUrl", () => {
  it("returns undefined when targetUrl is missing", () => {
    expect(buildHotelOutboundRedirectUrl({ provider: "agoda" })).toBeUndefined();
  });

  it("builds /hotels/out/agoda with encoded target URL", () => {
    const result = buildHotelOutboundRedirectUrl({
      provider: "agoda",
      targetUrl: "https://www.agoda.com/hotel?x=1",
    });

    expect(result).toBe(
      "/hotels/out/agoda?url=https%3A%2F%2Fwww.agoda.com%2Fhotel%3Fx%3D1",
    );
  });

  it("includes optional params when provided", () => {
    const result = buildHotelOutboundRedirectUrl({
      provider: "agoda",
      targetUrl: "https://www.agoda.com/hotel",
      hotelId: "123",
      city: "bangkok",
      checkIn: "2026-05-02",
      checkOut: "2026-05-05",
      resultPosition: 1,
      sort: "best",
    });

    expect(result).toBe(
      "/hotels/out/agoda?url=https%3A%2F%2Fwww.agoda.com%2Fhotel&hotelId=123&city=bangkok&checkIn=2026-05-02&checkOut=2026-05-05&sort=best&position=1",
    );
  });
});
