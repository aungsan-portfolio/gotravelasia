import { useEffect, useMemo, useRef, useState } from "react";
import {
    Plane,
    Calendar,
    MapPin,
    Users,
    ArrowRightLeft,
    Armchair,
    ChevronDown,
    Minus,
    Plus,
} from "lucide-react";

// --- CONFIG DATA ---
const MARKER_ID = "697202";

const AIRPORTS = [
    // 🇲🇲 Myanmar (Origin/Return Hubs) - Pinned to Top
    { code: "RGN", name: "Yangon (ရန်ကုန်)", country: "Myanmar" },
    { code: "MDL", name: "Mandalay (မန္တလေး)", country: "Myanmar" },

    // 🇹🇭 Thailand (Top Volume)
    { code: "BKK", name: "Bangkok (Suvarnabhumi)", country: "Thailand" },
    { code: "DMK", name: "Bangkok (Don Mueang)", country: "Thailand" },
    { code: "CNX", name: "Chiang Mai", country: "Thailand" },
    { code: "HKT", name: "Phuket", country: "Thailand" },

    // 🇸🇬 Singapore (High Value)
    { code: "SIN", name: "Singapore", country: "Singapore" },

    // 🇲🇾 Malaysia (Family/Business)
    { code: "KUL", name: "Kuala Lumpur", country: "Malaysia" },

    // 🇻🇳 Vietnam (Trending)
    { code: "SGN", name: "Ho Chi Minh", country: "Vietnam" },
    { code: "HAN", name: "Hanoi", country: "Vietnam" },

    // 🇰🇭 Cambodia (Niche/Direct)
    { code: "PNH", name: "Phnom Penh", country: "Cambodia" },
    { code: "REP", name: "Siem Reap", country: "Cambodia" },
] as const;

type Airport = (typeof AIRPORTS)[number];

const COUNTRY_FLAGS: Record<string, string> = {
    Myanmar: "🇲🇲",
    Thailand: "🇹🇭",
    Singapore: "🇸🇬",
    Malaysia: "🇲🇾",
    Vietnam: "🇻🇳",
    Cambodia: "🇰🇭",
};

// Dynamic grouping by country for <optgroup>
const DESTINATION_GROUPS = AIRPORTS.reduce<
    { key: string; label: string; options: Airport[] }[]
>((acc, airport) => {
    const existing = acc.find((g) => g.key === airport.country);
    if (existing) {
        existing.options.push(airport);
    } else {
        acc.push({
            key: airport.country,
            label: `${COUNTRY_FLAGS[airport.country] || ""} ${airport.country}`,
            options: [airport],
        });
    }
    return acc;
}, []);

const CABIN_OPTIONS = [
    { value: "Y", label: "Economy" },
    { value: "W", label: "Premium Eco" },
    { value: "C", label: "Business" },
    { value: "F", label: "First Class" },
] as const;

