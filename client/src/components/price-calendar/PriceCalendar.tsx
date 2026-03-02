import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, addMonths, subMonths, isSameDay, isBefore, isAfter, startOfDay } from "date-fns";
import posthog from "posthog-js";
import { motion, AnimatePresence } from "framer-motion";

// Initialize PostHog if not already inside the browser context
if (typeof window !== "undefined" && !posthog.__loaded) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY || "phc_placeholder_key", {
        api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
        autocapture: false,
    });
}

import { USD_TO_THB_RATE as USD_TO_THB } from "@/const";
import {
    type PriceTier,
    TIER_STYLES,
    WEEKDAYS,
    MONTHS,
    buildCalendarGrid,
    getTier,
    isInRange,
} from "./priceCalendar.utils";
import { useCalendarPrices } from "./useCalendarPrices";

type PriceCalendarProps = {
    origin: string;
    destination: string;
    calendarMode: "depart" | "return";
    selectedDepart?: Date;
    selectedReturn?: Date;
    onSelectDate: (date: Date | undefined) => void;
    onCheapestPrice?: (price: number | null) => void;
    todayDate: Date;
};

export default function PriceCalendar({
    origin,
    destination,
    calendarMode,
    selectedDepart,
    selectedReturn,
    onSelectDate,
    onCheapestPrice,
    todayDate,
}: PriceCalendarProps) {
    const [baseMonth, setBaseMonth] = useState<Date>(() => {
        if (calendarMode === "return" && selectedDepart) return startOfMonth(selectedDepart);
        if (selectedDepart) return startOfMonth(selectedDepart);
        return startOfMonth(todayDate);
    });
    const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

    const leftMonth = baseMonth;
    const rightMonth = addMonths(baseMonth, 1);

    const { priceMap, loading, thresholds, enrichedData, priceCount } = useCalendarPrices({
        origin,
        destination,
        leftMonth,
        rightMonth,
        onCheapestPrice,
    });

    const today = startOfDay(todayDate);
    const disabledBefore = calendarMode === "return" && selectedDepart ? startOfDay(selectedDepart) : today;

    const handlePrev = useCallback(() => setBaseMonth(prev => subMonths(prev, 1)), []);
    const handleNext = useCallback(() => setBaseMonth(prev => addMonths(prev, 1)), []);

    const canGoPrev = !isBefore(subMonths(baseMonth, 1), startOfMonth(today));

    /* Custom range helper for hover logic */
    const inHoverRange = useCallback((day: Date) => {
        if (selectedDepart && selectedReturn) return isInRange(day, selectedDepart, selectedReturn);
        if (selectedDepart && hoveredDay && !selectedReturn && isAfter(hoveredDay, selectedDepart)) {
            return isAfter(day, selectedDepart) && isBefore(day, hoveredDay);
        }
        return false;
    }, [selectedDepart, selectedReturn, hoveredDay]);

    const renderMonthGrid = (monthDate: Date, isNext = false) => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const cells = buildCalendarGrid(year, month);

        // Chunk into rows of 7
        const rows: (Date | null)[][] = [];
        for (let i = 0; i < cells.length; i += 7) {
            rows.push(cells.slice(i, i + 7));
        }

        return (
            <div className="w-full relative">
                <h3 className="text-center text-[15px] font-bold text-gray-900 mb-2 h-[44px] flex items-center justify-center">
                    {MONTHS[month]} {year}
                </h3>
                {/* Navigation buttons inside the grid headers */}
                <button
                    onClick={handlePrev}
                    disabled={!canGoPrev}
                    /* On mobile, this always shows. On desktop, it only shows on the left grid (!isNext) */
                    className={`absolute left-0 top-[6px] w-[32px] h-[32px] rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:hover:bg-gray-50 transition-colors z-10 ${isNext ? "md:hidden" : ""}`}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={handleNext}
                    /* On mobile, this always shows. On desktop, it only shows on the right grid (isNext) */
                    className={`absolute right-0 top-[6px] w-[32px] h-[32px] rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 transition-colors z-10 ${!isNext ? "md:hidden" : ""}`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr>
                            {WEEKDAYS.map((wd, i) => (
                                <th key={i} className="text-[12px] text-gray-400 pb-2 font-semibold uppercase tracking-wider h-[32px]">
                                    {wd}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => {
                                    if (!cell) return <td key={`empty-${rIdx}-${cIdx}`} className="p-0" />;

                                    const dateKey = format(cell, "yyyy-MM-dd");
                                    const enriched = enrichedData[dateKey];
                                    const priceUsd = enriched ? enriched.price : null;
                                    const isEstimated = enriched ? enriched.isEstimated : false;

                                    const thbPrice = priceUsd ? Math.round(priceUsd * USD_TO_THB) : null;
                                    const tier: PriceTier = thbPrice ? getTier(thbPrice, thresholds) : "none";

                                    const isDisabled = isBefore(cell, disabledBefore);
                                    const isSelectedDepart = selectedDepart && isSameDay(cell, selectedDepart);
                                    const isSelectedReturn = selectedReturn && isSameDay(cell, selectedReturn);
                                    const isSelected = isSelectedDepart || isSelectedReturn;

                                    const inRange = inHoverRange(cell);

                                    const styles = TIER_STYLES[tier];
                                    const currentBg = isEstimated && !isSelected ? styles.estBg : styles.bg;
                                    const currentText = isEstimated && !isSelected ? styles.estText : styles.text;

                                    // Date range visual logic
                                    const isRangeStart = isSelectedDepart && selectedReturn;
                                    const isRangeEnd = isSelectedReturn && selectedDepart;

                                    if (isDisabled) {
                                        return (
                                            <td key={dateKey} className="p-[2px]">
                                                <div className="w-[40px] h-[40px] md:w-[40px] md:h-[40px] mx-auto flex flex-col items-center justify-center rounded-lg text-gray-300 pointer-events-none">
                                                    <span className="font-bold text-[14px]">{cell.getDate()}</span>
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={dateKey} className="p-[2px] relative">
                                            {/* Range connecting background spanning full cell width */}
                                            {inRange && <div className="absolute inset-y-0.5 -inset-x-0.5 bg-gray-100/80 -z-10" />}
                                            {(isRangeStart || (isSelectedDepart && hoveredDay && isAfter(hoveredDay, selectedDepart))) && isSameDay(cell, selectedDepart) && (
                                                <div className="absolute inset-y-0.5 right-[-2px] left-1/2 bg-gray-100/80 -z-10" />
                                            )}
                                            {(isRangeEnd || (hoveredDay && isSameDay(cell, hoveredDay) && selectedDepart && isAfter(hoveredDay, selectedDepart) && !selectedReturn)) && isSameDay(cell, (selectedReturn || hoveredDay as Date)) && (
                                                <div className="absolute inset-y-0.5 left-[-2px] right-1/2 bg-gray-100/80 -z-10" />
                                            )}

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    onSelectDate(cell);
                                                    if (tier === "cheapest" || tier === "cheap") {
                                                        posthog.capture("green_date_clicked", {
                                                            origin, destination, date: format(cell, "yyyy-MM-dd"), price: priceUsd, is_estimated: isEstimated
                                                        });
                                                    }
                                                }}
                                                onMouseEnter={() => setHoveredDay(cell)}
                                                onMouseLeave={() => setHoveredDay(null)}
                                                className={`w-[40px] h-[40px] md:w-[40px] md:h-[40px] mx-auto flex flex-col items-center justify-center gap-0 rounded-lg transition-colors border border-transparent ${isSelected ? "shadow-md z-10 relative" : ""
                                                    }`}
                                                style={{
                                                    backgroundColor: isSelected ? "#5B0EA6" : (inRange && tier === "none" ? "transparent" : currentBg),
                                                    color: isSelected ? "#ffffff" : currentText,
                                                }}
                                            >
                                                <span className={`text-[14px] leading-tight ${isSelected ? "font-extrabold" : "font-bold"}`}>
                                                    {cell.getDate()}
                                                </span>
                                                {thbPrice ? (
                                                    <span className="text-[10px] font-mono opacity-80 leading-none">
                                                        {(thbPrice / 1000).toFixed(1)}k
                                                    </span>
                                                ) : null}
                                            </motion.button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="w-full bg-white overflow-hidden flex flex-col font-sans">

            {/* ─── Loading Overlay ─── */}
            {loading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-20">
                    <div className="flex items-center gap-2 bg-white/80 shadow-sm px-4 py-1.5 rounded-full font-medium text-sm text-gray-500 backdrop-blur-sm">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: '#5B0EA6', borderTopColor: 'transparent' }} />
                        Loading prices...
                    </div>
                </div>
            )}

            {/* ─── Calendar Grid ─── */}
            <div className="flex gap-6 relative">
                <div className="flex-1 min-w-0">
                    {renderMonthGrid(leftMonth, false)}
                </div>
                <div className="flex-1 min-w-0 hidden md:block">
                    {renderMonthGrid(rightMonth, true)}
                </div>
            </div>

            {/* ─── Bottom Legend ─── */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#b3f9c2" }} />
                        <span className="text-[11px] font-bold text-gray-700">Cheapest</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#fcb773" }} />
                        <span className="text-[11px] font-bold text-gray-700">Average</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#fba09d" }} />
                        <span className="text-[11px] font-bold text-gray-700">Expensive</span>
                    </div>
                </div>

                {/* Selection Info / Fallback feedback */}
                <AnimatePresence mode="popLayout">
                    {selectedDepart ? (
                        <motion.div
                            key="selected-dates"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="px-3 py-1.5 rounded-lg text-white text-[12px] font-bold whitespace-nowrap shadow-md" style={{ background: '#5B0EA6' }}
                        >
                            {selectedReturn ? (
                                `${format(selectedDepart, "MMM d")} – ${format(selectedReturn, "MMM d")}`
                            ) : (
                                `${format(selectedDepart, "MMM d")} (Select return)`
                            )}
                        </motion.div>
                    ) : (
                        priceCount > 0 && priceCount < 10 && (
                            <motion.div
                                key="limited-data"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[12px] font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100"
                            >
                                Prices estimated from nearby dates
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
