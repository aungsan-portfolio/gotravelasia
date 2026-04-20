import { memo } from "react";
import { HotelCard } from "@/components/hotels/results/HotelCard";
import type { HotelResult } from "@shared/hotels/types";

interface HotelResultsListProps {
  hotels: HotelResult[];
  checkIn: string;
  checkOut: string;
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  onSelectHotel: (hotelId: string) => void;
  onHoverHotel: (hotelId: string | null) => void;
  onOpenHotelDetail: (hotelId: string) => void;
}

function HotelResultsListComponent({
  hotels,
  checkIn,
  checkOut,
  selectedHotelId,
  hoveredHotelId,
  onSelectHotel,
  onHoverHotel,
  onOpenHotelDetail,
}: HotelResultsListProps) {
  if (!hotels.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
        No hotels match your filters. Try clearing one or more filters.
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-live="polite">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.hotelId}
          hotel={hotel}
          checkIn={checkIn}
          checkOut={checkOut}
          isSelected={hotel.hotelId === selectedHotelId}
          isHovered={hotel.hotelId === hoveredHotelId}
          onSelect={onSelectHotel}
          onHover={onHoverHotel}
          onOpenDetail={onOpenHotelDetail}
        />
      ))}
    </section>
  );
}

export const HotelResultsList = memo(HotelResultsListComponent);
