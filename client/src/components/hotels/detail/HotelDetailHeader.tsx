import { useMemo, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { formatReviewLabel } from "@/lib/hotels/formatters";
import { getLightweightHotelBadges } from "@/components/hotels/results/hotelBadgeCopy";
import type { HotelResult } from "@shared/hotels/types";
import { useWishlist } from "@/hooks/useWishlist";

interface HotelDetailHeaderProps {
  hotel: HotelResult;
}

export function HotelDetailHeader({ hotel }: HotelDetailHeaderProps) {
  const badges = useMemo(() => getLightweightHotelBadges(hotel, 3), [hotel]);

  // 1. Memoize and deduplicate gallery images
  const galleryImages = useMemo(() => {
    const candidates = [
      ...(hotel.images ?? []),
      hotel.imageUrl,
    ].filter(Boolean);

    return Array.from(new Set(candidates));
  }, [hotel.images, hotel.imageUrl]);

  // 2. Track failed images individually
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  
  const handleImageError = useCallback((url: string) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  const activeImages = useMemo(
    () => galleryImages.filter((img) => !failedImages.has(img)),
    [galleryImages, failedImages]
  );

  // 3. Mobile carousel scroll tracking
  const [activeSlide, setActiveSlide] = useState(0);
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    if (width > 0) {
      setActiveSlide(Math.round(scrollLeft / width));
    }
  }, []);

  // 4. Wishlist Hook
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(hotel.hotelId);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      
      {/* ===== Premium Gallery Section ===== */}
      {activeImages.length === 0 ? (
        // Fallback for completely missing or failed images
        <div className="h-64 bg-slate-100 md:h-80 flex items-center justify-center text-4xl">
          🏨
        </div>
      ) : (
        <>
          {/* Mobile Swipeable Carousel (visible only on mobile) */}
          <div className="relative flex md:hidden h-64">
            <div 
              className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              onScroll={handleScroll}
            >
              {activeImages.map((img, index) => (
                <div key={img} className="w-full shrink-0 snap-center relative">
                  <img
                    src={img}
                    alt={`${hotel.name} - Photo ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover"
                    onError={() => handleImageError(img)}
                  />
                </div>
              ))}
            </div>
            
            {/* Mobile Counter Badge */}
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-wide text-white pointer-events-none">
               {activeSlide + 1} / {activeImages.length}
            </div>
          </div>

          {/* Desktop Responsive Grid (visible only on md and up) */}
          <div className="hidden md:flex gap-1.5 h-[400px] p-1.5 bg-slate-100">
            {/* Hero Large Image */}
            <div className={`relative overflow-hidden rounded-l-lg ${activeImages.length === 1 ? 'w-full rounded-r-lg' : 'w-2/3'}`}>
               <img
                  src={activeImages[0]}
                  alt={`${hotel.name} - Hero`}
                  loading="eager"
                  className="h-full w-full object-cover cursor-pointer hover:opacity-95 transition"
                  onError={() => handleImageError(activeImages[0])}
                />
            </div>
            
            {/* Right Side Small Images Grid */}
            {activeImages.length > 1 && (
              <div className="w-1/3 flex flex-col gap-1.5">
                 {activeImages.length >= 5 ? (
                   // 5+ Images: Standard Airbnb 2x2 Grid
                   <div className="grid grid-cols-2 grid-rows-2 gap-1.5 h-full">
                     <div className="overflow-hidden relative"><img src={activeImages[1]} loading="lazy" className="h-full w-full object-cover cursor-pointer hover:opacity-95 transition" onError={() => handleImageError(activeImages[1])} /></div>
                     <div className="overflow-hidden rounded-tr-lg relative"><img src={activeImages[2]} loading="lazy" className="h-full w-full object-cover cursor-pointer hover:opacity-95 transition" onError={() => handleImageError(activeImages[2])} /></div>
                     <div className="overflow-hidden relative"><img src={activeImages[3]} loading="lazy" className="h-full w-full object-cover cursor-pointer hover:opacity-95 transition" onError={() => handleImageError(activeImages[3])} /></div>
                     <div className="overflow-hidden rounded-br-lg relative cursor-pointer hover:opacity-90 transition group">
                        <img src={activeImages[4]} loading="lazy" className="h-full w-full object-cover" onError={() => handleImageError(activeImages[4])} />
                        {activeImages.length > 5 && (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white group-hover:bg-black/50 transition">
                            <span className="text-xl font-bold tracking-tight">+{activeImages.length - 5}</span>
                            <span className="text-xs font-medium">photos</span>
                          </div>
                        )}
                     </div>
                   </div>
                 ) : (
                   // Fallback for 2, 3, or 4 total images: Stack them evenly
                   <div className={`grid gap-1.5 h-full ${activeImages.length === 2 ? 'grid-rows-1' : activeImages.length === 3 ? 'grid-rows-2' : 'grid-rows-3'}`}>
                      {activeImages.slice(1, 4).map((img, index) => {
                        const isLast = index === activeImages.slice(1, 4).length - 1;
                        return (
                          <div key={img} className={`overflow-hidden relative ${isLast ? 'rounded-br-lg' : ''} ${index === 0 ? 'rounded-tr-lg' : ''}`}>
                            <img src={img} loading="lazy" className="h-full w-full object-cover cursor-pointer hover:opacity-95 transition" onError={() => handleImageError(img)} />
                          </div>
                        );
                      })}
                   </div>
                 )}
              </div>
            )}
          </div>
        </>
      )}
      {/* ===== END Gallery Section ===== */}

      {/* Preserve Existing Information Section */}
      <div className="space-y-3 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{hotel.name}</h1>
            <p className="mt-1 text-sm text-slate-600">{hotel.address || "Location unavailable"}</p>
          </div>
          
          {/* 💖 Heart Save Button */}
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
    </section>
  );
}
