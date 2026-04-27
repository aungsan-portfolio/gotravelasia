import { memo, useMemo, useState } from "react";
import { formatReviewLabel, formatStayNights } from "@/lib/hotels/formatters";
import type { HotelPriceContext } from "@/lib/hotels/priceContext";
import type { HotelResult } from "@shared/hotels/types";
import {
  getLightweightHotelBadges,
  getPrimaryHotelExplanation,
} from "@/components/hotels/results/hotelBadgeCopy";

interface HotelCardProps {
  hotel: HotelResult;
  checkIn: string;
  checkOut: string;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (hotelId: string) => void;
  onHover: (hotelId: string | null) => void;
  onOpenDetail: (hotelId: string) => void;
  priceContext: HotelPriceContext;
}

const PROVIDER_STYLE: Record<
  string,
  { label: string; className: string }
> = {
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

function HotelCardComponent({
  hotel,
  checkIn,
  checkOut,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onOpenDetail,
  priceContext,
}: HotelCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const badges = useMemo(() => getLightweightHotelBadges(hotel, 2), [hotel]);
  const explanation = useMemo(() => getPrimaryHotelExplanation(hotel), [hotel]);
  const hasFallbackPrice = Number.isFinite(hotel.lowestRate) && hotel.lowestRate > 0;
  const minPrice = priceContext.minPrice ?? (hasFallbackPrice ? hotel.lowestRate : null);
  const maxPrice = priceContext.maxPrice;
  const hasPrice = minPrice !== null;
  const compareCount = Math.max(priceContext.providerCount, priceContext.providers.length);
  const hasComparableMaxPrice =
    hasPrice && maxPrice !== null && maxPrice > minPrice * 1.05;
  const savingsPercent = hasComparableMaxPrice
    ? Math.round(((maxPrice - minPrice) / maxPrice) * 100)
    : 0;
  const showSavingsBadge = savingsPercent >= 10;

  const handleOpen = () => {
    onSelect(hotel.hotelId);
    onOpenDetail(hotel.hotelId);
  };

  return (
    <article
      className={[
        "overflow-hidden rounded-xl border bg-white shadow-sm transition",
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-200"
          : isHovered
            ? "border-slate-400"
            : "border-slate-200",
      ].join(" ")}
      onMouseEnter={() => onHover(hotel.hotelId)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="grid w-full grid-cols-1 text-left md:grid-cols-[220px_1fr]"
      >
        <div className="h-48 bg-slate-100 md:h-full">
          {!imageFailed ? (
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">🏨</div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
              <p className="line-clamp-1 text-sm text-slate-600">
                {hotel.address || "Location unavailable"}
              </p>
            </div>
            <span className="text-sm font-medium text-amber-600">
              {"★".repeat(hotel.stars || 0)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="rounded bg-indigo-600 px-2 py-0.5 font-semibold text-white">
              {hotel.reviewScore?.toFixed(1) || "New"}
            </span>
            <span>
              {hotel.reviewScore ? formatReviewLabel(hotel.reviewScore) : "No rating"}
            </span>
            <span className="text-slate-500">
              ({hotel.reviewCount?.toLocaleString() || 0} reviews)
            </span>
          </div>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={`${hotel.hotelId}-${badge.id}`}
                  className={badge.className}
                  title={badge.description}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          {explanation && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {explanation}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {(hotel.amenities || []).slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
              >
                {amenity}
              </span>
            ))}
          </div>

          <div className="mt-1 flex items-end justify-between">
            <div className="text-sm text-slate-500">
              {formatStayNights(checkIn, checkOut)}
            </div>

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
              {priceContext.providers.length > 0 && (
                <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                  {priceContext.providers.map((provider) => {
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
          </div>
        </div>
      </button>
    </article>
  );
}

export const HotelCard = memo(HotelCardComponent);
