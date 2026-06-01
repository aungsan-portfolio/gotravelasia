import { useCallback, useMemo, useState } from "react";
import type { UIEvent } from "react";
import { Heart } from "lucide-react";
import { formatReviewLabel } from "@/lib/hotels/formatters";
import { getLightweightHotelBadges } from "@/components/hotels/results/hotelBadgeCopy";
import type { HotelResult } from "@shared/hotels/types";
import { useWishlist } from "@/hooks/useWishlist";
import { getHotelLocationDisplay } from "@/lib/hotels/locationDisplay";
import { HotelPhotoGalleryModal } from "./HotelPhotoGalleryModal";

interface HotelDetailHeaderProps {
  hotel: HotelResult;
}

function HotelImageFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-4xl">
      🏨
    </div>
  );
}

function GalleryImage({
  src,
  alt,
  loading = "lazy",
  roundedClassName = "",
  onError,
  onClick,
}: {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
  roundedClassName?: string;
  onError: (src: string) => void;
  onClick?: () => void;
}) {
  return (
    <div className={["relative overflow-hidden bg-slate-100", roundedClassName].filter(Boolean).join(" ")}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        onClick={onClick}
        className="h-full w-full cursor-pointer object-cover transition hover:opacity-95"
        onError={() => onError(src)}
      />
    </div>
  );
}

export function HotelDetailHeader({ hotel }: HotelDetailHeaderProps) {
  const badges = useMemo(() => getLightweightHotelBadges(hotel, 3), [hotel]);
  const locationDisplay = useMemo(() => getHotelLocationDisplay(hotel), [hotel]);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const [activeSlide, setActiveSlide] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialGallerySlide, setInitialGallerySlide] = useState(0);

  const openGallery = useCallback((index: number) => {
    setInitialGallerySlide(index);
    setIsGalleryOpen(true);
  }, []);

  const galleryImages = useMemo(() => {
    const candidates = [...(hotel.images ?? []), hotel.imageUrl].filter(Boolean);
    return Array.from(new Set(candidates));
  }, [hotel.imageUrl, hotel.images]);

  const activeImages = useMemo(
    () => galleryImages.filter((imageUrl) => !failedImages.has(imageUrl)),
    [failedImages, galleryImages],
  );

  const handleImageError = useCallback((imageUrl: string) => {
    setFailedImages((current) => {
      const next = new Set(current);
      next.add(imageUrl);
      return next;
    });
  }, []);

  const handleMobileGalleryScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { clientWidth, scrollLeft } = event.currentTarget;
    if (clientWidth <= 0) {
      return;
    }
    setActiveSlide(Math.min(activeImages.length - 1, Math.max(0, Math.round(scrollLeft / clientWidth))));
  }, [activeImages.length]);

  const compactDesktopImages = activeImages.slice(1, 4);

  // Wishlist Hook
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(hotel.hotelId);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {activeImages.length === 0 ? (
        <div className="h-64 md:h-80">
          <HotelImageFallback />
        </div>
      ) : (
        <>
          {/* Mobile Gallery */}
          <div className="relative h-64 md:hidden">
            <div
              className="flex h-full w-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onScroll={handleMobileGalleryScroll}
            >
              {activeImages.map((imageUrl, index) => (
                <div key={imageUrl} className="relative h-full w-full shrink-0 snap-center bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={`${hotel.name} photo ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    onClick={() => openGallery(index)}
                    className="h-full w-full object-cover cursor-pointer"
                    onError={() => handleImageError(imageUrl)}
                  />
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wide text-white">
              {Math.min(activeSlide + 1, activeImages.length)} / {activeImages.length}
            </div>
          </div>

          {/* Desktop Gallery Grid */}
          <div className="hidden h-[400px] gap-1.5 bg-slate-100 p-1.5 md:flex">
            <GalleryImage
              src={activeImages[0]}
              alt={`${hotel.name} hero photo`}
              loading="eager"
              roundedClassName={activeImages.length === 1 ? "w-full rounded-lg" : "w-2/3 rounded-l-lg"}
              onError={handleImageError}
              onClick={() => openGallery(0)}
            />

            {activeImages.length > 1 && (
              <div className="flex w-1/3 flex-col gap-1.5">
                {activeImages.length >= 5 ? (
                  <div className="grid h-full grid-cols-2 grid-rows-2 gap-1.5">
                    <GalleryImage
                      src={activeImages[1]}
                      alt={`${hotel.name} photo 2`}
                      onError={handleImageError}
                      onClick={() => openGallery(1)}
                    />
                    <GalleryImage
                      src={activeImages[2]}
                      alt={`${hotel.name} photo 3`}
                      roundedClassName="rounded-tr-lg"
                      onError={handleImageError}
                      onClick={() => openGallery(2)}
                    />
                    <GalleryImage
                      src={activeImages[3]}
                      alt={`${hotel.name} photo 4`}
                      onError={handleImageError}
                      onClick={() => openGallery(3)}
                    />
                    <button 
                      type="button"
                      onClick={() => openGallery(4)}
                      className="group relative overflow-hidden rounded-br-lg bg-slate-100 text-left w-full h-full block"
                    >
                      <img
                        src={activeImages[4]}
                        alt={`${hotel.name} photo 5`}
                        loading="lazy"
                        className="h-full w-full cursor-pointer object-cover transition group-hover:opacity-90"
                        onError={() => handleImageError(activeImages[4])}
                      />
                      {activeImages.length > 5 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white transition group-hover:bg-black/50">
                          <span className="text-xl font-bold tracking-tight">+{activeImages.length - 5}</span>
                          <span className="text-xs font-medium">photos</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div
                    className={[
                      "grid h-full gap-1.5",
                      activeImages.length === 2
                        ? "grid-rows-1"
                        : activeImages.length === 3
                          ? "grid-rows-2"
                          : "grid-rows-3",
                    ].join(" ")}
                  >
                    {compactDesktopImages.map((imageUrl, index) => {
                      const isFirst = index === 0;
                      const isLast = index === compactDesktopImages.length - 1;
                      return (
                        <GalleryImage
                          key={imageUrl}
                          src={imageUrl}
                          alt={`${hotel.name} photo ${index + 2}`}
                          roundedClassName={[isFirst ? "rounded-tr-lg" : "", isLast ? "rounded-br-lg" : ""]
                            .filter(Boolean)
                            .join(" ")}
                          onError={handleImageError}
                          onClick={() => openGallery(index + 1)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Hotel Information Section */}
      <div className="space-y-3 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{locationDisplay.text}</p>
          </div>
          
          {/* Heart Save Button */}
          <button
            type="button"
            onClick={() => toggleSave(hotel)}
            className="flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            title={saved ? "Remove from saved" : "Save this hotel"}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${saved ? "fill-rose-500 text-rose-500" : "text-slate-400"}`}
            />
          </button>
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

      {activeImages.length > 0 && (
        <HotelPhotoGalleryModal
          hotel={hotel}
          images={activeImages}
          isOpen={isGalleryOpen}
          onOpenChange={setIsGalleryOpen}
          initialSlide={initialGallerySlide}
        />
      )}
    </section>
  );
}
