import { memo } from "react";
import { MapPin, Navigation } from "lucide-react";

import type { HotelResult } from "@shared/hotels/types";

interface HotelMapPanelProps {
  hotels: HotelResult[];
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  onSelectHotel: (hotelId: string) => void;
  onHoverHotel: (hotelId: string | null) => void;
}

function HotelMapPanelComponent({
  hotels,
  selectedHotelId,
  hoveredHotelId,
  onSelectHotel,
  onHoverHotel,
}: HotelMapPanelProps) {
  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        <header className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Map preview</p>
          <p className="text-xs text-slate-500">
            {hotels.length} properties with location pins
          </p>
        </header>

        <div className="flex-1 overflow-auto p-3">
          {!hotels.length ? (
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No mapped hotel locations are available for the current result set.
            </div>
          ) : (
            <div className="space-y-2">
              {hotels.map((hotel) => {
                const isSelected = hotel.hotelId === selectedHotelId;
                const isHovered = hotel.hotelId === hoveredHotelId;

                return (
                  <button
                    key={hotel.hotelId}
                    type="button"
                    onClick={() => onSelectHotel(hotel.hotelId)}
                    onMouseEnter={() => onHoverHotel(hotel.hotelId)}
                    onMouseLeave={() => onHoverHotel(null)}
                    className={[
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : isHovered
                          ? "border-slate-400 bg-slate-50"
                          : "border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{hotel.name}</p>
                        <p className="line-clamp-1 text-xs text-slate-500">
                          {hotel.address || "Address unavailable"}
                        </p>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />
                        Pin
                      </span>
                    </div>

                    {hotel.coordinates && (
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <Navigation className="h-3.5 w-3.5" />
                        {hotel.coordinates.lat.toFixed(4)}, {hotel.coordinates.lng.toFixed(4)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export const HotelMapPanel = memo(HotelMapPanelComponent);
