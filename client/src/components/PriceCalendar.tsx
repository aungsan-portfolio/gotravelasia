import { useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameDay, isBefore, isAfter, startOfDay, addDays } from "date-fns";
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

type PriceEntry = {
  price: number;
  origin: string;
  destination: string;
  airline?: string;
  departure_at?: string;
  return_at?: string;
  transfers?: number;
  flight_number?: number;
  expires_at?: string;
};

type PriceMap = Record<string, number>;

type PriceTier = "cheapest" | "cheap" | "mid" | "expensive" | "none";

// Soft pastel colors — Custom theme values
const TIER_STYLES: Record<PriceTier, { bg: string; text: string; estBg: string; estText: string }> = {
  cheapest: { bg: "#b3f9c2", text: "#054d14", estBg: "#e8fbef", estText: "#9ca3af" },
  cheap: { bg: "#c6f6d5", text: "#065f16", estBg: "#e8fbef", estText: "#9ca3af" },
  mid: { bg: "#fcb773", text: "#5b2601", estBg: "#fef3e2", estText: "#9ca3af" },
  expensive: { bg: "#fba09d", text: "#680d08", estBg: "#feeaea", estText: "#9ca3af" },
  none: { bg: "#f3f4f6", text: "#6b7280", estBg: "#f3f4f6", estText: "#9ca3af" },
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function buildCalendarGrid(year: number, month: number) {
  const firstDay = startOfMonth(new Date(year, month));
  const lastDay = endOfMonth(new Date(year, month));
  const startDow = getDay(firstDay);
  const daysInMonth = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type Thresholds = { p33: number; p66: number; min: number };

function computeThresholds(priceMap: PriceMap): Thresholds | null {
  const thbPrices = Object.values(priceMap)
    .map(usd => Math.round(usd * USD_TO_THB))
    .sort((a, b) => a - b);

  if (thbPrices.length === 0) return null;

  const min = thbPrices[0];

  if (thbPrices.length <= 2) {
    return { p33: Math.round(thbPrices[thbPrices.length - 1] * 1.05), p66: Math.round(thbPrices[thbPrices.length - 1] * 1.15), min };
  }

  const p33 = thbPrices[Math.floor(thbPrices.length / 3)];
  const p66 = thbPrices[Math.floor((thbPrices.length * 2) / 3)];
  return { p33, p66, min };
}

function getTier(thbPrice: number, thresholds: Thresholds | null): PriceTier {
  if (!thresholds) return "none";
  if (thbPrice <= thresholds.min) return "cheapest";
  if (thbPrice <= thresholds.p33) return "cheap";
  if (thbPrice <= thresholds.p66) return "mid";
  return "expensive";
}

function fillGaps(priceMap: PriceMap, start: Date, end: Date): Record<string, { price: number; isEstimated: boolean }> {
  const result: Record<string, { price: number; isEstimated: boolean }> = {};

  const realDatesStr = Object.keys(priceMap).sort();
  if (realDatesStr.length === 0) return result;

  const realPrices = Object.values(priceMap).sort((a, b) => a - b);
  const minPrice = realPrices[0];
  const medianPrice = realPrices[Math.floor(realPrices.length / 2)];

  let curr = start;
  while (curr <= end) {
    const dateStr = format(curr, "yyyy-MM-dd");

    if (priceMap[dateStr] !== undefined) {
      result[dateStr] = { price: priceMap[dateStr], isEstimated: false };
    } else {
      let leftDate = null;
      let rightDate = null;

      for (let i = realDatesStr.length - 1; i >= 0; i--) {
        if (realDatesStr[i] < dateStr) { leftDate = realDatesStr[i]; break; }
      }
      for (let i = 0; i < realDatesStr.length; i++) {
        if (realDatesStr[i] > dateStr) { rightDate = realDatesStr[i]; break; }
      }

      if (leftDate && rightDate) {
        const leftMs = new Date(leftDate).getTime();
        const rightMs = new Date(rightDate).getTime();
        const currMs = curr.getTime();
        const fraction = (currMs - leftMs) / (rightMs - leftMs);
        const estPrice = priceMap[leftDate] + (priceMap[rightDate] - priceMap[leftDate]) * fraction;
        result[dateStr] = { price: estPrice, isEstimated: true };
      } else if (medianPrice !== undefined) {
        result[dateStr] = { price: medianPrice, isEstimated: true };
      } else {
        result[dateStr] = { price: minPrice, isEstimated: true };
      }
    }

    curr = addDays(curr, 1);
  }

  return result;
}

function isInRange(day: Date, start?: Date, end?: Date): boolean {
  if (!start || !end) return false;
  const d = startOfDay(day);
  const s = startOfDay(start);
  const e = startOfDay(end);
  return isAfter(d, s) && isBefore(d, e);
}

type PriceCalendarProps = {
  origin: string;
  destination: string;
  calendarMode: "depart" | "return";
  selectedDepart?: Date;
  selectedReturn?: Date;
  onSelectDate: (date: Date | undefined) => void;
  todayDate: Date;
};

export default function PriceCalendar({
  origin,
  destination,
  calendarMode,
  selectedDepart,
  selectedReturn,
  onSelectDate,
  todayDate,
}: PriceCalendarProps) {
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [baseMonth, setBaseMonth] = useState<Date>(() => {
    if (calendarMode === "return" && selectedDepart) return startOfMonth(selectedDepart);
    if (selectedDepart) return startOfMonth(selectedDepart);
    return startOfMonth(todayDate);
  });


  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const leftMonth = baseMonth;
  const rightMonth = addMonths(baseMonth, 1);

  const leftStr = format(leftMonth, "yyyy-MM");
  const rightStr = format(rightMonth, "yyyy-MM");
  const prevStr = format(subMonths(leftMonth, 1), "yyyy-MM"); // Fetch 1 prev month to anchor gap fill
  const nextStr = format(addMonths(rightMonth, 1), "yyyy-MM"); // Fetch 1 next month to anchor gap fill

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

    // Parallel fetch — much faster than sequential .then() chain
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
  const priceCount = Object.keys(priceMap).length;

  const enrichedData = useMemo(() => {
    return fillGaps(priceMap, leftMonth, endOfMonth(rightMonth));
  }, [priceMap, leftMonth, rightMonth]);

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
      <div className="w-full">
        <h3 className="text-center text-[13px] font-bold text-gray-900 mb-3 capitalize">
          {MONTHS[month]} {year}
        </h3>
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              {WEEKDAYS.map((wd, i) => (
                <th key={i} className="text-[10px] text-gray-400 pb-2 font-semibold uppercase tracking-wider">
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
                      <td key={dateKey} className="p-0.5">
                        <div className="w-full aspect-square flex flex-col items-center justify-center rounded-lg text-gray-300 pointer-events-none">
                          <span className="font-bold text-[12px]">{cell.getDate()}</span>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={dateKey} className="p-0.5 relative">
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
                        className={`w-full aspect-square flex flex-col items-center justify-center gap-0 rounded-lg text-xs transition-colors border border-transparent ${isSelected ? "shadow-md z-10 relative" : ""
                          }`}
                        style={{
                          backgroundColor: isSelected ? "#5B0EA6" : (inRange && tier === "none" ? "transparent" : currentBg),
                          color: isSelected ? "#ffffff" : currentText,
                        }}
                      >
                        <span className={`text-[12px] ${isSelected ? "font-extrabold" : "font-bold"}`}>
                          {cell.getDate()}
                        </span>
                        {thbPrice ? (
                          <span className="text-[9px] font-mono opacity-80 leading-none">
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
    <div className="w-[700px] max-w-[90vw] bg-white rounded-2xl overflow-hidden flex flex-col p-4 font-sans">


      {/* ─── Month navigation row ─── */}
      <div className="flex justify-between items-center mb-4 relative">
        {/* Navigation buttons */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 disabled:opacity-30 disabled:hover:bg-gray-50 transition-colors z-10 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-white/80 px-4 py-1.5 rounded-full font-medium text-sm text-gray-500 backdrop-blur-sm z-20">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: '#5B0EA6', borderTopColor: 'transparent' }} />
              Loading prices...
            </div>
          </div>
        ) : null}

        <button
          onClick={handleNext}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 transition-colors z-10 shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Dual Calendar Grid ─── */}
      <div className="flex gap-3 relative mt-[-48px] pt-[48px] overflow-x-auto snap-x hide-scrollbar">
        <div className="min-w-full md:min-w-[calc(50%-8px)] snap-start">
          {renderMonthGrid(leftMonth, false)}
        </div>
        <div className="min-w-full md:min-w-[calc(50%-8px)] snap-start hidden md:block">
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
