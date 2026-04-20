import { useMemo, useState } from "react";
import { formatReviewLabel } from "@/lib/hotels/formatters";
import { getLightweightHotelBadges } from "@/components/hotels/results/hotelBadgeCopy";
import type { HotelResult } from "@shared/hotels/types";

interface HotelDetailHeaderProps {
  hotel: HotelResult;
}

export function HotelDetailHeader({ hotel }: HotelDetailHeaderProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const badges = useMemo(() => getLightweightHotelBadges(hotel, 3), [hotel]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-64 bg-slate-100 md:h-80">
        {!imageFailed ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            loading="eager"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🏨</div>
        )}
      </div>

      <div className="space-y-3 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{hotel.address || "Location unavailable"}</p>
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

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={`${hotel.hotelId}-${badge.id}`} className={badge.className} title={badge.description}>
                {badge.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
