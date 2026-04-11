import { useMemo } from "react";
import { usePriceCalendar } from "@/hooks/usePriceCalendar";
import { usePriceTrend } from "@/hooks/usePriceTrend";

interface BridgeInput {
  committed: boolean;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}

function toMonthEnd(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  return end.toISOString().slice(0, 10);
}

export function useFlightWidgetPriceIntelligence(input: BridgeInput) {
  const requestInput = useMemo(() => {
    const origin = input.origin.trim().toUpperCase();
    const destination = input.destination.trim().toUpperCase();
    const departStartDate = input.departDate.trim();
    const departEndDate = toMonthEnd(departStartDate);
    const returnDate = input.returnDate?.trim() || undefined;

    const canFetch = Boolean(input.committed && origin && destination && departStartDate && departEndDate);

    return {
      enabled: canFetch,
      origin,
      destination,
      departStartDate,
      departEndDate,
      returnDate,
      currency: "USD" as const,
    };
  }, [input.committed, input.origin, input.destination, input.departDate, input.returnDate]);

  const calendar = usePriceCalendar(requestInput);
  const trend = usePriceTrend({ ...requestInput, windowDays: 7 });

  return { calendar, trend };
}
