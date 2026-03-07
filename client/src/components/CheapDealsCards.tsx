import { useState, useMemo, memo } from "react";
import { USD_TO_THB_RATE } from "@/const";
import OptimizedImage from "@/seo/OptimizedImage";
import { useMultiCheapDeals, type Deal } from "@/hooks/useFlightData";

// ─────────────────────────────────────────────────────────────────────────────
// CheapDealsCards — Live pricing from flight_data.json bot & TravelPayouts API
// ─────────────────────────────────────────────────────────────────────────────

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
    { toCode: "ICN", city: "Seoul", country: "South Korea", image: "/images/destinations/seoul.webp" },
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
    { toCode: "MNL", city: "Manila", country: "Philippines", image: "/images/destinations/manila.webp" },
    { toCode: "DPS", city: "Bali", country: "Indonesia", image: "/images/bali.webp" },
    { toCode: "ICN", city: "Seoul", country: "South Korea", image: "/images/destinations/seoul.webp" },
    { toCode: "KIX", city: "Osaka", country: "Japan", image: "/images/destinations/osaka.webp" },
];

// ── Deal Card Logic ──────────────────────────────────────────────────────────

export type EnhancedDealCard = {
    id: string;
    destination: string;
    destinationCode: string;
    country: string;
    originCode: string;
    imageUrl: string;
    duration: string;
    isDirect: boolean;
    departDate: string;
    returnDate: string;
    price: number;
    currency: string;
    airline: string;
    transfers: number;
    fetchedAt: number;
    clickCount: number;
    impressions: number;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const DEALS_TO_SHOW = 4;

const AIRLINE_NAMES: Record<string, string> = {
    FD: "AirAsia", AK: "AirAsia", D7: "AirAsia X",
    VZ: "VietJet", VJ: "VietJet",
    DD: "Nok Air", SL: "Thai Lion Air",
    TR: "Scoot", TG: "Thai Airways",
    SQ: "Singapore Airlines", MH: "Malaysia Airlines",
    UB: "MNA", "8M": "MAI",
    QR: "Qatar", EK: "Emirates",
};

function parseDateUTC(str: string): Date {
    const parts = str.split("-").map(Number);
    if (parts.length < 3) return new Date();
    const [y, m, day] = parts;
    return new Date(Date.UTC(y, m - 1, day));
}

function isFresh(deal: EnhancedDealCard): boolean {
    return Date.now() - deal.fetchedAt < CACHE_TTL_MS;
}

function scoreDeal(
    deal: EnhancedDealCard,
    budgetMax: number,
    originCode?: string
): number {
    const now = Date.now();
    const priceScore = Math.min(budgetMax / deal.price, 1.0);

    const popularityScore =
        deal.impressions > 0
            ? Math.min(deal.clickCount / deal.impressions, 1.0)
            : 0.5; // Default popularity if no data

    const hoursOld = Math.max(0, (now - deal.fetchedAt) / (1000 * 60 * 60));
    const recencyScore = 1 / (hoursOld + 1);

    const personalizationScore =
        originCode && deal.originCode === originCode ? 1.0 : 0.0;

    // Normalized weights to sum to 1.0
    const raw =
        priceScore * 0.40 +
        popularityScore * 0.25 +
        recencyScore * 0.20 +
        personalizationScore * 0.15;

    // Direct flight bonus
    const directBonus = deal.isDirect ? 0.05 : 0;

    return Math.min(raw + directBonus, 1.0);
}

function getPriceLabel(deal: EnhancedDealCard): {
    label: string;
    isStale: boolean;
} {
    const hoursOld = Math.floor(
        Math.max(0, (Date.now() - deal.fetchedAt) / (1000 * 60 * 60))
    );

    if (hoursOld < 1) return { label: "Just updated", isStale: false };
    if (hoursOld < 6) return { label: `${hoursOld}h ago`, isStale: false };
    if (hoursOld < 24) return { label: "Updated recently", isStale: false };
    return { label: "Price may have changed", isStale: true };
}

function formatDateRange(depart: string, ret?: string): string {
    if (!depart) return "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fmt = (dt: Date) =>
        `${days[dt.getUTCDay()]} ${dt.getUTCDate()}/${dt.getUTCMonth() + 1}`;

    const d1 = fmt(parseDateUTC(depart));
    if (ret) return `${d1} → ${fmt(parseDateUTC(ret))}`;
    return d1;
}

function buildSearchUrl(fromCode: string, toCode: string): string {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `/flights/results?flightSearch=${fromCode}${dd}${mm}${toCode}1`;
}

function formatPrice(price: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    }).format(price);
}

