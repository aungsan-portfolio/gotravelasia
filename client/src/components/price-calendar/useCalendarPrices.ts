import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, subMonths, endOfMonth, format } from "date-fns";
import { fillGaps, computeThresholds } from "./priceCalendar.utils";
import type { PriceMap, RawPriceEntry, PriceEntry } from "./priceCalendar.utils";
import type { FxQuote } from "@shared/config/fx";

type UseCalendarPricesProps = {
  origin: string;
  destination: string;
  leftMonth: Date;
  rightMonth: Date;
  onCheapestPrice?: (price: number | null) => void;
};

type CalendarPricesResponse = {
  success?: boolean;
  data?: Record<string, RawPriceEntry>;
  currency?: string;
  fx?: FxQuote;
};

async function fetchPricesForMonth(
  origin: string,
  destination: string,
  month: string
): Promise<{ map: PriceMap, fx?: FxQuote }> {
  if (!origin || !destination || origin === destination) return { map: {} };

  try {
    const params = new URLSearchParams({
      origin,
      destination,
      month,
      currency: "usd",
    });

    const response = await fetch(`/api/calendar-prices?${params.toString()}`);
    if (!response.ok) return { map: {} };

    const data = (await response.json()) as CalendarPricesResponse;
    if (!data?.data || typeof data.data !== "object") return { map: {}, fx: data.fx };

    const map: PriceMap = {};

    const respCurrency = data.currency || "USD";

    Object.entries(data.data).forEach(([dateStr, entry]) => {
      const typedEntry = entry as any; // Allow for injected currency if any
      const amount = Number(typedEntry.price || 0);

      if (Number.isFinite(amount) && amount > 0) {
        map[dateStr] = { amount, currency: typedEntry.currency || respCurrency };
      }
    });

    return { map, fx: data.fx };
  } catch {
    return { map: {} };
  }
}

export function useCalendarPrices({
  origin,
  destination,
  leftMonth,
  rightMonth,
  onCheapestPrice,
}: UseCalendarPricesProps) {
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [fxQuote, setFxQuote] = useState<FxQuote | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const leftStr = format(leftMonth, "yyyy-MM");
  const rightStr = format(rightMonth, "yyyy-MM");
  const prevStr = format(subMonths(leftMonth, 1), "yyyy-MM");
  const nextStr = format(addMonths(rightMonth, 1), "yyyy-MM");

  const loadPrices = useCallback(async () => {
    if (!origin || !destination || origin === destination) {
      setPriceMap({});
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [prev, left, right, next] = await Promise.all([
        fetchPricesForMonth(origin, destination, prevStr),
        fetchPricesForMonth(origin, destination, leftStr),
        fetchPricesForMonth(origin, destination, rightStr),
        fetchPricesForMonth(origin, destination, nextStr),
      ]);

      const fx = left.fx || right.fx || prev.fx || next.fx;
      if (fx) setFxQuote(fx);

      setPriceMap({
        ...prev.map,
        ...left.map,
        ...right.map,
        ...next.map,
      });
    } finally {
      setLoading(false);
    }
  }, [origin, destination, prevStr, leftStr, rightStr, nextStr]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!origin || !destination || origin === destination) {
        if (!cancelled) {
          setPriceMap({});
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const [prev, left, right, next] = await Promise.all([
          fetchPricesForMonth(origin, destination, prevStr),
          fetchPricesForMonth(origin, destination, leftStr),
          fetchPricesForMonth(origin, destination, rightStr),
          fetchPricesForMonth(origin, destination, nextStr),
        ]);

        if (cancelled) return;

        const fx = left.fx || right.fx || prev.fx || next.fx;
        if (fx) setFxQuote(fx);

        setPriceMap({
          ...prev.map,
          ...left.map,
          ...right.map,
          ...next.map,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [origin, destination, prevStr, leftStr, rightStr, nextStr]);

  const thresholds = useMemo(() => computeThresholds(priceMap, "THB", fxQuote), [priceMap, fxQuote]);

  const enrichedData = useMemo(() => {
    return fillGaps(priceMap, leftMonth, endOfMonth(rightMonth));
  }, [priceMap, leftMonth, rightMonth]);

  const priceCount = useMemo(() => Object.keys(priceMap).length, [priceMap]);

  const cheapestPrice = useMemo(() => {
    const prices = Object.values(priceMap).filter(
      (entry) => Number.isFinite(entry.amount) && entry.amount > 0
    );

    if (!prices.length) return null;
    
    // We compare and return cheapest in the original currency, assuming homogenous currency per calendar
    // In mixed currency cases, we'd need to convert to find min. Using THB as comparison base is safest.
    return prices.reduce((min, cur) => (cur.amount < min.amount ? cur : min), prices[0]).amount;
  }, [priceMap]);

  useEffect(() => {
    if (!onCheapestPrice) return;
    onCheapestPrice(cheapestPrice);
  }, [cheapestPrice, onCheapestPrice]);

  return {
    priceMap,
    fxQuote,
    enrichedData,
    loading,
    thresholds,
    priceCount,
    cheapestPrice,
    reloadPrices: loadPrices,
  };
}
