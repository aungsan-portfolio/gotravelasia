import { useLocation } from "wouter";

import {
  buildHotelSearchParams,
  defaultHotelDates,
} from "@shared/hotels/searchParams";
import { trackHotelDealClick } from "@/lib/hotels/tracking";

import { HotelDealCard } from "./HotelDealCard";
import { HOTEL_DEAL_SEEDS, type HotelDealSeed } from "./hotelDeals.seed";

/**
 * Interactive horizontal carousel for hotel deals.
 * Leverages HotelDealCard for consistent visual language and provides direct navigation to results.
 */
export function HotelDealsCarousel() {
  const [, setLocation] = useLocation();

  const handleDealClick = (deal: HotelDealSeed) => {
    trackHotelDealClick({
      dealId: deal.id,
      dealTitle: deal.title,
      city: deal.city,
      cityName: deal.cityName,
      source: "hotel_deals_carousel",
    });

    const dates = defaultHotelDates();
    const query = buildHotelSearchParams({
      city: deal.city,
      cityName: deal.cityName,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      adults: 2,
      rooms: 1,
      page: 1,
      sort: "best",
    });

    setLocation(`/hotels?${query.toString()}`);
  };

  return (
    <section className="mt-6 border-t border-white/5 pt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-white/80">Popular hotel deals</h4>
          <p className="text-xs text-white/40">
            Start with trending destinations across Thailand
          </p>
        </div>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
        {HOTEL_DEAL_SEEDS.map((deal) => (
          <HotelDealCard key={deal.id} deal={deal} onClick={handleDealClick} />
        ))}
      </div>
    </section>
  );
}
