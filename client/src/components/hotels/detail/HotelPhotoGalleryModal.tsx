import { useState, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { HotelResult } from "@shared/hotels/types";

interface HotelPhotoGalleryModalProps {
  hotel: HotelResult;
  images: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialSlide?: number;
}

export function HotelPhotoGalleryModal({
  hotel,
  images,
  isOpen,
  onOpenChange,
  initialSlide = 0,
}: HotelPhotoGalleryModalProps) {
  const [activeSlide, setActiveSlide] = useState(initialSlide);

  useEffect(() => {
    if (isOpen) {
      setActiveSlide(initialSlide);
    }
  }, [isOpen, initialSlide]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev]);

  if (!images || images.length === 0) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm transition-opacity" />
        <Dialog.Content 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 focus:outline-none"
          aria-describedby="gallery-description"
        >
          <div className="sr-only" id="gallery-description">
            Photo gallery for {hotel.name}
          </div>
          
          {/* Header */}
          <div className="absolute top-0 w-full flex items-center justify-between p-4 text-white z-10 bg-gradient-to-b from-black/60 to-transparent">
            <Dialog.Title className="text-lg font-semibold truncate px-2">
              {hotel.name}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          {/* Main Image */}
          <div className="relative flex-1 flex items-center justify-center w-full max-h-[70vh] md:max-h-[80vh]">
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 md:left-8 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}
            
            <img
              src={images[activeSlide]}
              alt={`${hotel.name} - Photo ${activeSlide + 1} of ${images.length}`}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 md:right-8 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
              {activeSlide + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="w-full max-w-4xl mt-4 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={[
                      "relative h-16 w-24 shrink-0 overflow-hidden rounded-md snap-center transition-all",
                      index === activeSlide 
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black/50 opacity-100" 
                        : "opacity-50 hover:opacity-100"
                    ].join(" ")}
                    aria-label={`View photo ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
