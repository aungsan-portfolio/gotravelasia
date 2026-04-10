import { z } from "zod";
import type { PriceCalendarRequest } from "./priceCalendar.types.js";
import type { PriceTrendRequest } from "./priceTrend.types.js";

const IATA = /^[A-Z]{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-\d{2}$/;

const BaseSchema = z.object({
  origin: z.string().transform((v) => v.trim().toUpperCase()).refine((v) => IATA.test(v), "Invalid origin IATA"),
  destination: z.string().transform((v) => v.trim().toUpperCase()).refine((v) => IATA.test(v), "Invalid destination IATA"),
  departStartDate: z.string().refine((v) => ISO_DATE.test(v), "Invalid departStartDate"),
  departEndDate: z.string().refine((v) => ISO_DATE.test(v), "Invalid departEndDate"),
  returnDate: z.string().refine((v) => ISO_DATE.test(v), "Invalid returnDate").optional(),
  cabin: z.enum(["economy", "premium", "business", "first"]).optional(),
  adults: z.coerce.number().int().min(1).max(9).optional(),
  children: z.coerce.number().int().min(0).max(8).optional(),
  infants: z.coerce.number().int().min(0).max(4).optional(),
  currency: z.string().default("USD").transform((v) => v.trim().toUpperCase()).refine((v) => /^[A-Z]{3}$/.test(v), "Invalid currency"),
});

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; message: string };

export function validatePriceCalendarRequest(input: Record<string, unknown>): ValidationResult<PriceCalendarRequest> {
  const parsed = BaseSchema.superRefine((v, ctx) => {
    if (v.origin === v.destination) {
      ctx.addIssue({ code: "custom", message: "Origin and destination must differ", path: ["destination"] });
    }
    if (v.departEndDate < v.departStartDate) {
      ctx.addIssue({ code: "custom", message: "departEndDate must be >= departStartDate", path: ["departEndDate"] });
    }
    const daySpan = Math.floor((Date.parse(v.departEndDate) - Date.parse(v.departStartDate)) / 86400000) + 1;
    if (daySpan < 1 || daySpan > 62) {
      ctx.addIssue({ code: "custom", message: "Date range must be between 1 and 62 days", path: ["departEndDate"] });
    }
    if (v.returnDate && v.returnDate < v.departStartDate) {
      ctx.addIssue({ code: "custom", message: "returnDate must be >= departStartDate", path: ["returnDate"] });
    }
  }).safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request" };
  }
  return { ok: true, data: parsed.data };
}

export function validatePriceTrendRequest(input: Record<string, unknown>): ValidationResult<PriceTrendRequest> {
  const parsed = BaseSchema.extend({
    windowDays: z.coerce.number().int().min(3).max(30).optional(),
  }).safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  const data = parsed.data;
  if (data.departEndDate < data.departStartDate) {
    return { ok: false, message: "departEndDate must be >= departStartDate" };
  }

  return { ok: true, data };
}

export function dateToMonthKey(dateIso: string): string {
  if (ISO_MONTH.test(dateIso)) return dateIso;
  return dateIso.slice(0, 7);
}
