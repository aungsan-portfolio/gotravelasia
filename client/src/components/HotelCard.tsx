import { useState } from 'react';
import type { City } from '@shared/hotels/cities';
import type { HotelOutboundLinks, HotelResult } from '@shared/hotels/types';

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
}

const PLATFORMS = [
  { id: 'agoda', name: 'Agoda', dot: '#E22128' },
  { id: 'booking', name: 'Booking.com', dot: '#4A90E2' },
  { id: 'trip', name: 'Trip.com', dot: '#1890FF' },
] as const;

function scoreLabel(s: number) {
  if (s >= 9.2) return 'Exceptional';
  if (s >= 8.5) return 'Excellent';
  if (s >= 7.5) return 'Very Good';
  if (s >= 7) return 'Good';
  return '';
}

function getHotelLink(platform: keyof AffiliateLinks, hotelLinks: AffiliateLinks | undefined, pageLinks: AffiliateLinks) {
  return hotelLinks?.[platform] ?? pageLinks[platform] ?? '#';
}

export default function HotelCard({ hotel, city, affiliateLinks, checkIn, checkOut, adults = 2, animDelay = 0 }: Props) {
  const [imgErr, setImgErr] = useState(false);
  const stars = Math.min(5, Math.max(0, Math.round(hotel.stars)));
  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
    : 1;
  const hotelLinks = hotel.outboundLinks ?? {};
  const hasHotelLevelLinks = Object.keys(hotelLinks).length > 0;

  return (
    <article
      className="bg-navy-card border border-white/8 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,.5)] hover:border-gold/15 animate-fade-up"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="relative h-[175px] overflow-hidden bg-navy-2">
        {!imgErr && hotel.imageUrl ? (
          <img src={hotel.imageUrl} alt={hotel.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30" style={{ background: 'linear-gradient(135deg,#1a1640,#0f0d22)' }}>🏨</div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(13,11,30,.85) 0%,transparent 55%)' }} />
        <div className="absolute bottom-2.5 left-3 text-gold text-[12px] tracking-widest">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
        {city && <div className="absolute top-2.5 left-3 text-[10px] text-white px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}>{city.flag} {city.name}</div>}
        {hotel.reviewScore >= 9 && <div className="absolute top-2.5 right-3 text-[10px] font-bold text-navy bg-gold px-2 py-0.5 rounded-full">Top Rated</div>}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-display font-semibold text-[15px] text-white leading-snug line-clamp-2">{hotel.name}</h3>

        {hotel.address && (
          <p className="flex items-start gap-1 text-[11px] text-white/38">
            <svg className="w-3 h-3 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {hotel.address}
          </p>
        )}

        {hotel.reviewScore > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-extrabold text-navy bg-gold px-2 py-0.5 rounded-md">{hotel.reviewScore.toFixed(1)}</span>
            <span className="text-[12px] font-semibold text-white/65">{scoreLabel(hotel.reviewScore)}</span>
            {hotel.reviewCount > 0 && <span className="text-[11px] text-white/38">{hotel.reviewCount.toLocaleString()} reviews</span>}
          </div>
        )}

        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 4).map((a) => <span key={a} className="text-[10px] text-white/55 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full">{a}</span>)}
          </div>
        )}

        <div className="mt-1 pt-2.5 border-t border-white/8">
          <div className="flex justify-between items-center mb-2 gap-2">
            <span className="text-[10px] font-semibold text-white/35 tracking-wider uppercase">{hasHotelLevelLinks ? 'Hotel links' : 'Search on partners'}</span>
            {checkIn && checkOut && <span className="text-[10px] text-white/28">{checkIn} – {checkOut} · {nights}n · {adults}A</span>}
          </div>

          {hotel.lowestRate > 0 && (
            <div className="mb-2 flex items-baseline justify-between rounded-lg border border-white/8 bg-white/[0.04] px-3 py-2">
              <span className="text-[11px] text-white/55">From</span>
              <span className="text-lg font-bold text-white">
                ${hotel.lowestRate}
                <span className="ml-1 text-[10px] font-normal text-white/38">/night{hotel.currency ? ` · ${hotel.currency}` : ''}</span>
              </span>
            </div>
          )}

          {PLATFORMS.map((platform) => {
            const href = getHotelLink(platform.id, hotelLinks, affiliateLinks);
            const label = hotelLinks[platform.id] ? 'Hotel deal' : 'Search page';
            return (
              <a key={platform.id} href={href} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-1 transition-all hover:bg-white/5 border border-transparent hover:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: platform.dot }} />
                  <span className="text-[12px] text-white/65">{platform.name}</span>
                  <span className="text-[9px] font-bold bg-white/8 text-white/55 px-1.5 py-0.5 rounded-full">{label}</span>
                </div>
                <span className="text-[11px] font-semibold text-gold">Book →</span>
              </a>
            );
          })}

          {(affiliateLinks.klook || affiliateLinks.expedia) && (
            <div className="flex gap-2 mt-2">
              {affiliateLinks.klook && <a href={hotelLinks.klook ?? affiliateLinks.klook} target="_blank" rel="noopener noreferrer sponsored" className="flex-1 text-center text-[11px] text-white/55 bg-white/5 border border-white/10 rounded-lg py-1.5 hover:bg-white/9 hover:text-white transition-all"><span className="text-[#FF5C35]">●</span> Klook →</a>}
              {affiliateLinks.expedia && <a href={hotelLinks.expedia ?? affiliateLinks.expedia} target="_blank" rel="noopener noreferrer sponsored" className="flex-1 text-center text-[11px] text-white/55 bg-white/5 border border-white/10 rounded-lg py-1.5 hover:bg-white/9 hover:text-white transition-all"><span className="text-[#00355F]">●</span> Expedia →</a>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
