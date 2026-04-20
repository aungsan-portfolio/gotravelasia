import { memo, useMemo } from "react";
import { MapPin, Navigation } from "lucide-react";

import type { HotelResult } from "@shared/hotels/types";

import { generateMapMarkers } from "@/features/hotels/mapView/markers";
import type { MarkerBounds } from "@/features/hotels/mapView/markers.types";

interface HotelMapPanelProps {
  hotels: HotelResult[];
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  bounds?: MarkerBounds | null;
  onSelectHotel: (hotelId: string) => void;
  onHoverHotel: (hotelId: string | null) => void;
}

function HotelMapPanelComponent({
  hotels,
  selectedHotelId,
  hoveredHotelId,
  bounds,
  onSelectHotel,
  onHoverHotel,
}: HotelMapPanelProps) {
  const markers = useMemo(
    () =>
      generateMapMarkers(hotels, {
        selectedHotelId,
        hoveredHotelId,
        bounds,
      }),
    [bounds, hotels, hoveredHotelId, selectedHotelId],
  );

  const hotelsById = useMemo(
    () => new Map(hotels.map((hotel) => [hotel.hotelId, hotel])),
    [hotels],
  );

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        <header className="border-b border-slate-200 px-4 py-3">
           <p className="text-sm font-semibold text-slate-900">Map preview</p>
           <p className="text-xs text-slate-500">
             {hotels.length} mapped hotels · {markers.length} generated markers
           </p>
        </header>

        <div className="flex-1 overflow-auto p-3">
          {!markers.length ? (
            <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No mappable hotel coordinates are available for the current result set.
            </div>
          ) : (
            <div className="space-y-2">
              {markers.map((marker) => {
                const hotel = hotelsById.get(marker.hotelId);

                return (
                  <button
                    key={marker.hotelId}
                    type="button"
                    onClick={() => onSelectHotel(marker.hotelId)}
                    onMouseEnter={() => onHoverHotel(marker.hotelId)}
                    onMouseLeave={() => onHoverHotel(null)}
                    className={[
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                      marker.isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : marker.isHovered
                          ? "border-slate-400 bg-slate-50"
                          : "border-slate-200 hover:bg-slate-50",
                      marker.isVisible ? "opacity-100" : "opacity-60",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{hotel?.name ?? marker.hotelId}</p>
                        <p className="line-clamp-1 text-xs text-slate-500">
                          {hotel?.address || "Address unavailable"}
                        </p>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />
                        {marker.label}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Navigation className="h-3.5 w-3.5" />
                        {marker.position.lat.toFixed(4)}, {marker.position.lng.toFixed(4)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 uppercase tracking-wide text-[10px] text-slate-600">
                        {marker.style.variant}
                      </span>
                    </div>
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
