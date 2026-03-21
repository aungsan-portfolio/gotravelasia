// components/flights/search/CompactFlightToolbar.tsx
//
// Responsive layout — matches Cheapflights mobile/desktop pattern:
//
// ┌─ MOBILE (<lg) ──────────────────────────────────────────┐
// │ [Logo]                              [🔔 Alerts]          │
// │ ┌─────────────────────────────────────────────────────┐ │
// │ │ Return / One-way                                     │ │
// │ │ [From (full width)]  ⇅  [To (full width)]           │ │
// │ │ [Dates──────────────]  [Pax + Cabin────]            │ │
// │ │ [────────── Search flights ──────────────]          │ │
// │ └─────────────────────────────────────────────────────┘ │
// └─────────────────────────────────────────────────────────┘
//
// ┌─ DESKTOP (lg+) ─────────────────────────────────────────┐
// │ [Logo] [Return|Oneway|From ⇄ To|Dates|Pax] [Search] [🔔]│
// └─────────────────────────────────────────────────────────┘

import { useState, useEffect, useMemo } from "react";
import { TripTypeSegment } from "./TripTypeSegment";
import { RouteField } from "./RouteField";
import { SwapAirportsButton } from "./SwapAirportsButton";
import { DateRangeField } from "./DateRangeField";
import { PaxCabinField } from "./PaxCabinField";
import { SearchSubmitButton } from "./SearchSubmitButton";
import { MobileSummaryPill } from "../results/MobileSummaryPill";
import { useFlightSearch } from "@/features/flights/search/useFlightSearch";
import {
  formatCabinLabel,
  getTotalTravellers,
} from "@/features/flights/search/flightSearch.utils";
import type { FlightSearchState } from "@/features/flights/search/flightSearch.types";
import HotelsSearchForm from "@/components/hotels/HotelsSearchForm";

type SearchTab = "flights" | "hotels";

interface Props {
  initialState?: Partial<FlightSearchState>;
  showBranding?: boolean;
}

function GtaLogo() {
  return (
    <a href="/" aria-label="GoTravel Asia home" className="flex shrink-0 items-center gap-2 no-underline">
      <svg width="32" height="32" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect width="34" height="34" rx="7" fill="#3D0870"/>
        <path d="M6 24 Q9 7 24 6" stroke="#F5A623" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
        <path d="M6 27 Q10 9 27 8" stroke="#F5A623" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45"/>
        <path d="M21 9.5L24.5 7.5L25.5 8.8L23 10.5L25 12.5L23 12.5L21.5 11.2L19 12.5L18.5 11Z" fill="#F5A623"/>
        <text x="5" y="26" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="12.5" fill="#fff" letterSpacing="-0.5">GO</text>
      </svg>
      {/* wordmark — hidden on smallest screens */}
      <span className="hidden text-[15px] font-black tracking-tight text-[#3D0870] sm:block lg:block">
        GO<span className="text-[#5B0FA8]">TRAVEL</span> ASIA
      </span>
    </a>
  );
}



