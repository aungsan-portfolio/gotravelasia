import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { HotelFilterToolbar } from "@/components/hotels/filters/HotelFilterToolbar";
import { HotelMapPanel } from "@/components/hotels/map/HotelMapPanel";
import { HotelResultsList } from "@/components/hotels/results/HotelResultsList";
import { HotelResultsSummaryRow } from "@/components/hotels/results/HotelResultsSummaryRow";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { getCityName } from "@/lib/cities";
import { buildHotelDetailUrl } from "@/lib/hotels/buildHotelDetailUrl";
import { trackHotelSearchView, trackHotelSelect } from "@/lib/hotels/tracking";
import { useHotelRouteState } from "./useHotelRouteState";
import { useHotelMapView } from "@/features/hotels/mapView/useHotelMapView";
import { ExternalLink, SearchX } from "lucide-react";

export default function HotelSearchResultsPage() {
  const { query, routeMode, routeMeta } = useHotelRouteState();
  const cityName = query.cityName || getCityName(query.city) || query.city;
  const [, setLocation] = useLocation();

  const {
    isLoading,
    errorMessage,
    visibleHotels,
    meta,
    affiliateLinks,
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
    bounds,
    setSelectedHotelId,
    setHoveredHotelId,
  } = useHotelMapView(visibleHotels);

  const mappedHotels = useMemo(
    () =>
      visibleHotels.filter(
        hotel => hotel.coordinates && !hotel.coordinates.isFallback
      ),
    [visibleHotels]
  );
  const shouldShowAgodaCtaFallback =
    meta?.source === "agoda" &&
    visibleHotels.length === 0 &&
    Boolean(affiliateLinks?.agoda);

  const openHotelDetail = (hotelId: string) => {
    const selectedHotel = visibleHotels.find(
      hotel => hotel.hotelId === hotelId
    );

    trackHotelSelect({
      hotelId,
      city: query.city,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      resultPosition: selectedHotel?.rankingPosition,
    });

    setLocation(
      buildHotelDetailUrl({
        hotelId,
        query,
      })
    );
  };

  useEffect(() => {
    if (isLoading || errorMessage) {
      return;
    }

    trackHotelSearchView({
      city: query.city,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
    });
  }, [
    isLoading,
    errorMessage,
    visibleHotels.length,
    query.city,
    query.checkIn,
    query.checkOut,
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Hotels in {cityName}
        </h1>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <HotelFilterToolbar
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
            onClearFilters={clearFilters}
            sort={sort}
            onSortChange={setSort}
            totalFound={totalFound}
          />
        </div>

        <div className="mt-6">
          <HotelResultsSummaryRow
            cityName={cityName}
            totalFound={totalFound}
            mappedCount={mappedHotels.length}
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
          <>
            {shouldShowAgodaCtaFallback && (
              <section className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <SearchX className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  Live hotel results are not available in-app for {cityName} yet.
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
                  You can still view hotels directly on Agoda.
                </p>
                {affiliateLinks?.agoda && (
                  <div className="mt-4 flex justify-center">
                    <a
                      href={affiliateLinks.agoda}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      View hotels on Agoda
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </section>
            )}

            {!shouldShowAgodaCtaFallback && (
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
                    onOpenHotelDetail={openHotelDetail}
                  />
                </div>
                <div className="min-w-0">
                  <HotelMapPanel
                    hotels={mappedHotels}
                    selectedHotelId={selectedHotelId}
                    hoveredHotelId={hoveredHotelId}
                    bounds={bounds}
                    onSelectHotel={setSelectedHotelId}
                    onHoverHotel={setHoveredHotelId}
                    city={query.city}
                    checkIn={query.checkIn}
                    checkOut={query.checkOut}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
