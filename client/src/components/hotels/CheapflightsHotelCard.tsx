import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import type { City } from "@shared/hotels/cities";
import type { HotelOutboundLinks, HotelResult } from "@shared/hotels/types";

export type HotelData = HotelResult;
export type AffiliateLinks = HotelOutboundLinks;

interface Props {
  hotel: HotelData;
  city?: City;
  affiliateLinks: AffiliateLinks;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  animDelay?: number;
  dense?: boolean;
  isActive?: boolean;
  onSelect?: (hotelId: HotelData["hotelId"]) => void;
  className?: string;
}

const PLATFORMS = [
  { id: "agoda", name: "Agoda", shortName: "Agoda", dot: "#E22128" },
  { id: "booking", name: "Booking.com", shortName: "Booking", dot: "#4A90E2" },
  { id: "trip", name: "Trip.com", shortName: "Trip", dot: "#1890FF" },
] as const;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function scoreLabel(score: number) {
  if (score >= 9.2) return "Exceptional";
  if (score >= 8.5) return "Excellent";
  if (score >= 7.5) return "Very Good";
  if (score >= 7) return "Good";
  return "";
}

function getHotelLink(
  platform: keyof AffiliateLinks,
  hotelLinks: AffiliateLinks | undefined,
  pageLinks: AffiliateLinks
) {
  return hotelLinks?.[platform] ?? pageLinks[platform] ?? "";
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(value?: number) {
  return value && value > 0 ? usdFormatter.format(value) : "—";
}

function formatStayMeta(checkIn?: string, checkOut?: string, adults = 2) {
  if (!checkIn || !checkOut) return "Dates flexible";

  const nights = Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
    )
  );

  return `${checkIn}–${checkOut} · ${nights}n · ${adults}A`;
}

