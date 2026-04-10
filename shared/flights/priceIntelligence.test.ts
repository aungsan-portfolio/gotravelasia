import { describe, expect, it } from "vitest";
import { buildPriceCalendarCacheKey } from "./priceIntelligence.cacheKey";
import { validatePriceCalendarRequest } from "./priceIntelligence.validation";

describe("price intelligence validation", () => {
  it("normalizes valid input", () => {
    const parsed = validatePriceCalendarRequest({
      origin: "bkk",
      destination: "sin",
      departStartDate: "2026-06-01",
      departEndDate: "2026-06-10",
      currency: "usd",
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.origin).toBe("BKK");
      expect(parsed.data.currency).toBe("USD");
    }
  });

  it("rejects invalid range", () => {
    const parsed = validatePriceCalendarRequest({
      origin: "BKK",
      destination: "SIN",
      departStartDate: "2026-07-10",
      departEndDate: "2026-07-01",
    });
    expect(parsed.ok).toBe(false);
  });
});

describe("cache keys", () => {
  it("is stable across equivalent requests", () => {
    const keyA = buildPriceCalendarCacheKey({
      origin: "bkk",
      destination: "sin",
      departStartDate: "2026-06-01",
      departEndDate: "2026-06-10",
      currency: "usd",
    });
    const keyB = buildPriceCalendarCacheKey({
      origin: "BKK",
      destination: "SIN",
      departStartDate: "2026-06-01",
      departEndDate: "2026-06-10",
      currency: "USD",
    });
    expect(keyA).toBe(keyB);
  });
});
