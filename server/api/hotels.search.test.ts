import { afterEach, describe, expect, it, vi } from "vitest";
import { getCityBySlug } from "../../shared/hotels/cities";

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

const originalEnv = {
  AGODA_API_KEY: process.env.AGODA_API_KEY,
  AGODA_SITE_ID: process.env.AGODA_SITE_ID,
  ALLOW_HOTEL_MOCKS: process.env.ALLOW_HOTEL_MOCKS,
};

function setLiveAgodaEnv() {
  process.env.AGODA_API_KEY = "test_api_key";
  process.env.AGODA_SITE_ID = "test_site_id";
  process.env.ALLOW_HOTEL_MOCKS = "false";
}

function buildReq(page: string, city = "16404") {
  return {
    query: {
      city,
      cityName: "London",
      checkIn: "2026-05-10",
      checkOut: "2026-05-12",
      adults: "2",
      rooms: "1",
      page,
      sort: "best",
    },
  };
}

async function runSearch(req: any, res: any) {
  const { searchHotels } = await import("./hotels");
  return searchHotels(req, res);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  process.env.AGODA_API_KEY = originalEnv.AGODA_API_KEY;
  process.env.AGODA_SITE_ID = originalEnv.AGODA_SITE_ID;
  process.env.ALLOW_HOTEL_MOCKS = originalEnv.ALLOW_HOTEL_MOCKS;
});

describe("hotel search api", () => {
  it("buildAgodaLtV1RequestBody returns criteria.additional shape", async () => {
    const { buildAgodaLtV1RequestBody } = await import("./hotels");
    expect(
      buildAgodaLtV1RequestBody({
        checkIn: "2026-05-10",
        checkOut: "2026-05-12",
        cityId: 9395,
        adults: 2,
        pageSize: 20,
        sort: "price_asc",
      })
    ).toEqual({
      criteria: {
        additional: {
          currency: "USD",
          dailyRate: { minimum: 1, maximum: 10000 },
          discountOnly: false,
          language: "en-us",
          maxResult: 20,
          minimumReviewScore: 0,
          minimumStarRating: 0,
          occupancy: { numberOfAdult: 2, numberOfChildren: 0 },
          sortBy: "PriceAsc",
        },
        checkInDate: "2026-05-10",
        checkOutDate: "2026-05-12",
        cityId: 9395,
      },
    });
  });

  it("uses Authorization header with siteid:apikey", async () => {
    setLiveAgodaEnv();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    const headers = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((headers.headers as any).Authorization).toBe("test_site_id:test_api_key");
  });

  it("normalizes PDF-style results fields", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            hotelId: "h1",
            hotelName: "Lite Hotel",
            starRating: 4,
            dailyRate: 123,
            imageURL: "https://example.com/hotel.jpg",
            landingURL: "https://agoda.example/h1",
          },
        ],
      }),
    } as Response);

    const res = createRes();
    await runSearch(buildReq("2"), res);
    const hotel = (res.body as any).hotels[0];
    expect(hotel.name).toBe("Lite Hotel");
    expect(hotel.stars).toBe(4);
    expect(hotel.lowestRate).toBe(123);
    expect(hotel.imageUrl).toBe("https://example.com/hotel.jpg");
    expect(hotel.outboundLinks.agoda).toBe("https://agoda.example/h1");
  });

  it("maps freeWifi and includeBreakfast", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            hotelId: "h2",
            hotelName: "Wifi Breakfast Hotel",
            includeBreakfast: true,
            freeWifi: true,
            dailyRate: 99,
          },
        ],
      }),
    } as Response);

    const res = createRes();
    await runSearch(buildReq("3"), res);
    const hotel = (res.body as any).hotels[0];
    expect(hotel.breakfastIncluded).toBe(true);
    expect(hotel.amenities).toContain("Free WiFi");
  });

  it("keeps mock fallback disabled by default", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 500, text: async () => "boom" } as Response);
    const res = createRes();
    await runSearch(buildReq("4"), res);
    expect((res.body as any)?.meta?.source).toBe("agoda");
    expect((res.body as any)?.hotels).toEqual([]);
  });

  it("bangkok has Agoda LT city override", () => {
    expect(getCityBySlug("bangkok")?.agodaLtCityId).toBe(9395);
  });
});
