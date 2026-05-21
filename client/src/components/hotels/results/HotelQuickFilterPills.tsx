import { memo } from "react";
import { HOTEL_FILTER_OPTIONS } from "@/hooks/useHotelSearch";
import type { HotelFilterId } from "@/types/hotels";

export interface HotelQuickFilterPillsProps {
  activeFilters: HotelFilterId[];
  onToggleFilter: (filterId: HotelFilterId) => void;
}

function HotelQuickFilterPillsComponent({
  activeFilters,
  onToggleFilter,
}: HotelQuickFilterPillsProps) {
  return (
    <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
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
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              isActive
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 shadow-sm",
            ].join(" ")}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export const HotelQuickFilterPills = memo(HotelQuickFilterPillsComponent);
