import { useMemo } from "react";
import { HotelFilterToolbar } from "@/components/hotels/filters/HotelFilterToolbar";
import { HotelMapPanel } from "@/components/hotels/map/HotelMapPanel";
import { HotelResultsList } from "@/components/hotels/results/HotelResultsList";
import { HotelResultsSummaryRow } from "@/components/hotels/results/HotelResultsSummaryRow";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { getCityName } from "@/lib/cities";
import { useHotelRouteState } from "./useHotelRouteState";
import { useHotelMapView } from "@/features/hotels/mapView/useHotelMapView";

export default function HotelSearchResultsPage() {
  const { query, routeMode, routeMeta } = useHotelRouteState();
  const cityName = getCityName(query.city);

  const {
    isLoading,
    errorMessage,
    visibleHotels,
    sort,
    activeFilters,
    totalFound,
    setSort,
    toggleFilter,
    clearFilters,
    retry,
  } = useHotelSearch(query, { routeMode, routeMeta });

  const {
    selectedHotelId,
    hoveredHotelId,
    setSelectedHotelId,
    setHoveredHotelId,
  } = useHotelMapView(visibleHotels);

  const mappedHotels = useMemo(
    () =>
      visibleHotels.filter(
        (hotel) => hotel.coordinates && !hotel.coordinates.isFallback,
      ),
    [visibleHotels],
  );

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

        <div className="space-y-4">
          <HotelResultsSummaryRow
            cityName={cityName}
            totalFound={totalFound}
            mappedCount={mappedHotels.length}
          />

          <HotelFilterToolbar
            sort={sort}
            activeFilters={activeFilters}
            onSortChange={setSort}
            onToggleFilter={toggleFilter}
            onClearFilters={clearFilters}
            totalFound={totalFound}
          />
        </div>

        {isLoading && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Loading hotels…
          </div>
        )}

        {!!errorMessage && !isLoading && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="font-semibold">Couldn&apos;t load hotels.</p>
            <p className="mt-1 text-sm">{errorMessage}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 rounded-md bg-rose-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-800"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <HotelResultsList
                hotels={visibleHotels}
                checkIn={query.checkIn}
                checkOut={query.checkOut}
                selectedHotelId={selectedHotelId}
                hoveredHotelId={hoveredHotelId}
                onSelectHotel={setSelectedHotelId}
                onHoverHotel={setHoveredHotelId}
              />
            </div>
            <div className="min-w-0">
              <HotelMapPanel
                hotels={mappedHotels}
                selectedHotelId={selectedHotelId}
                hoveredHotelId={hoveredHotelId}
                onSelectHotel={setSelectedHotelId}
                onHoverHotel={setHoveredHotelId}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
