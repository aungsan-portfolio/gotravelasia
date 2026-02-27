import { useState, useEffect, useMemo, memo } from "react";
import { USD_TO_THB_RATE } from "@/const";

// ─────────────────────────────────────────────────────────────────────────────
// CheapDealsCards — Live pricing from flight_data.json bot
// ─────────────────────────────────────────────────────────────────────────────
// Features:
//   • Two tabs: "From Myanmar 🇲🇲" and "Around Asia 🌏"
//   • Reads live bot data from /data/flight_data.json (updated daily)
//   • Auto-sorts by price ascending → picks cheapest 4 with country diversity
//   • Dynamic "under $XX" title hook based on live prices

// ── Types ────────────────────────────────────────────────────────────────────
interface BotRoute {
    origin: string;
    destination: string;
    price: number;
    currency: string;
    airline_code: string;
    date: string;
    transfers: number;
    flight_num: string;
    region: string;
    found_at: string;
}

interface DealCard {
    id: string;
    destination: string;
    country: string;
    image: string;
    toCode: string;
    fromCode: string;
    price: number;
    airline: string;
    date: string;
    transfers: number;
}

// ── Destination metadata (what we display, images, country for diversity) ────
interface DestinationMeta {
    toCode: string;
    city: string;
    country: string;
    image: string;
}

