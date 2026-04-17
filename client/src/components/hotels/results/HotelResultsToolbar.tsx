import { memo } from "react";
import { ListFilter, Map, SlidersHorizontal } from "lucide-react";

import {
  HOTEL_FILTER_OPTIONS,
  HOTEL_SORT_OPTIONS,
} from "@/hooks/useHotelSearch";
import type { HotelFilterId } from "@/types/hotels";
import type { HotelSort } from "@shared/hotels/types";

interface HotelResultsToolbarProps {
  sort: HotelSort;
  activeFilters: HotelFilterId[];
  onSortChange: (value: HotelSort) => void;
  onToggleFilter: (filterId: HotelFilterId) => void;
  onClearFilters: () => void;
  totalFound: number;
  mappedCount?: number;
}

function HotelResultsToolbarComponent({
  sort,
  activeFilters,
  onSortChange,
  onToggleFilter,
  onClearFilters,
  totalFound,
  mappedCount = 0,
}: HotelResultsToolbarProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
        <img
          src="/images/logo.png"
          alt="GoTravelAsia Logo"
          className="h-10 w-10 object-contain"
        />
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">
            GOTRAVELASIA
          </h1>
          <p className="text-xs text-slate-500">
            Hotels results toolbar
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Hotel results</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1">
              <ListFilter className="h-4 w-4" />
              {totalFound} properties match your current filters
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
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-500"
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

      <div className="mt-4 flex flex-wrap gap-2">
        {HOTEL_FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilters.includes(filter.id);

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onToggleFilter(filter.id)}
              title={filter.description}
              aria-pressed={isActive}
              className={[
                "rounded-full border px-3 py-1.5 text-sm transition",
                isActive
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-full border border-transparent px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
          >
            Clear all
          </button>
        )}
      </div>
    </section>
  );
}

export const HotelResultsToolbar = memo(HotelResultsToolbarComponent);
