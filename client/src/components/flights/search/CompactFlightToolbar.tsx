// v2.0.1-premium
import { useState } from "react";
import { TripTypeSegment } from "./TripTypeSegment";
import { RouteField } from "./RouteField";
import { SwapAirportsButton } from "./SwapAirportsButton";
import { DateRangeField } from "./DateRangeField";
import { PaxCabinField } from "./PaxCabinField";
import { SearchSubmitButton } from "./SearchSubmitButton";
import { MobileSummaryPill } from "../results/MobileSummaryPill";
import { useWhiteLabelFlightSearch } from "@/features/flights/search/useWhiteLabelFlightSearch";
import type { FlightSearchState } from "@/features/flights/search/flightSearch.types";
import HotelsSearchForm from "@/components/hotels/HotelsSearchForm";

type SearchTab = "flights" | "hotels";

interface Props {
  initialState?: Partial<FlightSearchState>;
  showBranding?: boolean;
}

function GtaLogo() {
  return (
    <a href="/" aria-label="GoTravel Asia home" className="gta-logo flex shrink-0 items-center gap-2 no-underline">
      <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
        <rect width="34" height="34" rx="7" fill="#3D0870" />
        <path d="M6 24 Q9 7 24 6" stroke="#F5A623" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path
          d="M6 27 Q10 9 27 8"
          stroke="#F5A623"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M21 9.5L24.5 7.5L25.5 8.8L23 10.5L25 12.5L23 12.5L21.5 11.2L19 12.5L18.5 11Z"
          fill="#F5A623"
        />
        <text
          x="5"
          y="26"
          fontFamily="Arial Black,Impact,sans-serif"
          fontWeight="900"
          fontSize="12.5"
          fill="#fff"
          letterSpacing="-0.5"
        >
          GO
        </text>
      </svg>
      <span className="hidden text-[14px] font-black tracking-tight text-white sm:block">
        GO<span className="text-[#F5A623]">TRAVEL</span> ASIA
      </span>
    </a>
  );
}

export function CompactFlightToolbar({ initialState, showBranding = true }: Props) {
  const { state, actions } = useWhiteLabelFlightSearch(initialState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>("flights");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasRoute = !!(state.origin && state.destination);

  function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const result = actions.submit();
    if (result.ok) {
      setIsExpanded(false);
      window.location.href = result.url;
      return;
    }
    setIsSubmitting(false);
  }

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-b from-[#24103A] to-[#160B26]/95 shadow-[0_8px_30px_rgba(13,8,24,0.45)] backdrop-blur-[1px]">
      <div className="mx-auto max-w-screen-xl px-3 py-2.5 sm:px-6 lg:px-8">
        <div className="hidden items-center gap-2.5 lg:flex">
          {showBranding && (
            <>
              <GtaLogo />
              <div className="h-5 w-px bg-white/10" />
            </>
          )}

          <div className="inline-flex rounded-xl bg-white/10 p-1 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("flights")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "flights"
                  ? "bg-white text-[#24103A]"
                  : "text-white/72 hover:bg-white/10 hover:text-white"
              }`}
            >
              Flights
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hotels")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "hotels"
                  ? "bg-white text-[#24103A]"
                  : "text-white/72 hover:bg-white/10 hover:text-white"
              }`}
            >
              Hotels
            </button>
          </div>

          {activeTab === "flights" ? (
            <>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-2xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/[0.08]">
                <TripTypeSegment value={state.tripType} onChange={actions.setTripType} />
                <div className="h-7 w-px shrink-0 bg-black/10" />
                <RouteField
                  label="From"
                  placeholder="Origin"
                  value={state.origin}
                  onChange={actions.setOrigin}
                />
                <SwapAirportsButton onClick={actions.onSwapRoute} />
                <RouteField
                  label="To"
                  placeholder="Destination"
                  value={state.destination}
                  onChange={actions.setDestination}
                />
                <div className="h-7 w-px shrink-0 bg-black/10" />
                <DateRangeField
                  tripType={state.tripType}
                  departDate={state.departDate}
                  returnDate={state.returnDate}
                  onDepartChange={actions.setDepartDate}
                  onReturnChange={actions.setReturnDate}
                />
                <div className="h-7 w-px shrink-0 bg-black/10" />
                <PaxCabinField
                  travellers={state.travellers}
                  cabin={state.cabin}
                  onTravellersChange={actions.setTravellers}
                  onCabinChange={actions.setCabin}
                />
              </div>
              <SearchSubmitButton onClick={handleSubmit} loading={isSubmitting} className="!h-11 !rounded-xl !bg-[#F5A623] !px-5 !font-extrabold !text-[#2A1602] hover:!bg-[#D4881A]" />
            </>
          ) : (
            <div className="flex-1">
              <HotelsSearchForm layout="compact" initialCity={state.destination?.city || ""} />
            </div>
          )}
        </div>

        <div className="lg:hidden">
          <div className="mb-2 flex items-center justify-between">
            {showBranding && <GtaLogo />}
          </div>

          <div className="mb-2 inline-flex w-full rounded-xl bg-white/10 p-1 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setActiveTab("flights")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                activeTab === "flights"
                  ? "bg-white text-[#24103A]"
                  : "text-white/72 hover:bg-white/10 hover:text-white"
              }`}
            >
              Flights
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("hotels")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                activeTab === "hotels"
                  ? "bg-white text-[#24103A]"
                  : "text-white/72 hover:bg-white/10 hover:text-white"
              }`}
            >
              Hotels
            </button>
          </div>

          {activeTab === "flights" && hasRoute && !isExpanded ? (
            <MobileSummaryPill state={state} onClick={() => setIsExpanded(true)} />
          ) : activeTab === "flights" ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-[0_12px_34px_rgba(7,4,12,0.35)]">
              <div className="mb-2 rounded-xl bg-white px-2 py-1.5 ring-1 ring-black/[0.08]">
                <TripTypeSegment value={state.tripType} onChange={actions.setTripType} />
              </div>

              <div className="space-y-2 rounded-xl bg-white p-2 ring-1 ring-black/[0.08]">
                <RouteField
                  label="From"
                  placeholder="City or airport"
                  value={state.origin}
                  onChange={actions.setOrigin}
                />
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={actions.onSwapRoute}
                    aria-label="Swap origin and destination"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#5B0FA8]/30 bg-white text-[#5B0FA8] shadow-sm transition hover:bg-[#f7f1ff]"
                  >
                    ⇅
                  </button>
                </div>
                <RouteField
                  label="To"
                  placeholder="City or airport"
                  value={state.destination}
                  onChange={actions.setDestination}
                />
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-2 ring-1 ring-black/[0.08]">
                  <DateRangeField
                    tripType={state.tripType}
                    departDate={state.departDate}
                    returnDate={state.returnDate}
                    onDepartChange={actions.setDepartDate}
                    onReturnChange={actions.setReturnDate}
                  />
                </div>
                <div className="rounded-xl bg-white p-2 ring-1 ring-black/[0.08]">
                  <PaxCabinField
                    travellers={state.travellers}
                    cabin={state.cabin}
                    onTravellersChange={actions.setTravellers}
                    onCabinChange={actions.setCabin}
                  />
                </div>
              </div>

              <SearchSubmitButton onClick={handleSubmit} loading={isSubmitting} className="!mt-3 !h-11 !w-full !rounded-xl !bg-[#F5A623] !font-extrabold !text-[#2A1602] hover:!bg-[#D4881A]" />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
              <HotelsSearchForm layout="compact" initialCity={state.destination?.city || ""} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
