import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { NormalizedFareEntryVM } from "@/types/destination";

// ── Types ─────────────────────────────────────────────────────────
export interface FilterState {
  airlines:    string[];   // [] = all
  stops:       "any" | "direct" | "1stop" | "2plus";
  timeSlot:    "any" | "morning" | "afternoon" | "evening" | "night";
  maxBudget:   number;
  origin:      string;
}

export function buildDefaultFilters(
  entries: NormalizedFareEntryVM[],
  defaultOrigin: string,
  defaultBudget: number,
): FilterState {
  return {
    airlines:  [],
    stops:     "any",
    timeSlot:  "any",
    maxBudget: defaultBudget,
    origin:    defaultOrigin,
  };
}

// ── Time slot helper ──────────────────────────────────────────────
function getTimeSlot(d1: string): FilterState["timeSlot"] {
  // d1 = "2026-04-20T22:15:00+07:00"
  const match = d1.match(/T(\d{2}):/);
  if (!match) return "any";
  const hour = parseInt(match[1]);
  if (hour >= 5  && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// ── Filter logic (pure function — reuse anywhere) ─────────────────
export function applyFilters(
  entries: NormalizedFareEntryVM[],
  f: FilterState,
): NormalizedFareEntryVM[] {
  return entries.filter(e => {
    // Origin
    if (f.origin && e.from1 !== f.origin && e.from2 !== f.origin)
      return false;

    // Budget
    if (f.maxBudget > 0 && e.price > f.maxBudget)
      return false;

    // Airlines
    if (f.airlines.length > 0 && e.airlineCode && !f.airlines.includes(e.airlineCode))
      return false;

    // Stops
    if (f.stops === "direct" && e.s1 !== 0)          return false;
    if (f.stops === "1stop"  && e.s1 !== 1)          return false;
    if (f.stops === "2plus"  && (e.s1 ?? 0) < 2)     return false;

    // Time slot
    if (f.timeSlot !== "any" && e.d1) {
      if (getTimeSlot(e.d1) !== f.timeSlot) return false;
    }

    return true;
  });
}

// ── Sidebar Props ─────────────────────────────────────────────────
interface Props {
  entries:      NormalizedFareEntryVM[];
  filters:      FilterState;
  onChange:     (f: FilterState) => void;
  onReset:      () => void;
  budgetMin:    number;
  budgetMax:    number;
  budgetStep:   number;
  originOptions: { label: string; value: string }[];
  resultCount:  number;
}

function formatTHB(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "THB", maximumFractionDigits: 0,
  }).format(n);
}

