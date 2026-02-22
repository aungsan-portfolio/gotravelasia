import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Bus,
    Train,
    Plane,
    Ship,
    Clock,
    ArrowRight,
    Star,
    ExternalLink,
    Search,
    Loader2,
} from "lucide-react";
import { FeaturedTrainCard } from "./FeaturedTrainCard";

// ──────────────────────────────────────────────
// Types (matches transport.json structure)
// ──────────────────────────────────────────────

interface TransportOption {
    type: string;
    provider: string;
    price: number;
    currency: string;
    duration: string;
    departure: string;
    arrival: string;
    rating?: number;
    bookingUrl: string;
}

interface RouteSchedule {
    from: string;
    to: string;
    options: TransportOption[];
}

interface TransportData {
    lastUpdated: string;
    routes: RouteSchedule[];
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("train")) return <Train className="w-5 h-5" />;
    if (t.includes("flight")) return <Plane className="w-5 h-5" />;
    if (t.includes("ferry")) return <Ship className="w-5 h-5" />;
    return <Bus className="w-5 h-5" />;
};

const getTypeBadgeColor = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("train")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (t.includes("flight")) return "bg-sky-100 text-sky-700 border-sky-200";
    if (t.includes("ferry")) return "bg-cyan-100 text-cyan-700 border-cyan-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
};

