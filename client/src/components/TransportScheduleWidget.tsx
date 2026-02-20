import { useState, useMemo, useEffect, useTransition } from "react";
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
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [from, setFrom] = useState("Bangkok");
    const [to, setTo] = useState("Chiang Mai");
    const [query, setQuery] = useState({ from: "Bangkok", to: "Chiang Mai" });

    // Background fetch – UI always shows fallback, upgrades to live data when ready
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        async function load() {
            setLoading(true);
            setLoadError(null);

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
                    startTransition(() => setData(json));
                }
            } catch (e: any) {
                if (!cancelled) {
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
    }, [startTransition]);

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
            {/* ── 12Go Official Search Iframe ── */}
            <Card className="p-4 md:p-6 bg-card border border-border overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        Search Transport
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded hidden sm:inline-block">
                        Powered by 12Go
                    </span>
                </div>

                <div className="w-full relative" style={{ minHeight: "350px" }}>
                    {/* The 12Go Iframe */}
                    <div style={{ width: "100%", margin: "0 auto" }}>
                        <iframe
                            src="https://12go.asia/en/iframe?partner=14566451&language=en"
                            width="100%"
                            height="350"
                            frameBorder="0"
                            scrolling="no"
                            title="12Go Transport Search"
                            className="bg-transparent"
                        ></iframe>
                    </div>
                </div>
            </Card>

            {/* ✨ FEATURED JOURNEY CARD (BKK-CNX Only) ✨ */}
            <FeaturedTrainCard from="Bangkok" to="Chiang Mai" />

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
