import { describe, it, expect } from "vitest";
import { getCityName, getCityCode } from "./cities.js";

describe("cities utility", () => {
    it("should correctly resolve IATA codes to city names", () => {
        expect(getCityName("RGN")).toBe("Yangon");
        expect(getCityName("BKK")).toBe("Bangkok");
        expect(getCityName("CNX")).toBe("Chiang Mai");
    });

    it("should correctly resolve city names to IATA codes", () => {
        expect(getCityCode("Yangon")).toBe("RGN");
        expect(getCityCode("Bangkok")).toBe("BKK");
    });

    it("should handle unknown codes gracefully", () => {
        expect(getCityName("UNKNOWN" as any)).toBe("UNKNOWN");
    });
});
