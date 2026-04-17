import { useSearch } from "wouter";

import HotelsSearchForm from "@/components/hotels/HotelsSearchForm";
import { HotelResultsPanel } from "@/components/hotels/results/HotelResultsPanel";
import { useHotelResultsState } from "@/features/hotels/results/useHotelResultsState";
import { parseHotelSearchParams } from "@shared/hotels/searchParams";
import { getCityName } from "@/lib/cities";

export default function HotelSearchResultsPage() {
  const searchString = useSearch();
  const query = parseHotelSearchParams(searchString);
  const cityName = getCityName(query.city);

  const {
    isLoading,
    errorMessage,
    visibleHotels,
    sort,
    activeFilters,
    selectedHotelId,
    hoveredHotelId,
    totalFound,
    setSort,
    toggleFilter,
    clearFilters,
    retry,
    setSelectedHotelId,
    setHoveredHotelId,
  } = useHotelResultsState(query);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <header className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-sm lg:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
                  Hotel Search
                </p>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  Stay in {cityName}
                </h1>

                <p className="mt-2 max-w-3xl text-sm text-white/75 lg:text-base">
                  Compare hotel prices, review ratings, and map-ready locations for your stay.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-medium text-white/85">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {query.checkIn} → {query.checkOut}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {query.adults} guest{query.adults > 1 ? "s" : ""}
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                  {query.rooms} room{query.rooms > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/95 p-3 text-slate-900 shadow-inner backdrop-blur">
              <HotelsSearchForm
                layout="compact"
                initialCity={query.city}
                initialCheckIn={query.checkIn}
                initialCheckOut={query.checkOut}
                initialAdults={query.adults}
                initialRooms={query.rooms}
                submitLabel="Update Search"
              />
            </div>
          </div>
        </header>

        <HotelResultsPanel
          isLoading={isLoading}
          errorMessage={errorMessage}
          hotels={visibleHotels}
          checkIn={query.checkIn}
          checkOut={query.checkOut}
          sort={sort}
          activeFilters={activeFilters}
          selectedHotelId={selectedHotelId}
          hoveredHotelId={hoveredHotelId}
          totalFound={totalFound}
          onSortChange={setSort}
          onToggleFilter={toggleFilter}
          onClearFilters={clearFilters}
          onRetry={retry}
          onSelectHotel={setSelectedHotelId}
          onHoverHotel={setHoveredHotelId}
        />
      </div>
    </main>
  );
}
