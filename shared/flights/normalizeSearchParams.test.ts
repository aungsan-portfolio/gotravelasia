import { describe, it, expect } from "vitest";
import { normalizeSearchParams } from "./normalizeSearchParams";

describe("normalizeSearchParams", () => {
  it("normalizes canonical correctly", () => {
    const input = {
      origin: "JFK",
      destination: "LHR",
      departDate: "2024-05-01",
      returnDate: "2024-05-15",
      tripType: "roundtrip",
      adults: "2",
      cabinClass: "business"
    };

    const res = normalizeSearchParams(input);
    expect(res).toEqual({
      origin: "JFK",
      destination: "LHR",
      departDate: "2024-05-01",
      returnDate: "2024-05-15",
      tripType: "roundtrip",
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: "business"
    });
  });

  it("handles legacy TripType aliases", () => {
    const oneway1 = normalizeSearchParams({ origin: "a", destination: "b", departDate: "d", tripType: "one-way" });
    expect(oneway1.tripType).toBe("oneway");

    const oneway2 = normalizeSearchParams({ origin: "a", destination: "b", departDate: "d", tripType: "single" });
    expect(oneway2.tripType).toBe("oneway");

    const roundtrip1 = normalizeSearchParams({ origin: "a", destination: "b", departDate: "d", returnDate: "r", tripType: "return" });
    expect(roundtrip1.tripType).toBe("roundtrip");

    // Infers oneway if no explicit tripType and no returnDate is provided
    const missing = normalizeSearchParams({ origin: "a", destination: "b", departDate: "d" });
    expect(missing.tripType).toBe("oneway");
  });

  it("removes returnDate if tripType is oneway", () => {
    const res = normalizeSearchParams({
      origin: "A", destination: "B", departDate: "2", 
      returnDate: "3", // This shouldn't be here for a oneway trip!
      tripType: "oneway"
    });
    
    expect(res.tripType).toBe("oneway");
    expect(res.returnDate).toBeUndefined();
  });

  it("handles destination aliases (to, arrival)", () => {
    const res1 = normalizeSearchParams({ origin: "RGN", to: "BKK" });
    expect(res1.destination).toBe("BKK");

    const res2 = normalizeSearchParams({ origin: "RGN", arrival: "DMK" });
    expect(res2.destination).toBe("DMK");
  });

  it("handles default values missing gracefully", () => {
    const empty = normalizeSearchParams({});
    expect(empty.adults).toBe(1);
    expect(empty.origin).toBe("");
    expect(empty.destination).toBe("");
    expect(empty.cabinClass).toBe("economy");
  });
});
