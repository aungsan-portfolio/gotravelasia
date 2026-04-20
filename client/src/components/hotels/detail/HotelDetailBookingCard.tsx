import type { HotelResult } from "@shared/hotels/types";
import { buildOutboundDealUrl } from "@/lib/hotels/buildOutboundDealUrl";
import { trackHotelBookClick } from "@/lib/hotels/tracking";

interface HotelDetailBookingCardProps {
  hotel: HotelResult;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  sort?: string;
  resultPosition?: number;
}

export function HotelDetailBookingCard({
  hotel,
  city,
  checkIn,
  checkOut,
  sort,
  resultPosition,
}: HotelDetailBookingCardProps) {
  const agodaUrl = buildOutboundDealUrl({
    baseUrl: hotel.outboundLinks?.agoda,
    provider: "agoda",
    hotelId: hotel.hotelId,
    city,
    checkIn,
    checkOut,
    sort,
    resultPosition,
  });

  const handleBookClick = () => {
    trackHotelBookClick({
      hotelId: hotel.hotelId,
      city,
      checkIn,
      checkOut,
      sort,
      resultPosition,
      provider: "agoda",
    });
  };

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Ready to book?</h2>
      <p className="mt-1 text-sm text-slate-600">You&apos;ll complete your booking on Agoda.</p>

      {agodaUrl ? (
        <a
          href={agodaUrl}
          onClick={handleBookClick}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Book on Agoda (opens external site)
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center rounded-md bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
        >
          Agoda link unavailable
        </button>
      )}
    </aside>
  );
}
