/**
 * FlightWidget.tsx — Go Travel Asia
 * Wrapper + Layout Glue (Refactored)
 *
 * Depends on:
 *  - useFlightWidgetState.ts   (state + handlers + validation)
 *  - AirportCombobox.tsx       (standalone combobox, a11y + positioning)
 *  - CalendarDropdown.tsx      (calendar UI + focus trap + one-way fix)
 *  - RecentSearchesPanel.tsx   (recent panel + live price memo/key fix)
 */

import React, {
    memo,
    useCallback,
    Component,
    type ReactNode,
    type ErrorInfo,
} from "react";
import {
    Plane,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    ArrowRightLeft,
    Armchair,
    ChevronDown,
    Minus,
    Plus,
    ExternalLink,
    X,
    Search,
    AlertTriangle,
} from "lucide-react";
import posthog from "posthog-js";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatTHB } from "@/const";

import { useFlightWidgetState } from "./useFlightWidgetState";
import { AirportCombobox } from "./AirportCombobox";
import { CalendarDropdown } from "./CalendarDropdown";
import { RecentSearchesPanel } from "./RecentSearchesPanel";
import { CABIN_OPTIONS, AIRPORT_MAP } from "./flightWidget.data";
import type { RecentSearchRecord } from "./flightWidget.recent";

// ─────────────────────────────────────────────────────────────────────────────
// 1) BRAND TOKENS — single source of truth for GoTravel colours
// ─────────────────────────────────────────────────────────────────────────────
const B = {
    purple: "#5B0EA6",
    purpleDeep: "#2D0558",
    gold: "#F5C518",
    white: "#FFFFFF",
    text: "#1a0a2e",
    textMuted: "#8B7AA0",
    glassBase: "rgba(255,255,255,0.12)",
    glassBorder: "rgba(255,255,255,0.18)",
    glassFocus: "rgba(245,197,24,0.12)",
    error: "#fba09d",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2) SHARED STYLE OBJECTS — DRY
// ─────────────────────────────────────────────────────────────────────────────
const cellBorder: React.CSSProperties = {
    borderBottom: `1px solid ${B.glassBorder}`,
    borderRight: `1px solid ${B.glassBorder}`,
};
const cellFocus: React.CSSProperties = {
    background: B.glassFocus,
    boxShadow: `inset 0 0 0 1.5px ${B.gold}`,
};
const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: B.gold,
    marginBottom: 2,
    lineHeight: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3) PURE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function formatTravelerLabel(adults: number, children: number, infants: number): string {
    const total = adults + children + infants;
    return total === 1 ? "1 Traveler" : `${total} Travelers`;
}

function fmtDisplayDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4) ERROR BOUNDARY — graceful crash recovery
// ─────────────────────────────────────────────────────────────────────────────
class FlightWidgetErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean; msg: string }
> {
    state = { hasError: false, msg: "" };

    static getDerivedStateFromError(e: Error) {
        return { hasError: true, msg: e.message };
    }

    componentDidCatch(e: Error, info: ErrorInfo) {
        console.error("[FlightWidget]", e, info);
        if (typeof posthog !== "undefined" && posthog.__loaded) {
            posthog.capture("flight_widget_error", { message: e.message });
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div
                role="alert"
                className="flex flex-col items-center justify-center gap-4 py-12 px-6 rounded-2xl text-center"
                style={{ background: B.glassBase, border: `1.5px solid ${B.glassBorder}` }}
            >
                <AlertTriangle className="w-10 h-10" style={{ color: B.gold }} />
                <div>
                    <p className="font-bold text-white text-lg mb-1">Widget failed to load</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{this.state.msg}</p>
                </div>
                <button
                    onClick={() => this.setState({ hasError: false, msg: "" })}
                    className="px-5 py-2 rounded-xl font-bold text-sm active:scale-[0.97] transition-all"
                    style={{ background: B.gold, color: B.purpleDeep }}
                >
                    Retry
                </button>
            </div>
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5) PAX STEPPER — memoized
// ─────────────────────────────────────────────────────────────────────────────
const PaxStepper = memo(function PaxStepper({
    label, sub, value, min, max, onChange,
}: {
    label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
    const dec = useCallback(() => onChange(clamp(value - 1, min, max)), [value, min, max, onChange]);
    const inc = useCallback(() => onChange(clamp(value + 1, min, max)), [value, min, max, onChange]);

    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-bold" style={{ color: B.text }}>{label}</div>
                <div className="text-xs" style={{ color: B.textMuted }}>{sub}</div>
            </div>
            <div role="group" aria-label={label} className="flex items-center gap-2">
                <button
                    type="button" onClick={dec} disabled={value <= min}
                    aria-label={`Decrease ${label}, current ${value}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40"
                    style={{ borderColor: "rgba(91,14,166,0.2)", color: B.purple }}
                >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="w-8 text-center text-sm font-black" style={{ color: B.text }} aria-live="polite" aria-atomic="true">
                    {value}
                </span>
                <button
                    type="button" onClick={inc} disabled={value >= max}
                    aria-label={`Increase ${label}, current ${value}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40"
                    style={{ borderColor: "rgba(91,14,166,0.2)", color: B.purple }}
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// 6) MAIN WIDGET — Layout Glue only
// ─────────────────────────────────────────────────────────────────────────────
function FlightWidgetInner() {
    const s = useFlightWidgetState();

    const travelerLabel = formatTravelerLabel(s.adults, s.children, s.infants);
    const cabinLabel = CABIN_OPTIONS.find(opt => opt.value === s.cabinClass)?.label ?? "Economy";

    const getSelectedCountry = useCallback(() => {
        return AIRPORT_MAP.get(s.destination)?.country ?? "Asia";
    }, [s.destination]);

    const handleReSearch = useCallback((rec: RecentSearchRecord) => {
        s.setOrigin(rec.origin);
        s.setDestination(rec.destination);
        s.setDepartDate(rec.departDate);
        s.setReturnDate(rec.returnDate);
    }, [s]);

    return (
        <div id="mainWidget" className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="flex flex-col w-full">

                {/* ═══ TRIP TYPE TOGGLE ═════════════════════════════════════ */}
                <div className="flex gap-2 mb-3" role="radiogroup" aria-label="Trip type">
                    {(["return", "one-way"] as const).map(t => (
                        <button
                            key={t} type="button" role="radio"
                            aria-checked={s.tripType === t}
                            onClick={() => {
                                s.setTripType(t);
                                if (t === "one-way") s.setReturnDate("");
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${s.tripType === t
                                ? "text-white shadow-lg"
                                : "text-white/60 hover:text-white/80"
                                }`}
                            style={s.tripType === t
                                ? { background: "rgba(255,255,255,0.18)", border: `1.5px solid rgba(255,255,255,0.35)` }
                                : { background: "transparent", border: `1.5px solid rgba(255,255,255,0.12)` }
                            }
                        >
                            {t === "return" ? "↔ Return" : "→ One-way"}
                        </button>
                    ))}
                </div>

                {/* ═══ INPUT GRID ════════════════════════════════════════════ */}
                <div
                    role="group" aria-label="Flight search fields"
                    className={`grid grid-cols-1 sm:grid-cols-2 ${s.tripType === "one-way"
                        ? "lg:grid-cols-5"
                        : "lg:grid-cols-6"
                        } flex-1 rounded-xl lg:rounded-2xl overflow-hidden`}
                    style={{ background: B.glassBase, border: `1.5px solid ${B.glassBorder}` }}
                >

                    {/* ── FROM ── */}
                    <div className="relative transition-colors" style={cellBorder}>
                        <div className="flex items-center px-4 py-3 h-full min-h-[64px]">
                            <MapPin
                                className={`w-4 h-4 mr-3 shrink-0 ${s.detectingLocation ? "animate-pulse" : ""}`}
                                style={{ color: s.detectingLocation ? B.gold : "rgba(255,255,255,0.45)" }}
                                aria-hidden="true"
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                                <span style={labelStyle}>
                                    {s.detectingLocation ? "Detecting…" : "From"}
                                </span>
                                <AirportCombobox
                                    value={s.origin}
                                    onChange={s.setOrigin}
                                    label="From"
                                />
                            </div>
                        </div>
                        {/* Swap Button */}
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); const tmp = s.origin; s.setOrigin(s.destination); s.setDestination(tmp); }}
                            className="absolute z-10 w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-all
                                       left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2
                                       sm:left-auto sm:translate-x-1/2 sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto"
                            style={{ background: "rgba(255,255,255,0.12)", border: `1.5px solid rgba(255,255,255,0.25)` }}
                            aria-label="Swap origin and destination"
                            title="Swap airports"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-white sm:rotate-0 rotate-90" aria-hidden="true" />
                        </button>
                    </div>

                    {/* ── TO ── */}
                    <div className="relative transition-colors" style={cellBorder}>
                        <div className="flex items-center px-4 py-3 h-full min-h-[64px]">
                            <Plane className="w-4 h-4 mr-3 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                            <div className="flex flex-col min-w-0 flex-1">
                                <span style={labelStyle}>To</span>
                                <AirportCombobox
                                    value={s.destination}
                                    onChange={s.setDestination}
                                    label="To"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── DEPART ── */}
                    <button
                        type="button"
                        onClick={() => { s.setCalendarMode("depart"); s.setCalendarOpen(true); }}
                        aria-label={`Departure date${s.departDate ? `: ${fmtDisplayDate(s.departDate)}` : ", not selected"}`}
                        aria-haspopup="dialog"
                        aria-pressed={s.calendarOpen && s.calendarMode === "depart"}
                        className="w-full h-full transition-colors text-left outline-none"
                        style={{ ...cellBorder, ...(s.calendarOpen && s.calendarMode === "depart" ? cellFocus : {}) }}
                    >
                        <div className="flex items-center px-3 py-3 h-full min-h-[64px]">
                            <CalendarIcon className="w-4 h-4 mr-2 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                            <div className="flex flex-col min-w-0 flex-1">
                                <span style={labelStyle}>Depart</span>
                                <span className="font-bold text-white text-sm leading-snug truncate">
                                    {s.departDate ? fmtDisplayDate(s.departDate) : "Select date"}
                                </span>
                            </div>
                        </div>
                    </button>

                    {/* ── RETURN (hidden in one-way) ── */}
                    {s.tripType === "return" && (
                        <button
                            type="button"
                            onClick={() => { s.setCalendarMode("return"); s.setCalendarOpen(true); }}
                            aria-label={`Return date${s.returnDate ? `: ${fmtDisplayDate(s.returnDate)}` : ", not selected. Optional"}`}
                            aria-haspopup="dialog"
                            aria-pressed={s.calendarOpen && s.calendarMode === "return"}
                            className="w-full h-full transition-colors text-left outline-none"
                            style={{ ...cellBorder, ...(s.calendarOpen && s.calendarMode === "return" ? cellFocus : {}) }}
                        >
                            <div className="flex items-center px-3 py-3 h-full min-h-[64px]">
                                <ArrowRightLeft
                                    className="w-4 h-4 mr-2 shrink-0"
                                    style={{ color: s.returnDate ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}
                                    aria-hidden="true"
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span style={labelStyle}>Return</span>
                                    <span className="font-bold text-sm leading-snug truncate" style={{ color: s.returnDate ? B.white : "rgba(255,255,255,0.4)" }}>
                                        {s.returnDate ? fmtDisplayDate(s.returnDate) : "Add return"}
                                    </span>
                                </div>
                                {s.returnDate && (
                                    <span
                                        role="button" tabIndex={0}
                                        onClick={e => { e.stopPropagation(); s.setReturnDate(""); }}
                                        onKeyDown={e => e.key === "Enter" && (e.stopPropagation(), s.setReturnDate(""))}
                                        aria-label="Remove return date"
                                        className="ml-1 p-0.5 rounded-full transition-colors shrink-0 cursor-pointer"
                                        style={{ color: "rgba(255,255,255,0.5)" }}
                                    >
                                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                                    </span>
                                )}
                            </div>
                        </button>
                    )}

                    {/* ── TRAVELERS & CLASS ── */}
                    <div className="relative transition-colors" style={cellBorder}>
                        <Popover open={s.openPax} onOpenChange={s.setOpenPax}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    ref={s.paxTriggerRef}
                                    aria-label={`Travelers and cabin class: ${travelerLabel}, ${cabinLabel}`}
                                    aria-haspopup="dialog"
                                    aria-expanded={s.openPax}
                                    className="w-full h-full min-h-[64px] px-4 py-3 flex items-center transition-colors text-left outline-none"
                                    style={s.openPax ? cellFocus : {}}
                                >
                                    <Users className="w-4 h-4 mr-2.5 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span style={labelStyle}>Travelers &amp; Class</span>
                                        <span className="font-bold text-white text-sm leading-snug truncate">{travelerLabel}, {cabinLabel}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 ml-2 shrink-0 transition-transform ${s.openPax ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent
                                align="end" sideOffset={8}
                                aria-describedby={undefined}
                                role="dialog" aria-label="Select passengers and cabin class"
                                className="w-[300px] p-5 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-black" style={{ color: B.text }}>Passengers</span>
                                    <button type="button" onClick={() => s.setOpenPax(false)} aria-label="Close passenger selector"
                                        className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">Close</button>
                                </div>
                                <div className="space-y-3">
                                    <PaxStepper label="Adults" sub="12+" value={s.adults} min={1} max={9} onChange={s.setAdults} />
                                    <PaxStepper label="Children" sub="2–11" value={s.children} min={0} max={8} onChange={s.setChildren} />
                                    <PaxStepper label="Infants" sub="Under 2" value={s.infants} min={0} max={s.adults} onChange={s.setInfants} />

                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Armchair className="w-4 h-4" style={{ color: B.purple }} aria-hidden="true" />
                                            <span className="text-sm font-black" style={{ color: B.text }}>Cabin class</span>
                                        </div>
                                        <div role="radiogroup" aria-label="Cabin class" className="grid grid-cols-2 gap-2">
                                            {CABIN_OPTIONS.map(opt => {
                                                const active = opt.value === s.cabinClass;
                                                return (
                                                    <button
                                                        key={opt.value} type="button" role="radio" aria-checked={active}
                                                        onClick={() => s.setCabinClass(opt.value)}
                                                        className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${active ? "border-transparent text-white" : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                                                            }`}
                                                        style={active ? { background: B.purple, boxShadow: `0 3px 10px rgba(91,14,166,0.3)` } : {}}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            ref={s.doneButtonRef} type="button" onClick={() => s.setOpenPax(false)}
                                            className="px-5 py-2 rounded-xl font-bold text-sm text-white"
                                            style={{ background: B.purple, boxShadow: `0 3px 10px rgba(91,14,166,0.25)` }}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* ── SEARCH BUTTON ── */}
                    <div className="lg:col-span-1 flex items-stretch">
                        <button
                            onClick={s.handleSearch}
                            aria-label="Search for flights"
                            className="w-full active:scale-[0.97] font-bold py-3.5 lg:py-5 px-6 rounded-xl lg:rounded-l-none lg:rounded-r-2xl transition-all flex items-center justify-center gap-2 text-base lg:text-lg"
                            style={{ background: B.gold, color: B.purpleDeep, boxShadow: "0 4px 18px rgba(245,197,24,0.4)" }}
                        >
                            <Search className="w-5 h-5" aria-hidden="true" />
                            Search Flights
                        </button>
                    </div>
                </div>

                {/* ═══ CALENDAR DROPDOWN ══════════════════════════════════════ */}
                <CalendarDropdown
                    open={s.calendarOpen}
                    onClose={() => s.setCalendarOpen(false)}
                    tripType={s.tripType}
                    calendarMode={s.calendarMode}
                    setCalendarMode={s.setCalendarMode}
                    origin={s.origin}
                    destination={s.destination}
                    selectedDepart={s.departDateObj}
                    selectedReturn={s.returnDateObj}
                    todayDate={s.todayDate}
                    onSelectDate={s.handleCalendarSelect}
                    onCheapestPrice={s.setCalendarCheapestPrice}
                    onSkipReturn={() => { s.setReturnDate(""); s.setCalendarOpen(false); }}
                />

                {/* ═══ ACTION ROW ═══════════════════════════════════════════ */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 w-full">
                    <div className="flex-1">
                        {s.displayPrice ? (
                            <div
                                className="animate-in fade-in slide-in-from-left-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#a0f0b0" }}
                                aria-label={`Cheapest flight from $${s.displayPrice}`}
                                aria-live="polite"
                            >
                                <span className="relative flex h-2 w-2" aria-hidden="true">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="text-sm font-bold">Cheapest from ${s.displayPrice} ({formatTHB(s.displayPrice)})</span>
                            </div>
                        ) : (
                            <div className="h-8 w-56 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }} aria-hidden="true" />
                        )}
                    </div>
                    <button
                        onClick={s.handleTripComSearch}
                        aria-label={`Compare prices on Trip.com for ${getSelectedCountry()}`}
                        className="w-full md:w-auto active:scale-[0.97] font-bold py-3.5 px-7 rounded-2xl text-base transition-all flex items-center justify-center gap-3"
                        style={{ background: "rgba(245,197,24,0.15)", color: B.gold, border: "1.5px solid rgba(245,197,24,0.35)" }}
                    >
                        <ExternalLink className="w-5 h-5" aria-hidden="true" />
                        Compare on Trip.com
                    </button>
                </div>

                {/* ═══ FORM ERROR ═══════════════════════════════════════════ */}
                {s.formError && (
                    <div
                        className="mt-3 flex items-center gap-2.5 px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300"
                        style={{ background: "rgba(251,160,157,0.15)", border: "1.5px solid rgba(251,160,157,0.4)" }}
                        role="alert" aria-live="polite"
                    >
                        <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: B.error }} aria-hidden="true" />
                        <span className="text-sm font-bold" style={{ color: B.error }}>{s.formError}</span>
                    </div>
                )}

                {/* ═══ RECENT SEARCHES ══════════════════════════════════════ */}
                <RecentSearchesPanel onReSearch={handleReSearch} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7) EXPORT — Error Boundary wraps everything
// ─────────────────────────────────────────────────────────────────────────────
export default function FlightWidget() {
    return (
        <FlightWidgetErrorBoundary>
            <FlightWidgetInner />
        </FlightWidgetErrorBoundary>
    );
}