const formatLastUpdated = (isoDate: string): string => {
    try {
        const d = new Date(isoDate);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return "Just updated";
        if (diffHours < 24) return `Updated ${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `Updated ${diffDays}d ago`;
    } catch {
        return "";
    }
};

// ──────────────────────────────────────────────
// Vite basePath-safe asset URL
// ──────────────────────────────────────────────
const assetUrl = (path: string) => {
    const base = (import.meta as any)?.env?.BASE_URL ?? "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${normalizedBase}${normalizedPath}`;
};

// ──────────────────────────────────────────────
// Fallback data – renders instantly before fetch
// ──────────────────────────────────────────────
const FALLBACK_DATA: TransportData = {
    lastUpdated: new Date().toISOString(),
    routes: [
        {
            from: "Bangkok",
            to: "Chiang Mai",
            options: [
                {
                    type: "Train",
                    provider: "State Railway of Thailand",
                    price: 950,
                    currency: "THB",
                    duration: "13h",
                    departure: "18:10",
                    arrival: "07:15 (+1)",
                    bookingUrl: "https://12go.asia/en/travel/bangkok/chiang-mai?referer=14566451&z=14566451&sub_id=fallback_train",
                },
                {
                    type: "Flight",
                    provider: "Thai AirAsia",
                    price: 1890,
                    currency: "THB",
                    duration: "1h 10m",
                    departure: "08:00",
                    arrival: "09:10",
                    bookingUrl: "https://12go.asia/en/travel/bangkok/chiang-mai?referer=14566451&z=14566451&sub_id=fallback_flight",
                },
            ],
        },
    ],
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function TransportScheduleWidget() {
    const [data, setData] = useState<TransportData>(FALLBACK_DATA);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [from, setFrom] = useState("Bangkok");
    const [to, setTo] = useState("Chiang Mai");
    const [query, setQuery] = useState({ from: "Bangkok", to: "Chiang Mai" });

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        async function load() {
            try {
                const res = await fetch(assetUrl("data/transport.json"), {
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (!res.ok) throw new Error(`transport.json ${res.status}`);

                const ct = res.headers.get("content-type") || "";
                if (!ct.includes("application/json")) throw new Error("transport.json not JSON");

                const json = await res.json();
                if (!cancelled) {
                    setData(json);
                }
            } catch (e: any) {
                if (!cancelled && e?.name !== "AbortError") {
                    setLoadError(e?.message || "Failed to load transport schedules");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    // Extract available cities from loaded data
    const cities = useMemo(() => {
        const citySet = new Set<string>();
        data.routes.forEach((r) => {
            citySet.add(r.from);
            citySet.add(r.to);
        });
        return Array.from(citySet).sort();
    }, [data]);

    // Filter "To" cities (exclude selected "From")
    const filteredToCities = useMemo(
        () => cities.filter((c) => c !== from),
        [cities, from]
    );

    // Get matching schedule options (sorted cheapest first)
    const options = useMemo(() => {
        const route = data.routes.find(
            (r) => r.from === query.from && r.to === query.to
        );
        if (!route) return [];
        return [...route.options].sort((a, b) => a.price - b.price);
    }, [data, query]);

    // Auto-fix: if "to" equals "from", pick the first different city
    const handleFromChange = (value: string) => {
        setFrom(value);
        if (value === to) {
            const alt = filteredToCities.find((c) => c !== value) || cities[0];
            if (alt) setTo(alt);
        }
    };

    const handleSearch = () => {
        setQuery({ from, to });
    };

    return (
        <div className="w-full space-y-6">
            {/* ── Search Form ── */}
            <Card className="p-6 bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        Search Transport
                    </h3>
                    {data.lastUpdated && (
                        <span className="text-xs text-muted-foreground font-mono">
                            {formatLastUpdated(data.lastUpdated)}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* From */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">From</label>
                        <select
                            value={from}
                            onChange={(e) => handleFromChange(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* To */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">To</label>
                        <select
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {filteredToCities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search button */}
                    <div className="flex items-end">
                        <Button
                            onClick={handleSearch}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
            </Card>

            {/* ── Results ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                        {query.from}
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        {query.to}
                    </h4>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        {loadError && (
                            <span className="inline-flex items-center rounded-md border border-amber-300 px-2 py-0.5 text-xs text-amber-700">
                                Offline data (live schedules unavailable)
                            </span>
                        )}
                        {options.length > 0 && (
                            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                {options.length} option{options.length !== 1 ? "s" : ""} — cheapest first
                            </span>
                        )}
                    </div>
                </div>

                {/* ✨ FEATURED JOURNEY CARD (BKK-CNX Only) ✨ */}
                <FeaturedTrainCard from={query.from} to={query.to} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {options.length === 0 ? (
                        loading ? (
                            // Skeleton cards only while fetch is in progress
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="p-5 animate-pulse border border-border">
                                    <div className="h-4 bg-muted rounded w-24 mb-4" />
                                    <div className="h-6 bg-muted rounded w-3/4 mb-6" />
                                    <div className="space-y-3">
                                        <div className="h-4 bg-muted rounded w-full" />
                                        <div className="h-4 bg-muted rounded w-2/3" />
                                    </div>
                                    <div className="h-10 bg-muted rounded mt-6" />
                                </Card>
                            ))
                        ) : (
                            // Fetch done but no data for this route
                            <Card className="p-6 border border-dashed col-span-full">
                                <p className="font-semibold">No schedules found for this route.</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Try a different From/To, or we may not have data yet.
                                </p>
                                {loadError && (
                                    <p className="text-sm text-amber-700 mt-2">
                                        Live data failed to load — showing fallback routes only.
                                    </p>
                                )}
                            </Card>
                        )
                    ) : (
                        options.map((option, idx) => (
                            <Card
                                key={idx}
                                className={`p-5 border hover:shadow-lg transition-all duration-200 flex flex-col ${idx === 0 ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
                                    }`}
                            >
                                {/* Cheapest badge */}
                                {idx === 0 && (
                                    <div className="mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary text-primary-foreground rounded-sm">
                                            Best Price
                                        </span>
                                    </div>
                                )}

                                {/* Header: type + badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(option.type)}
                                        <span className="font-bold">{option.type}</span>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full border ${getTypeBadgeColor(option.type)}`}
                                    >
                                        {option.type}
                                    </span>
                                </div>

                                {/* Provider */}
                                <p className="text-sm text-muted-foreground mb-4">
                                    {option.provider}
                                </p>

                                {/* Details */}
                                <div className="space-y-2 mb-4 flex-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>{option.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        <span>
                                            {option.departure} → {option.arrival}
                                        </span>
                                    </div>
                                    {option.rating && (
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{option.rating}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <p className="text-xs text-muted-foreground mb-1">Starting from</p>
                                <p className="text-2xl font-bold text-primary mb-4">
                                    ฿{option.price.toLocaleString()}
                                </p>

                                {/* Book CTA */}
                                <a
                                    href={option.bookingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-auto"
                                >
                                    <Button
                                        size="sm"
                                        className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors font-mono uppercase text-xs"
                                    >
                                        Book Now <ExternalLink className="w-3 h-3 ml-1" />
                                    </Button>
                                </a>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* ── Affiliate Disclosure ── */}
            <div className="p-4 bg-muted/30 border border-border rounded-lg text-xs text-muted-foreground">
                <p>
                    🔗 <strong>Affiliate Link:</strong> We earn a small commission when
                    you book through our links. This helps us provide free travel guides.
                    Your price remains the same.
                </p>
            </div>
        </div>
    );
}
