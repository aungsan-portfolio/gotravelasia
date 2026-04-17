import { memo, useMemo } from "react";

import { HotelResultsToolbar } from "@/components/hotels/results/HotelResultsToolbar";
import { HotelResultsList } from "@/components/hotels/results/HotelResultsList";
import { HotelMapPanel } from "@/components/hotels/map/HotelMapPanel";
import type { HotelFilterId } from "@/types/hotels";
import type { HotelResult, HotelSort } from "@shared/hotels/types";

interface HotelResultsPanelProps {
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
  onSortChange: (value: HotelSort) => void;
  onToggleFilter: (filterId: HotelFilterId) => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onSelectHotel: (hotelId: string | null) => void;
  onHoverHotel: (hotelId: string | null) => void;
}

function HotelResultsPanelComponent({
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
  onSortChange,
  onToggleFilter,
  onClearFilters,
  onRetry,
  onSelectHotel,
  onHoverHotel,
}: HotelResultsPanelProps) {
  const mappedHotels = useMemo(
    () => hotels.filter((hotel) => hotel.coordinates && !hotel.coordinates.isFallback),
    [hotels],
  );

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

      {!isLoading && !errorMessage && (
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <HotelResultsList
              hotels={hotels}
              checkIn={checkIn}
              checkOut={checkOut}
              selectedHotelId={selectedHotelId}
              hoveredHotelId={hoveredHotelId}
              onSelectHotel={(hotelId) => onSelectHotel(hotelId)}
              onHoverHotel={onHoverHotel}
            />
          </div>

          <div className="min-w-0">
            <HotelMapPanel
              hotels={mappedHotels}
              selectedHotelId={selectedHotelId}
              hoveredHotelId={hoveredHotelId}
              onSelectHotel={(hotelId) => onSelectHotel(hotelId)}
              onHoverHotel={onHoverHotel}
            />
          </div>
        </div>
      )}
    </>
  );
}

export const HotelResultsPanel = memo(HotelResultsPanelComponent);
