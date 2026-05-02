import { useEffect, useRef } from "react";
import type { HotelOffer, HotelResult } from "@shared/hotels/types";
import { buildOutboundDealUrl } from "@/lib/hotels/buildOutboundDealUrl";
import { buildHotelOutboundRedirectUrl } from "@/lib/hotels/buildHotelOutboundRedirectUrl";
import {
  trackHotelBookClick,
  trackHotelOutboundRedirectClick,
  trackHotelOfferImpression,
  trackHotelOfferClick,
} from "@/lib/hotels/tracking";
import {
  formatOfferPrice,
  getValidProviderOffers,
  HOTEL_OFFER_PROVIDER_LABELS,
  hasRenderableProviderOffers,
  resolveOfferBaseUrl,
} from "@/lib/hotels/providerOffers";

export { hasRenderableProviderOffers };

export interface ProviderOfferListProps {
  hotel: HotelResult;
  offers?: HotelOffer[];
  city?: string;
  checkIn?: string;
  checkOut?: string;
  sort?: string;
  resultPosition?: number;
}

export function ProviderOfferList({
  hotel,
  offers,
  city,
  checkIn,
  checkOut,
  sort,
  resultPosition,
}: ProviderOfferListProps) {
  const validOffers = getValidProviderOffers(offers);
  const hasTrackedImpressions = useRef(false);

  useEffect(() => {
    if (validOffers.length > 0 && !hasTrackedImpressions.current) {
      validOffers.forEach((offer, index) => {
        trackHotelOfferImpression({
          hotelId: hotel.hotelId,
          city,
          checkIn,
          checkOut,
          sort,
          resultPosition,
          provider: offer.provider,
          price: offer.price,
          currency: offer.currency ?? hotel.currency,
          offerRank: index + 1,
          freeCancellation: offer.freeCancellation,
          payLater: offer.payLater,
          breakfastIncluded: offer.breakfastIncluded,
          source: "hotel_detail_offer_list",
        });
      });
      hasTrackedImpressions.current = true;
    }
  }, [validOffers, hotel.hotelId, city, checkIn, checkOut, sort, resultPosition, hotel.currency]);

  if (validOffers.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {validOffers.map((offer, index) => {
        const providerLabel = HOTEL_OFFER_PROVIDER_LABELS[offer.provider];
        const price = formatOfferPrice(offer.price, offer.currency ?? hotel.currency);
        const crossedOutPrice = formatOfferPrice(
          Number.isFinite(offer.crossedOutPrice) &&
            Number(offer.crossedOutPrice) > offer.price
            ? offer.crossedOutPrice
            : undefined,
          offer.currency ?? hotel.currency,
        );

        const targetUrl = buildOutboundDealUrl({
          baseUrl: resolveOfferBaseUrl(offer, hotel),
          provider: offer.provider,
          hotelId: offer.hotelId || hotel.hotelId,
          city,
          checkIn,
          checkOut,
          sort,
          resultPosition,
        });

        const redirectUrl = buildHotelOutboundRedirectUrl({
          provider: offer.provider,
          targetUrl: targetUrl ?? undefined,
          hotelId: offer.hotelId || hotel.hotelId,
          city,
          checkIn,
          checkOut,
          sort,
          resultPosition,
        });

        const isPrimary = index === 0;

        return (
          <div
            key={`${offer.provider}-${offer.hotelId}-${offer.price}-${index}`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{providerLabel}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-base font-bold text-slate-900">{price ?? "—"}</p>
                  {crossedOutPrice ? (
                    <p className="text-xs text-slate-500 line-through">{crossedOutPrice}</p>
                  ) : null}
                </div>
                {offer.roomName ? (
                  <p className="mt-1 text-xs text-slate-600">{offer.roomName}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {offer.freeCancellation ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Free cancellation</span> : null}
              {offer.payLater ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800">Pay later</span> : null}
              {offer.breakfastIncluded ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Breakfast included</span> : null}
            </div>

            {offer.cancellationPolicy ? (
              <p className="mt-2 text-xs text-slate-500">{offer.cancellationPolicy}</p>
            ) : null}

            {redirectUrl ? (
              <a
                href={redirectUrl}
                onClick={() => {
                  const trackingContext = {
                    hotelId: hotel.hotelId,
                    city,
                    checkIn,
                    checkOut,
                    sort,
                    resultPosition,
                    provider: offer.provider,
                    price: offer.price,
                    currency: offer.currency ?? hotel.currency,
                    offerRank: index + 1,
                    freeCancellation: offer.freeCancellation,
                    payLater: offer.payLater,
                    breakfastIncluded: offer.breakfastIncluded,
                    source: "hotel_detail_offer_list",
                  };
                  
                  trackHotelBookClick(trackingContext);
                  trackHotelOutboundRedirectClick(trackingContext);
                  trackHotelOfferClick(trackingContext);
                }}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  isPrimary
                    ? "mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    : "mt-3 inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                }
                aria-label={`${isPrimary ? "Book" : "Compare"} on ${providerLabel} (opens external site)`}
              >
                {isPrimary
                  ? `Book on ${providerLabel} (opens external site)`
                  : `Compare on ${providerLabel}`}
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center rounded-md bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
              >
                Link unavailable
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
