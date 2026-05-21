import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { HotelFilterSidebar } from "@/components/hotels/results/HotelFilterSidebar";
import { HotelResultsToolbar } from "@/components/hotels/results/HotelResultsToolbar";
import { HotelMapPanel } from "@/components/hotels/map/HotelMapPanel";
import { HotelResultsList } from "@/components/hotels/results/HotelResultsList";
import { MockDataBanner } from "@/components/hotels/results/MockDataBanner";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { useHotelUrlState, type HotelUrlFilterState } from "@/hooks/useHotelUrlState";
import { getCityName } from "@/lib/cities";
import { buildHotelDetailUrl } from "@/lib/hotels/buildHotelDetailUrl";
import {
  trackHotelNoResults,
  trackHotelSearchError,
  trackHotelSearchView,
  trackHotelSelect,
} from "@/lib/hotels/tracking";
import { useHotelRouteState } from "./useHotelRouteState";
import { useHotelMapView } from "@/features/hotels/mapView/useHotelMapView";
import type { MarkerBounds } from "@/features/hotels/mapView/markers.types";
import { ExternalLink, SearchX, List, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HotelPagination } from "@/components/hotels/results/HotelPagination";
import { HotelAffiliateStrip } from "@/components/hotels/results/HotelAffiliateStrip";
import { HotelQuickFilterPills } from "@/components/hotels/results/HotelQuickFilterPills";

import { StructuredData } from "@/components/seo/StructuredData";
import { buildHotelSearchResultSchema } from "@/lib/seo/buildHotelSearchResultSchema";