// ── Main component ─────────────────────────────────────────────────────────────
export function CompactFlightToolbar({
  initialState,
  showBranding = true,
}: Props) {
  const { state, errors, actions } = useFlightSearch(initialState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>("flights");

  // If initial route exists, stay collapsed until user clicks
  // Otherwise expand to let them fill it in
  const hasRoute = !!(state.origin && state.destination);

  function handleSubmit() {
    const result = actions.submit();
    if (result.ok) {
      setIsExpanded(false);
      window.location.href = result.url;
    }
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b border-yellow-500/30 bg-yellow-400 shadow-sm">

      {/* ══════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (lg and above)
          Single pill row — classic Cheapflights toolbar
      ══════════════════════════════════════════════════════════ */}
      <div className="mx-auto hidden max-w-screen-xl items-center gap-3 px-4 py-2.5 lg:flex">

        {showBranding && (
          <>
            <GtaLogo />
            <div className="h-5 w-px bg-yellow-600/30" />
          </>
        )}

        {/* Tab switcher */}
        <div className="inline-flex rounded-2xl bg-white/10 p-1">
          <button
            type="button"
            data-testid="tab-flights"
            role="tab"
            aria-selected={activeTab === "flights"}
            aria-label="Flights"
            onClick={() => setActiveTab("flights")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeTab === "flights"
                ? "bg-white text-purple-900 shadow-sm"
                : "text-purple-900/60 hover:bg-white/10"
            }`}
          >
            Flights
          </button>
          <button
            type="button"
            data-testid="tab-hotels"
            role="tab"
            aria-selected={activeTab === "hotels"}
            aria-label="Hotels"
            onClick={() => setActiveTab("hotels")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeTab === "hotels"
                ? "bg-white text-purple-900 shadow-sm"
                : "text-purple-900/60 hover:bg-white/10"
            }`}
          >
            Hotels
          </button>
        </div>

        <div className="h-5 w-px bg-yellow-600/30" />

        {/* Search forms */}
        {activeTab === "flights" ? (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/[0.08]">
              <TripTypeSegment value={state.tripType} onChange={actions.setTripType} />
              <div className="h-7 w-px shrink-0 bg-neutral-200" />
              <RouteField label="From" placeholder="Origin" value={state.origin} onChange={actions.setOrigin} />
              <SwapAirportsButton onClick={actions.onSwapRoute} />
              <RouteField label="To" placeholder="Destination" value={state.destination} onChange={actions.setDestination} />
              <div className="h-7 w-px shrink-0 bg-neutral-200" />
              <DateRangeField
                tripType={state.tripType}
                departDate={state.departDate}
                returnDate={state.returnDate}
                onDepartChange={actions.setDepartDate}
                onReturnChange={actions.setReturnDate}
              />
              <div className="h-7 w-px shrink-0 bg-neutral-200" />
              <PaxCabinField
                travellers={state.travellers}
                cabin={state.cabin}
                onTravellersChange={actions.setTravellers}
                onCabinChange={actions.setCabin}
              />
            </div>
            <SearchSubmitButton onClick={handleSubmit} />
          </>
        ) : (
          <div className="flex-1">
            <HotelsSearchForm 
              layout="compact" 
              initialCity={state.destination?.city || ""} 
            />
          </div>
        )}

        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-yellow-600/30 px-4 py-2 text-xs font-bold text-yellow-900 hover:bg-yellow-500/20 xl:flex"
        >
          🔔 Alerts
        </a>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE LAYOUT  (below lg)
          Row 1: Logo + Alerts button
          Row 2: Expanded form card (stacked fields)
      ══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">

        {/* Top bar: logo + alerts */}
        <div className="flex items-center justify-between px-4 py-2">
          {showBranding && <GtaLogo />}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-yellow-600/30 px-3 py-1.5 text-xs font-bold text-yellow-900 hover:bg-yellow-500/20"
          >
            🔔 Alerts
          </a>
        </div>

        {/* ── Mobile Form Logic ──────────────────────────── */}
        <div className="mx-4 mb-3">
          {hasRoute && !isExpanded ? (
            <MobileSummaryPill state={state} onClick={() => setIsExpanded(true)} />
          ) : (
            <div className="rounded-2xl bg-white shadow-md ring-1 ring-black/[0.06]">
              {/* Tab switcher (Mobile) */}
              <div className="flex border-b border-neutral-100 p-2">
                <button
                  type="button"
                  data-testid="tab-flights"
                  role="tab"
                  aria-selected={activeTab === "flights"}
                  aria-label="Flights"
                  onClick={() => setActiveTab("flights")}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                    activeTab === "flights"
                      ? "bg-purple-950 text-white shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  Flights
                </button>
                <button
                  type="button"
                  data-testid="tab-hotels"
                  role="tab"
                  aria-selected={activeTab === "hotels"}
                  aria-label="Hotels"
                  onClick={() => setActiveTab("hotels")}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                    activeTab === "hotels"
                      ? "bg-purple-950 text-white shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-50"
                  }`}
                >
                  Hotels
                </button>
              </div>

              {activeTab === "flights" ? (
                <>
                  {/* Trip type tabs */}
                  <div className="border-b border-neutral-100 px-3 pt-3">
                    <TripTypeSegment value={state.tripType} onChange={actions.setTripType} />
                  </div>

              {/* Route row: From ⇅ To (vertical swap on mobile) */}
              <div className="relative px-3 py-2">
                {/* From */}
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    From
                  </div>
                  <div className="mt-0.5">
                    <RouteField
                      label="From"
                      placeholder="City or airport"
                      value={state.origin}
                      onChange={actions.setOrigin}
                    />
                  </div>
                </div>

                {/* Vertical swap button */}
                <div className="relative my-[-1px] flex justify-center">
                  <button
                    type="button"
                    onClick={actions.onSwapRoute}
                    aria-label="Swap origin and destination"
                    className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-400 bg-white shadow-sm transition-transform hover:scale-110"
                  >
                    {/* vertical swap icon */}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path
                        d="M4 2v10M4 12l-2-2M4 12l2-2M10 2v10M10 2l-2 2M10 2l2 2"
                        stroke="#3D0870"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* To */}
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    To
                  </div>
                  <div className="mt-0.5">
                    <RouteField
                      label="To"
                      placeholder="City or airport"
                      value={state.destination}
                      onChange={actions.setDestination}
                    />
                  </div>
                </div>
              </div>

              {/* Dates + Pax row (2-col grid) */}
              <div className="grid grid-cols-2 gap-0 border-t border-neutral-100 px-3 py-2">
                {/* Dates */}
                <div className="border-r border-neutral-100 pr-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Date
                  </div>
                  <div className="mt-0.5">
                    <DateRangeField
                      tripType={state.tripType}
                      departDate={state.departDate}
                      returnDate={state.returnDate}
                      onDepartChange={actions.setDepartDate}
                      onReturnChange={actions.setReturnDate}
                    />
                  </div>
                </div>

                {/* Pax + cabin */}
                <div className="pl-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Travellers
                  </div>
                  <div className="mt-0.5">
                    <PaxCabinField
                      travellers={state.travellers}
                      cabin={state.cabin}
                      onTravellersChange={actions.setTravellers}
                      onCabinChange={actions.setCabin}
                    />
                  </div>
                </div>
              </div>

              {/* Full-width Search button */}
              <div className="border-t border-neutral-100 px-3 pb-3 pt-2">
                <SearchSubmitButton onClick={handleSubmit} fullWidth />
              </div>

                </>
              ) : (
                <div className="p-3">
                  <HotelsSearchForm 
                    layout="default" 
                    initialCity={state.destination?.city || ""} 
                  />
                </div>
              )}

              {/* Cancel/Collapse button (optional but good for UX) */}
              {hasRoute && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="w-full pb-3 text-center text-xs font-semibold text-neutral-400 hover:text-neutral-600"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Validation errors (both layouts) ──────────────── */}
      {errors.length > 0 && (
        <div
          role="alert"
          className="mx-auto max-w-screen-xl px-4 pb-2 text-sm font-medium text-red-700"
        >
          {errors[0]}
        </div>
      )}
    </div>
  );
}
