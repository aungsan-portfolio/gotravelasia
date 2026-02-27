/**
 * FlightWidget.tsx — Go Travel Asia
 * Ultimate Version (V1 tokens + V2 stability + V3 a11y/perf)
 *
 * Features:
 *  ✅ Brand token system (B object) — single source of truth for colors
 *  ✅ Shared style objects — DRY, no repeated inline styles
 *  ✅ Error Boundary — graceful crash recovery with Retry button
 *  ✅ useScrollLock — body scroll lock when calendar is open
 *  ✅ Full ARIA attributes — screen reader & keyboard accessible
 *  ✅ React.memo + useCallback — optimised re-renders
 *  ✅ Strict TypeScript — AirportCode, CabinCode branded types
 *  ✅ Async detectOriginAirport() — clean geo-detection
 *  ✅ Namespaced recentSearches — tidy localStorage helpers
 */

import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
    memo,
    Component,
    type ReactNode,
    type ErrorInfo,
} from "react";
import {
    Plane,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    ArrowRightLeft,
    Armchair,
    ChevronDown,
    Minus,
    Plus,
    ExternalLink,
    X,
    Search,
    Trash2,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PriceCalendar from "@/components/PriceCalendar";
import { usePriceHint, useFlightPriceMap, useLivePriceMap } from "@/hooks/useFlightData";
import posthog from "posthog-js";
import { z } from "zod";
import { formatTHB } from "@/const";
import { useFlightSearch } from "@/contexts/FlightSearchContext";

// ─────────────────────────────────────────────────────────────────────────────
// 1. BRAND TOKENS — single source of truth for GoTravel colours
// ─────────────────────────────────────────────────────────────────────────────
const B = {
    purple: "#5B0EA6",
    purpleDeep: "#2D0558",
    gold: "#F5C518",
    white: "#FFFFFF",
    text: "#1a0a2e",
    textMuted: "#8B7AA0",
    glassBase: "rgba(255,255,255,0.12)",
    glassBorder: "rgba(255,255,255,0.18)",
    glassFocus: "rgba(245,197,24,0.12)",
    error: "#fba09d",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2. SHARED STYLE OBJECTS — DRY cell / label / border styles
// ─────────────────────────────────────────────────────────────────────────────
const cellBorder: React.CSSProperties = {
    borderBottom: `1px solid ${B.glassBorder}`,
    borderRight: `1px solid ${B.glassBorder}`,
};
const cellFocus: React.CSSProperties = {
    background: B.glassFocus,
    boxShadow: `inset 0 0 0 1.5px ${B.gold}`,
};
const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase", color: B.gold, marginBottom: 2, lineHeight: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. ZOD VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const flightSearchSchema = z
    .object({
        origin: z.string().min(1),
        destination: z.string().min(1),
        departDate: z.string().min(1, "Please select a departure date"),
        returnDate: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.origin === data.destination) {
            ctx.addIssue({ code: "custom", message: "Origin and destination cannot be the same", path: ["destination"] });
        }
        if (data.returnDate && data.returnDate < data.departDate) {
            ctx.addIssue({ code: "custom", message: "Return date must be after departure date", path: ["returnDate"] });
        }
    });

// ─────────────────────────────────────────────────────────────────────────────
// 4. AIRPORT DATA — strict typed
// ─────────────────────────────────────────────────────────────────────────────
const AIRPORTS = [
    { code: "RGN", name: "Yangon (ရန်ကုန်)", country: "Myanmar" },
    { code: "MDL", name: "Mandalay (မန္တလေး)", country: "Myanmar" },
    { code: "BKK", name: "Bangkok (Suvarnabhumi)", country: "Thailand" },
    { code: "DMK", name: "Bangkok (Don Mueang)", country: "Thailand" },
    { code: "CNX", name: "Chiang Mai", country: "Thailand" },
    { code: "HKT", name: "Phuket", country: "Thailand" },
    { code: "SIN", name: "Singapore", country: "Singapore" },
    { code: "KUL", name: "Kuala Lumpur", country: "Malaysia" },
    { code: "SGN", name: "Ho Chi Minh", country: "Vietnam" },
    { code: "HAN", name: "Hanoi", country: "Vietnam" },
    { code: "PNH", name: "Phnom Penh", country: "Cambodia" },
    { code: "REP", name: "Siem Reap", country: "Cambodia" },
    { code: "CGK", name: "Jakarta (Soekarno-Hatta)", country: "Indonesia" },
    { code: "DPS", name: "Bali (Ngurah Rai)", country: "Indonesia" },
    { code: "MNL", name: "Manila (Ninoy Aquino)", country: "Philippines" },
    { code: "CEB", name: "Cebu (Mactan)", country: "Philippines" },
    { code: "CEI", name: "Chiang Rai", country: "Thailand" },
    { code: "KBV", name: "Krabi", country: "Thailand" },
    { code: "DAD", name: "Da Nang", country: "Vietnam" },
    { code: "LGK", name: "Langkawi", country: "Malaysia" },
    { code: "PEN", name: "Penang", country: "Malaysia" },
    { code: "BKI", name: "Kota Kinabalu", country: "Malaysia" },
    { code: "VTE", name: "Vientiane", country: "Laos" },
    { code: "LPQ", name: "Luang Prabang", country: "Laos" },
    { code: "TPE", name: "Taipei (Taoyuan)", country: "Taiwan" },
    { code: "ICN", name: "Seoul (Incheon)", country: "South Korea" },
    { code: "NRT", name: "Tokyo (Narita)", country: "Japan" },
    { code: "KIX", name: "Osaka (Kansai)", country: "Japan" },
    { code: "HKG", name: "Hong Kong", country: "Hong Kong" },
    { code: "MFM", name: "Macau", country: "Macau" },
    { code: "CCU", name: "Kolkata", country: "India" },
    { code: "DEL", name: "Delhi (Indira Gandhi)", country: "India" },
    { code: "BWN", name: "Bandar Seri Begawan", country: "Brunei" },
] as const;

type Airport = (typeof AIRPORTS)[number];
type AirportCode = Airport["code"];
type CabinCode = "Y" | "W" | "C" | "F";

const AIRPORT_MAP = new Map<string, Airport>(
    (AIRPORTS as unknown as Airport[]).map(a => [a.code, a])
);

const COUNTRY_FLAGS: Record<string, string> = {
    Myanmar: "🇲🇲", Thailand: "🇹🇭", Singapore: "🇸🇬", Malaysia: "🇲🇾",
    Vietnam: "🇻🇳", Cambodia: "🇰🇭", Indonesia: "🇮🇩", Philippines: "🇵🇭",
    Laos: "🇱🇦", Taiwan: "🇹🇼", "South Korea": "🇰🇷", Japan: "🇯🇵",
    "Hong Kong": "🇭🇰", Macau: "🇲🇴", India: "🇮🇳", Brunei: "🇧🇳",
};

const DESTINATION_GROUPS = (AIRPORTS as unknown as Airport[]).reduce<
    { key: string; label: string; options: Airport[] }[]
>((acc, airport) => {
    const existing = acc.find(g => g.key === airport.country);
    if (existing) existing.options.push(airport);
    else acc.push({ key: airport.country, label: `${COUNTRY_FLAGS[airport.country] ?? ""} ${airport.country}`, options: [airport] });
    return acc;
}, []);

const CABIN_OPTIONS: { value: CabinCode; label: string }[] = [
    { value: "Y", label: "Economy" },
    { value: "W", label: "Premium Eco" },
    { value: "C", label: "Business" },
    { value: "F", label: "First Class" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. PURE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function formatTravelerLabel(adults: number, children: number, infants: number): string {
    const total = adults + children + infants;
    return total === 1 ? "1 Traveler" : `${total} Travelers`;
}

function fmtDisplayDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return isValid(d) ? format(d, "EEE, MMM d") : dateStr;
}

function fmtShortDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return isValid(d) ? format(d, "EEE d/M") : dateStr;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GEO DETECTION — async function (from V2)
// ─────────────────────────────────────────────────────────────────────────────
const CITY_TO_AIRPORT: Record<string, string> = {
    yangon: "RGN", mandalay: "MDL", bangkok: "BKK",
    "chiang mai": "CNX", chiangmai: "CNX", phuket: "HKT",
    "chiang rai": "CEI", chiangrai: "CEI", krabi: "KBV",
    singapore: "SIN", "kuala lumpur": "KUL", kl: "KUL",
    langkawi: "LGK", penang: "PEN", "george town": "PEN", "kota kinabalu": "BKI",
    "ho chi minh": "SGN", saigon: "SGN", "ho chi minh city": "SGN",
    hanoi: "HAN", "da nang": "DAD", danang: "DAD",
    "phnom penh": "PNH", "siem reap": "REP",
    jakarta: "CGK", bali: "DPS", denpasar: "DPS",
    manila: "MNL", cebu: "CEB", vientiane: "VTE", "luang prabang": "LPQ",
    taipei: "TPE", seoul: "ICN", incheon: "ICN", tokyo: "NRT", osaka: "KIX",
    "hong kong": "HKG", macau: "MFM", macao: "MFM",
    kolkata: "CCU", calcutta: "CCU", delhi: "DEL", "new delhi": "DEL",
    "bandar seri begawan": "BWN",
};

const COUNTRY_TO_AIRPORT: Record<string, string> = {
    MM: "RGN", TH: "BKK", SG: "SIN", MY: "KUL", VN: "SGN", KH: "PNH",
    ID: "CGK", PH: "MNL", JP: "NRT", KR: "ICN", HK: "HKG", TW: "TPE",
    LA: "VTE", IN: "DEL", BN: "BWN", MO: "MFM",
};

const DEFAULT_ORIGIN = "RGN";

async function detectOriginAirport(): Promise<string> {
    const cached = sessionStorage.getItem("gt_detected_origin");
    if (cached && AIRPORT_MAP.has(cached)) return cached;
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4000);
    try {
        const data = await fetch("https://ipapi.co/json/", { signal: ac.signal }).then(r => r.json());
        const city = (data.city ?? "").toLowerCase().trim();
        let code = CITY_TO_AIRPORT[city];
        if (!code || !AIRPORT_MAP.has(code)) code = COUNTRY_TO_AIRPORT[data.country_code];
        if (!code || !AIRPORT_MAP.has(code)) code = DEFAULT_ORIGIN;
        sessionStorage.setItem("gt_detected_origin", code);
        return code;
    } catch { return DEFAULT_ORIGIN; }
    finally { clearTimeout(t); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RECENT SEARCHES — namespaced helpers (from V2)
// ─────────────────────────────────────────────────────────────────────────────
const LS_KEY = "gt_recent_searches"; // keep existing key — no data loss
const MAX_RECENT = 5;

interface RecentSearchRecord {
    origin: string;
    destination: string;
    departDate: string;
    returnDate: string;
    priceAtSearch: number | null;
    timestamp: number;
}

const recentSearches = {
    load(): RecentSearchRecord[] {
        try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
        catch { return []; }
    },
    save(r: RecentSearchRecord) {
        const list = recentSearches.load().filter(s => !(s.origin === r.origin && s.destination === r.destination));
        localStorage.setItem(LS_KEY, JSON.stringify([r, ...list].slice(0, MAX_RECENT)));
    },
    clear() { localStorage.removeItem(LS_KEY); },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. SCROLL LOCK — no external dependency (from V3)
// ─────────────────────────────────────────────────────────────────────────────
function useScrollLock(active: boolean) {
    useEffect(() => {
        if (!active) return;
        const prev = document.body.style.overflow;
        const prevPad = document.body.style.paddingRight;
        const scrollW = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollW}px`;
        return () => {
            document.body.style.overflow = prev;
            document.body.style.paddingRight = prevPad;
        };
    }, [active]);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. ERROR BOUNDARY (from V2)
// ─────────────────────────────────────────────────────────────────────────────
class FlightWidgetErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean; msg: string }
> {
    state = { hasError: false, msg: "" };
    static getDerivedStateFromError(e: Error) { return { hasError: true, msg: e.message }; }
    componentDidCatch(e: Error, info: ErrorInfo) {
        console.error("[FlightWidget]", e, info);
        if (typeof posthog !== "undefined" && posthog.__loaded) {
            posthog.capture("flight_widget_error", { message: e.message });
        }
    }
    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div
                role="alert"
                className="flex flex-col items-center justify-center gap-4 py-12 px-6 rounded-2xl text-center"
                style={{ background: B.glassBase, border: `1.5px solid ${B.glassBorder}` }}
            >
                <AlertTriangle className="w-10 h-10" style={{ color: B.gold }} />
                <div>
                    <p className="font-bold text-white text-lg mb-1">Widget failed to load</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{this.state.msg}</p>
                </div>
                <button
                    onClick={() => this.setState({ hasError: false, msg: "" })}
                    className="px-5 py-2 rounded-xl font-bold text-sm active:scale-[0.97] transition-all"
                    style={{ background: B.gold, color: B.purpleDeep }}
                >
                    Retry
                </button>
            </div>
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. PAX STEPPER — memoized (from V3)
// ─────────────────────────────────────────────────────────────────────────────
const PaxStepper = memo(function PaxStepper({
    label, sub, value, min, max, onChange,
}: {
    label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
    const dec = useCallback(() => onChange(clamp(value - 1, min, max)), [value, min, max, onChange]);
    const inc = useCallback(() => onChange(clamp(value + 1, min, max)), [value, min, max, onChange]);

    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-bold" style={{ color: B.text }}>{label}</div>
                <div className="text-xs" style={{ color: B.textMuted }}>{sub}</div>
            </div>
            <div role="group" aria-label={label} className="flex items-center gap-2">
                <button
                    type="button" onClick={dec} disabled={value <= min}
                    aria-label={`Decrease ${label}, current ${value}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40"
                    style={{ borderColor: "rgba(91,14,166,0.2)", color: B.purple }}
                >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="w-8 text-center text-sm font-black" style={{ color: B.text }} aria-live="polite" aria-atomic="true">
                    {value}
                </span>
                <button
                    type="button" onClick={inc} disabled={value >= max}
                    aria-label={`Increase ${label}, current ${value}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-40"
                    style={{ borderColor: "rgba(91,14,166,0.2)", color: B.purple }}
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// 10B. AIRPORT COMBOBOX — autocomplete search (replaces <select>)
// ─────────────────────────────────────────────────────────────────────────────
const AirportCombobox = memo(function AirportCombobox({
    value,
    onChange,
    label,
    airports,
}: {
    value: string;
    onChange: (code: string) => void;
    label: string;
    airports: readonly Airport[] | Airport[];
}) {
    const selected = AIRPORT_MAP.get(value);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [focusIdx, setFocusIdx] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter airports
    const results = useMemo(() => {
        if (!query || query.length < 1) return [];
        const q = query.toLowerCase();
        return (airports as Airport[]).filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.code.toLowerCase().includes(q) ||
            a.country.toLowerCase().includes(q)
        ).slice(0, 8);
    }, [query, airports]);

    // Click outside
    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const select = useCallback((code: string) => {
        onChange(code);
        setOpen(false);
        setQuery("");
        setFocusIdx(-1);
    }, [onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusIdx(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusIdx(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            select(results[focusIdx >= 0 ? focusIdx : 0].code);
        } else if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
        }
    }, [results, focusIdx, select]);

    const displayText = selected ? selected.name.split("(")[0].trim() : value;
    const flag = selected ? COUNTRY_FLAGS[selected.country] ?? "" : "";

    return (
        <div ref={ref} className="relative flex-1 min-w-0">
            {!open ? (
                // Display mode — clickable to open
                <button
                    type="button"
                    onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="w-full text-left bg-transparent font-bold text-white text-sm outline-none cursor-pointer truncate leading-snug"
                    aria-label={`${label}: ${displayText}`}
                >
                    {flag && <span className="mr-1">{flag}</span>}
                    {displayText}
                </button>
            ) : (
                // Search mode
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setFocusIdx(-1); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type city or code…"
                    autoComplete="off"
                    className="w-full bg-transparent font-bold text-white text-sm outline-none placeholder:text-white/40 leading-snug"
                    aria-label={`Search ${label} airport`}
                    aria-expanded={results.length > 0}
                    role="combobox"
                    aria-autocomplete="list"
                />
            )}

            {/* Dropdown results */}
            {open && results.length > 0 && (
                <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] min-w-[240px]"
                    role="listbox"
                >
                    {results.map((a, i) => {
                        const isActive = i === focusIdx;
                        return (
                            <button
                                key={`${a.code}-${a.name}`}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() => select(a.code)}
                                onMouseEnter={() => setFocusIdx(i)}
                                className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 border-b border-gray-50 transition-colors ${isActive ? "bg-purple-50" : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                        {COUNTRY_FLAGS[a.country] ?? ""} {a.name.split("(")[0].trim()}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">{a.country}</div>
                                </div>
                                <span
                                    className="shrink-0 px-2 py-0.5 rounded text-xs font-bold font-mono"
                                    style={{ background: "rgba(91,14,166,0.1)", color: B.purple }}
                                >
                                    {a.code}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. MEMOIZED PRICE CALENDAR (from V3)
// ─────────────────────────────────────────────────────────────────────────────
const MemoizedPriceCalendar = memo(PriceCalendar, (prev, next) =>
    prev.origin === next.origin &&
    prev.destination === next.destination &&
    prev.calendarMode === next.calendarMode &&
    prev.selectedDepart?.getTime() === next.selectedDepart?.getTime() &&
    prev.selectedReturn?.getTime() === next.selectedReturn?.getTime()
);

// ─────────────────────────────────────────────────────────────────────────────
// 12. RECENT SEARCHES PANEL — memoized (from V1 glassmorphism + V3 ARIA)
// ─────────────────────────────────────────────────────────────────────────────
const RecentSearchesPanel = memo(function RecentSearchesPanel({
    onReSearch,
}: {
    onReSearch: (s: RecentSearchRecord) => void;
}) {
    const [searches, setSearches] = useState<RecentSearchRecord[]>([]);

    useEffect(() => setSearches(recentSearches.load()), []);

    // Live price lookup: fetch from API for each unique origin
    const currentPrices = useLivePriceMap(
        searches.map(s => ({ origin: s.origin, destination: s.destination }))
    );

    const handleClear = useCallback(() => {
        recentSearches.clear();
        setSearches([]);
    }, []);

    if (searches.length === 0) return null;

    const getAirportName = (code: string) => {
        const a = AIRPORT_MAP.get(code);
        return a ? a.name.split("(")[0].trim() : code;
    };

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
                {searches.slice(0, 3).map((s, i) => {
                    const routeKey = `${s.origin}-${s.destination}`;
                    const currentPrice = currentPrices[routeKey] ?? null;
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
                            key={`${routeKey}-${i}`}
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

// ─────────────────────────────────────────────────────────────────────────────
// 13. MAIN WIDGET
// ─────────────────────────────────────────────────────────────────────────────
function FlightWidgetInner() {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const todayDate = useMemo(() => new Date(today + "T00:00:00"), [today]);

    // ── Shared context (write) ───────────────────────────────────────────
    const ctx = useFlightSearch();

    // ── State ───────────────────────────────────────────────────────────────
    const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
    const [destination, setDestination] = useState("SIN");
    const [departDate, setDepartDate] = useState(today);
    const [returnDate, setReturnDate] = useState("");
    const [tripType, setTripType] = useState<"return" | "one-way">("return");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [cabinClass, setCabinClass] = useState<CabinCode>("Y");
    const [detectingLocation, setDetectingLocation] = useState(true);
    const [formError, setFormError] = useState("");
    const [openPax, setOpenPax] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarMode, setCalendarMode] = useState<"depart" | "return">("depart");

    const paxTriggerRef = useRef<HTMLButtonElement>(null);
    const doneButtonRef = useRef<HTMLButtonElement>(null);
    const hasOpenedPax = useRef(false);

    // ── Sync local state → context ──────────────────────────────────────
    useEffect(() => {
        const originAirport = AIRPORT_MAP.get(origin) ?? null;
        const destAirport = AIRPORT_MAP.get(destination) ?? null;
        if (originAirport) ctx.setOrigin({ code: originAirport.code, name: originAirport.name, country: originAirport.country });
        else ctx.setOrigin(null);
        if (destAirport) ctx.setDestination({ code: destAirport.code, name: destAirport.name, country: destAirport.country });
        else ctx.setDestination(null);
        ctx.setDepartDate(departDate);
        ctx.setReturnDate(returnDate);
        ctx.setTripType(tripType);
        ctx.setAdults(adults);
        ctx.setChildCount(children);
        ctx.setInfants(infants);
        ctx.setCabinClass(cabinClass);
    }, [origin, destination, departDate, returnDate, tripType, adults, children, infants, cabinClass]);

    // (Scroll lock removed — calendar is now inline dropdown, not modal)

    // ── Geo-detect on mount (async version from V2) ─────────────────────
    useEffect(() => {
        detectOriginAirport().then(code => {
            setOrigin(code);
            // Also push to context with guard (won't overwrite if user already picked)
            const airport = AIRPORT_MAP.get(code);
            if (airport) ctx.setOriginIfEmpty({ code: airport.code, name: airport.name, country: airport.country });
            setDetectingLocation(false);
        });
    }, []);

    // ── Clamp infants ≤ adults ──────────────────────────────────────────────
    useEffect(() => { setInfants(x => Math.min(x, adults)); }, [adults]);

    // ── Close on Escape ─────────────────────────────────────────────────────
    useEffect(() => {
        const fn = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setCalendarOpen(false); setOpenPax(false); }
        };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, []);

    // ── Focus management for Pax popover ────────────────────────────────────
    useEffect(() => {
        if (!openPax) return;
        hasOpenedPax.current = true;
        let r1 = 0, r2 = 0;
        r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => doneButtonRef.current?.focus()); });
        return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }, [openPax]);

    useEffect(() => {
        if (!openPax && hasOpenedPax.current) paxTriggerRef.current?.focus();
    }, [openPax]);

    // ── Derived values ──────────────────────────────────────────────────────
    const departDateObj = useMemo(() => {
        if (!departDate) return undefined;
        const d = new Date(departDate + "T00:00:00");
        return isValid(d) ? d : undefined;
    }, [departDate]);

    const returnDateObj = useMemo(() => {
        if (!returnDate) return undefined;
        const d = new Date(returnDate + "T00:00:00");
        return isValid(d) ? d : undefined;
    }, [returnDate]);

    const cabinLabel = CABIN_OPTIONS.find(opt => opt.value === cabinClass)?.label ?? "Economy";
    const travelerLabel = formatTravelerLabel(adults, children, infants);
    const lowestPrice = usePriceHint(origin, destination, !!returnDate);

    // ── Stable callbacks (from V3 — prevents unnecessary child re-renders) ──
    const handleCalendarSelect = useCallback((date: Date | undefined) => {
        if (!date) return;
        const isoStr = format(date, "yyyy-MM-dd");
        if (calendarMode === "depart") {
            setDepartDate(isoStr);
            if (returnDate && returnDate < isoStr) setReturnDate("");
            setCalendarMode("return");
        } else {
            setReturnDate(isoStr);
            setCalendarOpen(false);
        }
    }, [calendarMode, returnDate]);

    const handleReSearch = useCallback((s: RecentSearchRecord) => {
        setOrigin(s.origin);
        setDestination(s.destination);
        setDepartDate(s.departDate);
        setReturnDate(s.returnDate);
    }, []);

    const validateSearch = useCallback((): boolean => {
        const parsed = flightSearchSchema.safeParse({
            origin, destination, departDate,
            returnDate: returnDate || undefined,
        });
        if (!parsed.success) {
            setFormError(parsed.error.issues[0]?.message || "Please review your inputs.");
            return false;
        }
        setFormError("");
        return true;
    }, [origin, destination, departDate, returnDate]);

    const handleSearch = useCallback(() => {
        if (!validateSearch()) return;

        recentSearches.save({
            origin, destination, departDate, returnDate,
            priceAtSearch: lowestPrice, timestamp: Date.now(),
        });

        if (posthog.__loaded) {
            posthog.capture("search_flights_clicked", { origin, destination, departDate, returnDate });
        }

        const formatDDMM = (dateStr: string) => { const [, mm, dd] = dateStr.split("-"); return dd + mm; };
        const cabinCode: Record<CabinCode, string> = { Y: "", W: "w", C: "c", F: "f" };
        let fs = `${origin}${formatDDMM(departDate)}${destination}`;
        if (returnDate) fs += formatDDMM(returnDate);
        fs += `${cabinCode[cabinClass] ?? ""}${adults}${children > 0 ? children : ""}${infants > 0 ? infants : ""}`;
        window.location.href = `/flights/results?flightSearch=${fs}`;
    }, [origin, destination, departDate, returnDate, cabinClass, adults, children, infants, lowestPrice, validateSearch]);

    const handleTripComSearch = useCallback(() => {
        if (!validateSearch()) return;

        if (posthog.__loaded) {
            posthog.capture("trip_com_clicked", { origin, destination, departDate, returnDate });
        }

        const tripParams = new URLSearchParams({
            locale: "en_US", dcity: origin, acity: destination, ddate: departDate,
            class: ({ Y: "0", W: "0", C: "1", F: "2" }[cabinClass] ?? "0"),
            quantity: String(adults + children), searchBoxArg: "t",
            Allianceid: "7796167", SID: "293794502",
        });
        if (returnDate) tripParams.set("rdate", returnDate);
        window.open(`https://www.trip.com/flights?${tripParams}`, "_blank", "noopener,noreferrer");
    }, [origin, destination, departDate, returnDate, cabinClass, adults, children, validateSearch]);

    const getSelectedCountry = useCallback(() => {
        return AIRPORT_MAP.get(destination)?.country ?? "Asia";
    }, [destination]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div id="mainWidget" className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="flex flex-col w-full">

                {/* ═══ TRIP TYPE TOGGLE ═════════════════════════════════════ */}
                <div className="flex gap-2 mb-3" role="radiogroup" aria-label="Trip type">
                    {(["return", "one-way"] as const).map(t => (
                        <button
                            key={t} type="button" role="radio"
                            aria-checked={tripType === t}
                            onClick={() => {
                                setTripType(t);
                                if (t === "one-way") setReturnDate("");
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tripType === t
                                ? "text-white shadow-lg"
                                : "text-white/60 hover:text-white/80"
                                }`}
                            style={tripType === t
                                ? { background: "rgba(255,255,255,0.18)", border: `1.5px solid rgba(255,255,255,0.35)` }
                                : { background: "transparent", border: `1.5px solid rgba(255,255,255,0.12)` }
                            }
                        >
                            {t === "return" ? "↔ Return" : "→ One-way"}
                        </button>
                    ))}
                </div>

                {/* ═══ INPUT GRID ════════════════════════════════════════════ */}
                <div
                    role="group" aria-label="Flight search fields"
                    className={`grid grid-cols-1 sm:grid-cols-2 ${tripType === "one-way"
                        ? "lg:grid-cols-5"
                        : "lg:grid-cols-6"
                        } flex-1 rounded-xl lg:rounded-2xl overflow-hidden`}
                    style={{ background: B.glassBase, border: `1.5px solid ${B.glassBorder}` }}
                >

                    {/* ── FROM ── */}
                    <div className="relative transition-colors" style={cellBorder}>
                        <div className="flex items-center px-4 py-3 h-full min-h-[64px]">
                            <MapPin
                                className={`w-4 h-4 mr-3 shrink-0 ${detectingLocation ? "animate-pulse" : ""}`}
                                style={{ color: detectingLocation ? B.gold : "rgba(255,255,255,0.45)" }}
                                aria-hidden="true"
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                                <span style={labelStyle}>
                                    {detectingLocation ? "Detecting…" : "From"}
                                </span>
                                <AirportCombobox
                                    value={origin}
                                    onChange={setOrigin}
                                    label="From"
                                    airports={AIRPORTS}
                                />
                            </div>
                        </div>
                        {/* Swap Button — centered between FROM & TO on both layouts */}
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); const tmp = origin; setOrigin(destination); setDestination(tmp); }}
                            className="absolute z-10 w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-all
                                       left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2
                                       sm:left-auto sm:translate-x-1/2 sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto"
                            style={{ background: "rgba(255,255,255,0.12)", border: `1.5px solid rgba(255,255,255,0.25)` }}
                            aria-label="Swap origin and destination"
                            title="Swap airports"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-white sm:rotate-0 rotate-90" aria-hidden="true" />
                        </button>
                    </div>

                    {/* ── TO ── */}
                    <div className="relative transition-colors" style={cellBorder}>
                        <div className="flex items-center px-4 py-3 h-full min-h-[64px]">
                            <Plane className="w-4 h-4 mr-3 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                            <div className="flex flex-col min-w-0 flex-1">
                                <span style={labelStyle}>To</span>
                                <AirportCombobox
                                    value={destination}
                                    onChange={setDestination}
                                    label="To"
                                    airports={AIRPORTS}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── DEPART ── */}
                    <button
                        type="button"
                        onClick={() => { setCalendarMode("depart"); setCalendarOpen(true); }}
                        aria-label={`Departure date${departDate ? `: ${fmtDisplayDate(departDate)}` : ", not selected"}`}
                        aria-haspopup="dialog"
                        aria-pressed={calendarOpen && calendarMode === "depart"}
                        className="w-full h-full transition-colors text-left outline-none"
                        style={{ ...cellBorder, ...(calendarOpen && calendarMode === "depart" ? cellFocus : {}) }}
                    >
                        <div className="flex items-center px-3 py-3 h-full min-h-[64px]">
                            <CalendarIcon className="w-4 h-4 mr-2 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                            <div className="flex flex-col min-w-0 flex-1">
                                <span style={labelStyle}>Depart</span>
                                <span className="font-bold text-white text-sm leading-snug truncate">
                                    {departDate ? fmtDisplayDate(departDate) : "Select date"}
                                </span>
                            </div>
                        </div>
                    </button>

                    {/* ── RETURN (hidden in one-way) ── */}
                    {tripType === "return" && (
                        <button
                            type="button"
                            onClick={() => { setCalendarMode("return"); setCalendarOpen(true); }}
                            aria-label={`Return date${returnDate ? `: ${fmtDisplayDate(returnDate)}` : ", not selected. Optional"}`}
                            aria-haspopup="dialog"
                            aria-pressed={calendarOpen && calendarMode === "return"}
                            className="w-full h-full transition-colors text-left outline-none"
                            style={{ ...cellBorder, ...(calendarOpen && calendarMode === "return" ? cellFocus : {}) }}
                        >
                            <div className="flex items-center px-3 py-3 h-full min-h-[64px]">
                                <ArrowRightLeft
                                    className="w-4 h-4 mr-2 shrink-0"
                                    style={{ color: returnDate ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}
                                    aria-hidden="true"
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span style={labelStyle}>Return</span>
                                    <span className="font-bold text-sm leading-snug truncate" style={{ color: returnDate ? B.white : "rgba(255,255,255,0.4)" }}>
                                        {returnDate ? fmtDisplayDate(returnDate) : "Add return"}
                                    </span>
                                </div>
                                {returnDate && (
                                    <span
                                        role="button" tabIndex={0}
                                        onClick={e => { e.stopPropagation(); setReturnDate(""); }}
                                        onKeyDown={e => e.key === "Enter" && (e.stopPropagation(), setReturnDate(""))}
                                        aria-label="Remove return date"
                                        className="ml-1 p-0.5 rounded-full transition-colors shrink-0 cursor-pointer"
                                        style={{ color: "rgba(255,255,255,0.5)" }}
                                    >
                                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                                    </span>
                                )}
                            </div>
                        </button>
                    )}

                    {/* ── TRAVELERS & CLASS ── */}
                    <div className="relative transition-colors" style={cellBorder}>
                        <Popover open={openPax} onOpenChange={setOpenPax}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    ref={paxTriggerRef}
                                    aria-label={`Travelers and cabin class: ${travelerLabel}, ${cabinLabel}`}
                                    aria-haspopup="dialog"
                                    aria-expanded={openPax}
                                    className="w-full h-full min-h-[64px] px-4 py-3 flex items-center transition-colors text-left outline-none"
                                    style={openPax ? cellFocus : {}}
                                >
                                    <Users className="w-4 h-4 mr-2.5 shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span style={labelStyle}>Travelers &amp; Class</span>
                                        <span className="font-bold text-white text-sm leading-snug truncate">{travelerLabel}, {cabinLabel}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 ml-2 shrink-0 transition-transform ${openPax ? "rotate-180" : ""}`} style={{ color: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent
                                align="end" sideOffset={8}
                                role="dialog" aria-label="Select passengers and cabin class"
                                className="w-[300px] p-5 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-black" style={{ color: B.text }}>Passengers</span>
                                    <button type="button" onClick={() => setOpenPax(false)} aria-label="Close passenger selector"
                                        className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">Close</button>
                                </div>
                                <div className="space-y-3">
                                    <PaxStepper label="Adults" sub="12+" value={adults} min={1} max={9} onChange={setAdults} />
                                    <PaxStepper label="Children" sub="2–11" value={children} min={0} max={8} onChange={setChildren} />
                                    <PaxStepper label="Infants" sub="Under 2" value={infants} min={0} max={adults} onChange={setInfants} />

                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Armchair className="w-4 h-4" style={{ color: B.purple }} aria-hidden="true" />
                                            <span className="text-sm font-black" style={{ color: B.text }}>Cabin class</span>
                                        </div>
                                        <div role="radiogroup" aria-label="Cabin class" className="grid grid-cols-2 gap-2">
                                            {CABIN_OPTIONS.map(opt => {
                                                const active = opt.value === cabinClass;
                                                return (
                                                    <button
                                                        key={opt.value} type="button" role="radio" aria-checked={active}
                                                        onClick={() => setCabinClass(opt.value)}
                                                        className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${active ? "border-transparent text-white" : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                                                            }`}
                                                        style={active ? { background: B.purple, boxShadow: `0 3px 10px rgba(91,14,166,0.3)` } : {}}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button
                                            ref={doneButtonRef} type="button" onClick={() => setOpenPax(false)}
                                            className="px-5 py-2 rounded-xl font-bold text-sm text-white"
                                            style={{ background: B.purple, boxShadow: `0 3px 10px rgba(91,14,166,0.25)` }}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* ── SEARCH BUTTON ── */}
                    <div className="lg:col-span-1 flex items-stretch">
                        <button
                            onClick={handleSearch}
                            aria-label="Search for flights"
                            className="w-full active:scale-[0.97] font-bold py-3.5 lg:py-5 px-6 rounded-xl lg:rounded-l-none lg:rounded-r-2xl transition-all flex items-center justify-center gap-2 text-base lg:text-lg"
                            style={{ background: B.gold, color: B.purpleDeep, boxShadow: "0 4px 18px rgba(245,197,24,0.4)" }}
                        >
                            <Search className="w-5 h-5" aria-hidden="true" />
                            Search Flights
                        </button>
                    </div>
                </div>

                {/* ═══ CALENDAR DROPDOWN (Cheapflights style) ════════════ */}
                {calendarOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-30"
                            onClick={() => setCalendarOpen(false)}
                            aria-hidden="true"
                        />
                        <div
                            role="dialog" aria-modal="true"
                            aria-label={`Select ${calendarMode === "depart" ? "departure" : "return"} date`}
                            className="relative z-40 flex justify-center mt-2"
                        >
                            <div
                                className="bg-white rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 w-full max-w-[740px]"
                                style={{ border: `1.5px solid rgba(91,14,166,0.10)` }}
                            >
                                {/* Tab bar */}
                                <div role="tablist" aria-label="Select departure or return date" className="flex gap-2 mb-4">
                                    {(["depart", "return"] as const).map(m => (
                                        <button
                                            key={m} type="button" role="tab" aria-selected={calendarMode === m}
                                            onClick={() => setCalendarMode(m)}
                                            className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
                                            style={calendarMode === m
                                                ? { background: B.purple, color: B.white, boxShadow: `0 2px 8px rgba(91,14,166,0.3)` }
                                                : { background: "#f3f4f6", color: "#4b5563" }}
                                        >
                                            {m === "depart" ? "Departure" : "Return"}
                                        </button>
                                    ))}
                                    {calendarMode === "return" && (
                                        <button
                                            type="button"
                                            onClick={() => { setReturnDate(""); setCalendarOpen(false); }}
                                            className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
                                        >
                                            Skip return
                                        </button>
                                    )}
                                </div>
                                <MemoizedPriceCalendar
                                    origin={origin}
                                    destination={destination}
                                    calendarMode={calendarMode}
                                    selectedDepart={departDateObj}
                                    selectedReturn={returnDateObj}
                                    onSelectDate={handleCalendarSelect}
                                    todayDate={todayDate}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* ═══ ACTION ROW ═══════════════════════════════════════════ */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 w-full">
                    <div className="flex-1">
                        {lowestPrice ? (
                            <div
                                className="animate-in fade-in slide-in-from-left-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#a0f0b0" }}
                                aria-label={`Cheapest flight from $${lowestPrice}`}
                                aria-live="polite"
                            >
                                <span className="relative flex h-2 w-2" aria-hidden="true">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="text-sm font-bold">Cheapest from ${lowestPrice} ({formatTHB(lowestPrice)})</span>
                            </div>
                        ) : (
                            <div className="h-8 w-56 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }} aria-hidden="true" />
                        )}
                    </div>
                    <button
                        onClick={handleTripComSearch}
                        aria-label={`Compare prices on Trip.com for ${getSelectedCountry()}`}
                        className="w-full md:w-auto active:scale-[0.97] font-bold py-3.5 px-7 rounded-2xl text-base transition-all flex items-center justify-center gap-3"
                        style={{ background: "rgba(245,197,24,0.15)", color: B.gold, border: "1.5px solid rgba(245,197,24,0.35)" }}
                    >
                        <ExternalLink className="w-5 h-5" aria-hidden="true" />
                        Compare on Trip.com
                    </button>
                </div>

                {/* ═══ FORM ERROR ═══════════════════════════════════════════ */}
                <p className="mt-2 min-h-5 text-sm font-medium" style={{ color: B.error }} role="alert" aria-live="polite">{formError}</p>

                {/* ═══ RECENT SEARCHES ══════════════════════════════════════ */}
                <RecentSearchesPanel onReSearch={handleReSearch} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. EXPORT — Error Boundary wraps everything
// ─────────────────────────────────────────────────────────────────────────────
export default function FlightWidget() {
    return (
        <FlightWidgetErrorBoundary>
            <FlightWidgetInner />
        </FlightWidgetErrorBoundary>
    );
}
