import { useEffect, useMemo, useState } from "react";
import type { PriceTrendResponse } from "@shared/flights/priceTrend.types";

type Input = {
  origin: string;
  destination: string;
  departStartDate: string;
  departEndDate: string;
  returnDate?: string;
  currency?: string;
  windowDays?: number;
  enabled?: boolean;
};

export function usePriceTrend(input: Input) {
  const [data, setData] = useState<PriceTrendResponse | null>(null);
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
      String(input.windowDays ?? 7),
    ].join(":");
  }, [input.origin, input.destination, input.departStartDate, input.departEndDate, input.returnDate, input.currency, input.windowDays, input.enabled]);

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
      windowDays: String(input.windowDays ?? 7),
    });
    if (input.returnDate) qs.set("returnDate", input.returnDate);

    fetch(`/api/flights/price-trend?${qs.toString()}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json() as Promise<PriceTrendResponse>;
      })
      .then(setData)
      .catch((e) => {
        if (e?.name !== "AbortError") setError("Failed to fetch price trend");
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [stableKey]);

  return { data, loading, error };
}
