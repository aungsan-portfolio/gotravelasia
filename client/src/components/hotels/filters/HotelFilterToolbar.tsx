import { memo } from "react";
import {
  HOTEL_FILTER_OPTIONS,
  HOTEL_SORT_OPTIONS,
} from "@/features/hotels/results/useHotelResultsState";
import type { HotelFilterId } from "@/types/hotels";
import type { HotelSort } from "@shared/hotels/types";

interface HotelFilterToolbarProps {
  sort: HotelSort;
  activeFilters: HotelFilterId[];
  onSortChange: (value: HotelSort) => void;
  onToggleFilter: (filterId: HotelFilterId) => void;
  onClearFilters: () => void;
  totalFound: number;
}

function HotelFilterToolbarComponent({
  sort,
  activeFilters,
  onSortChange,
  onToggleFilter,
  onClearFilters,
  totalFound,
}: HotelFilterToolbarProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
        <img
          src="/images/logo.png"
          alt="GoTravelAsia Logo"
          className="h-10 w-10 object-contain"
        />
        <h1 className="text-xl font-bold tracking-tight text-indigo-600">
          GOTRAVELASIA
        </h1>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Hotel results</p>
          <p className="text-sm text-slate-500">{totalFound} properties match your current filters</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-medium">Sort by</span>
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

export const HotelFilterToolbar = memo(HotelFilterToolbarComponent);
