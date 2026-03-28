/**
 * priceCalendar.utils.ts
 * Types, Constants, and Pure Helpers for PriceCalendar
 */
import {
  startOfMonth,
  endOfMonth,
  getDay,
  isAfter,
  isBefore,
  startOfDay,
  addDays,
} from "date-fns";
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

export type Thresholds = {
  min: number;
  cheapMax: number;
  midMax: number;
};

export type EnrichedPriceMap = Record<
  string,
  {
    price: number;
    isEstimated: boolean;
  }
>;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
export const MAX_ESTIMATE_GAP_DAYS = 3;

export const TIER_STYLES: Record<
  PriceTier,
  {
    bg: string;
    text: string;
    estBg: string;
    estText: string;
    border: string;
    estBorder: string;
  }
> = {
  cheapest: {
    bg: "#16a34a",
    text: "#ffffff",
    estBg: "#dcfce7",
    estText: "#166534",
    border: "#15803d",
    estBorder: "#86efac",
  },
  cheap: {
    bg: "#4ade80",
    text: "#14532d",
    estBg: "#f0fdf4",
    estText: "#166534",
    border: "#22c55e",
    estBorder: "#86efac",
  },
  mid: {
    bg: "#facc15",
    text: "#713f12",
    estBg: "#fef9c3",
    estText: "#854d0e",
    border: "#eab308",
    estBorder: "#fde047",
  },
  expensive: {
    bg: "#f472b6",
    text: "#831843",
    estBg: "#fce7f3",
    estText: "#9d174d",
    border: "#ec4899",
    estBorder: "#f9a8d4",
  },
  none: {
    bg: "#f8fafc",
    text: "#64748b",
    estBg: "#f8fafc",
    estText: "#94a3b8",
    border: "#e2e8f0",
    estBorder: "#e2e8f0",
  },
};

export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─────────────────────────────────────────────────────────────────────────────
// Pure Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function buildCalendarGrid(year: number, month: number) {
  const firstDay = startOfMonth(new Date(year, month));
  const lastDay = endOfMonth(new Date(year, month));
  const startDow = getDay(firstDay);
  const daysInMonth = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export function computeThresholds(priceMap: PriceMap): Thresholds | null {
  const thbPrices = Object.values(priceMap)
    .map((usd) => Math.round(usd * USD_TO_THB))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (thbPrices.length === 0) return null;

  const unique = [...new Set(thbPrices)];
  const min = unique[0];
  const max = unique[unique.length - 1];

  if (unique.length === 1) {
    return {
      min,
      cheapMax: min,
      midMax: min,
    };
  }

  if (unique.length === 2) {
    return {
      min,
      cheapMax: unique[0],
      midMax: unique[1],
    };
  }

  const spread = max - min;

  return {
    min,
    cheapMax: min + Math.round(spread * 0.35),
    midMax: min + Math.round(spread * 0.7),
  };
}

export function getTier(thbPrice: number, thresholds: Thresholds | null): PriceTier {
  if (!thresholds) return "none";
  if (thbPrice <= thresholds.min) return "cheapest";
  if (thbPrice <= thresholds.cheapMax) return "cheap";
  if (thbPrice <= thresholds.midMax) return "mid";
  return "expensive";
}

export function fillGaps(
  priceMap: PriceMap,
  start: Date,
  end: Date
): EnrichedPriceMap {
  const result: EnrichedPriceMap = {};
  const realDates = Object.keys(priceMap).sort();

  if (realDates.length === 0) return result;

  let current = startOfDay(start);
  const last = startOfDay(end);

  while (current <= last) {
    const dateStr = formatDateKey(current);

    if (priceMap[dateStr] !== undefined) {
      result[dateStr] = {
        price: priceMap[dateStr],
        isEstimated: false,
      };
      current = addDays(current, 1);
      continue;
    }

    let leftDate: string | null = null;
    let rightDate: string | null = null;

    for (let i = realDates.length - 1; i >= 0; i -= 1) {
      if (realDates[i] < dateStr) {
        leftDate = realDates[i];
        break;
      }
    }

    for (let i = 0; i < realDates.length; i += 1) {
      if (realDates[i] > dateStr) {
        rightDate = realDates[i];
        break;
      }
    }

    if (leftDate && rightDate) {
      const left = new Date(`${leftDate}T00:00:00`);
      const right = new Date(`${rightDate}T00:00:00`);

      const leftGap = daysBetween(current, left);
      const rightGap = daysBetween(current, right);

      if (leftGap <= MAX_ESTIMATE_GAP_DAYS && rightGap <= MAX_ESTIMATE_GAP_DAYS) {
        const leftMs = left.getTime();
        const rightMs = right.getTime();
        const currentMs = current.getTime();
        const fraction = (currentMs - leftMs) / (rightMs - leftMs);

        const estimatedPrice =
          priceMap[leftDate] + (priceMap[rightDate] - priceMap[leftDate]) * fraction;

        result[dateStr] = {
          price: estimatedPrice,
          isEstimated: true,
        };
      }
    }

    current = addDays(current, 1);
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

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetween(a: Date, b: Date) {
  return Math.abs(Math.round((a.getTime() - b.getTime()) / 86_400_000));
}

export function formatThbPrice(thbPrice: number) {
  if (thbPrice >= 10000) return `฿${(thbPrice / 1000).toFixed(1)}k`;
  return `฿${thbPrice.toLocaleString()}`;
}
