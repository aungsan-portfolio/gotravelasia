import { useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, isValid, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameDay, isBefore, startOfDay } from "date-fns";

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

const TIER_BG: Record<PriceTier, string> = {
  cheap: "bg-green-300",
  mid: "bg-amber-400",
  expensive: "bg-pink-400",
  none: "bg-gray-100",
};

const TIER_TEXT: Record<PriceTier, string> = {
  cheap: "text-gray-800",
  mid: "text-gray-800",
  expensive: "text-white",
  none: "text-gray-400",
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
        <div className="text-center font-bold text-gray-800 text-base mb-3">
          {format(monthDate, "MMMM yyyy")}
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {rows.map((row, ri) =>
            row.map((cell, ci) => {
              if (!cell) {
                return <div key={`${ri}-${ci}`} className="h-11" />;
              }

              const dateKey = format(cell, "yyyy-MM-dd");
              const priceUsd = priceMap[dateKey];
              const thbPrice = priceUsd ? Math.round(priceUsd * USD_TO_THB) : null;
              const tier: PriceTier = thbPrice ? getTier(thbPrice) : "none";

              const isDisabled = isBefore(cell, disabledBefore);
              const isSelectedDepart = selectedDepart && isSameDay(cell, selectedDepart);
              const isSelectedReturn = selectedReturn && isSameDay(cell, selectedReturn);
              const isSelected = isSelectedDepart || isSelectedReturn;

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectDate(cell)}
                  className={`
                    h-11 rounded-lg flex items-center justify-center text-sm font-semibold
                    transition-all duration-150 select-none
                    ${isSelected
                      ? "bg-gray-800 text-white ring-2 ring-gray-900 ring-offset-1"
                      : isDisabled
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : `${TIER_BG[tier]} ${TIER_TEXT[tier]} hover:scale-105 hover:shadow-md cursor-pointer active:scale-95`
                    }
                  `}
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
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {loading && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium">Loading prices...</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleNext}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-6">
        {renderMonth(leftMonth)}
        {renderMonth(rightMonth)}
      </div>

      {Object.keys(priceMap).length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-14 h-7 rounded-md bg-green-300 text-gray-800 text-xs font-bold flex items-center justify-center">
              ฿{TIER_CHEAP.toLocaleString()}+
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-14 h-7 rounded-md bg-amber-400 text-gray-800 text-xs font-bold flex items-center justify-center">
              ฿{TIER_MID.toLocaleString()}+
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-14 h-7 rounded-md bg-pink-400 text-white text-xs font-bold flex items-center justify-center">
              ฿1982+
            </span>
          </div>
          <span className="text-xs text-gray-400 ml-1">
            Estimated prices for return flights
          </span>
        </div>
      )}
    </div>
  );
}
