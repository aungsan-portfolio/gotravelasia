import { memo } from "react";
import { ListFilter, Map, SlidersHorizontal } from "lucide-react";

import { HOTEL_SORT_OPTIONS } from "@/hooks/useHotelSearch";
import type { HotelSort } from "@shared/hotels/types";

interface HotelResultsToolbarProps {
  sort: HotelSort;
  onSortChange: (value: HotelSort) => void;
  totalFound: number;
  mappedCount?: number;
}

function HotelResultsToolbarComponent({
  sort,
  onSortChange,
  totalFound,
  mappedCount = 0,
}: HotelResultsToolbarProps) {
  return (
    <section className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Hotel results</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ListFilter className="h-4 w-4" />
              {totalFound} visible properties
            </span>
            <span className="inline-flex items-center gap-1">
              <Map className="h-4 w-4" />
              {mappedCount} with map pins
            </span>
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="inline-flex items-center gap-1 font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            Sort by
          </span>
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as HotelSort)}
            aria-label="Sort hotel results"
          >
            {HOTEL_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export const HotelResultsToolbar = memo(HotelResultsToolbarComponent);
