import { useState, useCallback, useEffect, useMemo } from "react";
import { addMonths, subMonths, endOfMonth } from "date-fns";
import { fillGaps, computeThresholds } from "./priceCalendar.utils.js";
import type { PriceMap, PriceEntry } from "./priceCalendar.utils.js";

type UseCalendarPricesProps = {
    origin: string;
    destination: string;
    leftMonth: Date;
    rightMonth: Date;
    onCheapestPrice?: (price: number | null) => void;
};

export function useCalendarPrices({
    origin,
    destination,
    leftMonth,
    rightMonth,
    onCheapestPrice,
}: UseCalendarPricesProps) {
    const [priceMap, setPriceMap] = useState<PriceMap>({});
    const [loading, setLoading] = useState(false);

    // Temporary internal format helper
    const formatYMD = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    };

    const leftStr = formatYMD(leftMonth);
    const rightStr = formatYMD(rightMonth);
    const prevStr = formatYMD(subMonths(leftMonth, 1)); // Fetch 1 prev month to anchor gap fill
    const nextStr = formatYMD(addMonths(rightMonth, 1)); // Fetch 1 next month to anchor gap fill

    const fetchPrices = useCallback(
        async (mo: string) => {
            if (origin === destination) return {};
            try {
                const params = new URLSearchParams({ type: "calendar", origin, destination, month: mo, currency: "usd" });
                const res = await fetch(`/api/flights?${params}`);
                if (!res.ok) return {};
                const data = await res.json();
                if (!data.data) return {};
                const map: PriceMap = {};
                Object.entries(data.data).forEach(([dateStr, entry]) => {
                    const e = entry as PriceEntry;
                    const price = e.price || 0;
                    if (price > 0) map[dateStr] = price;
                });
                return map;
            } catch {
                return {};
            }
        },
        [origin, destination]
    );

    useEffect(() => {
        if (origin === destination) { setPriceMap({}); return; }
        let cancelled = false;
        setLoading(true);

        // Parallel fetch
        Promise.all([
            fetchPrices(prevStr),
            fetchPrices(leftStr),
            fetchPrices(rightStr),
            fetchPrices(nextStr),
        ])
            .then(([m0, m1, m2, m3]) => {
                if (!cancelled) setPriceMap({ ...m0, ...m1, ...m2, ...m3 });
            })
            .catch(() => { /* individual fetchPrices already return {} on error */ })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [origin, destination, leftStr, rightStr, prevStr, nextStr, fetchPrices]);

    const thresholds = useMemo(() => computeThresholds(priceMap), [priceMap]);

    useEffect(() => {
        if (!onCheapestPrice) return;
        const prices = Object.values(priceMap).filter((p) => Number.isFinite(p) && p > 0);
        if (!prices.length) {
            onCheapestPrice(null);
            return;
        }
        onCheapestPrice(Math.min(...prices));
    }, [priceMap, onCheapestPrice]);

    const enrichedData = useMemo(() => {
        return fillGaps(priceMap, leftMonth, endOfMonth(rightMonth));
    }, [priceMap, leftMonth, rightMonth]);

    const priceCount = Object.keys(priceMap).length;

    return {
        priceMap,
        enrichedData,
        loading,
        thresholds,
        priceCount,
    };
}
