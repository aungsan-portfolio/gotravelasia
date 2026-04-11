import { useEffect, useMemo, useRef, useState } from "react";
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

function hasText(value: string | undefined): value is string {
  return Boolean(value && value.trim().length > 0);
}

export function usePriceCalendar(input: Input) {
  const [data, setData] = useState<PriceCalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const normalized = useMemo(() => {
    const origin = input.origin.trim().toUpperCase();
    const destination = input.destination.trim().toUpperCase();
    const departStartDate = input.departStartDate.trim();
    const departEndDate = input.departEndDate.trim();
    const returnDate = input.returnDate?.trim() || "";
    const currency = (input.currency ?? "USD").trim().toUpperCase();
    const enabled = Boolean(input.enabled);
    const validCore = hasText(origin) && hasText(destination) && hasText(departStartDate) && hasText(departEndDate);

    return {
      enabled,
      canFetch: enabled && validCore,
      origin,
      destination,
      departStartDate,
      departEndDate,
      returnDate,
      currency,
    };
  }, [input.origin, input.destination, input.departStartDate, input.departEndDate, input.returnDate, input.currency, input.enabled]);

  const stableKey = useMemo(() => {
    if (!normalized.canFetch) return "disabled";
    return [
      normalized.origin,
      normalized.destination,
      normalized.departStartDate,
      normalized.departEndDate,
      normalized.returnDate,
      normalized.currency,
    ].join(":");
  }, [normalized]);

  useEffect(() => {
    if (!normalized.canFetch) {
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams({
      origin: normalized.origin,
      destination: normalized.destination,
      departStartDate: normalized.departStartDate,
      departEndDate: normalized.departEndDate,
      currency: normalized.currency,
    });
    if (hasText(normalized.returnDate)) qs.set("returnDate", normalized.returnDate);

    fetch(`/api/flights/price-calendar?${qs.toString()}`, { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json() as Promise<PriceCalendarResponse>;
      })
      .then((nextData) => {
        if (requestSeq.current !== seq) return;
        setData(nextData);
      })
      .catch((e: unknown) => {
        if ((e as { name?: string } | null)?.name === "AbortError") return;
        if (requestSeq.current !== seq) return;
        setError("Failed to fetch price calendar");
      })
      .finally(() => {
        if (requestSeq.current !== seq) return;
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [stableKey, normalized]);

  return { data, loading, error };
}
