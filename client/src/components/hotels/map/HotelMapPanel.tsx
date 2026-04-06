import { memo } from "react";
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
          <p className="text-xs text-slate-500">{hotels.length} properties with location pins</p>
        </header>

        <div className="flex-1 overflow-auto p-3">
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
                  <p className="font-medium text-slate-900">{hotel.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{hotel.address}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export const HotelMapPanel = memo(HotelMapPanelComponent);
