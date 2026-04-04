/**
 * FloatingSearchBar/index.tsx — GoTravel Asia
 * ─────────────────────────────────────────────────────────────────
 * Cheapflights-style INLINE editing (no scroll-to-widget).
 * Refactored into modular sub-components.
 * ─────────────────────────────────────────────────────────────────
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { format, startOfMonth } from "date-fns";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import posthog from "posthog-js";
import { persistSearchToSession } from "@/lib/detectRouteFromContext";

import { AIRPORTS, type Airport } from "./airports";
import { CABIN_LABELS, DropPanel as DropPanelType } from "./constants";
import { Pill, PillX, Sep } from "./Primitives";
import { AirportDropdown } from "./AirportDropdown";
import { DatePickerPanel } from "./DatePickerPanel";
import { PaxCabinPanel } from "./PaxCabinPanel";
import { TripTypePill } from "./TripTypePill";

export default function FloatingSearchBar() {
    const ctx = useFlightSearch();

    // Which panel is open
    const [open, setOpen] = useState<DropPanelType>(null);

    // Airport search inputs
    const [originQ, setOriginQ] = useState("");
    const [destQ, setDestQ] = useState("");

    // Calendar month (local state — not connected to context)
    const [calMonth, setCalMonth] = useState(() => startOfMonth(new Date()));

    // Pax local state (synced from context on open)
    const [adults, setAdults] = useState(ctx.adults ?? 1);
    const [children, setChildren] = useState(ctx.childCount ?? 0);
    const [infants, setInfants] = useState(ctx.infants ?? 0);
    const [cabin, setCabin] = useState<string>(ctx.cabinClass ?? "Y");

    const barRef = useRef<HTMLDivElement>(null);

    // ── Close on outside click ─────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (barRef.current && !barRef.current.contains(e.target as Node)) {
                setOpen(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggle = useCallback((panel: DropPanelType) => {
        setOpen(prev => prev === panel ? null : panel);
    }, []);

    // ── Derived display values ─────────────────────────────────────
    const originCity = ctx.origin?.name?.split("(")[0].trim() ?? "Origin";
    const destCity = ctx.destination?.name?.split("(")[0].trim() ?? "Destination";

    const dateLabel = ctx.departDate
        ? format(new Date(ctx.departDate + "T00:00:00"), "EEE d MMM")
        : "Select date";
    const dateSub = ctx.tripType === "roundtrip" && ctx.returnDate
        ? "→ " + format(new Date(ctx.returnDate + "T00:00:00"), "d MMM")
        : "± flexible";

    const totalPax = adults + children + infants;
    const paxLabel = `${totalPax === 1 ? "1 adult" : `${totalPax} travelers`} · ${CABIN_LABELS[cabin]}`;

    // ── Search ─────────────────────────────────────────────────────
    const handleSearch = () => {
        if (!ctx.origin || !ctx.destination || !ctx.departDate) return;
        const urlObj = ctx.buildSearchURL?.();
        if (!urlObj) return;

        posthog?.capture?.("search_flights_clicked", {
            from: "floating_bar",
            origin: ctx.origin.code, destination: ctx.destination.code,
            departDate: ctx.departDate, tripType: ctx.tripType,
        });

        // ── Price Alert Persistence Logic ─────────────────────────────
        persistSearchToSession(ctx.origin.code, ctx.destination.code, ctx.departDate);

        window.location.href = urlObj.travelpayouts;
    };

    // ── Airport select ─────────────────────────────────────────────
    const pickOrigin = (a: Airport) => {
        ctx.setOrigin({ code: a.code, name: `${a.city} (${a.code})` } as any);
        setOriginQ(""); setOpen(null);
    };
    const pickDest = (a: Airport) => {
        ctx.setDestination({ code: a.code, name: `${a.city} (${a.code})` } as any);
        setDestQ(""); setOpen(null);
    };

    // ── Calendar ───────────────────────────────────────────────────
    const pickDate = (d: number) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const picked = new Date(calMonth.getFullYear(), calMonth.getMonth(), d);
        if (picked < today) return;
        ctx.setDepartDate?.(format(picked, "yyyy-MM-dd"));
        setOpen(null);
    };

    // ── Pax done ──────────────────────────────────────────────────
    const commitPax = () => {
        ctx.setAdults?.(adults);
        ctx.setChildCount?.(children);
        ctx.setInfants?.(infants);
        ctx.setCabinClass?.(cabin as any);
        setOpen(null);
    };

    return (
        <div
            ref={barRef}
            className="flex items-center h-[44px] px-[8px] gap-[4px] rounded-[12px] border border-[rgba(245,197,24,0.28)] flex-1 min-w-0 relative"
            style={{
                background: "rgba(42,8,128,0.85)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: "0 4px 24px rgba(0,0,0,.35), inset 0 0 0 1px rgba(245,197,24,.06)",
                fontFamily: "'Plus Jakarta Sans','Source Sans 3',sans-serif",
            }}
        >
            {/* ── Fields scroll row ── */}
            <div className="flex items-center gap-[2px] flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                {/* ── 1. Trip type ─────────────────────────────────────── */}
                <TripTypePill
                    openPanel={open}
                    togglePanel={toggle}
                    tripType={ctx.tripType ?? "oneway"}
                    setTripType={ctx.setTripType as any}
                    setOpen={setOpen}
                />

                <Sep />

                {/* ── 2. Origin ────────────────────────────────────────── */}
                <Pill active={open === "origin"} onClick={() => toggle("origin")}>
                    <span className="truncate max-w-[70px]">{originCity}</span>
                    {ctx.origin && (
                        <PillX onClick={e => { e.stopPropagation(); ctx.setOrigin(null); }} />
                    )}

                    {open === "origin" && (
                        <AirportDropdown
                            inputId="fsb-origin"
                            query={originQ}
                            onQuery={setOriginQ}
                            onPick={pickOrigin}
                            selected={ctx.origin?.code}
                        />
                    )}
                </Pill>

                {/* Swap */}
                <button
                    onClick={() => ctx.swapAirports?.()}
                    className="w-[26px] h-[26px] rounded-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.14)] flex items-center justify-center cursor-pointer flex-shrink-0 text-white/60 transition-all hover:bg-[rgba(245,197,24,0.15)] hover:border-[rgba(245,197,24,0.5)] hover:text-[#F5C518] hover:rotate-180 duration-200"
                    title="Swap airports"
                >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
                    </svg>
                </button>

                {/* ── 3. Destination ───────────────────────────────────── */}
                <Pill active={open === "dest"} onClick={() => toggle("dest")}>
                    <span className="truncate max-w-[70px]">{destCity}</span>
                    {ctx.destination && (
                        <PillX onClick={e => { e.stopPropagation(); ctx.setDestination(null); }} />
                    )}

                    {open === "dest" && (
                        <AirportDropdown
                            inputId="fsb-dest"
                            query={destQ}
                            onQuery={setDestQ}
                            onPick={pickDest}
                            selected={ctx.destination?.code}
                        />
                    )}
                </Pill>

                <Sep />

                {/* ── 4. Date ──────────────────────────────────────────── */}
                <div
                    onClick={() => toggle("date")}
                    className={[
                        "relative h-[32px] rounded-[7px] border flex flex-col items-start justify-center px-[9px]",
                        "cursor-pointer whitespace-nowrap flex-shrink-0 transition-all duration-150",
                        open === "date"
                            ? "border-[#F5C518] bg-[rgba(245,197,24,0.15)]"
                            : "border-transparent bg-[rgba(255,255,255,0.07)] hover:border-[rgba(245,197,24,0.35)] hover:bg-[rgba(245,197,24,0.10)]",
                    ].join(" ")}
                >
                    <span className="text-[12px] font-bold text-white leading-[1.15]">{dateLabel}</span>
                    <span className="text-[9px] font-medium text-white/45 leading-[1.15]">{dateSub}</span>

                    {open === "date" && (
                        <DatePickerPanel
                            calMonth={calMonth}
                            setCalMonth={setCalMonth}
                            departDate={ctx.departDate}
                            onPickDate={pickDate}
                        />
                    )}
                </div>

                <Sep />

                {/* ── 5. Pax/Cabin ─────────────────────────────────────── */}
                <Pill active={open === "pax"} onClick={() => toggle("pax")}>
                    <span className="hidden xs:inline">{paxLabel}</span>
                    <span className="xs:hidden">{totalPax} Pax</span>
                    <div className={`text-[8px] text-white/30 transition-transform duration-150 ml-1 ${open === "pax" ? "rotate-180 text-[#F5C518]" : ""}`}>▾</div>

                    {open === "pax" && (
                        <PaxCabinPanel
                            adults={adults} setAdults={setAdults}
                            children={children} setChildren={setChildren}
                            infants={infants} setInfants={setInfants}
                            cabin={cabin} setCabin={setCabin}
                            commitPax={commitPax}
                        />
                    )}
                </Pill>

            </div>

            {/* ── SEARCH BUTTON ── */}
            <button
                onClick={handleSearch}
                className="h-[32px] px-[10px] sm:px-[14px] rounded-[8px] bg-[#F5C518] text-[#2d0560] border-none font-extrabold text-[12px] cursor-pointer flex-shrink-0 flex items-center gap-[5px] shadow-[0_2px_10px_rgba(245,197,24,0.3)] hover:bg-[#d4a800] hover:shadow-[0_4px_16px_rgba(245,197,24,0.4)] hover:-translate-y-px active:scale-[0.97] transition-all tracking-[0.01em]"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
            </button>
        </div>
    );
}
