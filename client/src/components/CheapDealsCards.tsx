import { useState, useMemo, memo } from "react";
import { USD_TO_THB_RATE } from "@/const";

// ─────────────────────────────────────────────────────────────────────────────
// CheapDealsCards — Cheapflights-style deal cards with Smart Auto-Sort
// ─────────────────────────────────────────────────────────────────────────────
// Features:
//   • Two tabs: "From Myanmar 🇲🇲" and "Around Asia 🌏"
//   • Master pool of 10–15 destinations per tab
//   • Auto-sorts by price ascending → picks cheapest 4 with country diversity

// ── Data Model ───────────────────────────────────────────────────────────────
interface DealEntry {
    id: string;
    destination: string;
    country: string;      // Used for diversity filter (1 card per country)
    image: string;
    durationDesc: string;
    startDateStr: string;
    endDateStr: string;
    price: number;        // USD
    fromCode: string;
    toCode: string;
}

// ── MASTER POOL: Myanmar Tab (10+ destinations from RGN / MDL) ───────────────
const MYANMAR_POOL: DealEntry[] = [
    {
        id: "rgn-bkk", destination: "Bangkok", country: "Thailand",
        image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&q=80",
        durationDesc: "1h 20m, direct", startDateStr: "Thu 13/3", endDateStr: "Mon 17/3",
        price: 89, fromCode: "RGN", toCode: "BKK",
    },
    {
        id: "rgn-cnx", destination: "Chiang Mai", country: "Thailand",
        image: "/images/chiang-mai.webp",
        durationDesc: "1h 55m, direct", startDateStr: "Wed 18/3", endDateStr: "Sun 22/3",
        price: 115, fromCode: "RGN", toCode: "CNX",
    },
    {
        id: "rgn-sin", destination: "Singapore", country: "Singapore",
        image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80",
        durationDesc: "2h 45m, direct", startDateStr: "Fri 20/3", endDateStr: "Tue 24/3",
        price: 142, fromCode: "RGN", toCode: "SIN",
    },
    {
        id: "rgn-hkt", destination: "Phuket", country: "Thailand",
        image: "https://images.unsplash.com/photo-1584169973156-f8319ad0db0e?w=400&q=80",
        durationDesc: "2h 15m, 1 stop", startDateStr: "Sat 14/3", endDateStr: "Wed 18/3",
        price: 155, fromCode: "RGN", toCode: "HKT",
    },
    {
        id: "rgn-kul", destination: "Kuala Lumpur", country: "Malaysia",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80",
        durationDesc: "2h 30m, direct", startDateStr: "Mon 16/3", endDateStr: "Fri 20/3",
        price: 128, fromCode: "RGN", toCode: "KUL",
    },
    {
        id: "rgn-han", destination: "Hanoi", country: "Vietnam",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80",
        durationDesc: "2h 10m, direct", startDateStr: "Thu 19/3", endDateStr: "Mon 23/3",
        price: 135, fromCode: "RGN", toCode: "HAN",
    },
    {
        id: "mdl-bkk", destination: "Bangkok (from MDL)", country: "Thailand",
        image: "https://images.unsplash.com/photo-1583500057207-68b55589c4a7?w=400&q=80",
        durationDesc: "1h 45m, direct", startDateStr: "Sat 14/3", endDateStr: "Wed 18/3",
        price: 95, fromCode: "MDL", toCode: "BKK",
    },
    {
        id: "mdl-cnx", destination: "Chiang Mai (from MDL)", country: "Thailand",
        image: "/images/chiang-mai.webp",
        durationDesc: "1h 40m, direct", startDateStr: "Tue 24/3", endDateStr: "Sat 28/3",
        price: 105, fromCode: "MDL", toCode: "CNX",
    },
    {
        id: "rgn-icn", destination: "Seoul", country: "South Korea",
        image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&q=80",
        durationDesc: "5h 30m, 1 stop", startDateStr: "Wed 25/3", endDateStr: "Sun 29/3",
        price: 245, fromCode: "RGN", toCode: "ICN",
    },
    {
        id: "rgn-nrt", destination: "Tokyo", country: "Japan",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
        durationDesc: "6h 30m, 1 stop", startDateStr: "Fri 27/3", endDateStr: "Tue 31/3",
        price: 320, fromCode: "RGN", toCode: "NRT",
    },
    {
        id: "rgn-dps", destination: "Bali", country: "Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
        durationDesc: "4h 10m, 1 stop", startDateStr: "Sat 21/3", endDateStr: "Wed 25/3",
        price: 178, fromCode: "RGN", toCode: "DPS",
    },
];