// Map api responses to our enhanced deal card structure
function mapToEnhancedDeals(
    routes: Deal[],
    origins: string[],
    destinations: DestinationMeta[],
): EnhancedDealCard[] {
    const deals: EnhancedDealCard[] = [];
    const now = Date.now();

    for (const dest of destinations) {
        let cheapest: Deal | null = null;
        for (const route of routes) {
            if (
                origins.includes(route.origin) &&
                route.destination === dest.toCode &&
                route.price > 0 &&
                route.origin !== route.destination
            ) {
                if (!cheapest || route.price < cheapest.price) {
                    cheapest = route;
                }
            }
        }

        if (cheapest) {
            const fetchTime = cheapest.found_at ? new Date(cheapest.found_at).getTime() : now - (Math.random() * 2 * 3600 * 1000);
            deals.push({
                id: `${cheapest.origin}-${dest.toCode}`,
                destination: dest.city,
                destinationCode: dest.toCode,
                country: dest.country,
                originCode: cheapest.origin,
                imageUrl: dest.image,
                duration: cheapest.transfers === 0 ? "Direct" : `${cheapest.transfers} stop${(cheapest.transfers || 0) > 1 ? "s" : ""}`,
                isDirect: cheapest.transfers === 0,
                departDate: cheapest.date,
                returnDate: "",
                price: cheapest.price,
                currency: cheapest.currency || "USD",
                airline: AIRLINE_NAMES[cheapest.airline] || cheapest.airline,
                transfers: cheapest.transfers || 0,
                fetchedAt: fetchTime,
                clickCount: 0,
                impressions: 0,
            });
        }
    }
    return deals;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
type TargetNiche = "myanmar" | "international";

export default memo(function CheapDealsCards() {
    const [activeNiche, setActiveNiche] = useState<TargetNiche>("myanmar");

    const activeOrigins = activeNiche === "myanmar" ? MYANMAR_ORIGINS : ASIA_ORIGINS;
    const { deals: activeDeals, loading } = useMultiCheapDeals(activeOrigins);

    const topDeals = useMemo(() => {
        if (activeDeals.length === 0) return [];

        const destinations = activeNiche === "myanmar" ? MYANMAR_DESTINATIONS : ASIA_DESTINATIONS;
        const allDeals = mapToEnhancedDeals(activeDeals, activeOrigins, destinations);

        if (allDeals.length === 0) return [];

        const cheapest = Math.min(...allDeals.map(d => d.price));
        const budget = Math.max(Math.floor((cheapest * 1.5) / 50) * 50, 50);

        const scored = allDeals
            .map(deal => ({ deal, score: scoreDeal(deal, budget) }))
            .sort((a, b) => b.score - a.score);

        const result: EnhancedDealCard[] = [];
        const seenCity = new Set<string>();

        // Pick top N with destination diversity (no duplicate cities)
        for (const { deal } of scored) {
            if (result.length >= DEALS_TO_SHOW) break;
            if (!seenCity.has(deal.destination)) {
                result.push(deal);
                seenCity.add(deal.destination);
            }
        }

        // Final sort by price ascending for display consistency
        result.sort((a, b) => a.price - b.price);

        return result;
    }, [activeNiche, activeDeals, activeOrigins]);

    // Dynamic hook title
    const dynamicCeiling = useMemo(() => {
        if (topDeals.length === 0) return 100;
        const maxPrice = Math.max(...topDeals.map(d => d.price));
        return Math.ceil(maxPrice / 50) * 50;
    }, [topDeals]);

    const thbCeiling = Math.ceil((dynamicCeiling * USD_TO_THB_RATE) / 500) * 500;

    const hookTitle = activeNiche === "myanmar"
        ? `Flights from Myanmar under ${formatPrice(dynamicCeiling, "USD")} (${formatPrice(thbCeiling, "THB")})`
        : `Explore Southeast Asia under ${formatPrice(dynamicCeiling, "USD")} (${formatPrice(thbCeiling, "THB")})`;

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
                    Explore more
                    <span className="text-[18px] font-normal leading-none text-gray-400 group-hover:text-[#5B0EA6] transition-colors relative top-[1px]" aria-hidden="true">
                        ›
                    </span>
                </a>
            </div>

            {/* ── Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topDeals.map(deal => {
                    const { label, isStale } = getPriceLabel(deal);

                    return (
                        <a
                            key={deal.id}
                            href={buildSearchUrl(deal.originCode, deal.destinationCode)}
                            className="flex flex-col bg-white border border-[#e4e7ec] rounded-xl overflow-hidden
                                shadow-[0_2px_8px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.05)]
                                hover:-translate-y-[3px]
                                hover:shadow-[0_8px_24px_rgba(0,0,0,0.13),_0_2px_8px_rgba(0,0,0,0.07)]
                                transition-all duration-[220ms] group no-underline text-inherit"
                        >
                            {/* Image */}
                            <div className="relative w-full h-[180px] lg:h-[168px] overflow-hidden rounded-t-[10px] shrink-0 bg-gray-100">
                                <OptimizedImage
                                    src={deal.imageUrl}
                                    alt={`Flights to ${deal.destination}`}
                                    width={400}
                                    height={180}
                                    imgClassName="object-center transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
                                />
                                {deal.isDirect && (
                                    <span className="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-700 shadow-sm z-10" aria-label="Direct Flight">
                                        Direct
                                    </span>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex flex-col flex-1">
                                {/* Destination */}
                                <div className="text-[18px] font-[700] text-[#101828] mb-1.5 leading-[1.2]">
                                    {deal.destination}
                                </div>

                                {/* Airline & Duration */}
                                <div className="text-[14px] text-[#667085] leading-[1.5] mb-0.5">
                                    {deal.airline} · {deal.duration}
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-1 text-[14px] text-[#667085] mb-3">
                                    {formatDateRange(deal.departDate, deal.returnDate)}
                                </div>

                                {/* Spacer */}
                                <div className="flex-1 min-h-[4px]" />

                                {/* Dual Price & Freshness */}
                                <div className="mt-auto">
                                    <span className="block text-[14px] text-[#667085] leading-[1.2] mb-[2px]">
                                        from
                                    </span>
                                    <div className="flex items-baseline gap-2 mb-[3px]">
                                        <span className="text-[20px] font-[800] text-[#101828] leading-none tracking-[-0.3px]">
                                            {formatPrice(deal.price, "USD")}
                                        </span>
                                        <span className="text-[15px] font-[600] text-[#667085] leading-none">
                                            ({formatPrice(deal.price * USD_TO_THB_RATE, "THB")})
                                        </span>
                                    </div>
                                    <p className={`text-[12px] font-medium transition-colors ${isStale ? "text-amber-500" : "text-emerald-600"}`}>
                                        {label}
                                    </p>
                                </div>
                            </div>
                        </a>
                    );
                })}

                {/* Skeleton fillers — keeps grid 4 columns always */}
                {topDeals.length < DEALS_TO_SHOW &&
                    Array.from({ length: DEALS_TO_SHOW - topDeals.length }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className="flex flex-col rounded-xl overflow-hidden bg-gray-50 border border-gray-200/80"
                        >
                            <div className="h-[180px] lg:h-[168px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse" />
                                <div className="h-3 bg-gray-100 rounded-md w-1/2 animate-pulse" />
                                <div className="h-3 bg-gray-100 rounded-md w-2/3 animate-pulse" />
                                <div className="h-5 bg-gray-200 rounded-md w-1/3 mt-4 animate-pulse" />
                            </div>
                        </div>
                    ))
                }
            </div>

        </section >
    );
});
