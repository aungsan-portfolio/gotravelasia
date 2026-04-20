import { memo, useMemo, useState } from "react";
import { List, Map, SearchX } from "lucide-react";

import { HotelResultsToolbar } from "@/components/hotels/results/HotelResultsToolbar";
import { HotelResultsList } from "@/components/hotels/results/HotelResultsList";
import { HotelMapPanel } from "@/components/hotels/map/HotelMapPanel";
import { HotelAffiliateStrip } from "@/components/hotels/results/HotelAffiliateStrip";
import { HotelPagination } from "@/components/hotels/results/HotelPagination";
import type { HotelFilterId } from "@/types/hotels";
import type { HotelOutboundLinks, HotelResult, HotelSort } from "@shared/hotels/types";

interface HotelResultsPanelProps {
  cityName: string;
  isLoading: boolean;
  errorMessage: string | null;
  hotels: HotelResult[];
  checkIn: string;
  checkOut: string;
  sort: HotelSort;
  activeFilters: HotelFilterId[];
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  totalFound: number;
  currentPage: number;
  totalPages: number;
  affiliateLinks?: HotelOutboundLinks | null;
  onSortChange: (value: HotelSort) => void;
  onPageChange: (page: number) => void;
  onToggleFilter: (filterId: HotelFilterId) => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onSelectHotel: (hotelId: string | null) => void;
  onHoverHotel: (hotelId: string | null) => void;
  city?: string;
}

type MobileResultsView = "list" | "map";

function HotelResultsPanelComponent({
  cityName,
  isLoading,
  errorMessage,
  hotels,
  checkIn,
  checkOut,
  sort,
  activeFilters,
  selectedHotelId,
  hoveredHotelId,
  totalFound,
  currentPage,
  totalPages,
  affiliateLinks,
  onSortChange,
  onPageChange,
  onToggleFilter,
  onClearFilters,
  onRetry,
  onSelectHotel,
  onHoverHotel,
  city,
}: HotelResultsPanelProps) {
  const [mobileView, setMobileView] = useState<MobileResultsView>("list");

  const mappedHotels = useMemo(
    () => hotels.filter((hotel) => hotel.coordinates && !hotel.coordinates.isFallback),
    [hotels],
  );

  const hasNoVisibleHotels = !isLoading && !errorMessage && hotels.length === 0;

  return (
    <>
      <HotelResultsToolbar
        sort={sort}
        activeFilters={activeFilters}
        onSortChange={onSortChange}
        onToggleFilter={onToggleFilter}
        onClearFilters={onClearFilters}
        totalFound={totalFound}
        mappedCount={mappedHotels.length}
      />

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
            onClick={onRetry}
            className="mt-3 rounded-md bg-rose-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {hasNoVisibleHotels && (
        <div className="mt-4 space-y-4">
          <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <SearchX className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No hotels match your current filters
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
              Try clearing one or more filters, adjusting your dates, or opening a partner
              search for a wider inventory selection in {cityName}.
            </p>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Clear filters
              </button>
            </div>
          </section>

          <HotelAffiliateStrip affiliateLinks={affiliateLinks} cityName={cityName} />
        </div>
      )}

      {!isLoading && !errorMessage && hotels.length > 0 && (
        <>
          <div className="mt-4 lg:hidden">
            <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className={[
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                  mobileView === "list"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="inline-flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileView("map")}
                className={[
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                  mobileView === "map"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="inline-flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Map
                </span>
              </button>
            </div>
          </div>

          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className={mobileView === "list" ? "min-w-0" : "hidden min-w-0 lg:block"}>
              <HotelResultsList
                hotels={hotels}
                checkIn={checkIn}
                checkOut={checkOut}
                selectedHotelId={selectedHotelId}
                hoveredHotelId={hoveredHotelId}
                onSelectHotel={(hotelId) => onSelectHotel(hotelId)}
                onHoverHotel={onHoverHotel}
                onOpenHotelDetail={(hotelId) => onSelectHotel(hotelId)}
              />
            </div>

            <div className={mobileView === "map" ? "min-w-0" : "hidden min-w-0 lg:block"}>
              <HotelMapPanel
                hotels={mappedHotels}
                selectedHotelId={selectedHotelId}
                hoveredHotelId={hoveredHotelId}
                onSelectHotel={(hotelId) => onSelectHotel(hotelId)}
                onHoverHotel={onHoverHotel}
                city={city || cityName}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            </div>
          </div>

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
                  onPageChange={onPageChange}
                />
              </div>
            </footer>
          </div>
        </>
      )}
    </>
  );
}

export const HotelResultsPanel = memo(HotelResultsPanelComponent);
