import { describe, it, expect, beforeEach } from "vitest";
import { addPrice, CalendarEntry, PrioritySource } from "./calendarLogic";

describe("Calendar Logic Merge Precedence", () => {
    let merged: Record<string, CalendarEntry>;
    const DATE = "2026-04-10";

    beforeEach(() => {
        merged = {};
    });

    const createBaseEntry = (airline: string = "TG") => ({
        origin: "RGN",
        destination: "BKK",
        airline,
        departure_at: `${DATE}T00:00:00`,
    });

    it("should add entry when date is empty", () => {
        addPrice(merged, DATE, 150, createBaseEntry(), "v3");
        expect(merged[DATE]).toBeDefined();
        expect(merged[DATE].price).toBe(150);
        expect(merged[DATE].is_v3).toBe(true);
    });

    it("V3 overwrites Amadeus even if V3 is more expensive", () => {
        addPrice(merged, DATE, 100, createBaseEntry("AA"), "amadeus");
        expect(merged[DATE].price).toBe(100);
        expect(merged[DATE].is_amadeus).toBe(true);

        // V3 comes in, higher price but higher priority
        addPrice(merged, DATE, 150, createBaseEntry("VV"), "v3");
        expect(merged[DATE].price).toBe(150);
        expect(merged[DATE].is_v3).toBe(true);
        expect(merged[DATE].is_amadeus).toBe(false);
    });

    it("Bot overwrites Legacy", () => {
        addPrice(merged, DATE, 200, createBaseEntry(), "legacy");
        expect(merged[DATE].is_legacy_tp).toBe(true);

        addPrice(merged, DATE, 210, createBaseEntry(), "bot");
        expect(merged[DATE].is_bot_data).toBe(true);
        expect(merged[DATE].price).toBe(210);
    });

    it("Legacy overwrites Amadeus", () => {
        addPrice(merged, DATE, 150, createBaseEntry(), "amadeus");
        expect(merged[DATE].is_amadeus).toBe(true);

        addPrice(merged, DATE, 160, createBaseEntry(), "legacy");
        expect(merged[DATE].is_legacy_tp).toBe(true);
        expect(merged[DATE].price).toBe(160);
    });

    it("Lower-priority entries cannot overwrite higher-priority data", () => {
        addPrice(merged, DATE, 200, createBaseEntry(), "v3");
        expect(merged[DATE].is_v3).toBe(true);

        // Amadeus comes with super cheap price, should NOT overwrite
        addPrice(merged, DATE, 50, createBaseEntry(), "amadeus");
        expect(merged[DATE].is_v3).toBe(true);
        expect(merged[DATE].price).toBe(200);

        // Bot comes in, should NOT overwrite V3
        addPrice(merged, DATE, 180, createBaseEntry(), "bot");
        expect(merged[DATE].is_v3).toBe(true);
        expect(merged[DATE].price).toBe(200);
    });

    it("Same-priority entries keep the lower price", () => {
        // First V3 entry
        addPrice(merged, DATE, 200, createBaseEntry("A1"), "v3");
        
        // Second V3 entry, more expensive -> ignore
        addPrice(merged, DATE, 250, createBaseEntry("A2"), "v3");
        expect(merged[DATE].airline).toBe("A1");
        expect(merged[DATE].price).toBe(200);

        // Third V3 entry, cheaper -> overwrite
        addPrice(merged, DATE, 180, createBaseEntry("A3"), "v3");
        expect(merged[DATE].airline).toBe("A3");
        expect(merged[DATE].price).toBe(180);
    });

    it("Mixed multi-day inputs are merged correctly per date", () => {
        const DATE2 = "2026-04-11";
        
        // Day 1: Legacy wins over Amadeus
        addPrice(merged, DATE, 100, createBaseEntry(), "amadeus");
        addPrice(merged, DATE, 150, createBaseEntry(), "legacy");

        // Day 2: Amadeus is the only data
        addPrice(merged, DATE2, 120, createBaseEntry(), "amadeus");

        expect(merged[DATE].is_legacy_tp).toBe(true);
        expect(merged[DATE].price).toBe(150);

        expect(merged[DATE2].is_amadeus).toBe(true);
        expect(merged[DATE2].price).toBe(120);
    });

    it("Empty or partial inputs do not crash and produce stable results", () => {
        addPrice(merged, "", 100, createBaseEntry(), "v3"); // Empty date
        addPrice(merged, DATE, 0, createBaseEntry(), "v3"); // 0 price
        addPrice(merged, DATE, -50, createBaseEntry(), "v3"); // Negative price
        addPrice(merged, DATE, NaN, createBaseEntry(), "v3"); // NaN price

        expect(Object.keys(merged).length).toBe(0); // Nothing should be added
    });
});
