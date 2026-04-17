import { useSearch } from "wouter";

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
        <header className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Hotel Search Results</h1>
          <p className="mt-1 text-slate-600">
            {cityName} · {query.checkIn} to {query.checkOut} · {query.adults} guests · {query.rooms} room
            {query.rooms > 1 ? "s" : ""}
          </p>
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
