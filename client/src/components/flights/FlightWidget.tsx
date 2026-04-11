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
    useState,
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
import { useFlightSearch, type UseFlightSearchOptions } from "@/hooks/useFlightSearch";
import { AirportCombobox } from "./AirportCombobox";
import { CalendarDropdown } from "./CalendarDropdown";
import { RecentSearchesPanel } from "./RecentSearchesPanel";
import { TrackPricesButton } from "./TrackPricesButton";
import { CABIN_OPTIONS, AIRPORT_MAP, B, cellBorder, cellFocus, labelStyle } from "./flightWidget.data";
import { FlightWidgetErrorBoundary } from "./FlightWidgetErrorBoundary";
import { PassengerMenu } from "./PassengerMenu";
import { buildFlightPriceIntelligenceViewModel } from "./priceIntelligence.viewModel";
import { FlightPriceIntelligenceSummary } from "./FlightPriceIntelligenceSummary";
import { FlightPriceIntelligenceState } from "./FlightPriceIntelligenceState";
import type { RecentSearchRecord } from "./flightWidget.recent";
import type { FlexibilityType } from "@/contexts/FlightSearchContext";

// ─────────────────────────────────────────────────────────────────────────────
// 3) PURE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

export function formatTravelerLabel(adults: number, children: number, infants: number): string {
    const total = adults + children + infants;
    return total === 1 ? "1 Traveler" : `${total} Travelers`;
}

function fmtDisplayDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6) MAIN WIDGET — Layout Glue only
// ─────────────────────────────────────────────────────────────────────────────
function FlightWidgetInner() {
    const s = useFlightWidgetState();

    const [committedSearch, setCommittedSearch] = useState<UseFlightSearchOptions | null>(null);

    const {
        flights,
        bestFlights,
        cheapestFlights,
        fastestFlights,
        loading,
        error,
        isEmpty,
        refetch
    } = useFlightSearch(
        committedSearch || { 
            origin: "", 
            destination: "", 
            departDate: "", 
            enabled: false 
        }
    );

    const handleSearchClick = useCallback(() => {
        const shouldSearchLocally = s.handleSearch();
        if (shouldSearchLocally) {
            setCommittedSearch({
                origin: s.origin,
                destination: s.destination,
                departDate: s.departDate,
                returnDate: s.returnDate,
                passengers: s.adults + s.children,
                enabled: true
            });
        }
    }, [s]);

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

    const priceIntelligenceVm = buildFlightPriceIntelligenceViewModel(
        s.priceIntelligence.calendar,
        s.priceIntelligence.trend,
    );

    return (
        <div id="mainWidget" className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="flex flex-col w-full">

                {/* ═══ TRIP TYPE TOGGLE ═════════════════════════════════════ */}
                <div className="flex gap-2 mb-3" role="radiogroup" aria-label="Trip type">
                    {(["roundtrip", "oneway"] as const).map(t => (
                        <button
                            key={t} type="button" role="radio"
                            aria-checked={s.tripType === t}
                            onClick={() => {
                                s.setTripType(t);
                                if (t === "oneway") s.setReturnDate("");
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
                            {t === "roundtrip" ? "↔ Return" : "→ One-way"}
                        </button>
                    ))}
                </div>

                {/* ═══ INPUT GRID ════════════════════════════════════════════ */}
                <div
                    role="group" aria-label="Flight search fields"
                    className={`grid grid-cols-1 sm:grid-cols-2 ${s.tripType === "oneway"
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

                    {/* ── RETURN (hidden in oneway) ── */}
                    {s.tripType === "roundtrip" && (
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
                        <PassengerMenu
                            open={s.openPax}
                            setOpen={s.setOpenPax}
                            adults={s.adults}
                            childrenCount={s.children}
                            infants={s.infants}
                            cabinClass={s.cabinClass}
                            setAdults={s.setAdults}
                            setChildrenCount={s.setChildren}
                            setInfants={s.setInfants}
                            setCabinClass={s.setCabinClass}
                        />
                    </div>

                    {/* ── SEARCH BUTTON ── */}
                    <div className="lg:col-span-1 flex items-stretch">
                        <button
                            onClick={handleSearchClick}
                            disabled={loading}
                            aria-label="Search for flights"
                            className="w-full active:scale-[0.97] disabled:opacity-75 disabled:scale-100 font-bold py-3.5 lg:py-5 px-6 rounded-xl lg:rounded-l-none lg:rounded-r-2xl transition-all flex items-center justify-center gap-2 text-base lg:text-lg"
                            style={{ background: B.gold, color: B.purpleDeep, boxShadow: "0 4px 18px rgba(245,197,24,0.4)" }}
                        >
                            {loading ? (
                                <span className="animate-spin mr-1">✈️</span>
                            ) : (
                                <Search className="w-5 h-5" aria-hidden="true" />
                            )}
                            {loading ? "Searching..." : "Search Flights"}
                        </button>
                    </div>
                </div>

                {/* ═══ AUX SECTIONS: FLEXIBILITY & PRICE TRACKING ═══════════════ */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-3 ml-1 mr-2">
                    {/* ═══ FLEXIBILITY TOGGLE ═════════════════════════════════════ */}
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs font-semibold mr-2" style={{ color: B.textMuted }}>Dates:</span>
                        {(
                            [
                                { value: "exact", label: "Exact", icon: "📅" },
                                { value: "3days", label: "±3 days", icon: "↔️" },
                                { value: "week", label: "This week", icon: "📆" },
                                { value: "month", label: "Whole month", icon: "🗓️" },
                            ] as const
                        ).map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => s.setFlexibility(opt.value)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 ${s.flexibility === opt.value
                                    ? "shadow-sm"
                                    : "hover:bg-white/5"
                                    }`}
                                style={s.flexibility === opt.value
                                    ? { background: B.gold, color: B.purpleDeep }
                                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: `1px solid ${B.glassBorder}` }
                                }
                            >
                                {opt.icon} {opt.label}
                            </button>
                        ))}
                        {s.flexibility !== "exact" && (
                            <span className="ml-2 text-xs font-medium animate-pulse" style={{ color: B.gold }}>
                                ✨ We'll find the cheapest fare
                            </span>
                        )}
                    </div>

                    {/* ═══ PRICE TRACKING BUTTON ══════════════════════════════════ */}
                    <div className="w-full md:w-auto">
                        <TrackPricesButton currentPrice={s.lowestPrice ?? s.calendarCheapestPrice} />
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

                <FlightPriceIntelligenceSummary vm={priceIntelligenceVm} />
                <FlightPriceIntelligenceState vm={priceIntelligenceVm} />

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

                {/* ═══ VISUAL TEST: LOCAL SEARCH RESULTS ════════════════════ */}
                {committedSearch && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between p-4 rounded-t-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Plane className="w-5 h-5" style={{ color: B.gold }} />
                                API Live Results ({flights.length})
                            </h3>
                            <button 
                                onClick={() => refetch()} 
                                disabled={loading}
                                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
                                style={{ background: "rgba(255,255,255,0.1)", color: B.white }}
                            >
                                {loading ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>
                        
                        <div className="p-4 rounded-b-2xl overflow-hidden" style={{ background: "rgba(20,20,30,0.4)", border: `1px solid rgba(255,255,255,0.1)`, borderTop: "none" }}>
                            {loading && flights.length === 0 && (
                                <div className="py-12 text-center text-white/50 animate-pulse">
                                    Scouring the skies for the best deals...
                                </div>
                            )}

                            {error && (
                                <div className="p-4 rounded-xl text-red-200" style={{ background: "rgba(255,0,0,0.15)" }}>
                                    <h4 className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Search Error</h4>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            )}

                            {isEmpty && !error && (
                                <div className="py-12 text-center text-white/50">
                                    No flights found for this route.
                                </div>
                            )}

                            {flights.length > 0 && (
                                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                    {flights.map((flight, idx) => (
                                        <div 
                                            key={flight.id}
                                            className="p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-white/5"
                                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                                        >
                                            {/* Flight info */}
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: B.gold, color: B.purpleDeep }}>
                                                        {idx === 0 ? "🥇 SmartMix #1" : `#${idx + 1}`}
                                                    </span>
                                                    <span className="text-white/80 text-sm font-medium">Source: amadeus</span>
                                                    <span className="text-white text-sm">| Stops: {'totalPrice' in flight ? ((flight as any).outbound.totalStops + (flight as any).inbound.totalStops) : (flight as any).totalStops}</span>
                                                </div>
                                                <div className="text-xs text-white/50 font-mono mt-1 w-48 truncate" title={flight.id}>
                                                    ID: {flight.id}
                                                </div>
                                            </div>

                                            {/* Price / Score */}
                                            <div className="flex flex-col md:items-end text-left md:text-right">
                                                <div className="text-xl font-black" style={{ color: "#a0f0b0" }}>
                                                    {'totalPrice' in flight ? (flight as any).totalPrice : (flight as any).price.total} {'totalPrice' in flight ? 'USD' : (flight as any).price.currency}
                                                </div>
                                                {typeof (flight as any).score === "number" && (
                                                    <div className="text-xs font-bold" style={{ color: B.gold }}>
                                                        Score: {(flight as any).score.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
