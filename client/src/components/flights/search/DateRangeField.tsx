// components/flights/search/DateRangeField.tsx
// Phase 2: react-day-picker v8 range/single popover

import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import type { TripType } from "@/features/flights/search/flightSearch.types";
import { formatDateLabel } from "@/features/flights/search/flightSearch.utils";

interface Props {
  tripType: TripType;
  departDate: string | null;
  returnDate: string | null;
  onDepartChange: (v: string | null) => void;
  onReturnChange: (v: string | null) => void;
}

function toDate(iso: string | null): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const DAY_CLS = {
  root:            "rdp-gta",
  months:          "flex gap-6",
  month:           "space-y-2",
  caption:         "flex items-center justify-between px-1",
  caption_label:   "text-sm font-bold text-neutral-950",
  nav:             "flex items-center gap-1",
  nav_button:      "rounded-md p-1 hover:bg-neutral-100 text-neutral-500",
  table:           "w-full border-collapse",
  head_row:        "flex",
  head_cell:       "w-9 text-center text-[11px] font-bold text-neutral-400 uppercase tracking-widest",
  row:             "flex mt-1",
  cell:            "w-9 h-9 text-center",
  day:             "w-9 h-9 rounded-full text-sm font-medium transition-colors hover:bg-yellow-100 text-neutral-900",
  day_selected:    "!bg-yellow-400 !text-neutral-950 font-bold",
  day_range_start: "!bg-yellow-400 !text-neutral-950 font-bold rounded-full",
  day_range_end:   "!bg-yellow-400 !text-neutral-950 font-bold rounded-full",
  day_range_middle:"bg-yellow-50 rounded-none text-neutral-900",
  day_outside:     "text-neutral-300",
  day_disabled:    "text-neutral-200 cursor-not-allowed hover:bg-transparent",
  day_today:       "border border-yellow-400",
};

export function DateRangeField({
  tripType,
  departDate,
  returnDate,
  onDepartChange,
  onReturnChange,
}: Props) {
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  const isRoundTrip       = tripType === "roundtrip";

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const range: DateRange = {
    from: toDate(departDate),
    to:   isRoundTrip ? toDate(returnDate) : undefined,
  };

  function handleRangeSelect(sel: DateRange | undefined) {
    if (!sel) return;
    onDepartChange(sel.from ? toIso(sel.from) : null);
    onReturnChange(sel.to   ? toIso(sel.to)   : null);
    if (sel.from && sel.to) setOpen(false);
  }

  function handleSingleSelect(day: Date | undefined) {
    onDepartChange(day ? toIso(day) : null);
    if (day) setOpen(false);
  }

  function quickSet(days: number) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    onDepartChange(toIso(d));
    if (!isRoundTrip) setOpen(false);
  }

  const departLabel = departDate ? formatDateLabel(departDate) : "Depart";
  const returnLabel = returnDate ? formatDateLabel(returnDate) : "Return";

  return (
    <div ref={ref} className="relative">

      {/* ── Trigger button ─────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Select travel dates"
        className={[
          "flex min-w-[175px] items-center gap-1.5 rounded-md px-2 py-1.5 text-left",
          "transition-colors hover:bg-neutral-50",
          open ? "bg-neutral-50" : "",
        ].join(" ")}
      >
        <span className={departDate ? "text-sm font-semibold text-neutral-950" : "text-sm text-neutral-400"}>
          {departLabel}
        </span>
        {isRoundTrip && (
          <>
            <span className="text-neutral-300">–</span>
            <span className={returnDate ? "text-sm font-semibold text-neutral-950" : "text-sm text-neutral-400"}>
              {returnLabel}
            </span>
          </>
        )}
        <svg className="ml-auto shrink-0 text-neutral-400" width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="1" y="2.5" width="12" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M1 5.5h12M4 1v3M10 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>

      {/* ── Popover ────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Date picker"
          className="absolute left-0 top-full z-50 mt-2 rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-black/10"
          style={{ minWidth: isRoundTrip ? 640 : 320 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <span className="text-sm font-bold text-neutral-950">
              {isRoundTrip ? "Select departure & return dates" : "Select departure date"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Calendar */}
          <div className="p-4">
            {isRoundTrip ? (
              <DayPicker
                mode="range"
                selected={range}
                onSelect={handleRangeSelect}
                numberOfMonths={2}
                disabled={{ before: today }}
                showOutsideDays={false}
                classNames={DAY_CLS}
              />
            ) : (
              <DayPicker
                mode="single"
                selected={toDate(departDate)}
                onSelect={handleSingleSelect}
                disabled={{ before: today }}
                showOutsideDays={false}
                classNames={DAY_CLS}
              />
            )}
          </div>

          {/* Quick selects */}
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-4 py-3">
            <span className="text-xs font-semibold text-neutral-400">Quick:</span>
            {[
              { label: "+1 week",   days: 7  },
              { label: "+2 weeks",  days: 14 },
              { label: "+1 month",  days: 30 },
              { label: "+3 months", days: 90 },
            ].map(({ label, days }) => (
              <button
                key={days}
                type="button"
                onClick={() => quickSet(days)}
                className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-600 transition-colors hover:border-yellow-400 hover:bg-yellow-50"
              >
                {label}
              </button>
            ))}
            {(departDate || returnDate) && (
              <button
                type="button"
                onClick={() => { onDepartChange(null); onReturnChange(null); }}
                className="ml-auto text-xs font-semibold text-neutral-400 hover:text-red-500"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
