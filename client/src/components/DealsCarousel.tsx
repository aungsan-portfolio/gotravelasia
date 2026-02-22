import { Plane, ArrowRight, Star } from "lucide-react";
import type { Deal } from "@/hooks/useFlightData";

const ROUTE_CONFIG = [
  { from: "Yangon", to: "Bangkok", origin: "RGN", dest: "BKK", fallbackPrice: 45, rating: 4.8, reviews: 2340 },
  { from: "Yangon", to: "Singapore", origin: "RGN", dest: "SIN", fallbackPrice: 110, rating: 4.7, reviews: 1820 },
  { from: "Yangon", to: "Chiang Mai", origin: "RGN", dest: "CNX", fallbackPrice: 120, rating: 4.9, reviews: 1560 },
  { from: "Mandalay", to: "Bangkok", origin: "MDL", dest: "BKK", fallbackPrice: 65, rating: 4.6, reviews: 980 },
  { from: "Yangon", to: "KL", origin: "RGN", dest: "KUL", fallbackPrice: 75, rating: 4.5, reviews: 1240 },
  { from: "Yangon", to: "Hanoi", origin: "RGN", dest: "HAN", fallbackPrice: 130, rating: 4.4, reviews: 760 },
  { from: "Yangon", to: "Phuket", origin: "RGN", dest: "HKT", fallbackPrice: 140, rating: 4.8, reviews: 2100 },
  { from: "Mandalay", to: "Chiang Mai", origin: "MDL", dest: "CNX", fallbackPrice: 150, rating: 4.7, reviews: 640 },
  { from: "Yangon", to: "Ho Chi Minh", origin: "RGN", dest: "SGN", fallbackPrice: 125, rating: 4.5, reviews: 890 },
  { from: "Yangon", to: "Phnom Penh", origin: "RGN", dest: "PNH", fallbackPrice: 180, rating: 4.3, reviews: 520 },
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

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? "fill-amber-400 text-amber-400"
                : i === fullStars && hasHalf
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-gray-700">{rating}</span>
      <span className="text-xs text-gray-400">({reviews.toLocaleString()})</span>
    </div>
  );
}

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
            const price = routeDeal ? routeDeal.price : route.fallbackPrice;
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
                  {price && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-lg">
                      From ${price}
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{route.to}</h3>
                  <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    {route.from} <ArrowRight className="w-3 h-3 text-gray-400" /> {route.to}
                  </div>
                  <StarRating rating={route.rating} reviews={route.reviews} />

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    {price ? (
                      <>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price starting from</div>
                          <div className="text-xl font-black text-emerald-600">
                            {formatTHB(price)}
                          </div>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                          View Deal
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
