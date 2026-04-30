import { memo } from "react";

import { HOTEL_FILTER_OPTIONS } from "@/hooks/useHotelSearch";
import type { HotelFilterId } from "@/types/hotels";

interface HotelFilterSidebarProps {
  activeFilters: HotelFilterId[];
  onToggleFilter: (filterId: HotelFilterId) => void;
  onClearFilters: () => void;
  totalFound: number;
}

/**
 * Sidebar component for filtering hotel results.
 * Redesigned to use a mix of flex-wrap for smaller screens and vertical layout for xl screens.
 */
function HotelFilterSidebarComponent({
  activeFilters,
  onToggleFilter,
  onClearFilters,
  totalFound,
}: HotelFilterSidebarProps) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-900">Filters</p>
        <p className="mt-1 text-xs text-slate-500">
          {totalFound} properties match your current filters
        </p>
      </div>

      <div className="flex flex-wrap gap-2 xl:flex-col">
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
                "rounded-full border px-3 py-1.5 text-sm text-left transition xl:w-full",
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
            className="rounded-full border border-transparent px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 xl:w-full"
          >
            Clear all
          </button>
        )}
      </div>
    </aside>
  );
}

export const HotelFilterSidebar = memo(HotelFilterSidebarComponent);
