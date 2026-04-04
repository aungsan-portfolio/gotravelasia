import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar, Wifi } from "lucide-react";
import type { Deal } from "@/hooks/useFlightData";
import { getDisplayPrice } from "@shared/utils/currency";
import { formatTimeAgo } from "@/lib/timeAgo";

// ── Lookup tables ─────────────────────────────────────────────────
export const AIRLINE_NAMES: Record<string, string> = {
  FD: "Thai AirAsia",  "8M": "Myanmar Airways",
  DD: "Nok Air",        PG:  "Bangkok Airways",
  TG: "Thai Airways",   VZ:  "Thai VietJet",
  TR: "Scoot",          SL:  "Thai Lion Air",
  WE: "Thai Smile",     QR:  "Qatar Airways",
  SQ: "Singapore Airlines",
};

export const DEST_NAMES: Record<string, string> = {
  BKK: "Bangkok",   DMK: "Bangkok",        CNX: "Chiang Mai",
  HKT: "Phuket",    SIN: "Singapore",      KUL: "Kuala Lumpur",
  HAN: "Hanoi",     SGN: "Ho Chi Minh City", DAD: "Da Nang",
  PNH: "Phnom Penh", REP: "Siem Reap",     MDL: "Mandalay",
  RGN: "Yangon",    HKG: "Hong Kong",      TYO: "Tokyo",
  OSA: "Osaka",     ICN: "Seoul",          DPS: "Bali",
  DXB: "Dubai",     BKI: "Kota Kinabalu",  TPE: "Taipei",
};

export const DEST_IMAGES: Record<string, string> = {
  BKK: "/images/bangkok.webp",
  DMK: "/images/bangkok.webp",
  CNX: "/images/chiang-mai.webp",
  HKT: "/images/phuket.webp",
  SIN: "/images/destinations/singapore.webp",
  KUL: "/images/destinations/kuala-lumpur.webp",
  HAN: "/images/destinations/hanoi.webp",
  SGN: "/images/destinations/ho-chi-minh.webp",
  PNH: "/images/destinations/phnom-penh.webp",
  RGN: "/images/destinations/yangon.webp",
  MDL: "/images/destinations/mandalay.webp",
};

// ── Helpers ───────────────────────────────────────────────────────
export function formatDepartDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}


export function getStopBadge(transfers?: number) {
  if (!transfers || transfers === 0)
    return { label: "Direct", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
  if (transfers === 1)
    return { label: "1 stop",  color: "bg-amber-500/20  text-amber-300  border-amber-500/30"  };
  return   { label: `${transfers} stops`, color: "bg-red-500/20 text-red-300 border-red-500/30" };
}

// ── Props ─────────────────────────────────────────────────────────
interface FlightCardProps {
  deal:          Deal;
  href:          string;
  index?:        number;   // for staggered animation
  variant?:      "carousel" | "grid";  // layout variant
}

// ── Component ─────────────────────────────────────────────────────
export function FlightCard({ deal, href, index = 0, variant = "carousel" }: FlightCardProps) {
  const destName   = DEST_NAMES[deal.destination]              ?? deal.destination;
  const originName = DEST_NAMES[deal.origin]                   ?? deal.origin;
  const airline    = AIRLINE_NAMES[deal.airline_code ?? deal.airline] ?? deal.airline;
  const imgSrc     = DEST_IMAGES[deal.destination]             ?? "/images/hero-travel.webp";
  const thbPrice   = getDisplayPrice(deal.price, "USD", "THB");
  const stop       = getStopBadge(deal.transfers);
  const foundLabel = formatTimeAgo(deal.found_at);
  const flightNum  = deal.flight_number ?? deal.flight_num;
  const airlineCode = deal.airline_code ?? deal.airline;

  const carouselClass = "min-w-[280px] md:min-w-[300px] snap-start flex-shrink-0";
  const gridClass     = "w-full";

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className={`group block rounded-2xl overflow-hidden
                  border border-gray-200 bg-white
                  shadow-sm hover:shadow-md transition-shadow
                  flex flex-col
                  ${variant === "carousel" ? carouselClass : gridClass}`}
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="relative h-40 overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={imgSrc}
          alt={destName}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          decoding="async"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Stop badge — top left */}
        <span className={`absolute top-2 left-2 text-[10px] font-bold
                          px-2 py-0.5 rounded-full border backdrop-blur-sm
                          ${stop.color}`}>
          {stop.label}
        </span>

        {/* Airline logo — top right */}
        {airlineCode && (
          <img
            src={`https://pics.avs.io/40/40/${airlineCode}.png`}
            alt={airline}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            className="absolute top-2 right-2 w-7 h-7 rounded-md
                       bg-white/90 object-contain p-0.5"
            loading="lazy"
          />
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Route: CNX → BKK */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
          <span className="font-mono">{deal.origin}</span>
          <ArrowRight className="w-3 h-3 flex-shrink-0" />
          <span className="font-mono text-gray-600 font-semibold">{deal.destination}</span>
          <span className="text-gray-300 mx-0.5">·</span>
          <span>{originName} → {destName}</span>
        </div>

        {/* Destination title */}
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
          {destName}
        </h3>

        {/* Airline + flight number */}
        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-gray-300" />
          {airline}
          {flightNum && (
            <span className="text-gray-300 font-mono text-xs">
              {airlineCode}{flightNum}
            </span>
          )}
        </p>

        {/* Depart date */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span>{formatDepartDate(deal.date)}</span>
        </div>

        {/* Price — bottom */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-400 font-medium">from</span>
            <span className="text-2xl font-bold text-gray-900">
              ฿{thbPrice.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            ${deal.price.toFixed(0)} USD
          </div>
        </div>

        {/* Deal freshness */}
        {foundLabel && (
          <div className="mt-2 pt-2 border-t border-gray-100
                          flex items-center gap-1 text-[10px] text-gray-400">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {foundLabel}
          </div>
        )}
      </div>
    </motion.a>
  );
}
