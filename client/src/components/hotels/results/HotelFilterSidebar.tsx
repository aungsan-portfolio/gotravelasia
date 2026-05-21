import { memo } from "react";

import type { HotelRichFilters } from "@/lib/hotels/filterEngine";

export interface HotelFilterSidebarProps {
  richFilters: HotelRichFilters;
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
 * Sidebar for "rich" hotel filters: price range, star rating, guest rating,
 * amenities. Quick-filter pills (e.g. Free breakfast, Highly rated) live
 * separately above the results list in `HotelQuickFilterPills`.
 */
function HotelFilterSidebarComponent({
  richFilters,
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

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Filters</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {totalFound} {totalFound === 1 ? "property" : "properties"}
          </p>
        </div>
        {hasRichFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5 border-t border-slate-200 pt-4">
        <section>
          <p className="mb-2 text-sm font-medium text-slate-900">Price per night</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-500">
              Min
              <input
                type="number"
                min={0}
                placeholder="$0"
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
                placeholder="Any"
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
    </aside>
  );
}

export const HotelFilterSidebar = memo(HotelFilterSidebarComponent);