export default function HotelSearchResultsPage() {
  const { query, routeMode, routeMeta } = useHotelRouteState();
  const cityName = query.cityName || getCityName(query.city) || query.city;
  const [, setLocation] = useLocation();

  const {
    isLoading,
    errorMessage,
    allHotels,
    visibleHotels,
    meta,
    affiliateLinks,
    sort,
    activeFilters,
    totalFound,
    richFilters,
    currentPage,
    totalPages,
    setPage,
    setSort,
    toggleFilter,
    setPriceRange,
    toggleStarRating,
    setMinGuestRating,
    toggleAmenity,
    clearFilters,
    retry,
  } = useHotelSearch(query, { routeMode, routeMeta });

  const {
    selectedHotelId,
    hoveredHotelId,
    bounds,
    setSelectedHotelId,
    setHoveredHotelId,
    setBounds,
  } = useHotelMapView(visibleHotels);

  // ─── "Search this area" state ────────────────────────────────────
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [areaFilteredHotels, setAreaFilteredHotels] = useState<typeof visibleHotels | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const handleSearchArea = useCallback((mapBounds: MarkerBounds) => {
    setIsSearchingArea(true);
    setBounds(mapBounds);

    // Client-side filter: show only hotels within the visible map bounds
    const filtered = visibleHotels.filter((hotel) => {
      if (!hotel.coordinates || hotel.coordinates.isFallback) return false;
      const { lat, lng } = hotel.coordinates;
      return (
        lat >= mapBounds.south &&
        lat <= mapBounds.north &&
        lng >= mapBounds.west &&
        lng <= mapBounds.east
      );
    });

    setAreaFilteredHotels(filtered);
    setIsSearchingArea(false);
  }, [visibleHotels, setBounds]);

  // Reset area filter when base results change (new search, filter change)
  useEffect(() => {
    setAreaFilteredHotels(null);
  }, [visibleHotels]);

  // ─── URL state sync (P3) ─────────────────────────────────────────
  const handleRestoreFilters = useCallback((restored: HotelUrlFilterState) => {
    // Restore quick filters
    for (const filterId of restored.activeFilters) {
      toggleFilter(filterId);
    }
    // Restore rich filters
    if (restored.richFilters.priceRange) {
      setPriceRange(restored.richFilters.priceRange);
    }
    if (restored.richFilters.starRatings) {
      for (const star of restored.richFilters.starRatings) {
        toggleStarRating(star);
      }
    }
    if (restored.richFilters.minGuestRating != null) {
      setMinGuestRating(restored.richFilters.minGuestRating);
    }
    if (restored.richFilters.amenities) {
      for (const amenity of restored.richFilters.amenities) {
        toggleAmenity(amenity);
      }
    }
    // Restore map bounds (triggers area search)
    if (restored.mapBounds) {
      handleSearchArea(restored.mapBounds);
    }
  }, [toggleFilter, setPriceRange, toggleStarRating, setMinGuestRating, toggleAmenity, handleSearchArea]);

  useHotelUrlState({
    activeFilters,
    richFilters,
    mapBounds: bounds,
    sort,
    onRestoreFilters: handleRestoreFilters,
  });

  // Use area-filtered hotels if active, otherwise all visible
  const displayHotels = areaFilteredHotels ?? visibleHotels;

  const mappedHotels = useMemo(
    () =>
      displayHotels.filter(
        hotel => hotel.coordinates && !hotel.coordinates.isFallback
      ),
    [displayHotels]
  );
  const shouldShowAgodaCtaFallback =
    meta?.source === "agoda" &&
    allHotels.length === 0 &&
    Boolean(affiliateLinks?.agoda);

  const emptyStateContent = (() => {
    switch (meta?.emptyStateReason) {
      case "provider_unavailable":
        return {
          title: "Live hotel results are temporarily unavailable",
          body: meta?.warning || "You can still compare hotels directly with our partner links.",
        };
      case "unsupported_city":
      case "unresolved_city":
        return {
          title: "Live hotel results are not available in-app for this destination yet",
          body: "You can still view hotels directly with our partners.",
        };
      case "no_filter_matches":
        return {
          title: "No hotels match your current filters",
          body: "Try changing your price, star rating, or amenities filters.",
        };
      case "no_live_inventory":
      default:
        return {
          title: "No live hotel inventory returned for this search",
          body: "Try different dates or continue directly with a provider.",
        };
    }
  })();

  const openHotelDetail = (hotelId: string) => {
    const selectedHotel = displayHotels.find(
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

  useEffect(() => {
    if (isLoading || !errorMessage) {
      return;
    }

    trackHotelSearchError({
      city: query.city,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      errorMessage,
      source: "hotel_results",
    });
  }, [errorMessage, isLoading, query.checkIn, query.checkOut, query.city]);

  useEffect(() => {
    if (isLoading || errorMessage || visibleHotels.length !== 0) {
      return;
    }

    trackHotelNoResults({
      city: query.city,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      resultCount: 0,
      source: "hotel_results",
    });
  }, [
    errorMessage,
    isLoading,
    query.checkIn,
    query.checkOut,
    query.city,
    visibleHotels.length,
  ]);

  return (
    <>
      {displayHotels.length > 0 && !isLoading && (
        <StructuredData schema={buildHotelSearchResultSchema(displayHotels, window.location.href)} />
      )}
      <main className="min-h-screen bg-slate-50 relative pb-20 xl:pb-6">
      <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Hotels in {cityName}
        </h1>

        <div className="mt-6">
          <HotelResultsToolbar
            sort={sort}
            onSortChange={setSort}
            totalFound={totalFound}
            mappedCount={mappedHotels.length}
          />
        </div>

        {meta?.source === "mock" && (
          <div className="mt-4">
            <MockDataBanner affiliateUrl={affiliateLinks?.agoda} />
          </div>
        )}

        <div className="mt-4 xl:hidden">
          <HotelFilterSidebar
            activeFilters={activeFilters}
            richFilters={richFilters}
            onToggleFilter={toggleFilter}
            onClearFilters={clearFilters}
            onSetPriceRange={setPriceRange}
            onToggleStarRating={toggleStarRating}
            onSetMinGuestRating={setMinGuestRating}
            onToggleAmenity={toggleAmenity}
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
            {meta?.emptyStateReason === "no_filter_matches" ? (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-3 min-w-[140px] shadow-sm transition-shadow hover:shadow"
              >
                Clear Filters
              </Button>
            ) : (
              <button
                type="button"
                onClick={retry}
                className="mt-3 rounded-md bg-rose-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-800"
              >
                Retry
              </button>
            )}
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
                  {emptyStateContent.title}
                </h2>

                <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
                  {emptyStateContent.body}
                </p>

                {affiliateLinks?.agoda && meta?.emptyStateReason !== "no_filter_matches" && (
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
                
                {meta?.emptyStateReason === "no_filter_matches" && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </section>
            )}

            {!shouldShowAgodaCtaFallback && (
              <>
                <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[240px_420px_minmax(0,1fr)] 2xl:grid-cols-[280px_460px_minmax(0,1fr)]">
                  <div className="hidden xl:block relative">
                    <div className="sticky top-4">
                      <HotelFilterSidebar
                        activeFilters={activeFilters}
                        richFilters={richFilters}
                        onToggleFilter={toggleFilter}
                        onClearFilters={clearFilters}
                        onSetPriceRange={setPriceRange}
                        onToggleStarRating={toggleStarRating}
                        onSetMinGuestRating={setMinGuestRating}
                        onToggleAmenity={toggleAmenity}
                        totalFound={totalFound}
                      />
                    </div>
                  </div>

                  <div className={mobileView === "list" ? "min-w-0 flex flex-col" : "hidden xl:flex min-w-0 flex-col"}>
                    <div className="mb-4">
                      <HotelQuickFilterPills
                        activeFilters={activeFilters}
                        onToggleFilter={toggleFilter}
                      />
                    </div>
                    <HotelResultsList
                      hotels={displayHotels}
                      checkIn={query.checkIn}
                      checkOut={query.checkOut}
                      selectedHotelId={selectedHotelId}
                      hoveredHotelId={hoveredHotelId}
                      onSelectHotel={setSelectedHotelId}
                      onHoverHotel={setHoveredHotelId}
                      onOpenHotelDetail={openHotelDetail}
                    />
                  </div>

                  <div className={mobileView === "map" ? "min-w-0 h-[calc(100vh-160px)]" : "hidden xl:block min-w-0 h-[calc(100vh-80px)] sticky top-4"}>
                    <HotelMapPanel
                      hotels={mappedHotels}
                      selectedHotelId={selectedHotelId}
                      hoveredHotelId={hoveredHotelId}
                      bounds={bounds}
                      onSelectHotel={setSelectedHotelId}
                      onHoverHotel={setHoveredHotelId}
                      onSearchArea={handleSearchArea}
                      isSearchingArea={isSearchingArea}
                      city={query.city}
                      checkIn={query.checkIn}
                      checkOut={query.checkOut}
                    />
                  </div>
                </div>
              </>
            )}
            
            {!shouldShowAgodaCtaFallback && displayHotels.length > 0 && (
              <div className="mt-6 space-y-4">
                <HotelAffiliateStrip affiliateLinks={affiliateLinks} cityName={cityName} />

                <footer className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="text-sm text-slate-500">
                      Showing page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
                      <span className="font-semibold text-slate-900">{totalPages}</span>
                    </div>

                    <HotelPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </footer>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Floating Mobile Toggle Button */}
      {!shouldShowAgodaCtaFallback && displayHotels.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center xl:hidden pointer-events-none">
          <button
            type="button"
            onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10 transition-transform active:scale-95"
          >
            {mobileView === "list" ? (
              <>
                <MapIcon className="h-4 w-4" />
                Map
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                List
              </>
            )}
          </button>
        </div>
      )}
    </main>
    </>
  );
}
