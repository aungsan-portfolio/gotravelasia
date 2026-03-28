import { useCallback, useEffect, useMemo, useState } from "react";
import { addMonths, subMonths, endOfMonth, format } from "date-fns";
import { fillGaps, computeThresholds } from "./priceCalendar.utils";
import type { PriceMap, PriceEntry } from "./priceCalendar.utils";

type UseCalendarPricesProps = {
  origin: string;
  destination: string;
  leftMonth: Date;
  rightMonth: Date;
  onCheapestPrice?: (price: number | null) => void;
};

type CalendarPricesResponse = {
  success?: boolean;
  data?: Record<string, PriceEntry>;
  currency?: string;
};

async function fetchPricesForMonth(
  origin: string,
  destination: string,
  month: string
): Promise<PriceMap> {
  if (!origin || !destination || origin === destination) return {};

  try {
    const params = new URLSearchParams({
      origin,
      destination,
      month,
      currency: "usd",
    });

    const response = await fetch(`/api/calendar-prices?${params.toString()}`);
    if (!response.ok) return {};

    const data = (await response.json()) as CalendarPricesResponse;
    if (!data?.data || typeof data.data !== "object") return {};

    const map: PriceMap = {};

    Object.entries(data.data).forEach(([dateStr, entry]) => {
      const typedEntry = entry as PriceEntry;
      const price = Number(typedEntry.price || 0);

      if (Number.isFinite(price) && price > 0) {
        map[dateStr] = price;
      }
    });

    return map;
  } catch {
    return {};
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
      const [prevPrices, leftPrices, rightPrices, nextPrices] = await Promise.all([
        fetchPricesForMonth(origin, destination, prevStr),
        fetchPricesForMonth(origin, destination, leftStr),
        fetchPricesForMonth(origin, destination, rightStr),
        fetchPricesForMonth(origin, destination, nextStr),
      ]);

      setPriceMap({
        ...prevPrices,
        ...leftPrices,
        ...rightPrices,
        ...nextPrices,
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
        const [prevPrices, leftPrices, rightPrices, nextPrices] = await Promise.all([
          fetchPricesForMonth(origin, destination, prevStr),
          fetchPricesForMonth(origin, destination, leftStr),
          fetchPricesForMonth(origin, destination, rightStr),
          fetchPricesForMonth(origin, destination, nextStr),
        ]);

        if (cancelled) return;

        setPriceMap({
          ...prevPrices,
          ...leftPrices,
          ...rightPrices,
          ...nextPrices,
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

  const thresholds = useMemo(() => computeThresholds(priceMap), [priceMap]);

  const enrichedData = useMemo(() => {
    return fillGaps(priceMap, leftMonth, endOfMonth(rightMonth));
  }, [priceMap, leftMonth, rightMonth]);

  const priceCount = useMemo(() => Object.keys(priceMap).length, [priceMap]);

  const cheapestPrice = useMemo(() => {
    const prices = Object.values(priceMap).filter(
      (price) => Number.isFinite(price) && price > 0
    );

    if (!prices.length) return null;
    return Math.min(...prices);
  }, [priceMap]);

  useEffect(() => {
    if (!onCheapestPrice) return;
    onCheapestPrice(cheapestPrice);
  }, [cheapestPrice, onCheapestPrice]);

  return {
    priceMap,
    enrichedData,
    loading,
    thresholds,
    priceCount,
    cheapestPrice,
    reloadPrices: loadPrices,
  };
}
