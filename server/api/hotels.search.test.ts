import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAgodaLtCityCandidates,
  getCityBySlug,
  type City,
} from "../../shared/hotels/cities";

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
  EXPEDIA_TP_CODE: process.env.EXPEDIA_TP_CODE,
};

function setLiveAgodaEnv(overrides: Partial<Record<string, string>> = {}) {
  process.env.AGODA_API_KEY = overrides.AGODA_API_KEY ?? "test_api_key";
  process.env.AGODA_SITE_ID = overrides.AGODA_SITE_ID ?? "1959281";
  process.env.ALLOW_HOTEL_MOCKS = overrides.ALLOW_HOTEL_MOCKS ?? "false";
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
  process.env.EXPEDIA_TP_CODE = originalEnv.EXPEDIA_TP_CODE;
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
    expect((headers.headers as any).Authorization).toBe("1959281:test_api_key");
  });

  it("normalizes comma-separated Agoda site id for Authorization header", async () => {
    setLiveAgodaEnv({ AGODA_SITE_ID: "1,959,281" });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    const headers = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((headers.headers as any).Authorization).toBe("1959281:test_api_key");
  });

  it("trims Agoda site id and API key from env", async () => {
    setLiveAgodaEnv({
      AGODA_SITE_ID: " 1959281 ",
      AGODA_API_KEY: "  test_api_key  ",
    });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    const headers = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((headers.headers as any).Authorization).toBe("1959281:test_api_key");
  });

  it("does not duplicate site id in Authorization header if already present in api key", async () => {
    setLiveAgodaEnv({
      AGODA_SITE_ID: "1959281",
      AGODA_API_KEY: "1959281:test_api_key",
    });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    const headers = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((headers.headers as any).Authorization).toBe("1959281:test_api_key");
  });

  it("does not expose secrets in diagnostics", async () => {
    setLiveAgodaEnv({
      AGODA_SITE_ID: "1,959,281",
      AGODA_API_KEY: "  test_api_key  ",
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => '{"error":{"id":100,"message":"invalid"}}',
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    const diagnostics = (res.body as any)?.meta?.diagnostics;
    expect(diagnostics.apiKeyPresent).toBe(true);
    expect(diagnostics.siteIdLooksNumeric).toBe(true);
    expect(diagnostics.authFormat).toBe("siteid_colon_apikey");
    expect(JSON.stringify(diagnostics)).not.toContain("test_api_key");
    expect(JSON.stringify(diagnostics)).not.toContain("1959281");
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

  it("normalizes Agoda image URLs to https", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            hotelId: "h3",
            hotelName: "HTTP Image",
            imageUrl: "http://example.com/hotel.jpg",
            dailyRate: 44,
          },
        ],
      }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    expect((res.body as any).hotels[0].imageUrl).toBe(
      "https://example.com/hotel.jpg"
    );
  });

  it("omits Expedia link when EXPEDIA_TP_CODE is missing or placeholder", async () => {
    setLiveAgodaEnv();
    process.env.EXPEDIA_TP_CODE = "placeholder-ဒီမှာထည့်ပါ";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    expect((res.body as any).affiliateLinks.expedia).toBeUndefined();
  });

  it("uses area/location fields for address fallback", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            hotelId: "h4",
            hotelName: "Fallback Address",
            address: "",
            areaName: "Sukhumvit",
            dailyRate: 88,
          },
          {
            hotelId: "h5",
            hotelName: "Location Address",
            address: "",
            location: { areaName: "Riverside" },
            dailyRate: 99,
          },
        ],
      }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1"), res);
    expect((res.body as any).hotels[0].address).toBe("Sukhumvit");
    expect((res.body as any).hotels[1].address).toBe("Riverside");
  });

  it("builds Agoda LT candidates with verified LT id first", () => {
    const bangkok = getCityBySlug("bangkok")!;
    const candidates = buildAgodaLtCityCandidates({
      city: bangkok,
      queryCity: "18056",
    });
    expect(candidates.map((item) => item.cityId)).toEqual([9395, 18056]);
    expect(candidates[0].source).toBe("verified_lt_id");
  });

  it("treats dynamic query city id as unverified and keeps affiliate link", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1", "3386"), res);
    expect((res.body as any).meta.source).toBe("agoda");
    expect((res.body as any).hotels).toEqual([]);
    expect((res.body as any).affiliateLinks.agoda).toContain("city=3386");
  });

  it("tries next LT candidate after empty results and resolves", async () => {
    setLiveAgodaEnv();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ hotelId: "ok-1", dailyRate: 77 }] }),
      } as Response);
    const res = createRes();
    await runSearch(buildReq("1", "bangkok"), res);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect((res.body as any).hotels.length).toBe(1);
  });

  it("stops retrying on 401/403 response", async () => {
    setLiveAgodaEnv();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1", "bangkok"), res);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
