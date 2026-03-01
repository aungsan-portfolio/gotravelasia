/**
 * priceCalendar.utils.ts
 * Types, Constants, and Pure Helpers for PriceCalendar
 */
import { startOfMonth, endOfMonth, getDay, isAfter, isBefore, startOfDay, addDays } from "date-fns";
import { USD_TO_THB_RATE as USD_TO_THB } from "@/const";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type PriceEntry = {
    price: number;
    origin: string;
    destination: string;
    airline?: string;
    departure_at?: string;
    return_at?: string;
    transfers?: number;
    flight_number?: number;
    expires_at?: string;
};

export type PriceMap = Record<string, number>;

export type PriceTier = "cheapest" | "cheap" | "mid" | "expensive" | "none";

export type Thresholds = { p33: number; p66: number; min: number };

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
export const TIER_STYLES: Record<PriceTier, { bg: string; text: string; estBg: string; estText: string }> = {
    cheapest: { bg: "#b3f9c2", text: "#054d14", estBg: "#e8fbef", estText: "#9ca3af" },
    cheap: { bg: "#c6f6d5", text: "#065f16", estBg: "#e8fbef", estText: "#9ca3af" },
    mid: { bg: "#fcb773", text: "#5b2601", estBg: "#fef3e2", estText: "#9ca3af" },
    expensive: { bg: "#fba09d", text: "#680d08", estBg: "#feeaea", estText: "#9ca3af" },
    none: { bg: "#f3f4f6", text: "#6b7280", estBg: "#f3f4f6", estText: "#9ca3af" },
};

export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ─────────────────────────────────────────────────────────────────────────────
// Pure Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function buildCalendarGrid(year: number, month: number) {
    const firstDay = startOfMonth(new Date(year, month));
    const lastDay = endOfMonth(new Date(year, month));
    const startDow = getDay(firstDay);
    const daysInMonth = lastDay.getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

export function computeThresholds(priceMap: PriceMap): Thresholds | null {
    const thbPrices = Object.values(priceMap)
        .map(usd => Math.round(usd * USD_TO_THB))
        .sort((a, b) => a - b);

    if (thbPrices.length === 0) return null;

    const min = thbPrices[0];

    if (thbPrices.length <= 2) {
        return { p33: Math.round(thbPrices[thbPrices.length - 1] * 1.05), p66: Math.round(thbPrices[thbPrices.length - 1] * 1.15), min };
    }

    const p33 = thbPrices[Math.floor(thbPrices.length / 3)];
    const p66 = thbPrices[Math.floor((thbPrices.length * 2) / 3)];
    return { p33, p66, min };
}

export function getTier(thbPrice: number, thresholds: Thresholds | null): PriceTier {
    if (!thresholds) return "none";
    if (thbPrice <= thresholds.min) return "cheapest";
    if (thbPrice <= thresholds.p33) return "cheap";
    if (thbPrice <= thresholds.p66) return "mid";
    return "expensive";
}

export function fillGaps(priceMap: PriceMap, start: Date, end: Date): Record<string, { price: number; isEstimated: boolean }> {
    const result: Record<string, { price: number; isEstimated: boolean }> = {};

    const realDatesStr = Object.keys(priceMap).sort();
    if (realDatesStr.length === 0) return result;

    const realPrices = Object.values(priceMap).sort((a, b) => a - b);
    const minPrice = realPrices[0];
    const medianPrice = realPrices[Math.floor(realPrices.length / 2)];

    let curr = start;
    while (curr <= end) {
        const dateStr = formatHelper(curr, "yyyy-MM-dd");

        if (priceMap[dateStr] !== undefined) {
            result[dateStr] = { price: priceMap[dateStr], isEstimated: false };
        } else {
            let leftDate = null;
            let rightDate = null;

            for (let i = realDatesStr.length - 1; i >= 0; i--) {
                if (realDatesStr[i] < dateStr) { leftDate = realDatesStr[i]; break; }
            }
            for (let i = 0; i < realDatesStr.length; i++) {
                if (realDatesStr[i] > dateStr) { rightDate = realDatesStr[i]; break; }
            }

            if (leftDate && rightDate) {
                const leftMs = new Date(leftDate).getTime();
                const rightMs = new Date(rightDate).getTime();
                const currMs = curr.getTime();
                const fraction = (currMs - leftMs) / (rightMs - leftMs);
                const estPrice = priceMap[leftDate] + (priceMap[rightDate] - priceMap[leftDate]) * fraction;
                result[dateStr] = { price: estPrice, isEstimated: true };
            } else if (medianPrice !== undefined) {
                result[dateStr] = { price: medianPrice, isEstimated: true };
            } else {
                result[dateStr] = { price: minPrice, isEstimated: true };
            }
        }

        curr = addDays(curr, 1);
    }

    return result;
}

export function isInRange(day: Date, start?: Date, end?: Date): boolean {
    if (!start || !end) return false;
    const d = startOfDay(day);
    const s = startOfDay(start);
    const e = startOfDay(end);
    return isAfter(d, s) && isBefore(d, e);
}

// Temporary internal helper since we don't import format from date-fns
function formatHelper(date: Date, fmt: string) {
    // Simple yyyy-MM-dd format used in fillGaps
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
