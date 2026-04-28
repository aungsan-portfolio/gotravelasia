import { describe, expect, it } from "vitest";

import { searchHotels } from "./hotels";

function createRes() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return payload;
    },
  };
}

describe("hotel search api", () => {
  it("accepts numeric Agoda city with cityName", async () => {
    const req = {
      query: {
        city: "16404",
        cityName: "London",
        checkIn: "2026-05-10",
        checkOut: "2026-05-12",
        adults: "2",
        rooms: "1",
        page: "1",
        sort: "best",
      },
    };
    const res = createRes();

    await searchHotels(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.city?.agodaCityId).toBe(16404);
    expect((res.body as any)?.city?.name).toBe("London");
  });

  it("keeps slug-based city search working", async () => {
    const req = {
      query: {
        city: "bangkok",
        checkIn: "2026-05-10",
        checkOut: "2026-05-12",
        adults: "2",
        rooms: "1",
        page: "1",
        sort: "best",
      },
    };
    const res = createRes();

    await searchHotels(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.city?.slug).toBe("bangkok");
  });
});
