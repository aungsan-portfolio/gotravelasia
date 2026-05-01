import type { HotelDealSeed } from "./hotelDeals.seed";

export interface HotelDealCardProps {
  deal: HotelDealSeed;
  onClick: (deal: HotelDealSeed) => void;
}

/**
 * Modern card component for displaying individual hotel deals.
 * Features emoji imagery, high-contrast badges, and glassmorphism styling.
 */
export function HotelDealCard({ deal, onClick }: HotelDealCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(deal)}
      className="group min-w-[220px] rounded-2xl border border-white/10 bg-white/10 p-4 text-left transition hover:border-white/20 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl shadow-inner"
        >
          {deal.imageEmoji}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70">
          {deal.badge}
        </span>
      </div>

      <h5 className="text-sm font-semibold text-white truncate">{deal.title}</h5>
      <p className="mt-1 text-xs text-white/60 line-clamp-2 leading-relaxed">{deal.subtitle}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-white/50">{deal.priceHint}</span>
        <span className="text-xs font-semibold text-white/80 transition group-hover:text-white group-hover:translate-x-0.5">
          View hotels
        </span>
      </div>
    </button>
  );
}
