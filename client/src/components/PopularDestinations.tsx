import { useState, memo, useMemo } from "react";
import OptimizedImage from "@/seo/OptimizedImage";
import { useLivePriceMap } from "@/hooks/useFlightData";
import { buildFlightSearchUrl, buildPopularRouteUrl } from "@/lib/flightUrl";
import { useGeoOrigin } from "@/hooks/useGeoOrigin";

// ── Brand tokens ──────────────────────────────────────────────────
const B = {
    purple: "#5B0EA6",
    purpleDeep: "#2D0558",
    gold: "#F5C518",
    white: "#FFFFFF",
} as const;

// ── Destination Data ──────────────────────────────────────────────
interface Destination {
    city: string;
    country: string;
    code: string;
    emoji: string;
    image: string;
    fallbackPrice: number;
    duration: string;
    popularFor: string;
    tags: string[];
    routes: { from: string; fromCode: string }[];
}

const DESTINATIONS: Destination[] = [
    {
        city: "Bangkok", country: "Thailand", code: "BKK", emoji: "🏰",
        image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80",
        fallbackPrice: 50, duration: "1h 30m",
        popularFor: "Street food, temples, nightlife",
        tags: ["city", "budget"],
        routes: [
            { from: "Yangon", fromCode: "RGN" },
            { from: "Mandalay", fromCode: "MDL" },
        ],
    },
    {
        city: "Singapore", country: "Singapore", code: "SIN", emoji: "🦁",
        image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80",
        fallbackPrice: 100, duration: "2h 45m",
        popularFor: "Garders, hawker food, shopping",
        tags: ["city"],
        routes: [
            { from: "Yangon", fromCode: "RGN" },
            { from: "Bangkok", fromCode: "BKK" },
        ],
    },
    {
        city: "Bali", country: "Indonesia", code: "DPS", emoji: "🌴",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
        fallbackPrice: 150, duration: "3h 10m",
        popularFor: "Beaches, rice terraces, surf",
        tags: ["beach"],
        routes: [
            { from: "Bangkok", fromCode: "BKK" },
            { from: "Singapore", fromCode: "SIN" },
        ],
    },
    {
        city: "Kuala Lumpur", country: "Malaysia", code: "KUL", emoji: "🗼",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80",
        fallbackPrice: 85, duration: "1h 50m",
        popularFor: "KLCC towers, street food, culture",
        tags: ["city", "budget"],
        routes: [
            { from: "Bangkok", fromCode: "BKK" },
            { from: "Singapore", fromCode: "SIN" },
        ],
    },
    {
        city: "Hanoi", country: "Vietnam", code: "HAN", emoji: "🏮",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80",
        fallbackPrice: 95, duration: "2h 0m",
        popularFor: "Old quarter, pho, Ha Long Bay",
        tags: ["city", "budget"],
        routes: [
            { from: "Bangkok", fromCode: "BKK" },
            { from: "Singapore", fromCode: "SIN" },
        ],
    },
    {
        city: "Tokyo", country: "Japan", code: "NRT", emoji: "🎌",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
        fallbackPrice: 250, duration: "6h 30m",
        popularFor: "Culture, anime, ramen, cherry blossoms",
        tags: ["city"],
        routes: [
            { from: "Bangkok", fromCode: "BKK" },
            { from: "Singapore", fromCode: "SIN" },
        ],
    },
];

const POPULAR_ROUTES = [
    { from: "Yangon", to: "Bangkok", fromCode: "RGN", toCode: "BKK", fallbackPrice: 50 },
    { from: "Bangkok", to: "Singapore", fromCode: "BKK", toCode: "SIN", fallbackPrice: 65 },
    { from: "Yangon", to: "Singapore", fromCode: "RGN", toCode: "SIN", fallbackPrice: 100 },
    { from: "Bangkok", to: "Bali", fromCode: "BKK", toCode: "DPS", fallbackPrice: 115 },
    { from: "Singapore", to: "Tokyo", fromCode: "SIN", toCode: "NRT", fallbackPrice: 280 },
    { from: "Kuala Lumpur", to: "Hanoi", fromCode: "KUL", toCode: "HAN", fallbackPrice: 78 },
    { from: "Bangkok", to: "Osaka", fromCode: "BKK", toCode: "KIX", fallbackPrice: 195 },
    { from: "Manila", to: "Seoul", fromCode: "MNL", toCode: "ICN", fallbackPrice: 155 },
];

// ── Filter Tabs ───────────────────────────────────────────────────
type FilterId = "all" | "beach" | "city" | "budget";
const FILTERS: { id: FilterId; label: string }[] = [
    { id: "all", label: "✈️ All" },
    { id: "beach", label: "🏖️ Beach" },
    { id: "city", label: "🏙️ City" },
    { id: "budget", label: "💰 Budget" },
];