// ── Component ─────────────────────────────────────────────────────
export function FilterSidebar({
  entries, filters, onChange, onReset,
  budgetMin, budgetMax, budgetStep,
  originOptions, resultCount,
}: Props) {

  // Unique airlines from entries
  const airlineOptions = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach(e => {
      if (e.airlineCode && e.airline) map.set(e.airlineCode, e.airline);
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [entries]);

  function toggleAirline(code: string) {
    const next = filters.airlines.includes(code)
      ? filters.airlines.filter(a => a !== code)
      : [...filters.airlines, code];
    onChange({ ...filters, airlines: next });
  }

  const hasBudgetRange = budgetMax > 0 && budgetMax > budgetMin;
  const hasActiveFilters =
    filters.airlines.length > 0 ||
    filters.stops !== "any"     ||
    filters.timeSlot !== "any"  ||
    filters.maxBudget < budgetMax;

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-fuchsia-300" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-300
                             border border-fuchsia-500/30 px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-white/40
                       hover:text-white/70 transition-colors"
          >
            <X size={12} /> Reset all
          </button>
        )}
      </div>

      {/* ── Origin ───────────────────────────────────────────── */}
      {originOptions.length > 1 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45 mb-3">
            Origin
          </p>
          <div className="flex flex-wrap gap-2">
            {originOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, origin: opt.value })}
                className={`text-sm px-4 py-1.5 rounded-full border transition
                  ${filters.origin === opt.value
                    ? "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-100"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stops ────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/45 mb-3">
          Stops
        </p>
        <div className="space-y-2">
          {(["any","direct","1stop","2plus"] as const).map(val => {
            const labels = {
              any:    "Any",
              direct: "Direct only",
              "1stop":"1 stop",
              "2plus":"2+ stops",
            };
            return (
              <label key={val}
                className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center
                                 justify-center transition shrink-0
                                 ${filters.stops === val
                                   ? "border-fuchsia-400 bg-fuchsia-400"
                                   : "border-white/20 group-hover:border-white/40"}`}
                >
                  {filters.stops === val && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <input type="radio" className="sr-only"
                  checked={filters.stops === val}
                  onChange={() => onChange({ ...filters, stops: val })} />
                <span className="text-sm text-white/70 group-hover:text-white transition">
                  {labels[val]}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Airlines ─────────────────────────────────────────── */}
      {airlineOptions.length > 1 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/45 mb-3">
            Airlines
          </p>
          <div className="space-y-2">
            {airlineOptions.map(({ code, name }) => {
              const checked = filters.airlines.includes(code);
              return (
                <label key={code}
                  className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleAirline(code)}
                    className={`w-4 h-4 rounded border-2 flex items-center
                                justify-center transition shrink-0
                                ${checked
                                  ? "border-fuchsia-400 bg-fuchsia-400"
                                  : "border-white/20 group-hover:border-white/40"}`}
                  >
                    {checked && (
                      <svg viewBox="0 0 10 8" className="w-2.5 fill-white">
                        <path d="M1 4l3 3 5-6" stroke="white"
                              strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" className="sr-only"
                    checked={checked}
                    onChange={() => toggleAirline(code)} />
                  {code && (
                    <img src={`https://pics.avs.io/24/24/${code}.png`}
                      alt="" className="w-5 h-5 rounded-sm object-contain
                                        bg-white/10" loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <span className="text-sm text-white/70 group-hover:text-white transition truncate">
                    {name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Departure time ───────────────────────────────────── */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/45 mb-3">
          Departure time
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: "any",       label: "Any",       sub: "All times"   },
            { val: "morning",   label: "Morning",   sub: "05:00–11:59" },
            { val: "afternoon", label: "Afternoon", sub: "12:00–16:59" },
            { val: "evening",   label: "Evening",   sub: "17:00–20:59" },
            { val: "night",     label: "Night",     sub: "21:00–04:59" },
          ] as const).map(({ val, label, sub }) => (
            <button key={val}
              onClick={() => onChange({ ...filters, timeSlot: val })}
              className={`text-left px-3 py-2 rounded-xl border text-xs transition
                ${filters.timeSlot === val
                  ? "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-100"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07]"
                }`}
            >
              <p className="font-medium">{label}</p>
              <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Budget slider ─────────────────────────────────────── */}
      {hasBudgetRange && (
        <div>
          <div className="flex items-end justify-between mb-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Max budget
            </p>
            <p className="text-sm font-semibold text-amber-300">
              {formatTHB(filters.maxBudget)}
            </p>
          </div>
          <Slider
            value={[filters.maxBudget]}
            min={budgetMin} max={budgetMax} step={budgetStep}
            onValueChange={v => onChange({ ...filters, maxBudget: v[0] ?? budgetMax })}
          />
          <div className="flex justify-between text-[10px] text-white/35 mt-2">
            <span>{formatTHB(budgetMin)}</span>
            <span>{formatTHB(budgetMax)}</span>
          </div>
        </div>
      )}

      {/* Result count */}
      <div className="rounded-xl border border-white/10 bg-[#100b21] px-4 py-2.5
                      text-center text-xs text-white/50">
        Showing <span className="text-white font-semibold">{resultCount}</span> fare
        {resultCount === 1 ? "" : "s"}
      </div>
    </aside>
  );
}
