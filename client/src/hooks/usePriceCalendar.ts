import { useEffect, useMemo, useState } from "react";
import type { PriceCalendarResponse } from "@shared/flights/priceCalendar.types";

type Input = {
  origin: string;
  destination: string;
  departStartDate: string;
  departEndDate: string;
  returnDate?: string;
  currency?: string;
  enabled?: boolean;
};

export function usePriceCalendar(input: Input) {
  const [data, setData] = useState<PriceCalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stableKey = useMemo(() => {
    if (!input.enabled) return "disabled";
    return [
      input.origin,
      input.destination,
      input.departStartDate,
      input.departEndDate,
      input.returnDate ?? "",
      input.currency ?? "USD",
    ].join(":");
  }, [input.origin, input.destination, input.departStartDate, input.departEndDate, input.returnDate, input.currency, input.enabled]);

  useEffect(() => {
    if (!input.enabled) return;
    if (!input.origin || !input.destination || !input.departStartDate || !input.departEndDate) return;

    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams({
      origin: input.origin,
      destination: input.destination,
      departStartDate: input.departStartDate,
      departEndDate: input.departEndDate,
      currency: input.currency ?? "USD",
    });
    if (input.returnDate) qs.set("returnDate", input.returnDate);

    fetch(`/api/flights/price-calendar?${qs.toString()}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json() as Promise<PriceCalendarResponse>;
      })
      .then(setData)
      .catch((e) => {
        if (e?.name !== "AbortError") setError("Failed to fetch price calendar");
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [stableKey]);

  return { data, loading, error };
}
