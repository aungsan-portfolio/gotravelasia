// components/flights/search/CompactFlightToolbar.tsx
//
// Cheapflights-style compact search toolbar.
// Gold background | white pill | black Search button
//
// Phase 1: Full UI shell with state management.
//          Submits to Travelpayouts White Label results page.
// Phase 2: Connect real airport autocomplete + date picker.

import { TripTypeSegment }   from "./TripTypeSegment";
import { RouteField }        from "./RouteField";
import { SwapAirportsButton } from "./SwapAirportsButton";
import { DateRangeField }    from "./DateRangeField";
import { PaxCabinField }     from "./PaxCabinField";
import { SearchSubmitButton } from "./SearchSubmitButton";
import { useFlightSearch }   from "@/features/flights/search/useFlightSearch";
import type { FlightSearchState } from "@/features/flights/search/flightSearch.types";

interface Props {
  /** Pre-fill toolbar for destination pages (e.g. /flights/to/singapore) */
  initialState?: Partial<FlightSearchState>;
  /** Show back button + branding (default: true) */
  showBranding?: boolean;
}

function GtaLogo() {
  return (
    <a href="/" aria-label="GoTravel Asia home" className="flex shrink-0 items-center gap-2 no-underline">
      <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect width="34" height="34" rx="7" fill="#3D0870"/>
        <path d="M6 24 Q9 7 24 6" stroke="#F5A623" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
        <path d="M6 27 Q10 9 27 8" stroke="#F5A623" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45"/>
        <path d="M21 9.5L24.5 7.5L25.5 8.8L23 10.5L25 12.5L23 12.5L21.5 11.2L19 12.5L18.5 11Z" fill="#F5A623"/>
        <text x="5" y="26" fontFamily="Arial Black,Impact,sans-serif" fontWeight="900" fontSize="12.5" fill="#fff" letterSpacing="-0.5">GO</text>
      </svg>
      <span className="hidden text-[15px] font-black tracking-tight text-[#3D0870] lg:block">
        GO<span className="text-[#5B0FA8]">TRAVEL</span> ASIA
      </span>
    </a>
  );
}

export function CompactFlightToolbar({
  initialState,
  showBranding = true,
}: Props) {
  const { state, errors, actions } = useFlightSearch(initialState);

  function handleSubmit() {
    const result = actions.submit();
    if (result.ok) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b border-yellow-500/30 bg-yellow-400 shadow-sm">
      {/* ── Main toolbar row ──────────────────────────── */}
      <div className="mx-auto flex max-w-screen-xl items-center gap-3 px-4 py-2.5">

        {/* Branding */}
        {showBranding && (
          <>
            <GtaLogo />
            <div className="hidden h-5 w-px bg-yellow-600/30 lg:block" />
          </>
        )}

        {/* ── Search pill ─────────────────────────────── */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/[0.08]">

          {/* Trip type */}
          <TripTypeSegment
            value={state.tripType}
            onChange={actions.setTripType}
          />

          <div className="h-7 w-px shrink-0 bg-neutral-200" />

          {/* Origin */}
          <RouteField
            label="From"
            placeholder="Origin"
            value={state.origin}
            onChange={actions.setOrigin}
          />

          <SwapAirportsButton onClick={actions.onSwapRoute} />

          {/* Destination */}
          <RouteField
            label="To"
            placeholder="Destination"
            value={state.destination}
            onChange={actions.setDestination}
          />

          <div className="h-7 w-px shrink-0 bg-neutral-200" />

          {/* Dates */}
          <DateRangeField
            tripType={state.tripType}
            departDate={state.departDate}
            returnDate={state.returnDate}
            onDepartChange={actions.setDepartDate}
            onReturnChange={actions.setReturnDate}
          />

          <div className="h-7 w-px shrink-0 bg-neutral-200" />

          {/* Pax + cabin */}
          <PaxCabinField
            travellers={state.travellers}
            cabin={state.cabin}
            onTravellersChange={actions.setTravellers}
            onCabinChange={actions.setCabin}
          />
        </div>

        {/* ── Search button ────────────────────────────── */}
        <SearchSubmitButton onClick={handleSubmit} />

        {/* Right pill: Price Alerts */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-yellow-600/30 px-4 py-2 text-xs font-bold text-yellow-900 transition-colors hover:bg-yellow-500/20 sm:flex"
        >
          🔔 Alerts
        </a>
      </div>

      {/* ── Inline validation errors ─────────────────── */}
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
