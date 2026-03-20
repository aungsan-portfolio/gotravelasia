import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { build12GoUrl, SEA_STATIONS, getStationsByCity } from "@/lib/transport";
import { trackAffiliateClick } from "@/lib/tracking";
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
import { FeaturedTrainCard } from "../FeaturedTrainCard";

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
                    bookingUrl: build12GoUrl("bangkok/chiang-mai", "fallback_train"),
                },
                {
                    type: "Flight",
                    provider: "Thai AirAsia",
                    price: 1890,
                    currency: "THB",
                    duration: "1h 10m",
                    departure: "08:00",
                    arrival: "09:10",
                    bookingUrl: build12GoUrl("bangkok/chiang-mai", "fallback_flight"),
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
    const [from, setFrom] = useState(SEA_STATIONS[0].id);
    const [to, setTo] = useState(SEA_STATIONS[1].id);
    const [query, setQuery] = useState({ from: SEA_STATIONS[0].id, to: SEA_STATIONS[1].id });
    const [bookingUrl, setBookingUrl] = useState<string | null>(null);
    const [travelDate, setTravelDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split("T")[0];
    });

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

    // Filter "To" stations (exclude selected "From")
    const filteredToStations = useMemo(
        () => SEA_STATIONS.filter((s) => s.id !== from),
        [from]
    );

    // Get matching schedule options (sorted cheapest first)
    const currentRoute = useMemo(() => {
        // Find if we have local schedule data for these IDs
        // Note: transport.json might use names or different IDs. 
        // For MVP, we match by the station ID or name.
        const fromStation = SEA_STATIONS.find(s => s.id === query.from);
        const toStation = SEA_STATIONS.find(s => s.id === query.to);
        
        return data.routes.find(
            (r) => (r.from === fromStation?.name || r.from === query.from) && 
                   (r.to === toStation?.name || r.to === query.to)
        );
    }, [data, query]);

    const options = useMemo(() => {
        if (!currentRoute) return [];
        return [...currentRoute.options].sort((a, b) => a.price - b.price);
    }, [currentRoute]);

    const handleSearch = () => {
        setQuery({ from, to });
        // Track the search (can be added later)
    };

    const handleExternalSearch = () => {
        trackAffiliateClick('12go', { from, to, date: travelDate, context: 'search_widget' });
        setBookingUrl(build12GoUrl(from, to, travelDate));
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
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {SEA_STATIONS.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.cityCode})</option>
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
                            {filteredToStations.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.cityCode})</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Departure Date</label>
                        <input
                            type="date"
                            value={travelDate}
                            onChange={(e) => setTravelDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
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
                        {SEA_STATIONS.find(s => s.id === query.from)?.name || query.from}
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        {SEA_STATIONS.find(s => s.id === query.to)?.name || query.to}
                    </h4>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                        {loadError && (
                            <span className="inline-flex items-center rounded-md border border-amber-300 px-2 py-0.5 text-xs text-amber-700">
                                Offline data (live schedules unavailable)
                            </span>
                        )}
                        {options.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                                    ⚠️ Sample data — verify prices on 12Go.asia
                                </span>
                                <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                                    {options.length} option{options.length !== 1 ? "s" : ""} — cheapest first
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✨ FEATURED JOURNEY CARD (BKK-CNX Only) ✨ */}
                <FeaturedTrainCard from={query.from} to={query.to} date={travelDate} />

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
                        <Card className="p-8 border border-dashed col-span-full text-center bg-muted/20">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                                    <Bus className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-xl">Find live schedules on 12Go</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        We don't have current offline data for this specific route, but 12Go Asia has the largest network of trains, buses, and ferries in SEA.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleExternalSearch}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg"
                                >
                                    Search Live on 12Go.asia
                                    <ExternalLink className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
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
                                <Button
                                    size="sm"
                                    onClick={() => setBookingUrl(option.bookingUrl)}
                                    className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors font-mono uppercase text-xs mt-auto"
                                >
                                    Book Now <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* ── Affiliate Disclosure ── */}
            <div className="p-4 bg-muted/30 border border-border rounded-lg text-xs text-muted-foreground space-y-1">
                <p>
                    🔗 <strong>Affiliate Link:</strong> We earn a small commission when
                    you book through our links. This helps us provide free travel guides.
                    Your price remains the same.
                </p>
                <p>
                    📋 <strong>Sample Data:</strong> Schedules and prices shown are for reference only.
                    Actual availability and fares may differ — always confirm on 12Go.asia before booking.
                </p>
            </div>

            <Dialog open={!!bookingUrl} onOpenChange={(open) => !open && setBookingUrl(null)}>
                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden sm:rounded-2xl border-none">
                    {bookingUrl && (
                        <iframe 
                            src={bookingUrl} 
                            className="w-full h-full border-0 bg-white"
                            title="Book Transport Ticket"
                            allow="payment"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
