import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameDay, isBefore, startOfDay } from "date-fns";

const USD_TO_THB = 34;

const TIER_CHEAP = 1485;
const TIER_MID = 1600;

type PriceEntry = {
  value: number;
  price?: number;
};

type PriceMap = Record<string, number>;

type PriceTier = "cheap" | "mid" | "expensive" | "none";

function getTier(thbPrice: number): PriceTier {
  if (thbPrice <= TIER_CHEAP) return "cheap";
  if (thbPrice <= TIER_MID) return "mid";
  return "expensive";
}

const TIER_STYLES: Record<PriceTier, { bg: string; text: string }> = {
  cheap: { bg: "#86efac", text: "#1f2937" },
  mid: { bg: "#fbbf24", text: "#1f2937" },
  expensive: { bg: "#f472b6", text: "#ffffff" },
  none: { bg: "#fbbf24", text: "#1f2937" },
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

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

  const leftMonth = baseMonth;
  const rightMonth = addMonths(baseMonth, 1);

  const leftStr = format(leftMonth, "yyyy-MM");
  const rightStr = format(rightMonth, "yyyy-MM");

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
          const price = e.value || e.price || 0;
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
    Promise.all([fetchPrices(leftStr), fetchPrices(rightStr)]).then(([m1, m2]) => {
      if (!cancelled) {
        setPriceMap({ ...m1, ...m2 });
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [origin, destination, leftStr, rightStr, fetchPrices]);

  const today = startOfDay(todayDate);
  const disabledBefore = calendarMode === "return" && selectedDepart ? startOfDay(selectedDepart) : today;

  const handlePrev = () => setBaseMonth(prev => subMonths(prev, 1));
  const handleNext = () => setBaseMonth(prev => addMonths(prev, 1));

  const canGoPrev = !isBefore(subMonths(baseMonth, 1), startOfMonth(today));

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const cells = buildCalendarGrid(year, month);
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return (
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-7 gap-[3px] mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wide py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-[3px]">
          {rows.map((row, ri) =>
            row.map((cell, ci) => {
              if (!cell) {
                return <div key={`${ri}-${ci}`} className="h-[46px]" />;
              }

              const dateKey = format(cell, "yyyy-MM-dd");
              const priceUsd = priceMap[dateKey];
              const thbPrice = priceUsd ? Math.round(priceUsd * USD_TO_THB) : null;
              const tier: PriceTier = thbPrice ? getTier(thbPrice) : "none";

              const isDisabled = isBefore(cell, disabledBefore);
              const isSelectedDepart = selectedDepart && isSameDay(cell, selectedDepart);
              const isSelectedReturn = selectedReturn && isSameDay(cell, selectedReturn);
              const isSelected = isSelectedDepart || isSelectedReturn;

              const styles = TIER_STYLES[tier];

              if (isDisabled) {
                return (
                  <div
                    key={dateKey}
                    className="h-[46px] rounded-lg flex items-center justify-center text-sm text-gray-300"
                  >
                    {cell.getDate()}
                  </div>
                );
              }

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelectDate(cell)}
                  className="h-[46px] rounded-lg flex items-center justify-center text-sm font-semibold transition-transform duration-100 select-none hover:scale-105 cursor-pointer active:scale-95"
                  style={
                    isSelected
                      ? { backgroundColor: "#1f2937", color: "#ffffff", boxShadow: "0 0 0 2px #3b82f6, 0 0 0 4px #dbeafe" }
                      : { backgroundColor: styles.bg, color: styles.text }
                  }
                >
                  {cell.getDate()}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-16">
          <span className="text-base font-bold text-gray-800">
            {format(leftMonth, "MMMM yyyy")}
          </span>
          <span className="text-base font-bold text-gray-800">
            {format(rightMonth, "MMMM yyyy")}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <span className="text-base">ဈေးနှုန်းများ ရှာနေပါတယ်... ⏳</span>
        </div>
      ) : (
        <div className="flex gap-8">
          {renderMonth(leftMonth)}
          {renderMonth(rightMonth)}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-200">
        <span
          className="inline-flex items-center justify-center h-[28px] px-2.5 rounded-md text-xs font-bold"
          style={{ backgroundColor: "#86efac", color: "#1f2937" }}
        >
          B{TIER_CHEAP.toLocaleString()}+
        </span>
        <span
          className="inline-flex items-center justify-center h-[28px] px-2.5 rounded-md text-xs font-bold"
          style={{ backgroundColor: "#fbbf24", color: "#1f2937" }}
        >
          B{TIER_MID.toLocaleString()}+
        </span>
        <span
          className="inline-flex items-center justify-center h-[28px] px-2.5 rounded-md text-xs font-bold"
          style={{ backgroundColor: "#f472b6", color: "#ffffff" }}
        >
          B1982+
        </span>
        <span className="text-xs text-gray-400 ml-1">
          Estimated prices for return flights
        </span>
      </div>
    </div>
  );
}
