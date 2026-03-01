/**
 * useCalendarPrices.ts
 * Custom hook to fetch and manage price calendar data
 */
import { useState, useCallback, useEffect, useMemo } from "react";
import { startOfMonth, addMonths, subMonths, endOfMonth } from "date-fns";
import { fillGaps } from "./priceCalendar.utils";
import type { PriceMap, PriceEntry } from "./priceCalendar.utils";

type UseCalendarPricesProps = {
    origin: string;
    destination: string;
    calendarMode: "depart" | "return";
    selectedDepart?: Date;
    todayDate: Date;
};

export function useCalendarPrices({
    origin,
    destination,
    calendarMode,
    selectedDepart,
    todayDate,
}: UseCalendarPricesProps) {
    const [priceMap, setPriceMap] = useState<PriceMap>({});
    const [loading, setLoading] = useState(false);
    const [baseMonth, setBaseMonth] = useState<Date>(() => {
        if (calendarMode === "return" && selectedDepart) return startOfMonth(selectedDepart);
        if (selectedDepart) return startOfMonth(selectedDepart);
        return startOfMonth(todayDate);
    });

    const leftMonth = baseMonth;
    const rightMonth = addMonths(baseMonth, 1);

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
                const params = new URLSearchParams({ origin, destination, month: mo, currency: "usd" });
                const res = await fetch(`/api/calendar-prices?${params}`);
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

    const enrichedData = useMemo(() => {
        return fillGaps(priceMap, leftMonth, endOfMonth(rightMonth));
    }, [priceMap, leftMonth, rightMonth]);

    const priceCount = Object.keys(priceMap).length;

    const handlePrev = useCallback(() => setBaseMonth(prev => subMonths(prev, 1)), []);
    const handleNext = useCallback(() => setBaseMonth(prev => addMonths(prev, 1)), []);

    return {
        priceMap,
        enrichedData,
        loading,
        baseMonth,
        leftMonth,
        rightMonth,
        priceCount,
        handlePrev,
        handleNext,
    };
}
