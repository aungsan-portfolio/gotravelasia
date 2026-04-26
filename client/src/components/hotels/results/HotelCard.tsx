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

function HotelCardComponent({
  hotel,
  checkIn,
  checkOut,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onOpenDetail,
  priceContext: _priceContext,
}: HotelCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const badges = useMemo(() => getLightweightHotelBadges(hotel, 2), [hotel]);
  const explanation = useMemo(() => getPrimaryHotelExplanation(hotel), [hotel]);

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
              <p className="text-xs text-slate-500">From per night</p>
              <p className="text-2xl font-bold text-slate-900">
                {hotel.currency === "THB" ? "฿" : "$"}
                {hotel.lowestRate.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

export const HotelCard = memo(HotelCardComponent);
