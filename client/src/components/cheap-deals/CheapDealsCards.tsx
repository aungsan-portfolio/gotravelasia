import { useState, useMemo, memo } from "react";
import { USD_TO_THB_RATE } from "@/const";
import { useMultiCheapDeals } from "@/hooks/useFlightData";

import {
    MYANMAR_ORIGINS,
    MYANMAR_DESTINATIONS,
    ASIA_ORIGINS,
    ASIA_DESTINATIONS,
} from "./destinations";

import {
    DEALS_TO_SHOW,
    MAX_HOOK_THB,
    type TargetNiche,
    type EnhancedDealCard,
} from "./types";

import {
    mapToEnhancedDeals,
    scoreDeal,
    formatPrice,
} from "./utils";

import DealCard from "./DealCard";

export default memo(function CheapDealsCards() {
    const [activeNiche, setActiveNiche] = useState<TargetNiche>("myanmar");

    const activeOrigins = activeNiche === "myanmar" ? MYANMAR_ORIGINS : ASIA_ORIGINS;
    const { deals: activeDeals, loading } = useMultiCheapDeals([...activeOrigins]);

    const { topDeals } = useMemo(() => {
        if (activeDeals.length === 0) return { topDeals: [] as EnhancedDealCard[], displayBudget: 0 };

        const destinations = activeNiche === "myanmar" ? MYANMAR_DESTINATIONS : ASIA_DESTINATIONS;
        // @ts-ignore - mapToEnhancedDeals accepts string[] but activeOrigins is readonly literal tuple
        const allDeals = mapToEnhancedDeals(activeDeals, activeOrigins as unknown as string[], destinations);

        if (allDeals.length === 0) return { topDeals: [] as EnhancedDealCard[], displayBudget: 0 };

        // Filter to affordable deals under the THB cap
        const affordable = allDeals.filter(d => d.price * USD_TO_THB_RATE <= MAX_HOOK_THB);
        let pool = affordable;

        // Fallback: if we don't have enough affordable deals to fill the grid (4 cards),
        // pull the cheapest from the remaining unaffordable deals to fill the gaps
        if (affordable.length < DEALS_TO_SHOW) {
            const unaffordable = allDeals
                .filter(d => d.price * USD_TO_THB_RATE > MAX_HOOK_THB)
                .sort((a, b) => a.price - b.price);

            pool = [...affordable, ...unaffordable.slice(0, DEALS_TO_SHOW - affordable.length)];
        }

        const cheapest = Math.min(...pool.map(d => d.price));
        const budget = Math.max(Math.floor((cheapest * 1.5) / 50) * 50, 50);

        const scored = pool
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

        // Dynamic budget in THB for the hook title
        const budgetThb = Math.round(budget * USD_TO_THB_RATE);

        return { topDeals: result, displayBudget: budgetThb };
    }, [activeNiche, activeDeals, activeOrigins]);

    // Dynamic hook title — cheapest price grabs attention, budget sets expectation
    const cheapestDeal = topDeals[0]; // already sorted price-asc

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
                    {cheapestDeal ? (
                        <>
                            {activeNiche === "myanmar" ? "Cheap flights from Myanmar from " : "Explore Southeast Asia from "}
                            <span style={{ color: "#16a34a" }}>
                                {formatPrice(cheapestDeal.price, "USD")}
                            </span>
                            {" "}
                            <span className="text-[16px] sm:text-[18px] font-[600] text-[#667085]">
                                ({formatPrice(cheapestDeal.price * USD_TO_THB_RATE, "THB")})
                            </span>
                        </>
                    ) : (
                        activeNiche === "myanmar"
                            ? "Cheap flights from Myanmar"
                            : "Explore Southeast Asia"
                    )}
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
                {topDeals.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                ))}

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

        </section>
    );
});
