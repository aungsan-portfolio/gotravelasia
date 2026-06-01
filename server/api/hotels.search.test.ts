import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildAgodaLtCityCandidates,
  getCityBySlug,
  type City,
} from "../../shared/hotels/cities";
import { deriveEmptyStateReason } from "./hotels";
import { findAgodaLtCityIdByName } from "../../shared/hotels/agodaLtCityMap";

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
  NODE_ENV: process.env.NODE_ENV,
  HOTEL_DEBUG_DIAGNOSTICS: process.env.HOTEL_DEBUG_DIAGNOSTICS,
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
  process.env.NODE_ENV = originalEnv.NODE_ENV;
  process.env.HOTEL_DEBUG_DIAGNOSTICS = originalEnv.HOTEL_DEBUG_DIAGNOSTICS;
});

describe("hotel search api", () => {
  describe("deriveEmptyStateReason unit tests", () => {
    it("returns undefined if hotels are present", () => {
      expect(deriveEmptyStateReason([{ hotelId: "1" } as any])).toBeUndefined();
    });

    it("returns provider_unavailable if no diagnostics", () => {
      expect(deriveEmptyStateReason([])).toBe("provider_unavailable");
    });

    it("maps diagnostics reason correctly", () => {
      expect(deriveEmptyStateReason([], { reason: "fetch_error" } as any)).toBe("provider_unavailable");
      expect(deriveEmptyStateReason([], { reason: "unsupported_city" } as any)).toBe("unsupported_city");
      expect(deriveEmptyStateReason([], { reason: "unresolved_city" } as any)).toBe("unresolved_city");
    });

    it("handles empty_results based on city resolution status", () => {
      expect(deriveEmptyStateReason([], { 
        reason: "empty_results", 
        cityResolutionStatus: "resolved" 
      } as any)).toBe("no_live_inventory");
      
      expect(deriveEmptyStateReason([], { 
        reason: "empty_results", 
        cityResolutionStatus: "unresolved_empty_results" 
      } as any)).toBe("unresolved_city");
    });
  });

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
      json: async () => ({ results: [{ hotelId: "sg-1", dailyRate: 120 }] }),
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

  it("enables mock fallback when ALLOW_HOTEL_MOCKS is true", async () => {
    setLiveAgodaEnv({ ALLOW_HOTEL_MOCKS: "true" });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({ ok: false, status: 500, text: async () => "boom" } as Response);
    const res = createRes();
    await runSearch(buildReq("4"), res);
    expect((res.body as any)?.meta?.source).toBe("mock");
    expect((res.body as any)?.hotels.length).toBeGreaterThan(0);
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

  it("resolves Da Nang LT city id from data-file mapping", () => {
    expect(findAgodaLtCityIdByName("Da Nang", "Vietnam")?.agodaLtCityId).toBe(
      16440
    );
  });

  it("resolves Singapore LT city id from data-file mapping", () => {
    expect(findAgodaLtCityIdByName("Singapore", "Singapore")?.agodaLtCityId).toBe(
      4064
    );
  });

  it("tries resolved LT city id before dynamic query city id", () => {
    const candidates = buildAgodaLtCityCandidates({
      queryCity: "3386",
      queryCityName: "Da Nang",
      country: "Vietnam",
    });
    expect(candidates.map((item) => item.cityId)).toEqual([16440, 3386]);
    expect(candidates[0].source).toBe("data_file_city_id");
  });

  it("resolves cityName-only search to Singapore LT city id", async () => {
    setLiveAgodaEnv();
    process.env.HOTEL_DEBUG_DIAGNOSTICS = "true";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ hotelId: "sg-1", hotelName: "SGP Hotel", dailyRate: 100 }],
      }),
    } as Response);

    const req = {
      query: {
        cityName: "Singapore",
        checkIn: "2026-05-12",
        checkOut: "2026-05-14",
        adults: "2",
        rooms: "1",
        page: "1",
        sort: "best",
      },
    };

    const res = createRes();
    await runSearch(req, res);

    expect((res.body as any).city.name).toBe("Singapore");
    expect((res.body as any).meta.diagnostics.attemptedLtCityIds).toContain(4064);
    expect((res.body as any).meta.diagnostics.resolvedLtCityIdSource).toBe("data_file_city_id");
  });

  it("keeps default behavior when city and cityName are missing", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const req = {
      query: {
        checkIn: "2026-05-12",
        checkOut: "2026-05-14",
        adults: "2",
        rooms: "1",
        page: "1",
        sort: "best",
      },
    };

    const res = createRes();
    await runSearch(req, res);
    expect((res.body as any).city.slug).toBe("yangon");
  });

  it("keeps dynamic query city id when no mapping exists", () => {
    const candidates = buildAgodaLtCityCandidates({
      queryCity: "3386",
      queryCityName: "Unknown City",
      country: "Nowhere",
    });
    expect(candidates.map((item) => item.cityId)).toEqual([3386]);
  });

  it("hides diagnostics in production by default", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.HOTEL_DEBUG_DIAGNOSTICS;
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1", "3386"), res);
    expect((res.body as any)?.meta?.diagnostics).toBeUndefined();
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

  it("returns unsupported_city empty-state reason when no LT candidates resolve", async () => {
    setLiveAgodaEnv();
    process.env.HOTEL_DEBUG_DIAGNOSTICS = "true";
    const res = createRes();
    await runSearch({
      query: {
        city: "mystery-city",
        cityName: "Mystery City",
        checkIn: "2026-05-10",
        checkOut: "2026-05-12",
        adults: "2",
        rooms: "1",
        page: "1",
        sort: "best",
      },
    }, res);

    expect((res.body as any).hotels).toEqual([]);
    expect((res.body as any).meta.emptyStateReason).toBe("unresolved_city");
    expect((res.body as any).meta.diagnostics.reason).toBe("unresolved_city");
  });

  it("maps provider non-ok to provider_unavailable empty-state", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => "upstream unavailable",
    } as Response);
    const res = createRes();
    await runSearch(buildReq("1", "bangkok"), res);
    expect((res.body as any).meta.emptyStateReason).toBe("provider_unavailable");
  });

  it("kuala lumpur city candidate order prefers verified LT city id", () => {
    const kl = getCityBySlug("kuala-lumpur")!;
    const candidates = buildAgodaLtCityCandidates({ city: kl, queryCity: "3714" });
    expect(kl.agodaCityId).toBe(3714);
    expect(kl.agodaLtCityId).toBe(14524);
    expect(candidates.map((item) => item.cityId)).toEqual([14524, 3714]);
  });
});
