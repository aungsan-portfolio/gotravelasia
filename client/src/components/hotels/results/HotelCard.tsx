import { memo, useMemo, useState, type MouseEvent } from "react";
import { Heart, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { formatReviewLabel, formatStayNights } from "@/lib/hotels/formatters";
import { HotelPriceComparison } from "@/components/hotels/results/HotelPriceComparison";
import type { HotelPriceContext } from "@/lib/hotels/priceContext";
import type { HotelOffer, HotelResult } from "@shared/hotels/types";
import {
  getLightweightHotelBadges,
  getPrimaryHotelExplanation,
} from "@/components/hotels/results/hotelBadgeCopy";
import { useWishlist } from "@/hooks/useWishlist";
import { getHotelLocationDisplay } from "@/lib/hotels/locationDisplay";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(hotel.hotelId);

  const badges = useMemo(() => getLightweightHotelBadges(hotel, 2), [hotel]);
  const explanation = useMemo(() => getPrimaryHotelExplanation(hotel), [hotel]);
  const locationDisplay = useMemo(() => getHotelLocationDisplay(hotel), [hotel]);

  const carouselImages = useMemo(() => {
    if (hotel.provider === "mock") return hotel.imageUrl ? [hotel.imageUrl] : [];
    if (hotel.images && hotel.images.length > 0) {
      return hotel.images.slice(0, 5); // Limit to 5 images for the carousel
    }
    return hotel.imageUrl ? [hotel.imageUrl] : [];
  }, [hotel.images, hotel.imageUrl, hotel.provider]);

  const hasImages = carouselImages.length > 0;
  const shouldShowImage = hasImages && !imageFailed;

  const handleOpen = () => {
    onSelect(hotel.hotelId);
    onOpenDetail(hotel.hotelId);
  };

  const handleToggleSave = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSave(hotel);
  };

  const nextImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  return (
    <article
      className={[
        "group relative flex flex-col sm:flex-row overflow-hidden rounded-xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md",
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
          : isHovered
            ? "border-slate-400"
            : "border-slate-200 shadow-sm",
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
          "absolute right-3 top-3 sm:left-3 sm:right-auto z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:scale-110 active:scale-95",
          saved ? "" : "hover:bg-white",
        ].join(" ")}
      >
        <Heart
          className={[
            "h-4 w-4 transition-colors",
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
        className="flex flex-col sm:flex-row w-full text-left"
      >
        <div className="relative w-full sm:w-[260px] shrink-0 aspect-[4/3] sm:aspect-auto sm:h-auto bg-slate-100 overflow-hidden group/image">
          {shouldShowImage ? (
            <>
              <img
                src={carouselImages[currentImageIndex]}
                alt={`${hotel.name} - image ${currentImageIndex + 1}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageFailed(true)}
              />
              
              {/* Carousel Controls */}
              {carouselImages.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center px-2 opacity-0 transition-opacity group-hover/image:opacity-100 z-10">
                    <button
                      type="button"
                      onClick={prevImage}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-sm hover:bg-white hover:scale-110 active:scale-95 backdrop-blur-sm transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 opacity-0 transition-opacity group-hover/image:opacity-100 z-10">
                    <button
                      type="button"
                      onClick={nextImage}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-sm hover:bg-white hover:scale-110 active:scale-95 backdrop-blur-sm transition-all"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Dots */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {carouselImages.map((_, i) => (
                      <div
                        key={i}
                        className={[
                          "h-1.5 rounded-full transition-all shadow-sm",
                          i === currentImageIndex ? "w-3 bg-white" : "w-1.5 bg-white/60",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
              <span className="text-3xl">🏨</span>
              <span className="text-xs font-medium">
                {hotel.provider === "mock" ? "Sample hotel" : "Image unavailable"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-700">
                {hotel.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <p className="line-clamp-1">{locationDisplay.text}</p>
              </div>
            </div>
            <div className="flex text-amber-500 shrink-0">
              {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-700">
            <span className="rounded bg-indigo-600 px-1.5 py-0.5 font-bold text-white text-xs">
              {hotel.reviewScore?.toFixed(1) || "New"}
            </span>
            <span className="font-medium">
              {hotel.reviewScore ? formatReviewLabel(hotel.reviewScore) : "No rating"}
            </span>
            <span className="text-slate-500 text-xs">
              ({hotel.reviewCount?.toLocaleString() || 0} reviews)
            </span>
          </div>

          {(badges.length > 0 || explanation) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={`${hotel.hotelId}-${badge.id}`}
                  className={badge.className + " text-xs"}
                  title={badge.description}
                >
                  {badge.label}
                </span>
              ))}
              {explanation && (
                <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                  {explanation}
                </span>
              )}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {(hotel.amenities || []).slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 font-medium"
              >
                {amenity}
              </span>
            ))}
            {(hotel.amenities?.length || 0) > 4 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 font-medium">
                +{(hotel.amenities?.length || 0) - 4} more
              </span>
            )}
          </div>

          <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100 mt-4">
            <div className="text-xs text-slate-500 font-medium">
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
