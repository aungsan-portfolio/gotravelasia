import { describe, it, expect } from "vitest";
import { convertPrice, getDisplayPrice, formatCurrency } from "./currency";

describe("Shared Currency Utility", () => {
    it("converts USD to THB correctly using centralized rates", () => {
        expect(convertPrice(100, "USD", "THB")).toBe(3400);
        expect(convertPrice(50.5, "USD", "THB")).toBe(1717);
    });

    it("converts THB to USD correctly", () => {
        // 3400 THB = 100 USD (3400 * 1/34 = 100)
        expect(convertPrice(3400, "THB", "USD")).toBeCloseTo(100);
    });

    it("returns original amount when source and target match", () => {
        expect(convertPrice(100, "USD", "USD")).toBe(100);
        expect(convertPrice(500, "THB", "THB")).toBe(500);
    });

    it("handles case-insensitive currency codes", () => {
        expect(convertPrice(100, "usd", "thb")).toBe(3400);
    });

    it("safely falls back (no-op) when conversion is missing", () => {
        // Should not crash, should return original
        expect(convertPrice(100, "EUR", "USD")).toBe(100);
    });

    it("formats currency correctly based on code", () => {
        expect(formatCurrency(100, "USD")).toBe("$100.00");
        expect(formatCurrency(3400.6, "THB")).toBe("฿3,401"); // THB rounds correctly
        expect(formatCurrency(250, "EUR")).toBe("250 EUR"); // fallback
    });

    it("getDisplayPrice rounds correctly depending on target currency", () => {
        expect(getDisplayPrice(100.123, "THB", "THB")).toBe(100);
        expect(getDisplayPrice(100.123, "USD", "USD")).toBe(100.12);
    });
});
