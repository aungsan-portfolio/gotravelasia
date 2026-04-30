import { memo } from "react";

import type { HotelRichFilters } from "@/lib/hotels/filterEngine";
import { HOTEL_FILTER_OPTIONS } from "@/hooks/useHotelSearch";
import type { HotelFilterId } from "@/types/hotels";

export interface HotelFilterSidebarProps {
  activeFilters: HotelFilterId[];
  richFilters: HotelRichFilters;
  onToggleFilter: (filterId: HotelFilterId) => void;
  onClearFilters: () => void;
  onSetPriceRange: (range: HotelRichFilters["priceRange"]) => void;
  onToggleStarRating: (stars: number) => void;
  onSetMinGuestRating: (rating?: number) => void;
  onToggleAmenity: (amenity: string) => void;
  totalFound: number;
}

/**
 * Parses a string input value into a numeric price or undefined.
 */
function parsePriceInput(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * Enhanced Sidebar component for filtering hotel results.
 * Includes both "Quick Filters" (pills) and "Rich Filters" (price, stars, rating, amenities).
 */
function HotelFilterSidebarComponent({
  activeFilters,
  richFilters,
  onToggleFilter,
  onClearFilters,
  onSetPriceRange,
  onToggleStarRating,
  onSetMinGuestRating,
  onToggleAmenity,
  totalFound,
}: HotelFilterSidebarProps) {
  const priceMin = richFilters.priceRange?.min;
  const priceMax = richFilters.priceRange?.max;

  const hasRichFilters = Boolean(
    richFilters.priceRange?.min != null ||
      richFilters.priceRange?.max != null ||
      richFilters.starRatings?.length ||
      richFilters.minGuestRating != null ||
      richFilters.amenities?.length,
  );

  const hasAnyFilters = activeFilters.length > 0 || hasRichFilters;

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
                "rounded-full border px-3 py-1.5 text-left text-sm transition xl:w-full",
                isActive
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
        <section>
          <p className="mb-2 text-sm font-medium text-slate-900">Price per night</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-500">
              Min
              <input
                type="number"
                min={0}
                value={priceMin ?? ""}
                onChange={(event) =>
                  onSetPriceRange({ min: parsePriceInput(event.target.value), max: priceMax })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="text-xs text-slate-500">
              Max
              <input
                type="number"
                min={0}
                value={priceMax ?? ""}
                onChange={(event) =>
                  onSetPriceRange({ min: priceMin, max: parsePriceInput(event.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </label>
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-slate-900">Star rating</p>
          <div className="flex flex-wrap gap-2">
            {[3, 4, 5].map((stars) => {
              const isActive = richFilters.starRatings?.includes(stars);
              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => onToggleStarRating(stars)}
                  aria-pressed={Boolean(isActive)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    isActive
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {stars}★
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-slate-900">Guest rating</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "7+", value: 7 },
              { label: "8+", value: 8 },
              { label: "9+", value: 9 },
            ].map(({ label, value }) => {
              const isActive = richFilters.minGuestRating === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSetMinGuestRating(isActive ? undefined : value)}
                  aria-pressed={isActive}
                  className={[
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    isActive
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium text-slate-900">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {["Free WiFi", "Pool", "Parking", "Breakfast", "Airport shuttle"].map((amenity) => {
              const isActive = richFilters.amenities?.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => onToggleAmenity(amenity)}
                  aria-pressed={Boolean(isActive)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-sm transition",
                    isActive
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {hasAnyFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 rounded-full border border-transparent px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 xl:w-full"
        >
          Clear all
        </button>
      )}
    </aside>
  );
}

export const HotelFilterSidebar = memo(HotelFilterSidebarComponent);
