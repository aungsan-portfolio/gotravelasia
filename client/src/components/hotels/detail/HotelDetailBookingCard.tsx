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
  const providers = [
    {
      key: "agoda" as const,
      label: "Agoda",
      url: buildOutboundDealUrl({
        baseUrl: hotel.outboundLinks?.agoda,
        provider: "agoda",
        hotelId: hotel.hotelId,
        city,
        checkIn,
        checkOut,
        sort,
        resultPosition,
      }),
    },
    {
      key: "booking" as const,
      label: "Booking.com",
      url: buildOutboundDealUrl({
        baseUrl: hotel.outboundLinks?.booking,
        provider: "booking",
        hotelId: hotel.hotelId,
        city,
        checkIn,
        checkOut,
        sort,
        resultPosition,
      }),
    },
    {
      key: "trip" as const,
      label: "Trip.com",
      url: buildOutboundDealUrl({
        baseUrl: hotel.outboundLinks?.trip,
        provider: "trip",
        hotelId: hotel.hotelId,
        city,
        checkIn,
        checkOut,
        sort,
        resultPosition,
      }),
    },
    {
      key: "expedia" as const,
      label: "Expedia",
      url: buildOutboundDealUrl({
        baseUrl: hotel.outboundLinks?.expedia,
        provider: "expedia",
        hotelId: hotel.hotelId,
        city,
        checkIn,
        checkOut,
        sort,
        resultPosition,
      }),
    },
    {
      key: "klook" as const,
      label: "Klook",
      url: buildOutboundDealUrl({
        baseUrl: hotel.outboundLinks?.klook,
        provider: "klook",
        hotelId: hotel.hotelId,
        city,
        checkIn,
        checkOut,
        sort,
        resultPosition,
      }),
    },
  ].filter((provider) => Boolean(provider.url));

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Compare booking partners</h2>
      <p className="mt-1 text-sm text-slate-600">
        Compare partner options and complete your booking on the provider site.
      </p>

      {providers.length > 0 ? (
        <div className="mt-4 space-y-2">
          {providers.map((provider, index) => (
            <a
              key={provider.key}
              href={provider.url!}
              onClick={() => {
                trackHotelBookClick({
                  hotelId: hotel.hotelId,
                  city,
                  checkIn,
                  checkOut,
                  sort,
                  resultPosition,
                  provider: provider.key,
                });
              }}
              target="_blank"
              rel="noopener noreferrer"
              className={
                index === 0
                  ? "inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  : "inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              }
            >
              {index === 0
                ? `Book on ${provider.label} (opens external site)`
                : `Compare on ${provider.label}`}
            </a>
          ))}
        </div>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center rounded-md bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
        >
          Partner links unavailable
        </button>
      )}
    </aside>
  );
}
