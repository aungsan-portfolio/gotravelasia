import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Train, Wifi, Snowflake, Coffee, Ticket, ExternalLink,
    CalendarClock, AlertTriangle, Lightbulb,
} from "lucide-react";

/* ─── Types ─── */
interface TrainClass {
    class: string;
    price: number;
    availability: string;
    features: string[];
}

interface FeaturedTrain {
    trainNumber: string;
    trainName: string;
    departure: string;
    arrival: string;
    duration: string;
    frequency: string;
    classes: TrainClass[];
    bookingUrl: string;
    tips: string[];
}

interface FeaturedTrainCardProps {
    from?: string;
    to?: string;
}

/** Safe slug for old iOS Safari */
const slug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");

/** Vite basePath-safe asset URL */
const assetUrl = (path: string) => {
    const base = (import.meta as any)?.env?.BASE_URL ?? "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${normalizedBase}${normalizedPath}`;
};

/* ─── Component ─── */
export function FeaturedTrainCard({ from, to }: FeaturedTrainCardProps) {
    /* ── All hooks FIRST (Rules of Hooks) ── */
    const [activeTab, setActiveTab] = useState<
        "exterior" | "1st-class" | "2nd-class"
    >("exterior");
    const [trainData, setTrainData] = useState<FeaturedTrain | null>(null);

    // Derive route info (safe even when from/to are undefined)
    const isBkkToCnx = from === "Bangkok" && to === "Chiang Mai";
    const isCnxToBkk = from === "Chiang Mai" && to === "Bangkok";
    const routeKey = isBkkToCnx
        ? "Bangkok-Chiang Mai"
        : isCnxToBkk
            ? "Chiang Mai-Bangkok"
            : null;

    // Fetch with cancellation + content-type guard
    useEffect(() => {
        let cancelled = false;
        if (!routeKey) return;

        const url = assetUrl("data/transport.json");
        fetch(url)
            .then(async (res) => {
                if (!res.ok) return null;
                const ct = res.headers.get("content-type") || "";
                if (!ct.includes("application/json")) return null;
                try { return await res.json(); } catch { return null; }
            })
            .then((data) => {
                if (cancelled) return;
                const featured = data?.featuredTrains?.[routeKey];
                if (featured) setTrainData(featured);
            })
            .catch(() => { });

        return () => { cancelled = true; };
    }, [routeKey]);

    // Fallback data (useMemo MUST be called every render — no conditional skip)
    const train = useMemo<FeaturedTrain>(
        () =>
            trainData || {
                trainNumber: isBkkToCnx ? "9" : "10",
                trainName: "Uttraphimuk Special Express (CNR)",
                departure: isBkkToCnx ? "18:10" : "18:00",
                arrival: isBkkToCnx ? "07:15 (+1)" : "06:50 (+1)",
                duration: "13 hours",
                frequency: "Daily",
                classes: [
                    {
                        class: "1st Class AC Sleeper",
                        price: 1650,
                        availability: "High Demand — Book 60-90 days ahead",
                        features: [
                            "Private Lockable Cabin (2 Berth)",
                            "Touchscreen & USB Charging",
                            "Wash Basin & Mirror",
                            "Shared Hot Shower",
                        ],
                    },
                    {
                        class: "2nd Class AC Sleeper",
                        price: 950,
                        availability: "Available — Book 30-60 days ahead",
                        features: [
                            "Comfortable Open-Plan Berths",
                            "Privacy Curtains",
                            "Power Outlet at every berth",
                            "Clean Bedding Provided",
                        ],
                    },
                ],
                bookingUrl: `https://12go.asia/en/travel/${slug(from || "bangkok")}/${slug(to || "chiang-mai")}?z=14566451&sub_id=featured_train_card`,
                tips: [
                    "Lower berths have windows and more space",
                    "Dining car serves Thai food — bring snacks too",
                ],
            },
        [trainData, isBkkToCnx, from, to],
    );

    /* ── Early returns AFTER all hooks ── */
    if (!from || !to || !routeKey) return null;

    const firstClass = train.classes?.[0];
    const secondClass = train.classes?.[1];

    const getAvailabilityColor = (text: string) => {
        const t = (text || "").toLowerCase();
        if (t.includes("sold out")) return "bg-gray-800 text-white";
        if (t.includes("high demand"))
            return "bg-amber-100 text-amber-800 border-amber-200";
        return "bg-green-100 text-green-800 border-green-200";
    };

    const isFirstActive = activeTab === "1st-class";
    const isSecondActive = activeTab === "2nd-class";

    // Vite-safe image paths
    const exteriorImg = assetUrl("images/trains/cnr-exterior.jpg");
    const firstImg = assetUrl("images/trains/cnr-1st-class.jpg");
    const secondImg = assetUrl("images/trains/cnr-2nd-class.jpg");

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-3">
                <Badge
                    variant="default"
                    className="bg-red-600 hover:bg-red-700 text-white border-none px-3 py-1 text-xs uppercase tracking-wider shadow-sm"
                >
                    🌟 Featured Journey
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">
                    most popular choice
                </span>
            </div>

            <Card className="overflow-hidden border-2 border-red-100 bg-gradient-to-br from-white to-red-50/30 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                    {/* ── Image Showcase ── */}
                    <div className="lg:col-span-2 relative bg-slate-100 overflow-hidden aspect-[16/10] lg:aspect-auto lg:h-full">
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) =>
                                setActiveTab(v as "exterior" | "1st-class" | "2nd-class")
                            }
                            className="h-full w-full relative"
                        >
                            <div className="absolute top-4 left-4 z-20">
                                <Badge
                                    variant="secondary"
                                    className="bg-black/70 text-white backdrop-blur-md border-none text-xs"
                                >
                                    Special Express CNR
                                </Badge>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 z-20">
                                <TabsList className="grid w-full grid-cols-3 bg-black/60 backdrop-blur-md border-white/10 text-white p-1 rounded-lg">
                                    <TabsTrigger
                                        value="exterior"
                                        className="text-sm py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                                    >
                                        Train
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="1st-class"
                                        className="text-sm py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                                    >
                                        1st Class
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="2nd-class"
                                        className="text-sm py-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                                    >
                                        2nd Class
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent
                                value="exterior"
                                className="m-0 p-0 absolute inset-0"
                            >
                                <img
                                    src={exteriorImg}
                                    alt="CNR Special Express Train — Bangkok to Chiang Mai"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </TabsContent>
                            <TabsContent
                                value="1st-class"
                                className="m-0 p-0 absolute inset-0"
                            >
                                <img
                                    src={firstImg}
                                    alt="CNR 1st Class Private Cabin with Lockable Door"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </TabsContent>
                            <TabsContent
                                value="2nd-class"
                                className="m-0 p-0 absolute inset-0"
                            >
                                <img
                                    src={secondImg}
                                    alt="CNR 2nd Class AC Sleeper Berths with Curtains"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* ── Right: Content & Booking ── */}
                    <div className="lg:col-span-3 p-6 flex flex-col justify-between">
                        <div>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Train className="w-6 h-6 text-red-600" />
                                        {isBkkToCnx
                                            ? "Bangkok → Chiang Mai"
                                            : "Chiang Mai → Bangkok"}
                                    </h3>
                                    <p className="text-muted-foreground font-medium">
                                        Train No. {train.trainNumber} "{train.trainName}"
                                    </p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-red-600 flex items-center justify-end gap-1">
                                        <CalendarClock className="w-4 h-4" /> {train.frequency}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {train.departure} → {train.arrival}
                                    </p>
                                </div>
                            </div>

                            {/* Class Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {firstClass && (
                                    <div
                                        className={`p-4 rounded-xl border transition-all ${isFirstActive
                                                ? "bg-red-50 border-red-200 shadow-sm"
                                                : "bg-white border-slate-100 hover:border-red-100"
                                            }`}
                                    >
                                        <h4 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                                            <Ticket className="w-4 h-4" /> {firstClass.class}
                                        </h4>
                                        <Badge
                                            className={`mb-2 text-[10px] font-medium border ${getAvailabilityColor(firstClass.availability)}`}
                                        >
                                            {firstClass.availability}
                                        </Badge>
                                        <ul className="text-sm space-y-1 text-slate-600">
                                            {firstClass.features.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{" "}
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-lg font-bold text-slate-900">
                                            ~ ฿{firstClass.price.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {secondClass && (
                                    <div
                                        className={`p-4 rounded-xl border transition-all ${isSecondActive
                                                ? "bg-red-50 border-red-200 shadow-sm"
                                                : "bg-white border-slate-100 hover:border-red-100"
                                            }`}
                                    >
                                        <h4 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                                            <Ticket className="w-4 h-4" /> {secondClass.class}
                                        </h4>
                                        <Badge
                                            className={`mb-2 text-[10px] font-medium border ${getAvailabilityColor(secondClass.availability)}`}
                                        >
                                            {secondClass.availability}
                                        </Badge>
                                        <ul className="text-sm space-y-1 text-slate-600">
                                            {secondClass.features.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{" "}
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-lg font-bold text-slate-900">
                                            ~ ฿{secondClass.price.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                    <Snowflake className="w-3 h-3" /> AC
                                </span>
                                <span className="flex items-center gap-1">
                                    <Wifi className="w-3 h-3" /> No Wifi
                                </span>
                                <span className="flex items-center gap-1">
                                    <Coffee className="w-3 h-3" /> Dining Car
                                </span>
                            </div>

                            {/* Insider Tips */}
                            {train.tips && train.tips.length > 0 && (
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-3">
                                    <p className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                                        <Lightbulb className="w-3 h-3" /> Insider Tips
                                    </p>
                                    <ul className="text-xs text-amber-700 space-y-0.5">
                                        {train.tips.map((tip, i) => (
                                            <li key={i}>• {tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Booking Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-red-100 pt-4 mt-auto">
                            <div className="text-xs text-red-600 font-medium px-3 py-1.5 bg-red-50 rounded-full flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" /> Book 30-90 days in
                                advance!
                            </div>
                            <a
                                href={train.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto"
                            >
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200 transition-all font-bold">
                                    Check Availability on 12Go{" "}
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
