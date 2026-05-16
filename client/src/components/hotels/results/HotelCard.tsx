import { memo, useMemo, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { formatReviewLabel, formatStayNights } from "@/lib/hotels/formatters";
import { HotelPriceComparison } from "@/components/hotels/results/HotelPriceComparison";
import type { HotelPriceContext } from "@/lib/hotels/priceContext";
import type { HotelOffer, HotelResult } from "@shared/hotels/types";
import {
  getLightweightHotelBadges,
  getPrimaryHotelExplanation,
} from "@/components/hotels/results/hotelBadgeCopy";
import { useWishlist } from "@/hooks/useWishlist";

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
type HotelResultWithOffers = HotelResult & { offers?: HotelOffer[] };


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
  const hotelWithOffers = hotel as HotelResultWithOffers;
  const [imageFailed, setImageFailed] = useState(false);
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(hotel.hotelId);

  const badges = useMemo(() => getLightweightHotelBadges(hotel, 2), [hotel]);
  const explanation = useMemo(() => getPrimaryHotelExplanation(hotel), [hotel]);

  const hasProviderImage =
    hotel.provider !== "mock" &&
    typeof hotel.imageUrl === "string" &&
    hotel.imageUrl.trim().length > 0;

  const shouldShowImage = hasProviderImage && !imageFailed;
  const handleOpen = () => {
    onSelect(hotel.hotelId);
    onOpenDetail(hotel.hotelId);
  };

  const handleToggleSave = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSave(hotel);
  };

  return (
    <article
      className={[
        "relative overflow-hidden rounded-xl border bg-white shadow-sm transition",
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
        onClick={handleToggleSave}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        data-testid={`hotel-wishlist-toggle-${hotel.hotelId}`}
        className={[
          "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:scale-110 active:scale-95",
          saved ? "" : "hover:bg-white",
        ].join(" ")}
      >
        <Heart
          className={[
            "h-5 w-5 transition-colors",
            saved
              ? "fill-rose-500 text-rose-500"
              : "text-slate-600 hover:text-rose-500",
          ].join(" ")}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        onClick={handleOpen}
        className="grid w-full grid-cols-1 text-left md:grid-cols-[220px_1fr]"
      >
        <div className="h-48 bg-slate-100 md:h-full">
          {shouldShowImage ? (
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
              <span className="text-3xl">🏨</span>
              <span className="text-xs font-medium">
                {hotel.provider === "mock" ? "Sample hotel" : "Image unavailable"}
              </span>
            </div>
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

            <HotelPriceComparison
              hotel={hotel}
              priceContext={priceContext}
              offers={hotelWithOffers.offers}
            />
          </div>
        </div>
      </button>
    </article>
  );
}

export const HotelCard = memo(HotelCardComponent);
