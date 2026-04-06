import { memo, useState } from "react";
import {
  formatMoney,
  formatReviewLabel,
  formatStayNights,
} from "@/lib/hotels/formatters";
import type { HotelResult } from "@shared/hotels/types";

interface HotelCardProps {
  hotel: HotelResult;
  checkIn: string;
  checkOut: string;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (hotelId: string) => void;
  onHover: (hotelId: string | null) => void;
}

function HotelCardComponent({
  hotel,
  checkIn,
  checkOut,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: HotelCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

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
        onClick={() => onSelect(hotel.hotelId)}
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
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-1">
                {hotel.address || "Location unavailable"}
              </p>
            </div>
            <span className="text-sm font-medium text-amber-600">{"★".repeat(hotel.stars || 0)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="rounded bg-indigo-600 px-2 py-0.5 font-semibold text-white">
              {hotel.reviewScore?.toFixed(1) || "New"}
            </span>
            <span>{hotel.reviewScore ? formatReviewLabel(hotel.reviewScore) : "No rating"}</span>
            <span className="text-slate-500">({hotel.reviewCount?.toLocaleString() || 0} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(hotel.amenities || []).slice(0, 3).map((amenity) => (
              <span key={amenity} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {amenity}
              </span>
            ))}
          </div>

          <div className="mt-1 flex items-end justify-between">
            <div className="text-sm text-slate-500">{formatStayNights(checkIn, checkOut)}</div>
            <div className="text-right">
              {hotel.outboundLinks ? (
                <div className="mb-1 flex justify-end gap-1">
                  {hotel.outboundLinks.agoda && (
                    <a
                      href={hotel.outboundLinks.agoda}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on Agoda
                    </a>
                  )}
                </div>
              ) : null}
              <p className="text-xs text-slate-500">Per night</p>
              <p className="text-2xl font-bold text-slate-900">
                {hotel.currency === "THB" ? "฿" : "$"}{hotel.lowestRate.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

export const HotelCard = memo(HotelCardComponent);
