import { Plane, ArrowRight } from "lucide-react";
import type { Deal } from "@/hooks/useFlightData";

const ROUTE_CONFIG = [
  { from: "Yangon", to: "Bangkok", origin: "RGN", dest: "BKK", fallbackPrice: 45 },
  { from: "Yangon", to: "Singapore", origin: "RGN", dest: "SIN", fallbackPrice: 110 },
  { from: "Yangon", to: "Chiang Mai", origin: "RGN", dest: "CNX", fallbackPrice: 120 },
  { from: "Mandalay", to: "Bangkok", origin: "MDL", dest: "BKK", fallbackPrice: 65 },
  { from: "Yangon", to: "KL", origin: "RGN", dest: "KUL", fallbackPrice: 75 },
  { from: "Yangon", to: "Hanoi", origin: "RGN", dest: "HAN", fallbackPrice: 130 },
  { from: "Yangon", to: "Phuket", origin: "RGN", dest: "HKT", fallbackPrice: 140 },
  { from: "Mandalay", to: "Chiang Mai", origin: "MDL", dest: "CNX", fallbackPrice: 150 },
  { from: "Yangon", to: "Ho Chi Minh", origin: "RGN", dest: "SGN", fallbackPrice: 125 },
  { from: "Yangon", to: "Phnom Penh", origin: "RGN", dest: "PNH", fallbackPrice: 180 },
];

const getRouteImage = (dest: string) => {
  const images: Record<string, string> = {
    BKK: "/images/bangkok.webp",
    CNX: "/images/chiang-mai.webp",
    HKT: "/images/phuket.webp",
    SIN: "/images/hero-travel.webp",
    KUL: "/images/hero-travel.webp",
    HAN: "/images/hero-travel.webp",
    SGN: "/images/hero-travel.webp",
    PNH: "/images/hero-travel.webp",
  };
  return images[dest] || "/images/hero-travel.webp";
};

const USD_TO_THB_RATE = 34;
const formatTHB = (usdPrice: number) => {
  const thbPrice = Math.round(usdPrice * USD_TO_THB_RATE);
  return `฿${thbPrice.toLocaleString()}`;
};

type DealsCarouselProps = {
  deals: Deal[];
  buildRouteUrl: (origin: string, dest: string, dealDate?: string) => string;
};

export default function DealsCarousel({ deals, buildRouteUrl }: DealsCarouselProps) {
  return (
    <section className="py-16 bg-[#f8f9fa] border-b border-gray-100 overflow-hidden">
      <div className="container">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-gray-900">
            Trending Flights from Myanmar
          </h2>
          <p className="text-gray-500 font-medium text-lg">
            Explore live deals and direct connections.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          {ROUTE_CONFIG.map((route) => {
            const routeDeal = deals.find(d => d.origin === route.origin && d.destination === route.dest);
            return (
              <a
                key={`${route.origin}-${route.dest}`}
                href={buildRouteUrl(route.origin, route.dest, routeDeal?.date)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block min-w-[280px] md:min-w-[320px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 snap-start flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={getRouteImage(route.dest)}
                    alt={route.to}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
                    <Plane className="w-3 h-3" /> Direct
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{route.to}</h3>
                  <div className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                    {route.from} <ArrowRight className="w-3 h-3 text-gray-400" /> {route.to}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    {routeDeal || route.fallbackPrice ? (
                      <>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Economy</div>
                        <div className="text-xl font-black text-emerald-600">
                          From {formatTHB(routeDeal ? routeDeal.price : route.fallbackPrice!)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Check Fares</div>
                        <div className="text-lg font-black text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                          Search <ArrowRight className="w-4 h-4" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
