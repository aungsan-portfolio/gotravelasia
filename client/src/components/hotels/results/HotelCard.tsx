import { memo, useMemo, useState } from "react";
import { MapPin, Star } from "lucide-react";

import {
  formatReviewLabel,
  formatStayNights,
} from "@/lib/hotels/formatters";
import { getHotelPricePresentation } from "@/components/hotels/hotelPriceFormat";
import {
  getHotelAmenityVisual,
  prioritizeAmenities,
} from "@/components/hotels/hotelAmenityIcons";
import {
  getHotelBadgeClassName,
  getHotelBadges,
} from "@/components/hotels/hotelBadges";
import type { HotelOutboundLinks, HotelResult } from "@shared/hotels/types";

interface HotelCardProps {
  hotel: HotelResult;
  checkIn: string;
  checkOut: string;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (hotelId: string) => void;
  onHover: (hotelId: string | null) => void;
}

function getPrimaryLink(
  outboundLinks?: HotelOutboundLinks,
): { href: string; label: string } | null {
  if (!outboundLinks) return null;

  if (outboundLinks.agoda) return { href: outboundLinks.agoda, label: "View on Agoda" };
  if (outboundLinks.booking) return { href: outboundLinks.booking, label: "View on Booking" };
  if (outboundLinks.trip) return { href: outboundLinks.trip, label: "View on Trip.com" };
  if (outboundLinks.expedia) return { href: outboundLinks.expedia, label: "View on Expedia" };
  if (outboundLinks.klook) return { href: outboundLinks.klook, label: "View on Klook" };

  return null;
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

  const displayedAmenities = useMemo(
    () => prioritizeAmenities(hotel.amenities || [], 4),
    [hotel.amenities],
  );

  const remainingAmenityCount = Math.max(
    0,
    (hotel.amenities?.length || 0) - displayedAmenities.length,
  );

  const badges = useMemo(() => getHotelBadges(hotel, 3), [hotel]);

  const primaryLink = getPrimaryLink(hotel.outboundLinks);

  const pricePresentation = useMemo(
    () =>
      getHotelPricePresentation(hotel.lowestRate, hotel.currency || "USD", {
        mode: "native",
        showApproximateThb: true,
      }),
    [hotel.lowestRate, hotel.currency],
  );

  const hasMapCoordinates = Boolean(hotel.coordinates);

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
        className="grid w-full grid-cols-1 text-left md:grid-cols-[240px_1fr]"
      >
        <div className="h-52 bg-slate-100 md:h-full">
          {!imageFailed && hotel.imageUrl ? (
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🏨</div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
              <p className="mt-1 line-clamp-1 text-sm text-slate-600">
                {hotel.address || "Location unavailable"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 text-amber-500">
              {Array.from({ length: hotel.stars || 0 }).map((_, index) => (
                <Star
                  key={`${hotel.hotelId}-star-${index}`}
                  className="h-4 w-4 fill-current"
                />
              ))}
            </div>
          </div>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={`${hotel.hotelId}-${badge.id}`}
                  className={getHotelBadgeClassName(badge.tone)}
                  title={badge.description}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="rounded bg-indigo-600 px-2 py-0.5 font-semibold text-white">
              {hotel.reviewScore ? hotel.reviewScore.toFixed(1) : "New"}
            </span>
            <span>{hotel.reviewScore ? formatReviewLabel(hotel.reviewScore) : "No rating yet"}</span>
            <span className="text-slate-500">
              ({hotel.reviewCount?.toLocaleString() || 0} reviews)
            </span>

            {hasMapCoordinates && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                <MapPin className="h-3.5 w-3.5" />
                Map
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {displayedAmenities.map((amenity) => {
              const { Icon, label } = getHotelAmenityVisual(amenity);

              return (
                <span
                  key={`${hotel.hotelId}-${amenity}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                  title={amenity}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </span>
              );
            })}

            {remainingAmenityCount > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                +{remainingAmenityCount} more
              </span>
            )}
          </div>

          <div className="mt-1 flex items-end justify-between gap-4">
            <div className="text-sm text-slate-500">
              {formatStayNights(checkIn, checkOut)}
            </div>

            <div className="text-right">
              {primaryLink && (
                <div className="mb-2 flex justify-end">
                  <a
                    href={primaryLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {primaryLink.label}
                  </a>
                </div>
              )}

              <p className="text-xs text-slate-500">Per night</p>
              <p className="text-2xl font-bold text-slate-900">
                {pricePresentation.primary}
              </p>

              {pricePresentation.secondary && (
                <p className="mt-1 text-xs text-slate-500">
                  {pricePresentation.secondary}
                  {pricePresentation.isApproximate ? " approx." : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

export const HotelCard = memo(HotelCardComponent);
