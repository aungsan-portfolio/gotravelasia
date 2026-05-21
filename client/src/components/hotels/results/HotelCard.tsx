import { memo, useMemo, useState, type MouseEvent } from "react";
import { Heart, MapPin, Star } from "lucide-react";
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
      onMouseEnter={() => onHover(hotel.hotelId)}
      onMouseLeave={() => onHover(null)}
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-200",
        isSelected
          ? "border-indigo-500 shadow-lg ring-2 ring-indigo-200"
          : isHovered
            ? "border-slate-300 shadow-md -translate-y-0.5"
            : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md",
      ].join(" ")}
    >
      {/* Wishlist button (absolute, sits above the link) */}
      <button
        type="button"
        onClick={handleToggleSave}
        aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        data-testid={`hotel-wishlist-toggle-${hotel.hotelId}`}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 backdrop-blur-sm transition hover:scale-110 active:scale-95"
      >
        <Heart
          className={[
            "h-5 w-5 transition-colors",
            saved
              ? "fill-rose-500 text-rose-500"
              : "text-slate-600 group-hover:text-rose-500",
          ].join(" ")}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={handleOpen}
        className="grid w-full grid-cols-1 text-left sm:grid-cols-[260px_1fr]"
      >
        {/* Image column */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 sm:aspect-auto sm:h-full">
          {shouldShowImage ? (
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
              <span className="text-3xl" aria-hidden="true">
                {"\u{1F3E8}"}
              </span>
              <span className="text-xs font-medium">
                {hotel.provider === "mock" ? "Sample hotel" : "Image unavailable"}
              </span>
            </div>
          )}

          {/* Top-left badge for first/best deal-style emphasis */}
          {badges[0] && (
            <div className="absolute left-3 top-3">
              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm",
                  badges[0].className,
                ].join(" ")}
                title={badges[0].description}
              >
                {badges[0].label}
              </span>
            </div>
          )}
        </div>

        {/* Content column */}
        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
          {/* Name + stars */}
          <div className="flex items-start justify-between gap-3 pr-10 sm:pr-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-balance text-lg font-semibold leading-tight text-slate-900 group-hover:text-indigo-700">
                {hotel.name}
              </h3>
              {hotel.stars > 0 && (
                <div
                  className="mt-1 flex items-center gap-0.5 text-amber-500"
                  aria-label={`${hotel.stars}-star hotel`}
                >
                  {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-current"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">
              {hotel.address || "Location unavailable"}
            </span>
          </p>

          {/* Review row */}
          {hotel.reviewScore ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md bg-indigo-600 px-2 py-0.5 font-bold text-white">
                {hotel.reviewScore.toFixed(1)}
              </span>
              <span className="font-semibold text-slate-800">
                {formatReviewLabel(hotel.reviewScore)}
              </span>
              <span className="text-slate-500">
                ({hotel.reviewCount?.toLocaleString() || 0} reviews)
              </span>
            </div>
          ) : (
            <div className="text-sm text-slate-500">No rating yet</div>
          )}

          {/* Secondary badges (skip first one — already shown on image) */}
          {badges.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {badges.slice(1).map((badge) => (
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

          {/* Explanation (e.g. "Top pick for value") */}
          {explanation && (
            <p className="rounded-lg bg-indigo-50/60 px-3 py-1.5 text-xs text-indigo-900">
              {explanation}
            </p>
          )}

          {/* Amenity chips */}
          {(hotel.amenities || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(hotel.amenities || []).slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                >
                  {amenity}
                </span>
              ))}
              {(hotel.amenities?.length || 0) > 3 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                  +{(hotel.amenities?.length || 0) - 3} more
                </span>
              )}
            </div>
          )}

          {/* Bottom row: stay info + price */}
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-500">
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