// Myanmar Tab: destinations reachable from RGN or MDL
const MYANMAR_ORIGINS = ["RGN", "MDL"];
const MYANMAR_DESTINATIONS: DestinationMeta[] = [
    { toCode: "BKK", city: "Bangkok", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "DMK", city: "Bangkok (DMK)", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "CNX", city: "Chiang Mai", country: "Thailand", image: "/images/chiang-mai.webp" },
    { toCode: "SIN", city: "Singapore", country: "Singapore", image: "/images/destinations/singapore.webp" },
    { toCode: "KUL", city: "Kuala Lumpur", country: "Malaysia", image: "/images/destinations/kuala-lumpur.webp" },
    { toCode: "HAN", city: "Hanoi", country: "Vietnam", image: "/images/destinations/hanoi.webp" },
    { toCode: "SGN", city: "Ho Chi Minh City", country: "Vietnam", image: "/images/destinations/ho-chi-minh.webp" },
    { toCode: "ICN", city: "Seoul", country: "South Korea", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&q=80" },
    { toCode: "NRT", city: "Tokyo", country: "Japan", image: "/images/tokyo.webp" },
    { toCode: "HKT", city: "Phuket", country: "Thailand", image: "/images/phuket.webp" },
    { toCode: "DPS", city: "Bali", country: "Indonesia", image: "/images/bali.webp" },
];

// Asia Tab: popular inter-Asia routes (use ALL bot-tracked origins)
const ASIA_ORIGINS = ["BKK", "DMK", "CNX", "HKT", "SIN"];
const ASIA_DESTINATIONS: DestinationMeta[] = [
    { toCode: "CNX", city: "Chiang Mai", country: "Thailand", image: "/images/chiang-mai.webp" },
    { toCode: "HKT", city: "Phuket", country: "Thailand", image: "/images/phuket.webp" },
    { toCode: "BKK", city: "Bangkok", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "DMK", city: "Bangkok (DMK)", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "SIN", city: "Singapore", country: "Singapore", image: "/images/destinations/singapore.webp" },
    { toCode: "KUL", city: "Kuala Lumpur", country: "Malaysia", image: "/images/destinations/kuala-lumpur.webp" },
    { toCode: "SGN", city: "Ho Chi Minh City", country: "Vietnam", image: "/images/destinations/ho-chi-minh.webp" },
    { toCode: "RGN", city: "Yangon", country: "Myanmar", image: "/images/destinations/yangon.png" },
    { toCode: "MDL", city: "Mandalay", country: "Myanmar", image: "/images/destinations/mandalay.png" },
    { toCode: "HAN", city: "Hanoi", country: "Vietnam", image: "/images/destinations/hanoi.webp" },
    { toCode: "MNL", city: "Manila", country: "Philippines", image: "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=400&q=80" },
    { toCode: "DPS", city: "Bali", country: "Indonesia", image: "/images/bali.webp" },
    { toCode: "ICN", city: "Seoul", country: "South Korea", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&q=80" },
    { toCode: "KIX", city: "Osaka", country: "Japan", image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
type TargetNiche = "myanmar" | "international";
const CARDS_TO_SHOW = 4;

const AIRLINE_NAMES: Record<string, string> = {
    FD: "AirAsia", AK: "AirAsia", D7: "AirAsia X",
    VZ: "VietJet", VJ: "VietJet",
    DD: "Nok Air", SL: "Thai Lion Air",
    TR: "Scoot", TG: "Thai Airways",
    SQ: "Singapore Airlines", MH: "Malaysia Airlines",
    UB: "MNA", "8M": "MAI",
    QR: "Qatar", EK: "Emirates",
};

function buildSearchUrl(fromCode: string, toCode: string): string {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `/flights/results?flightSearch=${fromCode}${dd}${mm}${toCode}1`;
}

function toTHB(usd: number): string {
    const thb = Math.round(usd * USD_TO_THB_RATE);
    return `฿${thb.toLocaleString()}`;
}

function formatBotDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
        return dateStr;
    }
}

function durationLabel(transfers: number): string {
    return transfers === 0 ? "direct" : `${transfers} stop${transfers > 1 ? "s" : ""}`;
}

// ── Find cheapest deal for each destination from bot data ────────────────────
function findCheapestDeals(
    routes: BotRoute[],
    origins: string[],
    destinations: DestinationMeta[],
): DealCard[] {
    const deals: DealCard[] = [];

    for (const dest of destinations) {
        // Find cheapest route matching any origin → this destination
        let cheapest: BotRoute | null = null;
        for (const route of routes) {
            if (
                origins.includes(route.origin) &&
                route.destination === dest.toCode &&
                route.price > 0
            ) {
                // Exclude routes where origin === destination
                if (route.origin === route.destination) continue;
                if (!cheapest || route.price < cheapest.price) {
                    cheapest = route;
                }
            }
        }

        if (cheapest) {
            deals.push({
                id: `${cheapest.origin}-${dest.toCode}`,
                destination: dest.city,
                country: dest.country,
                image: dest.image,
                toCode: dest.toCode,
                fromCode: cheapest.origin,
                price: cheapest.price,
                airline: cheapest.airline_code,
                date: cheapest.date,
                transfers: cheapest.transfers,
            });
        }
    }

    return deals;
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default memo(function CheapDealsCards() {
    const [activeNiche, setActiveNiche] = useState<TargetNiche>("myanmar");
    const [botRoutes, setBotRoutes] = useState<BotRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");

    // Fetch bot data on mount
    useEffect(() => {
        fetch("/data/flight_data.json")
            .then(res => res.json())
            .then(data => {
                if (data.routes && Array.isArray(data.routes)) {
                    setBotRoutes(data.routes);
                }
                if (data.meta?.updated_at) {
                    setLastUpdated(data.meta.updated_at);
                }
            })
            .catch(err => console.error("Failed to load flight deals:", err))
            .finally(() => setLoading(false));
    }, []);

    // Compute deals for active tab with country diversity + fallback
    const topDeals = useMemo(() => {
        if (botRoutes.length === 0) return [];

        const origins = activeNiche === "myanmar" ? MYANMAR_ORIGINS : ASIA_ORIGINS;
        const destinations = activeNiche === "myanmar" ? MYANMAR_DESTINATIONS : ASIA_DESTINATIONS;

        const allDeals = findCheapestDeals(botRoutes, origins, destinations);

        // Sort by price ascending
        allDeals.sort((a, b) => a.price - b.price);

        // Pass 1: Pick one deal per unique country (diversity)
        const seenCountry = new Set<string>();
        const result: DealCard[] = [];
        for (const deal of allDeals) {
            if (seenCountry.has(deal.country)) continue;
            seenCountry.add(deal.country);
            result.push(deal);
            if (result.length >= CARDS_TO_SHOW) break;
        }

        // Pass 2: If we still need more cards, fill with cheapest remaining (different cities)
        if (result.length < CARDS_TO_SHOW) {
            const usedIds = new Set(result.map(d => d.id));
            for (const deal of allDeals) {
                if (usedIds.has(deal.id)) continue;
                result.push(deal);
                usedIds.add(deal.id);
                if (result.length >= CARDS_TO_SHOW) break;
            }
        }

        return result;
    }, [activeNiche, botRoutes]);

    // Dynamic hook title
    const dynamicCeiling = useMemo(() => {
        if (topDeals.length === 0) return 100;
        const maxPrice = Math.max(...topDeals.map(d => d.price));
        return Math.ceil((maxPrice + 5) / 10) * 10;
    }, [topDeals]);

    const hookTitle = activeNiche === "myanmar"
        ? `Flights from Myanmar under $${dynamicCeiling} (${toTHB(dynamicCeiling)})`
        : `Explore Southeast Asia under $${dynamicCeiling} (${toTHB(dynamicCeiling)})`;

    if (loading) {
        return (
            <section className="w-full max-w-[1200px] mx-auto px-5 sm:px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[320px] bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    if (topDeals.length === 0) return null;

    return (
        <section
            className="w-full max-w-[1200px] mx-auto px-5 sm:px-6 py-10 bg-white rounded-none sm:rounded-2xl sm:my-8"
            style={{ fontFamily: "'Source Sans 3', -apple-system, sans-serif" }}
        >
            {/* ── Tabs ── */}
            <div className="flex justify-center sm:justify-start gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveNiche("myanmar")}
                    className={`pb-3 px-2 font-bold text-[15px] sm:text-[16px] transition-all border-b-[3px] ${activeNiche === "myanmar"
                        ? "border-[#5B0EA6] text-[#5B0EA6]"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                        }`}
                >
                    From Myanmar 🇲🇲
                </button>
                <button
                    onClick={() => setActiveNiche("international")}
                    className={`pb-3 px-2 font-bold text-[15px] sm:text-[16px] transition-all border-b-[3px] ${activeNiche === "international"
                        ? "border-[#5B0EA6] text-[#5B0EA6]"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                        }`}
                >
                    Around Asia 🌏
                </button>
            </div>

            {/* ── Dynamic Hook Title ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                <h2 className="text-[20px] sm:text-[22px] font-[800] text-[#101828] tracking-[-0.3px] leading-tight">
                    {hookTitle}
                </h2>
                <a
                    href="#flights"
                    className="group flex items-center gap-1 text-[15px] font-[600] text-[#101828] hover:text-[#5B0EA6] transition-colors"
                >
                    Search more flights
                    <span className="text-[18px] font-normal leading-none text-gray-400 group-hover:text-[#5B0EA6] transition-colors relative top-[1px]">
                        ›
                    </span>
                </a>
            </div>

            {/* ── Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topDeals.map(deal => (
                    <a
                        key={deal.id}
                        href={buildSearchUrl(deal.fromCode, deal.toCode)}
                        className="flex flex-col bg-white border border-[#e4e7ec] rounded-xl overflow-hidden
                            shadow-[0_2px_8px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.05)]
                            hover:-translate-y-[3px]
                            hover:shadow-[0_8px_24px_rgba(0,0,0,0.13),_0_2px_8px_rgba(0,0,0,0.07)]
                            transition-all duration-[220ms] group no-underline text-inherit"
                    >
                        {/* Image */}
                        <div className="w-full h-[180px] lg:h-[168px] overflow-hidden rounded-t-[10px] shrink-0">
                            <img
                                src={deal.image}
                                alt={`Flights to ${deal.destination}`}
                                loading="lazy"
                                className="w-full h-full object-cover object-center block transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
                                onError={(e) => {
                                    // Auto-fallback to local image if external breaks
                                    const img = e.currentTarget;
                                    if (!img.src.includes('/images/')) {
                                        const slug = deal.destination.toLowerCase().replace(/ \([^)]*\)/g, '').replace(/\s+/g, '-');
                                        img.src = `/images/destinations/${slug}.webp`;
                                    } else {
                                        // Ultimate fallback if local webp also missing
                                        img.src = "/images/og-default.webp";
                                    }
                                }}
                            />
                        </div>

                        {/* Card Body */}
                        <div className="p-4 pb-5 flex flex-col flex-1">
                            {/* Destination */}
                            <div className="text-[18px] font-[700] text-[#101828] mb-1.5 leading-[1.2]">
                                {deal.destination}
                            </div>

                            {/* Airline + Type */}
                            <div className="text-[14px] text-[#667085] leading-[1.5] mb-0.5">
                                {AIRLINE_NAMES[deal.airline] || deal.airline} · {durationLabel(deal.transfers)}
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-1 text-[14px] text-[#667085]">
                                {formatBotDate(deal.date)}
                                <span className="text-[12px] text-[#98a2b3] ml-1">cheapest</span>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1 min-h-[16px]" />

                            {/* Dual Price */}
                            <div className="mt-auto pt-3">
                                <span className="block text-[14px] text-[#667085] leading-[1.2] mb-[2px]">
                                    from
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[20px] font-[800] text-[#101828] leading-none tracking-[-0.3px]">
                                        ${deal.price}
                                    </span>
                                    <span className="text-[15px] font-[600] text-[#667085] leading-none">
                                        ({toTHB(deal.price)})
                                    </span>
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Last updated indicator */}
            {lastUpdated && (
                <div className="mt-4 text-center text-[12px] text-[#98a2b3]">
                    Prices updated: {lastUpdated} · Live data from 1,000+ routes
                </div>
            )}
        </section>
    );
});
