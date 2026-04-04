import { ArrowRight, Zap } from "lucide-react";
import type { Deal } from "@/hooks/useFlightData";
import { convertPrice } from "@shared/utils/currency";
import { FlightCard } from "@/components/FlightCard";

const THB_THRESHOLD = 15000;
const USD_THRESHOLD = convertPrice(THB_THRESHOLD, "THB", "USD");

type DealsCarouselProps = {
  deals: Deal[];
  buildRouteUrl: (origin: string, dest: string, dealDate?: string) => string;
};

export default function DealsCarousel({ deals, buildRouteUrl }: DealsCarouselProps) {
  const cheapDeals = deals
    .filter((d) => d.price <= USD_THRESHOLD && d.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 12); // Limit to 12 best deals for the carousel

  if (cheapDeals.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-gray-100 overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Best Flight Deals
            </h2>
            <p className="text-gray-500 font-medium text-base mt-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Live prices · updated daily
            </p>
          </div>
          <a
            href="#popular-routes"
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
          >
            Explore more <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          {cheapDeals.map((deal, i) => (
            <FlightCard 
              key={`${deal.origin}-${deal.destination}-${i}`} 
              deal={deal} 
              index={i} 
              href={buildRouteUrl(deal.origin, deal.destination, deal.date)}
              variant="carousel"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
