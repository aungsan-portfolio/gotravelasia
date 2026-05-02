import { memo } from "react";
import type { HotelPriceContext } from "@/lib/hotels/priceContext";
import type { HotelOffer, HotelResult } from "@shared/hotels/types";

export interface HotelPriceComparisonProps {
  hotel: HotelResult;
  priceContext: HotelPriceContext;
  offers?: HotelOffer[];
}

const PROVIDER_STYLE: Record<string, { label: string; className: string }> = {
  agoda: {
    label: "Agoda",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  booking: {
    label: "Booking.com",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  trip: {
    label: "Trip",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  expedia: {
    label: "Expedia",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  klook: {
    label: "Klook",
    className: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },
};

/**
 * Component to display price comparison across different OTAs.
 * Extracted from HotelCard to improve modularity and support streaming price updates.
 * Wrapped in memo to prevent unnecessary re-renders when other card details change.
 */
function HotelPriceComparisonComponent({
  hotel,
  priceContext,
  offers,
}: HotelPriceComparisonProps) {
  const validOfferPrices = (offers ?? [])
    .map((offer) => offer.price)
    .filter((price) => typeof price === "number" && Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);
  const offerProviders = Array.from(
    new Set((offers ?? []).map((offer) => offer.provider).filter(Boolean)),
  );
  const offerMinPrice = validOfferPrices.length > 0 ? validOfferPrices[0] : null;
  const offerMaxPrice =
    validOfferPrices.length > 0 ? validOfferPrices[validOfferPrices.length - 1] : null;
  const hasOfferPricing = offerMinPrice !== null;
  const hasFallbackPrice = Number.isFinite(hotel.lowestRate) && hotel.lowestRate > 0;
  const minPrice = hasOfferPricing
    ? offerMinPrice
    : priceContext.minPrice ?? (hasFallbackPrice ? hotel.lowestRate : null);
  const maxPrice = hasOfferPricing ? offerMaxPrice : priceContext.maxPrice;
  const hasPrice = minPrice !== null;
  const compareCount = hasOfferPricing
    ? Math.max(validOfferPrices.length, offerProviders.length)
    : Math.max(priceContext.providerCount, priceContext.providers.length);
  const displayProviders = hasOfferPricing ? offerProviders : priceContext.providers;
  const hasComparableMaxPrice =
    hasPrice && maxPrice !== null && maxPrice > minPrice * 1.05;
  const savingsPercent = hasComparableMaxPrice
    ? Math.round(((maxPrice - minPrice) / maxPrice) * 100)
    : 0;
  const showSavingsBadge = savingsPercent >= 10;

  return (
    <div className="text-right">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">View details</p>
      <p className="text-xs text-slate-500">
        {compareCount > 1 ? `Compare ${compareCount} sites` : "From per night"}
      </p>
      {hasPrice ? (
        <>
          <div className="mt-1 flex items-center justify-end gap-2">
            {showSavingsBadge && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Save {savingsPercent}%
              </span>
            )}
            {hasComparableMaxPrice && (
              <span className="text-xs text-slate-400 line-through">
                {hotel.currency === "THB" ? "฿" : "$"}
                {maxPrice.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {hotel.currency === "THB" ? "฿" : "$"}
            {minPrice.toLocaleString()}
          </p>
        </>
      ) : (
        <p className="text-sm font-semibold text-slate-500">Price unavailable</p>
      )}
      {displayProviders.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-end gap-1.5">
          {displayProviders.map((provider) => {
            const display = PROVIDER_STYLE[provider] ?? {
              label: provider,
              className: "border-slate-200 bg-slate-50 text-slate-600",
            };

            return (
              <span
                key={`${hotel.hotelId}-${provider}`}
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${display.className}`}
              >
                {display.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const HotelPriceComparison = memo(HotelPriceComparisonComponent);
