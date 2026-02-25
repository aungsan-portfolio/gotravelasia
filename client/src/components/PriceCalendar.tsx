import { useEffect, useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameDay, isBefore, isAfter, startOfDay, addDays } from "date-fns";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";

const USD_TO_THB = 34;

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

// Using extremely subtle variants for estimated prices to blend invisibly
const TIER_STYLES: Record<PriceTier, { bg: string; text: string; estBg: string; estText: string }> = {
  cheapest: { bg: "#22c55e", text: "#ffffff", estBg: "#ecfdf5", estText: "#9ca3af" },
  cheap: { bg: "#86efac", text: "#1f2937", estBg: "#ecfdf5", estText: "#9ca3af" },
  mid: { bg: "#eab308", text: "#ffffff", estBg: "#fefce8", estText: "#9ca3af" },
  expensive: { bg: "#ec4899", text: "#ffffff", estBg: "#fdf4ff", estText: "#9ca3af" },
  none: { bg: "#f3f4f6", text: "#6b7280", estBg: "#f3f4f6", estText: "#9ca3af" },
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

function formatThb(val: number): string {
  if (val >= 10000) return `B${(val / 1000).toFixed(1)}k`;
  return `B${val.toLocaleString()}`;
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

/* ─── Range helper for dark highlight between depart ↔ return ─── */
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
  const captureEvent = usePostHogEvent();
  const [priceMap, setPriceMap] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [baseMonth, setBaseMonth] = useState<Date>(() => {
    if (calendarMode === "return" && selectedDepart) return startOfMonth(selectedDepart);
    if (selectedDepart) return startOfMonth(selectedDepart);
    return startOfMonth(todayDate);
  });

  /* ─── Skyscanner-style header states (visual MVP) ─── */
  const [activeTab, setActiveTab] = useState<"dates" | "weekend" | "month">("dates");
  const [departPrecision, setDepartPrecision] = useState<"exact" | "flexible">("exact");
  const [returnPrecision, setReturnPrecision] = useState<"exact" | "flexible">("exact");

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
    Promise.all([fetchPrices(leftStr), fetchPrices(rightStr)]).then(([m1, m2]) => {
      if (!cancelled) {
        setPriceMap({ ...m1, ...m2 });
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [origin, destination, leftStr, rightStr, fetchPrices]);

  const thresholds = useMemo(() => computeThresholds(priceMap), [priceMap]);
  const priceCount = Object.keys(priceMap).length;

  const enrichedData = useMemo(() => {
    return fillGaps(priceMap, leftMonth, endOfMonth(rightMonth));
  }, [priceMap, leftMonth, rightMonth]);

  const today = startOfDay(todayDate);
  const disabledBefore = calendarMode === "return" && selectedDepart ? startOfDay(selectedDepart) : today;

  const handlePrev = () => setBaseMonth(prev => subMonths(prev, 1));
  const handleNext = () => setBaseMonth(prev => addMonths(prev, 1));

  const canGoPrev = !isBefore(subMonths(baseMonth, 1), startOfMonth(today));

  /* ─── Render a single month grid ─── */
  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const cells = buildCalendarGrid(year, month);

    return (
      <div className="flex-1 min-w-0">
        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div
              key={i}
              className="text-center text-[12px] font-extrabold text-gray-800 uppercase"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-12" />;
            }

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

            const inRange = isInRange(cell, selectedDepart, selectedReturn);

            const styles = TIER_STYLES[tier];
            const currentBg = isEstimated && !isSelected ? styles.estBg : styles.bg;
            const currentText = isEstimated && !isSelected ? styles.estText : styles.text;

            // Range override: dark bg for dates between depart and return
            const rangeBg = inRange && !isSelected ? "#1f2937" : null;
            const rangeText = inRange && !isSelected ? "#ffffff" : null;

            if (isDisabled) {
              return (
                <div
                  key={dateKey}
                  className="h-12 rounded-md flex flex-col items-center justify-center text-sm text-gray-300 pointer-events-none"
                >
                  <span className="font-bold">{cell.getDate()}</span>
                </div>
              );
            }

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => {
                  onSelectDate(cell);
                  if (tier === "cheapest" || tier === "cheap") {
                    captureEvent("green_date_clicked", {
                      origin,
                      destination,
                      date: format(cell, "yyyy-MM-dd"),
                      price: priceUsd,
                      is_estimated: isEstimated
                    });
                  }
                }}
                className={[
                  "relative h-12 rounded-md",
                  "flex flex-col items-center justify-center",
                  "transition-transform duration-100 select-none",
                  "hover:scale-[1.03] active:scale-[0.98] cursor-pointer",
                  tier === "none" && !isSelected && !inRange ? "hover:bg-gray-100" : "",
                ].join(" ")}
                style={
                  isSelected
                    ? {
                      backgroundColor: "#111827",
                      color: "#ffffff",
                      boxShadow: "0 0 0 2px #111827",
                    }
                    : {
                      backgroundColor: rangeBg ?? currentBg,
                      color: rangeText ?? currentText,
                      border: inRange
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(17,24,39,0.06)",
                    }
                }
              >
                <span className={`text-[14px] ${isSelected ? "font-extrabold" : "font-bold"}`}>
                  {cell.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ─── Top row: Skyscanner tabs + exact/flexible dropdowns ─── */}
      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-5">
          {([
            { key: "dates" as const, label: "DATES" },
            { key: "weekend" as const, label: "WEEKEND" },
            { key: "month" as const, label: "MONTH" },
          ]).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setActiveTab(t.key);
                captureEvent("calendar_tab_clicked", { tab: t.key });
              }}
              className={`text-[12px] font-bold tracking-wide pb-2 border-b-2 transition-colors ${activeTab === t.key
                ? "text-gray-900 border-gray-900"
                : "text-gray-400 border-transparent hover:text-gray-700"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[12px] text-gray-700">
            <span className="font-semibold">Departure</span>
            <select
              className="text-[12px] font-semibold text-blue-600 bg-transparent outline-none cursor-pointer"
              value={departPrecision}
              onChange={(e) => {
                setDepartPrecision(e.target.value as "exact" | "flexible");
                captureEvent("calendar_precision_changed", { type: "depart", value: e.target.value });
              }}
            >
              <option value="exact">exact</option>
              <option value="flexible">flexible</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-[12px] text-gray-700">
            <span className="font-semibold">Return</span>
            <select
              className="text-[12px] font-semibold text-blue-600 bg-transparent outline-none cursor-pointer"
              value={returnPrecision}
              onChange={(e) => {
                setReturnPrecision(e.target.value as "exact" | "flexible");
                captureEvent("calendar_precision_changed", { type: "return", value: e.target.value });
              }}
            >
              <option value="exact">exact</option>
              <option value="flexible">flexible</option>
            </select>
          </label>
        </div>
      </div>

      {/* ─── Month navigation row ─── */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-24">
          <div className="text-[16px] font-extrabold text-gray-900">
            {format(leftMonth, "MMMM yyyy")}
          </div>
          <div className="text-[16px] font-extrabold text-gray-900">
            {format(rightMonth, "MMMM yyyy")}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ─── Calendar grid ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <span className="text-base">ဈေးနှုန်းများ ရှာနေပါတယ်... ⏳</span>
        </div>
      ) : (
        <div className="flex gap-10 px-3 pb-3">
          {renderMonth(leftMonth)}
          {renderMonth(rightMonth)}
        </div>
      )}

      {/* ─── Legend ─── */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center justify-center h-[28px] px-3 rounded-md text-xs font-bold"
            style={{ backgroundColor: "#22c55e", color: "#ffffff" }}
          >
            Cheapest
          </span>
          <span
            className="inline-flex items-center justify-center h-[28px] px-3 rounded-md text-xs font-bold"
            style={{ backgroundColor: "#eab308", color: "#ffffff" }}
          >
            Average
          </span>
          <span
            className="inline-flex items-center justify-center h-[28px] px-3 rounded-md text-xs font-bold"
            style={{ backgroundColor: "#ec4899", color: "#ffffff" }}
          >
            Expensive
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5 flex flex-col gap-0.5">
          <span>Some prices are estimated based on nearby real data.</span>
          {(priceCount > 0 && priceCount < 5) && (
            <span className="text-orange-500 font-medium">Limited real data for this route</span>
          )}
        </p>
      </div>
    </div>
  );
}
