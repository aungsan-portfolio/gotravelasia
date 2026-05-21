import { memo } from "react";
import { Check } from "lucide-react";

import { HOTEL_FILTER_OPTIONS } from "@/hooks/useHotelSearch";
import type { HotelFilterId } from "@/types/hotels";

interface HotelQuickFilterPillsProps {
  activeFilters: HotelFilterId[];
  onToggleFilter: (filterId: HotelFilterId) => void;
}

/**
 * Horizontal scrollable row of quick-filter pills.
 * Sits above the hotel list as a "primary" filter affordance,
 * complementing the rich Sidebar filters (price/stars/amenities).
 */
function HotelQuickFilterPillsComponent({
  activeFilters,
  onToggleFilter,
}: HotelQuickFilterPillsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="group"
      aria-label="Quick filters"
    >
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
              "inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
              isActive
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            {isActive && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export const HotelQuickFilterPills = memo(HotelQuickFilterPillsComponent);
