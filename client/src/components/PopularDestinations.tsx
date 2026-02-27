import { useState, memo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PopularDestinations — SEO destination cards with real flight search links
// Adapted to GoTravel purple/gold brand
// ─────────────────────────────────────────────────────────────────────────────

// Brand tokens (matches FlightWidget)
const B = {
    purple: "#5B0EA6",
    purpleDeep: "#2D0558",
    gold: "#F5C518",
    white: "#FFFFFF",
} as const;

// ── Destination Data ─────────────────────────────────────────────────────────
interface Destination {
    city: string;
    country: string;
    code: string;
    emoji: string;
    image: string;
    fromPrice: number;
    duration: string;
    popularFor: string;
    tags: string[];
    routes: { from: string; fromCode: string }[];
}

const DESTINATIONS: Destination[] = [
    {
        city: "Bangkok", country: "Thailand", code: "BKK", emoji: "🏯",
        image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80",
        fromPrice: 89, duration: "1h 30m",
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
        fromPrice: 145, duration: "2h 45m",
        popularFor: "Gardens, hawker food, shopping",
        tags: ["city"],
        routes: [
            { from: "Yangon", fromCode: "RGN" },
            { from: "Bangkok", fromCode: "BKK" },
        ],
    },
    {
        city: "Bali", country: "Indonesia", code: "DPS", emoji: "🌴",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
        fromPrice: 178, duration: "3h 10m",
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
        fromPrice: 99, duration: "1h 50m",
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
        fromPrice: 115, duration: "2h 0m",
        popularFor: "Old quarter, pho, Ha Long Bay",
        tags: ["city", "budget"],
        routes: [
            { from: "Bangkok", fromCode: "BKK" },
            { from: "Singapore", fromCode: "SIN" },
        ],
    },
    {
        city: "Tokyo", country: "Japan", code: "NRT", emoji: "🗻",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
        fromPrice: 320, duration: "6h 30m",
        popularFor: "Culture, anime, ramen, cherry blossoms",
        tags: ["city"],
        routes: [
            { from: "Bangkok", fromCode: "BKK" },
            { from: "Singapore", fromCode: "SIN" },
        ],
    },
];

// ── Popular Routes Data ──────────────────────────────────────────────────────
const POPULAR_ROUTES = [
    { from: "Yangon", to: "Bangkok", fromCode: "RGN", toCode: "BKK", price: 89 },
    { from: "Bangkok", to: "Singapore", fromCode: "BKK", toCode: "SIN", price: 65 },
    { from: "Yangon", to: "Singapore", fromCode: "RGN", toCode: "SIN", price: 142 },
    { from: "Bangkok", to: "Bali", fromCode: "BKK", toCode: "DPS", price: 115 },
    { from: "Singapore", to: "Tokyo", fromCode: "SIN", toCode: "NRT", price: 280 },
    { from: "Kuala Lumpur", to: "Hanoi", fromCode: "KUL", toCode: "HAN", price: 78 },
    { from: "Bangkok", to: "Osaka", fromCode: "BKK", toCode: "KIX", price: 195 },
    { from: "Manila", to: "Seoul", fromCode: "MNL", toCode: "ICN", price: 155 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Build a working /flights/results link from origin+dest codes */
function buildSearchUrl(fromCode: string, toCode: string): string {
    // Use a date 14 days from now for best prices
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `/flights/results?flightSearch=${fromCode}${dd}${mm}${toCode}1`;
}

// ── Filter Tabs ──────────────────────────────────────────────────────────────
type FilterId = "all" | "beach" | "city" | "budget";
const FILTERS: { id: FilterId; label: string }[] = [
    { id: "all", label: "✈️ All" },
    { id: "beach", label: "🏖️ Beach" },
    { id: "city", label: "🏙️ City" },
    { id: "budget", label: "💰 Budget" },
];

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default memo(function PopularDestinations() {
    const [activeFilter, setActiveFilter] = useState<FilterId>("all");

    const filtered = activeFilter === "all"
        ? DESTINATIONS
        : DESTINATIONS.filter(d => d.tags.includes(activeFilter));

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
                {filtered.map(dest => (
                    <a
                        key={dest.code}
                        href={buildSearchUrl(dest.routes[0].fromCode, dest.code)}
                        className="group block rounded-2xl overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        {/* Image */}
                        <div className="relative h-44 overflow-hidden">
                            <img
                                src={dest.image}
                                alt={`Flights to ${dest.city}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Price badge */}
                            <div
                                className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md"
                                style={{ background: B.gold, color: B.purpleDeep }}
                            >
                                from ${dest.fromPrice}
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
                                {dest.routes.map(route => (
                                    <span
                                        key={route.fromCode}
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            window.location.href = buildSearchUrl(route.fromCode, dest.code);
                                        }}
                                        className="text-sm font-medium cursor-pointer transition-colors hover:underline"
                                        style={{ color: B.purple }}
                                    >
                                        ✈️ {route.from} → {dest.city}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* ── Popular Routes Grid (SEO internal links) ── */}
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#f8f5ff", border: "1px solid #ede5ff" }}>
                <h3 className="text-lg font-extrabold text-gray-900 mb-5">
                    🔗 Popular Flight Routes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {POPULAR_ROUTES.map((route, i) => (
                        <a
                            key={i}
                            href={buildSearchUrl(route.fromCode, route.toCode)}
                            className="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-gray-100 transition-all hover:border-purple-300 hover:shadow-md group"
                        >
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                {route.from} → {route.to}
                            </span>
                            <span className="text-sm font-bold text-emerald-600">
                                ${route.price}
                            </span>
                        </a>
                    ))}
                </div>

                {/* SEO destination pills */}
                <div className="pt-5 border-t border-purple-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Popular Destinations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {["Bangkok", "Singapore", "Kuala Lumpur", "Bali", "Tokyo", "Seoul", "Hanoi", "Ho Chi Minh City", "Manila", "Osaka", "Hong Kong", "Taipei"].map(city => (
                            <a
                                key={city}
                                href={`/flights/results?flightSearch=RGN${city.slice(0, 3).toUpperCase()}1`}
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
