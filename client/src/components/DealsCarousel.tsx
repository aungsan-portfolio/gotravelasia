import { ArrowRight } from "lucide-react";
import type { Deal } from "@/hooks/useFlightData";

const AIRLINE_NAMES: Record<string, string> = {
  FD: "Thai AirAsia",
  "8M": "Myanmar Airways International",
  DD: "Nok Air",
  PG: "Bangkok Airways",
  TG: "Thai Airways",
  VZ: "VietJet Air",
};

const DEST_NAMES: Record<string, string> = {
  BKK: "Bangkok",
  DMK: "Bangkok",
  CNX: "Chiang Mai",
  HKT: "Phuket",
  SIN: "Singapore",
  KUL: "Kuala Lumpur",
  HAN: "Hanoi",
  SGN: "Ho Chi Minh",
  PNH: "Phnom Penh",
  MDL: "Mandalay",
  RGN: "Yangon",
};

const getRouteImage = (dest: string) => {
  const images: Record<string, string> = {
    BKK: "/images/bangkok.webp",
    DMK: "/images/bangkok.webp",
    CNX: "/images/chiang-mai.webp",
    HKT: "/images/phuket.webp",
    SIN: "/images/destinations/singapore.webp",
    KUL: "/images/destinations/kuala-lumpur.webp",
    HAN: "/images/destinations/hanoi.webp",
    SGN: "/images/destinations/ho-chi-minh.webp",
    PNH: "/images/destinations/phnom-penh.webp",
  };
  return images[dest] || "/images/hero-travel.webp";
};

const USD_TO_THB_RATE = 34;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const THB_THRESHOLD = 15000;
const USD_THRESHOLD = THB_THRESHOLD / USD_TO_THB_RATE;

type DealsCarouselProps = {
  deals: Deal[];
  buildRouteUrl: (origin: string, dest: string, dealDate?: string) => string;
};

export default function DealsCarousel({ deals, buildRouteUrl }: DealsCarouselProps) {
  const cheapDeals = deals
    .filter((d) => d.price <= USD_THRESHOLD && d.price > 0)
    .sort((a, b) => a.price - b.price);

  if (cheapDeals.length === 0) return null;

  return (
    <section className="py-16 bg-[#f8f9fa] border-b border-gray-100 overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Travel deals under ฿{THB_THRESHOLD.toLocaleString()}
            </h2>
            <p className="text-gray-500 font-medium text-base mt-1">
              Live prices from Myanmar — updated daily.
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
          {cheapDeals.map((deal, i) => {
            const dest = deal.destination;
            const origin = deal.origin;
            const destName = DEST_NAMES[dest] || dest;
            const originName = DEST_NAMES[origin] || origin;
            const airlineName = AIRLINE_NAMES[deal.airline] || deal.airline;
            const thbPrice = Math.round(deal.price * USD_TO_THB_RATE);
            const isDirect = deal.transfers === undefined || deal.transfers === 0;

            return (
              <a
                key={`${origin}-${dest}-${i}`}
                href={buildRouteUrl(origin, dest, deal.date)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block min-w-[260px] md:min-w-[280px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 snap-start flex flex-col border border-gray-100"
              >
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img
                    src={getRouteImage(dest)}
                    alt={destName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">{destName}</h3>

                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-1.5 flex-wrap">
                    <span>{airlineName}</span>
                    {isDirect && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-emerald-600 font-semibold">direct</span>
                      </>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-3">
                    {originName} <ArrowRight className="w-3 h-3 inline mx-0.5 text-gray-400" /> {formatDate(deal.date)}
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-gray-400 font-medium">from</span>
                      <span className="text-xl font-extrabold text-gray-900">
                        ฿{thbPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      ${deal.price.toFixed(0)} USD
                    </div>
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
