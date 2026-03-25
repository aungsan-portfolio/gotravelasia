import { memo } from "react";
import { HotelCard } from "@/components/hotels/results/HotelCard";
import type { HotelItem } from "@/types/hotels";

interface HotelResultsListProps {
  hotels: HotelItem[];
  checkIn: string;
  checkOut: string;
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  onSelectHotel: (hotelId: string) => void;
  onHoverHotel: (hotelId: string | null) => void;
}

function HotelResultsListComponent({
  hotels,
  checkIn,
  checkOut,
  selectedHotelId,
  hoveredHotelId,
  onSelectHotel,
  onHoverHotel,
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
          key={hotel.id}
          hotel={hotel}
          checkIn={checkIn}
          checkOut={checkOut}
          isSelected={hotel.id === selectedHotelId}
          isHovered={hotel.id === hoveredHotelId}
          onSelect={onSelectHotel}
          onHover={onHoverHotel}
        />
      ))}
    </section>
  );
}

export const HotelResultsList = memo(HotelResultsListComponent);
