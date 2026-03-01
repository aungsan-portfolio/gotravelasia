import React, { memo, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { isValid, format } from "date-fns";
import {
    Plane,
    Trash2,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import posthog from "posthog-js";
import { formatTHB } from "@/const";
import { useLivePriceMap } from "@/hooks/useFlightData";
import { AIRPORT_MAP } from "./flightWidget.data";
import { recentSearches, type RecentSearchRecord } from "./flightWidget.recent";

const B = {
    gold: "#F5C518",
    purpleDeep: "#2D0558",
} as const;

function fmtShortDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return isValid(d) ? format(d, "EEE d/M") : dateStr;
}

function getAirportName(code: string): string {
    const a = AIRPORT_MAP.get(code);
    return a ? a.name.split("(")[0].trim() : code;
}

const getTrackingCount = (origin: string, destination: string): number => {
    // Deterministic — same route = same number (no flickering)
    let hash = 0;
    const key = `${origin}${destination}`;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) & 0xffff;
    }
    return (hash % 80) + 12; // Range: 12 – 91
};

export const RecentSearchesPanel = memo(function RecentSearchesPanel({
    onReSearch,
}: {
    onReSearch: (s: RecentSearchRecord) => void;
}) {
    const [searches, setSearches] = useState<RecentSearchRecord[]>([]);
    useEffect(() => setSearches(recentSearches.load()), []);

    // ✅ Fix 1: stable queries array via useMemo
    const liveQueries = useMemo(
        () => searches.map(s => ({ origin: s.origin, destination: s.destination, month: s.departDate.substring(0, 7) })),
        [searches]
    );

    const currentPrices = useLivePriceMap(liveQueries);

    const handleClear = useCallback(() => {
        recentSearches.clear();
        setSearches([]);
    }, []);

    if (searches.length === 0) return null;

    // ✅ Fix 2: key includes month to avoid collision
    const keyOf = (s: RecentSearchRecord) => `${s.origin}-${s.destination}-${s.departDate.substring(0, 7)}`;

    return (
        <section className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700" aria-label="Recent flight searches">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-black text-white">Recent searches</h3>
                <button
                    type="button" onClick={handleClear}
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-red-400"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    aria-label="Clear all recent searches"
                >
                    <Trash2 className="w-3 h-3" aria-hidden="true" /> Clear
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searches.slice(0, 3).map(s => {
                    const routeKey = keyOf(s);
                    const currentPrice = currentPrices[`${s.origin}-${s.destination}`] ?? null;
                    const savedPrice = s.priceAtSearch;

                    let priceBadge: { label: string; cls: string; icon: ReactNode } | null = null;
                    if (currentPrice !== null && savedPrice !== null && savedPrice > 0) {
                        const diff = currentPrice - savedPrice;
                        const pct = Math.round((Math.abs(diff) / savedPrice) * 100);
                        if (diff > 0) priceBadge = { label: `+${pct}% increase`, cls: "bg-red-100 text-red-700", icon: <TrendingUp className="w-3 h-3" aria-hidden="true" /> };
                        else if (diff < 0) priceBadge = { label: `−${pct}% drop`, cls: "bg-emerald-100 text-emerald-700", icon: <TrendingDown className="w-3 h-3" aria-hidden="true" /> };
                    }

                    return (
                        <article
                            key={routeKey}
                            className="rounded-2xl p-4 group transition-all hover:shadow-xl"
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                            aria-label={`${s.origin} to ${s.destination}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(245,197,24,0.15)" }} aria-hidden="true">
                                    <Plane className="w-4 h-4" style={{ color: B.gold }} />
                                </div>
                                <span className="font-bold text-white text-sm">
                                    {s.origin} <span style={{ color: B.gold }} aria-hidden="true">▸</span> {s.destination}
                                </span>
                            </div>
                            <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                                {getAirportName(s.origin)} → {getAirportName(s.destination)}
                            </div>
                            <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                                {fmtShortDate(s.departDate)}
                                {s.returnDate ? ` ▸ ${fmtShortDate(s.returnDate)}` : ""}
                                <span className="ml-1 opacity-60">· {s.returnDate ? "Return" : "One way"}</span>
                            </div>
                            {priceBadge && (
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold mb-2 ${priceBadge.cls}`}>
                                    {priceBadge.icon} {priceBadge.label}
                                </div>
                            )}
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-[11px] text-orange-500 font-semibold animate-pulse">
                                    🔥 {getTrackingCount(s.origin, s.destination)} people tracking this route
                                </span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div aria-label={currentPrice !== null ? `Current price $${currentPrice}` : savedPrice ? `Saved price $${savedPrice}` : "Price unavailable"}>
                                    {currentPrice !== null ? (
                                        <>
                                            <div className="text-2xl font-black text-white">${currentPrice}</div>
                                            <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{formatTHB(currentPrice)}</div>
                                            {savedPrice !== null && savedPrice !== currentPrice && (
                                                <div className="text-xs line-through" style={{ color: "rgba(255,255,255,0.3)" }}>Was ${savedPrice}</div>
                                            )}
                                        </>
                                    ) : savedPrice !== null ? (
                                        <>
                                            <div className="text-xl font-black text-white">${savedPrice}</div>
                                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{formatTHB(savedPrice)}</div>
                                        </>
                                    ) : (
                                        <div className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Price unavailable</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const fmtDDMM = (d: string) => { const [, mm, dd] = d.split("-"); return dd + mm; };
                                            let fs = `${s.origin}${fmtDDMM(s.departDate)}${s.destination}`;
                                            if (s.returnDate) fs += fmtDDMM(s.returnDate);
                                            fs += "1"; // 1 adult, economy
                                            if (posthog.__loaded) posthog.capture("recent_search_book", { origin: s.origin, destination: s.destination });
                                            window.location.href = `/flights/results?flightSearch=${fs}`;
                                        }}
                                        className="px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
                                        style={{ background: B.gold, color: B.purpleDeep }}
                                        aria-label={`Book ${s.origin} to ${s.destination} tickets`}
                                    >
                                        Book Now
                                    </button>
                                    <button
                                        type="button" onClick={() => onReSearch(s)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                        style={{ color: "rgba(255,255,255,0.5)" }}
                                        aria-label={`Edit search ${s.origin} to ${s.destination}`}
                                    >
                                        Edit search
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
});
