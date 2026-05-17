import { useEffect, useMemo } from "react";
import { useRoute } from "wouter";

import { HotelDetailAmenities } from "@/components/hotels/detail/HotelDetailAmenities";
import { HotelDetailBookingCard } from "@/components/hotels/detail/HotelDetailBookingCard";
import { HotelDetailHeader } from "@/components/hotels/detail/HotelDetailHeader";
import { HotelDetailPriceBox } from "@/components/hotels/detail/HotelDetailPriceBox";
import { HotelMiniMap } from "@/components/hotels/detail/HotelMiniMap";
import { useHotelDetailFallback } from "@/hooks/useHotelDetailFallback";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import { getCityName } from "@/lib/cities";
import { buildHotelRouteUrl } from "@/lib/hotels/buildHotelRouteUrl";
import { formatStayNights } from "@/lib/hotels/formatters";
import { trackHotelDetailView } from "@/lib/hotels/tracking";
import { useHotelRouteState } from "./useHotelRouteState";

import { StructuredData } from "@/components/seo/StructuredData";
import { buildHotelLodgingSchema } from "@/lib/seo/buildHotelLodgingSchema";

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

  const selectedHotelId = match ? params?.hotelId : undefined;

  const primaryHotel = useMemo(() => {
    if (!selectedHotelId) {
      return null;
    }

    return allHotels.find((item) => item.hotelId === selectedHotelId) ?? null;
  }, [allHotels, selectedHotelId]);

  const shouldLoadFallback =
    Boolean(selectedHotelId) && !isLoading && !errorMessage && !primaryHotel;

  const {
    fallbackHotel,
    isFallbackLoading,
    fallbackErrorMessage,
    retryFallback,
  } = useHotelDetailFallback(selectedHotelId, query, shouldLoadFallback);

  const hotel = primaryHotel ?? fallbackHotel;

  const cityName = getCityName(query.city);
  const hotelResultPosition = hotel?.rankingPosition;

  useEffect(() => {
    if (
      isLoading ||
      isFallbackLoading ||
      errorMessage ||
      fallbackErrorMessage ||
      !hotel
    ) {
      return;
    }

    trackHotelDetailView({
      hotelId: hotel.hotelId,
      city: query.city,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      sort: query.sort,
      resultPosition: hotel.rankingPosition,
    });
  }, [
    errorMessage,
    fallbackErrorMessage,
    hotel,
    isFallbackLoading,
    isLoading,
    query.checkIn,
    query.checkOut,
    query.city,
    query.sort,
  ]);

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
    <>
      {hotel && !isLoading && (
        <StructuredData schema={buildHotelLodgingSchema(hotel, window.location.href, cityName)} />
      )}
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

        {!isLoading && !errorMessage && isFallbackLoading && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Looking up this hotel again…
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          !isFallbackLoading &&
          !!fallbackErrorMessage && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <p className="font-semibold">Couldn&apos;t reload this hotel.</p>
              <p className="mt-1 text-sm">{fallbackErrorMessage}</p>
              <button
                type="button"
                onClick={retryFallback}
                className="mt-3 rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
              >
                Try again
              </button>
              <a
                href={backToResultsUrl}
                className="mt-3 block text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
                Back to results
              </a>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          !isFallbackLoading &&
          !fallbackErrorMessage &&
          !hotel && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <p className="font-semibold">
                We couldn&apos;t find this hotel in the latest results.
              </p>
              <p className="mt-1 text-sm">
                Try returning to results and selecting the hotel again.
              </p>
              <a
                href={backToResultsUrl}
                className="mt-3 inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-900"
              >
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
                  <HotelMiniMap coordinates={hotel.coordinates} hotelName={hotel.name} />
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
              <HotelDetailBookingCard
                hotel={hotel}
                city={query.city}
                checkIn={query.checkIn}
                checkOut={query.checkOut}
                sort={query.sort}
                resultPosition={hotelResultPosition}
              />
            </div>
          </div>
        )}
      </div>
    </main>
    </>
  );
}
