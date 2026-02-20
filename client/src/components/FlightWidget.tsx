import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
    ExternalLink,
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

    // 🇮🇩 Indonesia (SEA Hub)
    { code: "CGK", name: "Jakarta (Soekarno-Hatta)", country: "Indonesia" },
    { code: "DPS", name: "Bali (Ngurah Rai)", country: "Indonesia" },

    // 🇵🇭 Philippines (SEA Hub)
    { code: "MNL", name: "Manila (Ninoy Aquino)", country: "Philippines" },
] as const;

type Airport = (typeof AIRPORTS)[number];

const COUNTRY_FLAGS: Record<string, string> = {
    Myanmar: "🇲🇲",
    Thailand: "🇹🇭",
    Singapore: "🇸🇬",
    Malaysia: "🇲🇾",
    Vietnam: "🇻🇳",
    Cambodia: "🇰🇭",
    Indonesia: "🇮🇩",
    Philippines: "🇵🇭",
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
    const [priceHint, setPriceHint] = useState<string | null>(null);
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

    // Fetch price hints dynamically
    useEffect(() => {
        if (returnDate) {
            setPriceHint(null);
            return;
        }

        fetch("/data/flight_data.json?v=" + new Date().getTime())
            .then((res) => res.json())
            .then((data) => {
                const routes = data.routes || [];
                const route = routes.find(
                    (r: any) => r.origin === origin && r.destination === destination
                );
                if (route && route.price) {
                    setPriceHint(`From $${Math.round(route.price)}`);
                } else {
                    setPriceHint(null);
                }
            })
            .catch((err) => {
                console.error("Failed to load flight_data.json", err);
                setPriceHint(null);
            });
    }, [origin, destination, returnDate]);

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

    const handleTripComSearch = () => {
        if (origin === destination) {
            alert("Origin and destination cannot be the same");
            return;
        }
        if (!departDate) {
            alert("Please select a departure date");
            return;
        }
        // Trip.com flight affiliate deep link
        const tripParams = new URLSearchParams({
            locale: "en_US",
            dcity: origin,
            acity: destination,
            ddate: departDate,
            class: cabinClass === "C" || cabinClass === "F" ? "C" : "Y",
            quantity: String(adults + children),
            searchBoxArg: "t",
            Allianceid: "7796167",
            SID: "293794502",
        });
        if (returnDate) {
            tripParams.set("rdate", returnDate);
        }
        const tripUrl = `https://www.trip.com/flights?${tripParams.toString()}`;
        window.open(tripUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="w-full max-w-6xl mx-auto rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {/* SEARCH ROW */}
            <div className="flex flex-col lg:flex-row gap-3">

                {/* Inputs Wrapper (White bordered box) */}
                <div className="flex flex-col lg:flex-row flex-1 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200">

                    {/* Origin */}
                    <div className="relative flex-[1.2] min-w-[140px] border-b lg:border-b-0 lg:border-r border-gray-200 group hover:bg-gray-50 transition-colors">
                        <div className="flex items-center px-3 py-2.5 h-full">
                            <MapPin className="w-5 h-5 text-gray-400 mr-1.5 shrink-0" />
                            <div className="flex flex-col w-full overflow-hidden">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">From</span>
                                <select
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    className="w-full bg-transparent font-bold text-gray-900 outline-none appearance-none cursor-pointer truncate text-sm md:text-base"
                                >
                                    {AIRPORTS.map((city) => (
                                        <option key={city.code} value={city.code}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="relative flex-[1.2] min-w-[140px] border-b lg:border-b-0 lg:border-r border-gray-200 group hover:bg-gray-50 transition-colors">
                        <div className="flex items-center px-3 py-2.5 h-full">
                            <Plane className="w-5 h-5 text-gray-400 mr-1.5 shrink-0" />
                            <div className="flex flex-col w-full overflow-hidden">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">To</span>
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full bg-transparent font-bold text-gray-900 outline-none appearance-none cursor-pointer truncate text-sm md:text-base"
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
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col sm:flex-row flex-[1.6] border-b lg:border-b-0 lg:border-r border-gray-200">
                        <div className="relative flex-1 min-w-[130px] border-b sm:border-b-0 sm:border-r border-gray-200 group hover:bg-gray-50 transition-colors">
                            <div className="flex items-center px-3 py-2.5 h-full">
                                <Calendar className="w-4 h-4 text-gray-400 mr-1.5 shrink-0" />
                                <div className="flex flex-col w-full overflow-hidden">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Depart</span>
                                    <input
                                        type="date"
                                        value={departDate}
                                        min={today}
                                        onChange={(e) => setDepartDate(e.target.value)}
                                        className="w-full bg-transparent font-bold text-gray-900 outline-none cursor-pointer text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="relative flex-1 min-w-[130px] group hover:bg-gray-50 transition-colors">
                            <div className="flex items-center px-3 py-2.5 h-full">
                                <ArrowRightLeft className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${returnDate ? "text-gray-500" : "text-gray-300"}`} />
                                <div className="flex flex-col w-full overflow-hidden">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                                        Return <span className="text-[9px] text-gray-400 font-normal normal-case hidden xl:inline">(Optional)</span>
                                    </span>
                                    <input
                                        type="date"
                                        value={returnDate}
                                        min={departDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        className={`w-full bg-transparent font-bold outline-none cursor-pointer text-sm ${returnDate ? "text-gray-900" : "text-gray-400"}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Travelers & Class (Popover Trigger) */}
                    <div className="relative flex-[1.3] min-w-[150px] group hover:bg-gray-50 transition-colors rounded-b-xl lg:rounded-b-none lg:rounded-r-2xl" ref={popoverRef}>
                        <button
                            ref={paxTriggerRef}
                            type="button"
                            aria-expanded={openPax}
                            aria-controls="pax-panel"
                            onClick={() => setOpenPax((v) => !v)}
                            className="w-full h-full text-left"
                        >
                            <div className="flex items-center px-3 py-2.5 h-full">
                                <Users className="w-4 h-4 text-gray-400 mr-1.5 shrink-0" />
                                <div className="flex flex-col w-full overflow-hidden">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Travelers & Class</span>
                                    <span className="font-bold text-gray-900 truncate text-sm">
                                        {travelerLabel}, {cabinLabel}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform shrink-0 ${openPax ? "rotate-180" : ""}`} />
                            </div>
                        </button>

                        {/* Popover content */}
                        {openPax && (
                            <div
                                id="pax-panel"
                                role="dialog"
                                aria-modal="false"
                                className="absolute right-0 z-50 mt-2 w-full min-w-[300px] max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-4 max-h-[70vh] overflow-auto animate-in fade-in zoom-in-95"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-black text-gray-900">Passengers</div>
                                    <button
                                        type="button"
                                        onClick={() => setOpenPax(false)}
                                        className="text-xs font-bold text-gray-500 hover:text-gray-800"
                                    >
                                        Close
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <PaxStepper label="Adults" sub="12+" value={adults} min={1} max={9} onChange={setAdults} />
                                    <PaxStepper label="Children" sub="2–11" value={children} min={0} max={8} onChange={setChildren} />
                                    <PaxStepper label="Infants" sub="Under 2" value={infants} min={0} max={adults} onChange={setInfants} />

                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Armchair className="w-4 h-4 text-gray-600" />
                                            <div className="text-sm font-black text-gray-900">Cabin class</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CABIN_OPTIONS.map((opt) => {
                                                const active = opt.value === cabinClass;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setCabinClass(opt.value)}
                                                        className={["px-3 py-2 rounded-xl text-sm font-bold border transition", active ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"].join(" ")}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-3">
                                        <button ref={doneButtonRef} type="button" onClick={() => setOpenPax(false)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm">
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Primary Search Button Container */}
                <div className="flex shrink-0">
                    <button
                        onClick={handleSearch}
                        className="w-full lg:w-auto bg-[#FECD00] hover:bg-[#E5B800] text-gray-900 font-extrabold py-3.5 px-8 rounded-xl lg:rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg h-full"
                        aria-label="Search Flights"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* ACTION AREA & Secondary Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex-1">
                    {priceHint && !returnDate && (
                        <div className="animate-in fade-in slide-in-from-left-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl w-fit border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-bold">Cheapest {priceHint}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={handleTripComSearch}
                        aria-label={`Compare prices on Trip.com for ${getSelectedCountry()}`}
                        className="w-full md:w-auto bg-white hover:bg-blue-50 text-blue-600 font-bold py-2.5 px-6 rounded-xl border border-blue-200 hover:border-blue-400 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Compare on Trip.com</span>
                    </button>
                </div>
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