export default memo(function PopularDestinations() {
    const origin = useGeoOrigin();
    const [activeFilter, setActiveFilter] = useState<FilterId>("all");

    // Gather all requested routes for live batching
    const routesToFetch = useMemo(() => {
        const arr: { origin: string; destination: string }[] = [];
        for (const dest of DESTINATIONS) {
            for (const r of dest.routes) {
                arr.push({ origin: r.fromCode, destination: dest.code });
            }
        }
        for (const pr of POPULAR_ROUTES) {
            arr.push({ origin: pr.fromCode, destination: pr.toCode });
        }
        return arr;
    }, []);

    const livePricesMap = useLivePriceMap(routesToFetch);

    // Provide legacy lowest-route lookups
    const destinationPrices = useMemo(() => {
        const prices: Record<string, number> = {};
        for (const dest of DESTINATIONS) {
            let lowest = Infinity;
            for (const r of dest.routes) {
                const live = livePricesMap[`${r.fromCode}-${dest.code}`];
                if (live && live < lowest) lowest = live;
            }
            if (lowest !== Infinity) prices[dest.code] = lowest;
        }
        return prices;
    }, [livePricesMap]);

    const routePrices = livePricesMap;

    const sortedDestinations = useMemo(() => {
        // Sort destinations by country match first
        const sorted = [...DESTINATIONS].sort((a, b) => {
            if (a.country === origin.country && b.country !== origin.country) return -1;
            if (b.country === origin.country && a.country !== origin.country) return 1;
            return 0;
        });
        return sorted;
    }, [origin.country]);

    const filtered = activeFilter === "all"
        ? sortedDestinations
        : sortedDestinations.filter(d => d.tags.includes(activeFilter));

    return (
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">

            {/* ── Header + Filter Tabs ── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                        Popular Destinations
                    </h2>
                    <p className="text-gray-500 text-sm mt-1.5">
                        Explore top routes across Southeast Asia and beyond
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {FILTERS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === f.id
                                ? "text-white shadow-lg"
                                : "text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200"
                                }`}
                            style={activeFilter === f.id
                                ? { background: B.purple }
                                : {}
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Destination Cards Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
                {filtered.map(dest => {
                    const lowestPrice = destinationPrices[dest.code] || dest.fallbackPrice;

                    return (
                        <a
                            key={dest.code}
                            href={buildPopularRouteUrl(dest.routes[0].fromCode, dest.code)}
                            className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                        >
                            {/* Image */}
                            <div className="relative h-44 overflow-hidden">
                                <OptimizedImage
                                    src={dest.image}
                                    alt={`Flights to ${dest.city}`}
                                    width={400}
                                    height={176}
                                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Price badge */}
                                <div
                                    className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md"
                                    style={{ background: B.gold, color: B.purpleDeep }}
                                >
                                    from ${Math.floor(lowestPrice)}
                                </div>

                                {/* City name */}
                                <div className="absolute bottom-3 left-4 text-white">
                                    <div className="font-extrabold text-lg leading-tight">
                                        {dest.emoji} {dest.city}
                                    </div>
                                    <div className="text-xs text-white/80">{dest.country}</div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <div className="text-xs text-gray-400 mb-3">
                                    ⏱️ {dest.duration} · {dest.popularFor}
                                </div>

                                {/* Route links */}
                                <div className="flex flex-col gap-1.5">
                                    {dest.routes.map(route => {
                                        const routePrice = routePrices[`${route.fromCode}-${dest.code}`];
                                        return (
                                            <span
                                                key={route.fromCode}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    window.location.href = buildPopularRouteUrl(route.fromCode, dest.code);
                                                }}
                                                className="flex items-center justify-between text-sm font-medium cursor-pointer transition-colors hover:underline"
                                                style={{ color: B.purple }}
                                            >
                                                <span>✈️ {route.from} → {dest.city}</span>
                                                {routePrice && (
                                                    <span className="text-xs font-bold text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                                                        ${Math.floor(routePrice)}
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </a>
                    )
                })}
            </div>

            {/* ── Popular Routes Grid (SEO internal links) ── */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#f8f5ff", border: "1px solid #ede5ff" }}>
                <h3 className="text-lg font-extrabold text-gray-900 mb-5">
                    🔗 Popular Flight Routes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {POPULAR_ROUTES.map((route, i) => {
                        const routePrice = routePrices[`${route.fromCode}-${route.toCode}`] || route.fallbackPrice;

                        return (
                            <a
                                key={i}
                                href={buildPopularRouteUrl(route.fromCode, route.toCode)}
                                className="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-gray-100 transition-all hover:border-purple-300 hover:shadow-md group"
                            >
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                    {route.from} → {route.to}
                                </span>
                                <span className="text-sm font-bold text-emerald-600">
                                    ${Math.floor(routePrice)}
                                </span>
                            </a>
                        )
                    })}
                </div>

                {/* SEO destination pills */}
                <div className="pt-5 border-t border-purple-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Popular Destinations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { city: "Bangkok", code: "BKK" },
                            { city: "Singapore", code: "SIN" },
                            { city: "Kuala Lumpur", code: "KUL" },
                            { city: "Bali", code: "DPS" },
                            { city: "Tokyo", code: "NRT" },
                            { city: "Seoul", code: "ICN" },
                            { city: "Hanoi", code: "HAN" },
                            { city: "Ho Chi Minh City", code: "SGN" },
                            { city: "Manila", code: "MNL" },
                            { city: "Osaka", code: "KIX" },
                            { city: "Hong Kong", code: "HKG" },
                            { city: "Taipei", code: "TPE" },
                        ].map(({ city, code }) => (
                            <a
                                key={city}
                                href={buildPopularRouteUrl(origin.code || "RGN", code)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 transition-all hover:text-white hover:border-transparent"
                                style={{ ["--hover-bg" as string]: B.purple }}
                                onMouseEnter={e => { e.currentTarget.style.background = B.purple; e.currentTarget.style.color = B.white; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#4b5563"; }}
                            >
                                ✈️ Flights to {city}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
});