export default function CheapflightsHotelCard({
  hotel,
  city,
  affiliateLinks,
  checkIn,
  checkOut,
  adults = 2,
  animDelay = 0,
  dense = false,
  isActive = false,
  onSelect,
  className,
}: Props) {
  const [imgErr, setImgErr] = useState(false);

  const stars = Math.min(5, Math.max(0, Math.round(hotel.stars ?? 0)));
  const reviewLabel = scoreLabel(hotel.reviewScore ?? 0);
  const stayMeta = formatStayMeta(checkIn, checkOut, adults);

  const hotelLinks = hotel.outboundLinks ?? {};
  const hasHotelLevelLinks = Object.keys(hotelLinks).length > 0;

  const availablePlatforms = useMemo(() => {
    return PLATFORMS.map((platform) => {
      const href = getHotelLink(platform.id, hotelLinks, affiliateLinks);
      return href
        ? {
            ...platform,
            href,
          }
        : null;
    }).filter(Boolean) as Array<(typeof PLATFORMS)[number] & { href: string }>;
  }, [hotelLinks, affiliateLinks]);

  const primaryHref =
    getHotelLink("agoda", hotelLinks, affiliateLinks) ||
    availablePlatforms[0]?.href ||
    "";

  const locationText = city
    ? `${city.flag} ${city.name}`
    : hotel.address || "Hotel";

  const handleSelect = () => {
    onSelect?.(hotel.hotelId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  if (dense) {
    return (
      <article
        tabIndex={onSelect ? 0 : -1}
        onClick={onSelect ? handleSelect : undefined}
        onKeyDown={onSelect ? handleKeyDown : undefined}
        aria-pressed={onSelect ? isActive : undefined}
        className={joinClasses(
          "group animate-fade-up rounded-xl border bg-[#17142d] p-2.5 transition-all duration-200",
          onSelect && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/50",
          isActive
            ? "border-gold/45 shadow-[0_16px_36px_rgba(0,0,0,.35)] ring-1 ring-gold/30"
            : "border-white/10 hover:border-white/25 hover:bg-[#1b1834]",
          className
        )}
        style={{ animationDelay: `${animDelay}ms` }}
      >
        <div className="flex gap-2.5">
          <div className="relative h-[94px] w-[116px] shrink-0 overflow-hidden rounded-lg bg-navy-2">
            {!imgErr && hotel.imageUrl ? (
              <img
                src={hotel.imageUrl}
                alt={hotel.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-3xl opacity-35"
                style={{
                  background: "linear-gradient(135deg,#1a1640,#0f0d22)",
                }}
              >
                🏨
              </div>
            )}

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top,rgba(13,11,30,.7) 0%,transparent 65%)",
              }}
            />

            <div className="absolute bottom-1.5 left-1.5 text-[10px] tracking-wide text-gold">
              {"★".repeat(stars)}
              {"☆".repeat(5 - stars)}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-tight text-white">
              {hotel.name}
            </h3>

            <p className="mt-1 line-clamp-1 text-[10px] text-white/45">
              {locationText}
            </p>

            {hotel.reviewScore > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                <span className="rounded bg-gold px-1.5 py-0.5 font-extrabold text-navy">
                  {hotel.reviewScore.toFixed(1)}
                </span>

                {reviewLabel && (
                  <span className="font-medium text-white/80">{reviewLabel}</span>
                )}

                {hotel.reviewCount > 0 && (
                  <span className="text-white/45">
                    {hotel.reviewCount.toLocaleString()} reviews
                  </span>
                )}
              </div>
            )}

            <div className="mt-1.5 flex items-end justify-between gap-2">
              <div className="text-[10px] text-white/45">{stayMeta}</div>

              <div className="text-right leading-tight">
                <div className="text-[10px] uppercase tracking-wide text-white/45">
                  from
                </div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(hotel.lowestRate)}
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex flex-wrap gap-1.5">
                {availablePlatforms.map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-1 text-[10px] text-white/70 transition-colors hover:bg-white/10"
                    aria-label={`Open ${hotel.name} on ${platform.name}`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: platform.dot }}
                    />
                    {platform.shortName}
                  </a>
                ))}
              </div>

              <span className="ml-auto self-center text-[10px] font-semibold text-gold">
                {hasHotelLevelLinks ? "Hotel deal" : "Partner deal"} →
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      tabIndex={onSelect ? 0 : -1}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      aria-pressed={onSelect ? isActive : undefined}
      className={joinClasses(
        "group animate-fade-up overflow-hidden rounded-2xl border bg-navy-card transition-all duration-200",
        onSelect && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/50",
        isActive
          ? "border-gold/30 shadow-[0_16px_48px_rgba(0,0,0,.5)] ring-1 ring-gold/20"
          : "border-white/8 hover:-translate-y-1 hover:border-gold/15 hover:shadow-[0_16px_48px_rgba(0,0,0,.5)]",
        className
      )}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="relative h-[175px] overflow-hidden bg-navy-2">
        {!imgErr && hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-5xl opacity-30"
            style={{ background: "linear-gradient(135deg,#1a1640,#0f0d22)" }}
          >
            🏨
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top,rgba(13,11,30,.85) 0%,transparent 55%)",
          }}
        />

        <div className="absolute bottom-2.5 left-3 text-[12px] tracking-widest text-gold">
          {"★".repeat(stars)}
          {"☆".repeat(5 - stars)}
        </div>

        {hotel.reviewScore > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-navy-card/80 p-1 pr-3 text-white backdrop-blur-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-navy">
              {hotel.reviewScore.toFixed(1)}
            </span>
            {reviewLabel && (
              <span className="text-xs font-semibold">{reviewLabel}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-white">
            {hotel.name}
          </h3>

          <p className="mt-1 line-clamp-1 text-xs text-white/65">
            {locationText}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="text-xs text-white/55">
            <p>{stayMeta}</p>
            {hotel.reviewCount > 0 && (
              <p className="mt-1">{hotel.reviewCount.toLocaleString()} reviews</p>
            )}
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-white/45">
              Price per night from
            </p>
            <p className="text-2xl font-bold text-white">
              {formatPrice(hotel.lowestRate)}
            </p>
          </div>
        </div>

        {availablePlatforms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availablePlatforms.map((platform) => (
              <a
                key={platform.id}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-medium text-white/75 transition-colors hover:bg-white/10"
                aria-label={`Open ${hotel.name} on ${platform.name}`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: platform.dot }}
                />
                {platform.name}
              </a>
            ))}
          </div>
        )}

        {primaryHref ? (
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 block w-full rounded-lg bg-gold py-2.5 text-center text-sm font-bold text-navy shadow-[0_4px_12px_rgba(245,200,66,0.3)] transition-all hover:bg-gold-2 hover:shadow-[0_6px_16px_rgba(245,200,66,0.4)]"
            aria-label={`View deal for ${hotel.name}`}
          >
            View Details & Book
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="mt-1 w-full rounded-lg bg-white/10 py-2.5 text-sm font-bold text-white/40"
          >
            Deal unavailable
          </button>
        )}
      </div>
    </article>
  );
}
