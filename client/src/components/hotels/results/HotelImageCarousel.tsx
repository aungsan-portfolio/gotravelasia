"use client";

import { useState, type MouseEvent, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HotelImageCarouselProps {
  images: string[];
  alt: string;
  fallback: React.ReactNode;
  className?: string;
}

/**
 * Cheapflights-style image carousel for hotel cards.
 *
 * - Single image: renders without controls.
 * - Multiple images: prev/next chevrons + dot indicators + counter.
 * - Click events on controls do NOT propagate, so the parent card link
 *   is not triggered when the user navigates between photos.
 * - Failed images are skipped automatically.
 */
export function HotelImageCarousel({
  images,
  alt,
  fallback,
  className,
}: HotelImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  // Filter out images that failed to load. We keep the original index space
  // so the dots/counter map cleanly to `images`.
  const validImages = images.filter((src, i) => !failed[i] && Boolean(src));
  const total = validImages.length;

  if (total === 0) {
    return (
      <div className={["relative h-full w-full bg-slate-100", className].filter(Boolean).join(" ")}>
        {fallback}
      </div>
    );
  }

  const safeIndex = Math.min(index, total - 1);
  const currentSrc = validImages[safeIndex];

  const goTo = (next: number, e?: MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    const wrapped = (next + total) % total;
    setIndex(wrapped);
  };

  const handlePrev = (e: MouseEvent<HTMLButtonElement>) => goTo(safeIndex - 1, e);
  const handleNext = (e: MouseEvent<HTMLButtonElement>) => goTo(safeIndex + 1, e);

  const handleImageError = () => {
    setFailed((prev) => {
      // mark the *original* index as failed by finding the source in images
      const originalIndex = images.findIndex(
        (src, i) => src === currentSrc && !prev[i]
      );
      if (originalIndex === -1) return prev;
      return { ...prev, [originalIndex]: true };
    });
  };

  return (
    <div
      className={["relative h-full w-full overflow-hidden bg-slate-100", className]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        key={currentSrc}
        src={currentSrc || "/placeholder.svg"}
        alt={total > 1 ? `${alt} — photo ${safeIndex + 1} of ${total}` : alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={handleImageError}
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md ring-1 ring-black/5 opacity-0 transition group-hover:opacity-100 hover:scale-110 active:scale-95 sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md ring-1 ring-black/5 opacity-0 transition group-hover:opacity-100 hover:scale-110 active:scale-95 sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>

          {/* Dot indicators */}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center">
            <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
              {validImages.map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === safeIndex ? "w-3 bg-white" : "w-1.5 bg-white/60",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