// ── MASTER POOL: Asia Tab (10+ popular SEA routes) ───────────────────────────
const INTERNATIONAL_POOL: DealEntry[] = [
    {
        id: "bkk-cnx", destination: "Chiang Mai", country: "Thailand",
        image: "/images/chiang-mai.webp",
        durationDesc: "1h 15m, direct", startDateStr: "Tue 24/3", endDateStr: "Sat 28/3",
        price: 45, fromCode: "BKK", toCode: "CNX",
    },
    {
        id: "bkk-hkt", destination: "Phuket", country: "Thailand",
        image: "https://images.unsplash.com/photo-1584169973156-f8319ad0db0e?w=400&q=80",
        durationDesc: "1h 25m, direct", startDateStr: "Fri 13/3", endDateStr: "Mon 16/3",
        price: 55, fromCode: "BKK", toCode: "HKT",
    },
    {
        id: "kul-utp", destination: "Pattaya", country: "Thailand",
        image: "https://images.unsplash.com/photo-1588661704283-7d727dbfcdc2?w=400&q=80",
        durationDesc: "2h 10m, direct", startDateStr: "Wed 25/3", endDateStr: "Sun 29/3",
        price: 68, fromCode: "KUL", toCode: "UTP",
    },
    {
        id: "sin-dps", destination: "Bali", country: "Indonesia",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
        durationDesc: "2h 40m, direct", startDateStr: "Thu 12/3", endDateStr: "Sun 15/3",
        price: 110, fromCode: "SIN", toCode: "DPS",
    },
    {
        id: "bkk-sgn", destination: "Ho Chi Minh City", country: "Vietnam",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80",
        durationDesc: "1h 45m, direct", startDateStr: "Mon 16/3", endDateStr: "Fri 20/3",
        price: 72, fromCode: "BKK", toCode: "SGN",
    },
    {
        id: "sin-kul", destination: "Kuala Lumpur", country: "Malaysia",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&q=80",
        durationDesc: "1h 0m, direct", startDateStr: "Sat 14/3", endDateStr: "Wed 18/3",
        price: 38, fromCode: "SIN", toCode: "KUL",
    },
    {
        id: "kul-han", destination: "Hanoi", country: "Vietnam",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&q=80",
        durationDesc: "3h 30m, direct", startDateStr: "Thu 19/3", endDateStr: "Mon 23/3",
        price: 85, fromCode: "KUL", toCode: "HAN",
    },
    {
        id: "sin-mnl", destination: "Manila", country: "Philippines",
        image: "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=400&q=80",
        durationDesc: "3h 40m, direct", startDateStr: "Wed 18/3", endDateStr: "Sun 22/3",
        price: 95, fromCode: "SIN", toCode: "MNL",
    },
    {
        id: "bkk-kix", destination: "Osaka", country: "Japan",
        image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80",
        durationDesc: "5h 50m, direct", startDateStr: "Fri 27/3", endDateStr: "Tue 31/3",
        price: 195, fromCode: "BKK", toCode: "KIX",
    },
    {
        id: "sin-icn", destination: "Seoul", country: "South Korea",
        image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&q=80",
        durationDesc: "6h 20m, direct", startDateStr: "Thu 26/3", endDateStr: "Mon 30/3",
        price: 210, fromCode: "SIN", toCode: "ICN",
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
type TargetNiche = "myanmar" | "international";
const CARDS_TO_SHOW = 4;

/** Build a flight results URL with a date 14 days from now */
function buildSearchUrl(fromCode: string, toCode: string): string {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `/flights/results?flightSearch=${fromCode}${dd}${mm}${toCode}1`;
}

/** Format USD to THB string: e.g. "฿3,060" */
function toTHB(usd: number): string {
    const thb = Math.round(usd * USD_TO_THB_RATE);
    return `฿${thb.toLocaleString()}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default memo(function CheapDealsCards() {
    const [activeNiche, setActiveNiche] = useState<TargetNiche>("myanmar");

    // SMART AUTO-SORT: sort by price ascending → pick cheapest per country (diversity)
    const topDeals = useMemo(() => {
        const pool = activeNiche === "myanmar" ? MYANMAR_POOL : INTERNATIONAL_POOL;
        const sorted = [...pool].sort((a, b) => a.price - b.price);
        const seen = new Set<string>();
        const result: DealEntry[] = [];
        for (const deal of sorted) {
            if (seen.has(deal.country)) continue; // skip duplicate country
            seen.add(deal.country);
            result.push(deal);
            if (result.length >= CARDS_TO_SHOW) break;
        }
        return result;
    }, [activeNiche]);

    // DYNAMIC HOOK TITLE: ceiling = round up the max of the top 4
    const dynamicCeiling = useMemo(() => {
        const maxPrice = Math.max(...topDeals.map(d => d.price));
        return Math.ceil((maxPrice + 5) / 10) * 10;
    }, [topDeals]);

    const hookTitle = activeNiche === "myanmar"
        ? `Flights from Myanmar under $${dynamicCeiling} (${toTHB(dynamicCeiling)})`
        : `Explore Southeast Asia under $${dynamicCeiling} (${toTHB(dynamicCeiling)})`;

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

            {/* ── Cards Grid (Cheapflights exact spec: 4 → 2 → 1) ── */}
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
                            />
                        </div>

                        {/* Card Body */}
                        <div className="p-4 pb-5 flex flex-col flex-1">
                            {/* Destination */}
                            <div className="text-[18px] font-[700] text-[#101828] mb-1.5 leading-[1.2]">
                                {deal.destination}
                            </div>

                            {/* Duration */}
                            <div className="text-[14px] text-[#667085] leading-[1.5] mb-0.5">
                                {deal.durationDesc}
                            </div>

                            {/* Dates */}
                            <div className="flex items-center gap-1 text-[14px] text-[#667085]">
                                {deal.startDateStr}
                                <span className="text-[16px] text-[#98a2b3] leading-none">›</span>
                                {deal.endDateStr}
                            </div>

                            {/* Spacer */}
                            <div className="flex-1 min-h-[16px]" />

                            {/* Dual Price: THB highlighted + USD secondary */}
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
        </section>
    );
});
