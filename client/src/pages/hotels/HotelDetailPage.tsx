import { useMemo } from "react";
import { useRoute } from "wouter";

import { HotelDetailAmenities } from "@/components/hotels/detail/HotelDetailAmenities";
import { HotelDetailBookingCard } from "@/components/hotels/detail/HotelDetailBookingCard";
import { HotelDetailHeader } from "@/components/hotels/detail/HotelDetailHeader";
import { HotelDetailPriceBox } from "@/components/hotels/detail/HotelDetailPriceBox";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { getCityName } from "@/lib/cities";
import { buildHotelRouteUrl } from "@/lib/hotels/buildHotelRouteUrl";
import { formatStayNights } from "@/lib/hotels/formatters";
import { useHotelRouteState } from "./useHotelRouteState";

export default function HotelDetailPage() {
  const [match, params] = useRoute<{ hotelId: string }>("/hotels/detail/:hotelId");
  const { query, routeMode, routeMeta } = useHotelRouteState();

  const backToResultsUrl = useMemo(
    () => buildHotelRouteUrl({ query, routeMode, routeMeta }),
    [query, routeMeta, routeMode],
  );

  const { isLoading, errorMessage, allHotels, retry } = useHotelSearch(query, {
    routeMode,
    routeMeta,
  });

  const hotel = useMemo(() => {
    if (!match || !params?.hotelId) {
      return null;
    }

    return allHotels.find((item) => item.hotelId === params.hotelId) ?? null;
  }, [allHotels, match, params?.hotelId]);

  const cityName = getCityName(query.city);

  if (!match || !params?.hotelId) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <p className="font-semibold">Hotel details are unavailable.</p>
            <p className="mt-1 text-sm">The hotel link is missing required details.</p>
            <a href={backToResultsUrl} className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-900">
              ← Back to results
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6 lg:py-8">
        <a href={backToResultsUrl} className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">
          ← Back to results
        </a>

        <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          <p>
            {cityName} · {query.checkIn} to {query.checkOut} · {formatStayNights(query.checkIn, query.checkOut)} · {query.adults} guest
            {query.adults > 1 ? "s" : ""} · {query.rooms} room{query.rooms > 1 ? "s" : ""}
          </p>
        </section>

        {isLoading && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Loading hotel details…
          </div>
        )}

        {!!errorMessage && !isLoading && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="font-semibold">Couldn&apos;t load hotel details.</p>
            <p className="mt-1 text-sm">{errorMessage}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 rounded-md bg-rose-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-800"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && !hotel && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <p className="font-semibold">We couldn&apos;t find this hotel in the latest results.</p>
            <p className="mt-1 text-sm">Try returning to results and selecting the hotel again.</p>
            <a href={backToResultsUrl} className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-900">
              Back to results
            </a>
          </div>
        )}

        {!isLoading && !errorMessage && hotel && (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <HotelDetailHeader hotel={hotel} />
              <HotelDetailAmenities amenities={hotel.amenities || []} />

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Location</h2>
                <p className="mt-2 text-sm text-slate-700">{hotel.address || "Location details unavailable"}</p>
                {hotel.coordinates ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Coordinates: {hotel.coordinates.lat.toFixed(4)}, {hotel.coordinates.lng.toFixed(4)}
                    {hotel.coordinates.isFallback ? " (approximate)" : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Map coordinates are not available for this hotel yet.</p>
                )}
              </section>
            </div>

            <div className="space-y-4">
              <HotelDetailPriceBox
                lowestRate={hotel.lowestRate}
                currency={hotel.currency}
                checkIn={query.checkIn}
                checkOut={query.checkOut}
              />
              <HotelDetailBookingCard hotel={hotel} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
