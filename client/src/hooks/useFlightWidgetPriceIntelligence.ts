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

export function useFlightWidgetPriceIntelligence(input: BridgeInput) {
  const monthEnd = useMemo(() => {
    if (!input.departDate) return "";
    const d = new Date(`${input.departDate}T00:00:00Z`);
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
    return end.toISOString().slice(0, 10);
  }, [input.departDate]);

  const common = {
    enabled: input.committed,
    origin: input.origin,
    destination: input.destination,
    departStartDate: input.departDate,
    departEndDate: monthEnd,
    returnDate: input.returnDate,
    currency: "USD",
  };

  const calendar = usePriceCalendar(common);
  const trend = usePriceTrend({ ...common, windowDays: 7 });

  return { calendar, trend };
}
