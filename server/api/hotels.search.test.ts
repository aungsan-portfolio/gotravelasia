import { afterEach, describe, expect, it, vi } from "vitest";

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

    await runSearch(req, res);

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

    await runSearch(req, res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.city?.slug).toBe("bangkok");
  });

  it("parses payload.results from Agoda", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            hotelId: "h-results-1",
            name: "Results Hotel",
            price: 111,
            currency: "USD",
          },
        ],
      }),
    } as Response);

    const res = createRes();
    await runSearch(buildReq("11"), res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.hotels).toHaveLength(1);
    expect((res.body as any)?.hotels?.[0]?.hotelId).toBe("h-results-1");
  });

  it("parses payload.hotels from Agoda", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        hotels: [{ hotelId: "h-hotels-1", hotelName: "Hotels Hotel", price: 99 }],
      }),
    } as Response);

    const res = createRes();
    await runSearch(buildReq("12"), res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.hotels).toHaveLength(1);
    expect((res.body as any)?.hotels?.[0]?.hotelId).toBe("h-hotels-1");
  });

  it("parses payload.properties from Agoda", async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        properties: [
          { propertyId: "h-properties-1", propertyName: "Properties Hotel", price: 88 },
        ],
      }),
    } as Response);

    const res = createRes();
    await runSearch(buildReq("13"), res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.hotels).toHaveLength(1);
    expect((res.body as any)?.hotels?.[0]?.hotelId).toBe("h-properties-1");
  });

  it('surfaces diagnostics for payload.error = "No search result"', async () => {
    setLiveAgodaEnv();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: "No search result",
      }),
    } as Response);

    const res = createRes();
    await runSearch(buildReq("14"), res);

    expect(res.statusCode).toBe(200);
    expect((res.body as any)?.hotels).toEqual([]);
    expect((res.body as any)?.meta?.diagnostics?.agodaErrorMessage).toBe(
      "No search result"
    );
    expect((res.body as any)?.meta?.diagnostics?.payloadTopLevelKeys).toEqual([
      "error",
    ]);
    expect((res.body as any)?.meta?.diagnostics?.requestShape).toMatchObject({
      cityId: 16404,
      checkIn: "2026-05-10",
      checkOut: "2026-05-12",
      adults: 2,
      rooms: 1,
      page: 14,
      pageSize: 20,
    });
  });
});