// Aviasales trip_class mapping: 0=Economy, 1=Business, 2=First
const CABIN_TO_TRIP_CLASS: Record<string, string> = {
    Y: "0",
    W: "0",
    C: "1",
    F: "2",
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function formatTravelerLabel(
    adults: number,
    children: number,
    infants: number
) {
    const total = adults + children + infants;
    return total === 1 ? "1 Traveler" : `${total} Travelers`;
}

export default function FlightWidget() {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const [origin, setOrigin] = useState("RGN");
    const [destination, setDestination] = useState("BKK");
    const [departDate, setDepartDate] = useState(today);
    const [returnDate, setReturnDate] = useState("");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [cabinClass, setCabinClass] = useState("Y");
    const [priceHint, setPriceHint] = useState("Check rates");
    const [openPax, setOpenPax] = useState(false);

    const popoverRef = useRef<HTMLDivElement | null>(null);
    const paxTriggerRef = useRef<HTMLButtonElement>(null);
    const doneButtonRef = useRef<HTMLButtonElement>(null);
    const hasOpenedPax = useRef(false);

    const cabinLabel =
        CABIN_OPTIONS.find((opt) => opt.value === cabinClass)?.label || "Economy";
    const travelerLabel = formatTravelerLabel(adults, children, infants);

    // Clamp infants ≤ adults
    useEffect(() => {
        setInfants((x) => Math.min(x, adults));
    }, [adults]);

    // Close popover on outside click + Escape
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!openPax) return;
            const el = popoverRef.current;
            if (!el) return;
            if (e.target instanceof Node && !el.contains(e.target)) {
                setOpenPax(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpenPax(false);
        }
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [openPax]);

    // Focus Done button when popover opens (RAF for reliable post-paint focus)
    useEffect(() => {
        if (!openPax) return;
        hasOpenedPax.current = true;

        let raf1 = 0;
        let raf2 = 0;
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                doneButtonRef.current?.focus();
            });
        });
        return () => {
            if (raf1) cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);
        };
    }, [openPax]);

    // Restore focus to trigger when popover closes (skip initial mount)
    useEffect(() => {
        if (openPax) return;
        if (!hasOpenedPax.current) return;
        paxTriggerRef.current?.focus();
    }, [openPax]);

    // Price hint from bot data
    useEffect(() => {
        fetch("/data/flight_data.json")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load flight_data.json");
                return res.json();
            })
            .then((data) => {
                const foundDeal = data.routes?.find(
                    (d: { origin?: string; destination?: string }) =>
                        d.origin === origin && d.destination === destination
                ) as { price?: number } | undefined;

                if (foundDeal && typeof foundDeal.price === "number") {
                    setPriceHint(`From $${foundDeal.price}`);
                } else {
                    setPriceHint("Check rates");
                }
            })
            .catch(() => setPriceHint("Check rates"));
    }, [origin, destination]);

    const getSelectedCountry = () => {
        const found = AIRPORTS.find((a) => a.code === destination);
        return found ? found.country : "Asia";
    };

    const handleSearch = () => {
        if (origin === destination) {
            alert("Origin and destination cannot be the same");
            return;
        }
        if (!departDate) {
            alert("Please select a departure date");
            return;
        }
        if (returnDate && returnDate < departDate) {
            alert("Return date must be after departure date");
            return;
        }

        const params = new URLSearchParams({
            origin_iata: origin,
            destination_iata: destination,
            depart_date: departDate,
            one_way: returnDate ? "false" : "true",
            adults: String(adults),
            children: String(children),
            infants: String(infants),
            trip_class: CABIN_TO_TRIP_CLASS[cabinClass] || "0",
            locale: "en",
            currency: "USD",
        });
        if (returnDate) {
            params.set("return_date", returnDate);
        }
        const targetUrl = `https://www.aviasales.com/search?${params.toString()}`;
        const tpUrl = `https://tp.media/r?marker=${MARKER_ID}&p=4114&u=${encodeURIComponent(targetUrl)}`;
        window.open(tpUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-4 md:p-6 border border-gray-100">
            {/* ROW 1: ROUTE & DATES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
                        From
                    </label>
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent group-hover:border-gray-300 transition-all">
                        <MapPin className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
                        <select
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className="w-full bg-transparent font-bold text-gray-700 outline-none appearance-none cursor-pointer truncate"
                        >
                            {AIRPORTS.map((city) => (
                                <option key={city.code} value={city.code}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
                        To
                    </label>
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent group-hover:border-gray-300 transition-all">
                        <Plane className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
                        <select
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full bg-transparent font-bold text-gray-700 outline-none appearance-none cursor-pointer truncate"
                        >
                            {DESTINATION_GROUPS.map((group) => (
                                <optgroup key={group.key} label={group.label}>
                                    {group.options.map((dest) => (
                                        <option key={dest.code} value={dest.code}>
                                            {dest.name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
                        Depart
                    </label>
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent group-hover:border-gray-300 transition-all">
                        <Calendar className="w-5 h-5 text-gray-500 mr-3 shrink-0" />
                        <input
                            type="date"
                            value={departDate}
                            min={today}
                            onChange={(e) => setDepartDate(e.target.value)}
                            className="w-full bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
                        />
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block flex justify-between">
                        <span>Return</span>
                        <span className="text-[10px] text-gray-300 font-normal normal-case self-end">
                            (Optional)
                        </span>
                    </label>
                    <div
                        className={`flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent transition-all ${returnDate
                                ? "border-gray-300 bg-gray-50"
                                : "group-hover:border-gray-300"
                            }`}
                    >
                        <ArrowRightLeft
                            className={`w-5 h-5 mr-3 shrink-0 ${returnDate ? "text-gray-600" : "text-gray-400"
                                }`}
                        />
                        <input
                            type="date"
                            value={returnDate}
                            min={departDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className={`w-full bg-transparent font-bold outline-none cursor-pointer ${returnDate ? "text-gray-700" : "text-gray-400"
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* ROW 2: TRAVELERS & CLASS (popover) */}
            <div className="mb-6 relative" ref={popoverRef}>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">
                    Travelers & Class
                </label>

                <button
                    ref={paxTriggerRef}
                    type="button"
                    aria-expanded={openPax}
                    aria-controls="pax-panel"
                    onClick={() => setOpenPax((v) => !v)}
                    className="w-full flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-transparent hover:border-gray-300 transition-all"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <Users className="w-5 h-5 text-gray-600 shrink-0" />
                        <span className="font-bold text-gray-800 truncate">
                            {travelerLabel}, {cabinLabel}
                        </span>
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform ${openPax ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {/* Popover panel */}
                {openPax && (
                    <div
                        id="pax-panel"
                        role="dialog"
                        aria-modal="false"
                        className="absolute z-50 mt-2 w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-4 max-h-[70vh] overflow-auto animate-in fade-in zoom-in-95"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-black text-gray-900">
                                Passengers
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpenPax(false)}
                                className="text-xs font-bold text-gray-500 hover:text-gray-800"
                            >
                                Close
                            </button>
                        </div>

                        <div className="space-y-3">
                            <PaxStepper
                                label="Adults"
                                sub="12+"
                                value={adults}
                                min={1}
                                max={9}
                                onChange={setAdults}
                            />
                            <PaxStepper
                                label="Children"
                                sub="2–11"
                                value={children}
                                min={0}
                                max={8}
                                onChange={setChildren}
                            />
                            <PaxStepper
                                label="Infants"
                                sub="Under 2"
                                value={infants}
                                min={0}
                                max={adults}
                                onChange={setInfants}
                            />

                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Armchair className="w-4 h-4 text-gray-600" />
                                    <div className="text-sm font-black text-gray-900">
                                        Cabin class
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {CABIN_OPTIONS.map((opt) => {
                                        const active = opt.value === cabinClass;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setCabinClass(opt.value)}
                                                className={[
                                                    "px-3 py-2 rounded-xl text-sm font-bold border transition",
                                                    active
                                                        ? "border-gray-900 bg-gray-900 text-white"
                                                        : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
                                                ].join(" ")}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end pt-3">
                                <button
                                    ref={doneButtonRef}
                                    type="button"
                                    onClick={() => setOpenPax(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION AREA */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                {/* Price Hint from Bot Data */}
                <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 w-full md:w-auto justify-center md:justify-start">
                    <div className="relative flex h-3 w-3">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase leading-none">
                            Best Price Estimate
                        </span>
                        <span className="text-sm font-black text-emerald-800 leading-tight">
                            {priceHint}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    aria-label={`Search ${returnDate ? "round-trip" : "one-way"} ${cabinLabel} flights to ${getSelectedCountry()}`}
                    className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
                >
                    <Plane className="w-5 h-5 fill-current group-hover:rotate-45 transition-transform duration-300" />
                    <span>
                        Search {returnDate ? "Round-trip" : "One-way"} in {cabinLabel} to{" "}
                        {getSelectedCountry()}
                    </span>
                </button>
            </div>
        </div>
    );
}

/* ── PaxStepper sub-component ── */
function PaxStepper({
    label,
    sub,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    sub: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <div className="text-sm font-bold text-gray-800">{label}</div>
                <div className="text-xs text-gray-500">{sub}</div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(clamp(value - 1, min, max))}
                    disabled={value <= min}
                    aria-label={`Decrease ${label}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                    <Minus className="h-4 w-4" />
                </button>

                <div className="w-8 text-center text-sm font-black text-gray-900">
                    {value}
                </div>

                <button
                    type="button"
                    onClick={() => onChange(clamp(value + 1, min, max))}
                    disabled={value >= max}
                    aria-label={`Increase ${label}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
