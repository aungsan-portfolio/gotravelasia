import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
} from "lucide-react";
import { format, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

/* ─── THB Converter Helper ─── */
const USD_TO_THB_RATE = 34; // Static conversion rate
const formatTHB = (usdPrice: number) => {
    const thbPrice = Math.round(usdPrice * USD_TO_THB_RATE);
    return `฿${thbPrice.toLocaleString()}`;
};

/* ─── Recent Searches (localStorage) ─── */
const LS_KEY = "gt_recent_searches";
const MAX_RECENT = 5;

interface RecentSearchRecord {
    origin: string;
    destination: string;
    departDate: string;
    returnDate: string;
    priceAtSearch: number | null; // USD price when user searched
    timestamp: number;
}

function loadRecentSearches(): RecentSearchRecord[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveRecentSearch(record: RecentSearchRecord) {
    const existing = loadRecentSearches();
    // Remove duplicate route
    const filtered = existing.filter(
        (s) => !(s.origin === record.origin && s.destination === record.destination)
    );
    // Prepend new, cap at MAX_RECENT
    const updated = [record, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
    localStorage.removeItem(LS_KEY);
}

export default function FlightWidget() {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const todayDate = useMemo(() => new Date(today + "T00:00:00"), [today]);
    const [origin, setOrigin] = useState("RGN");
    const [destination, setDestination] = useState("BKK");
    const [departDate, setDepartDate] = useState(today);
    const [returnDate, setReturnDate] = useState("");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [cabinClass, setCabinClass] = useState("Y");
    const [lowestPrice, setLowestPrice] = useState<number | null>(null);
    const [openPax, setOpenPax] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarMode, setCalendarMode] = useState<"depart" | "return">("depart");

    // Parse YYYY-MM-DD string to Date object
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

    // Format date for display
    const formatDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr + "T00:00:00");
        return isValid(d) ? format(d, "EEE, MMM d") : dateStr;
    };

    const handleCalendarSelect = (date: Date | undefined) => {
        if (!date) return;
        const isoStr = format(date, "yyyy-MM-dd");
        if (calendarMode === "depart") {
            setDepartDate(isoStr);
            // If return date exists and is before new depart, clear it
            if (returnDate && returnDate < isoStr) {
                setReturnDate("");
            }
            // Auto-advance to return date selection
            setCalendarMode("return");
        } else {
            setReturnDate(isoStr);
            setCalendarOpen(false);
        }
    };

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
            setLowestPrice(null);
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
                    setLowestPrice(route.price);
                } else {
                    setLowestPrice(null);
                }
            })
            .catch((err) => {
                console.error("Error fetching price hints:", err);
                setLowestPrice(null);
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

        // Save to recent searches
        saveRecentSearch({
            origin,
            destination,
            departDate,
            returnDate,
            priceAtSearch: lowestPrice,
            timestamp: Date.now(),
        });

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
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <div className="flex flex-col sm:flex-row flex-[1.6] border-b lg:border-b-0 lg:border-r border-gray-200">
                            {/* Depart trigger */}
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => { setCalendarMode("depart"); setCalendarOpen(true); }}
                                    className={`relative flex-1 min-w-[130px] border-b sm:border-b-0 sm:border-r border-gray-200 group hover:bg-gray-50 transition-colors text-left ${calendarOpen && calendarMode === "depart" ? "bg-blue-50 ring-2 ring-blue-400 ring-inset" : ""
                                        }`}
                                >
                                    <div className="flex items-center px-3 py-2.5 h-full">
                                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-1.5 shrink-0" />
                                        <div className="flex flex-col w-full overflow-hidden">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Depart</span>
                                            <span className="font-bold text-gray-900 text-sm truncate">
                                                {departDate ? formatDisplay(departDate) : "Select date"}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            </PopoverTrigger>

                            {/* Return trigger */}
                            <button
                                type="button"
                                onClick={() => { setCalendarMode("return"); setCalendarOpen(true); }}
                                className={`relative flex-1 min-w-[130px] group hover:bg-gray-50 transition-colors text-left ${calendarOpen && calendarMode === "return" ? "bg-blue-50 ring-2 ring-blue-400 ring-inset" : ""
                                    }`}
                            >
                                <div className="flex items-center px-3 py-2.5 h-full">
                                    <ArrowRightLeft className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${returnDate ? "text-gray-500" : "text-gray-300"}`} />
                                    <div className="flex flex-col w-full overflow-hidden">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex justify-between">
                                            Return <span className="text-[9px] text-gray-400 font-normal normal-case hidden xl:inline">(Optional)</span>
                                        </span>
                                        <span className={`font-bold text-sm truncate ${returnDate ? "text-gray-900" : "text-gray-400"}`}>
                                            {returnDate ? formatDisplay(returnDate) : "Add return"}
                                        </span>
                                    </div>
                                    {returnDate && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setReturnDate(""); }}
                                            className="ml-1 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                            aria-label="Clear return date"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Calendar Popover */}
                        <PopoverContent
                            className="w-auto p-0 shadow-2xl border border-gray-200 rounded-2xl"
                            align="center"
                            sideOffset={8}
                        >
                            <div className="p-4">
                                {/* Mode tabs */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setCalendarMode("depart")}
                                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${calendarMode === "depart"
                                            ? "bg-gray-900 text-white shadow-md"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        Departure{departDate ? ` · ${formatDisplay(departDate)}` : ""}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCalendarMode("return")}
                                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${calendarMode === "return"
                                            ? "bg-gray-900 text-white shadow-md"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        Return{returnDate ? ` · ${formatDisplay(returnDate)}` : ""}
                                    </button>
                                </div>

                                <Calendar
                                    mode="single"
                                    numberOfMonths={typeof window !== "undefined" && window.innerWidth < 640 ? 1 : 2}
                                    selected={calendarMode === "depart" ? departDateObj : returnDateObj}
                                    onSelect={handleCalendarSelect}
                                    defaultMonth={calendarMode === "depart" ? (departDateObj || todayDate) : (returnDateObj || departDateObj || todayDate)}
                                    disabled={[
                                        { before: calendarMode === "return" && departDateObj ? departDateObj : todayDate },
                                    ]}
                                    modifiers={{
                                        departHighlight: departDateObj ? [departDateObj] : [],
                                        returnHighlight: returnDateObj ? [returnDateObj] : [],
                                    }}
                                    modifiersClassNames={{
                                        departHighlight: "!bg-blue-600 !text-white rounded-md",
                                        returnHighlight: "!bg-amber-500 !text-white rounded-md",
                                    }}
                                    className="[--cell-size:40px]"
                                />

                                {/* Quick actions */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">
                                        {calendarMode === "depart" ? "Select departure date" : "Select return date (optional)"}
                                    </span>
                                    {calendarMode === "return" && (
                                        <button
                                            type="button"
                                            onClick={() => { setReturnDate(""); setCalendarOpen(false); }}
                                            className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                                        >
                                            Skip return
                                        </button>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

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
                    {lowestPrice && !returnDate && (
                        <div className="animate-in fade-in slide-in-from-left-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl w-fit border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-bold">Cheapest from ${lowestPrice} ({formatTHB(lowestPrice)})</span>
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

            {/* Recent Searches */}
            <RecentSearches
                onReSearch={(s) => {
                    setOrigin(s.origin);
                    setDestination(s.destination);
                    setDepartDate(s.departDate);
                    setReturnDate(s.returnDate);
                }}
            />
        </div>
    );
}

/* ── RecentSearches sub-component ── */
function RecentSearches({
    onReSearch,
}: {
    onReSearch: (s: RecentSearchRecord) => void;
}) {
    const [searches, setSearches] = useState<RecentSearchRecord[]>([]);
    const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const saved = loadRecentSearches();
        setSearches(saved);
        setLoaded(true);

        // Fetch current prices
        fetch("/data/flight_data.json?v=" + Date.now())
            .then((r) => r.json())
            .then((data) => {
                const map: Record<string, number> = {};
                for (const route of data.routes || []) {
                    map[`${route.origin}-${route.destination}`] = route.price;
                }
                setCurrentPrices(map);
            })
            .catch(() => { });
    }, []);

    const handleClear = () => {
        clearRecentSearches();
        setSearches([]);
    };

    if (!loaded || searches.length === 0) return null;

    const getAirportName = (code: string) => {
        const a = AIRPORTS.find((ap) => ap.code === code);
        return a ? a.name.split("(")[0].trim() : code;
    };

    return (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-gray-900">
                    Your recent searches
                </h3>
                <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Clear
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searches.slice(0, 3).map((s, i) => {
                    const routeKey = `${s.origin}-${s.destination}`;
                    const currentPrice = currentPrices[routeKey] ?? null;
                    const savedPrice = s.priceAtSearch;

                    let priceBadge: { label: string; color: string; icon: React.ReactNode } | null = null;
                    if (currentPrice !== null && savedPrice !== null && savedPrice > 0) {
                        const diff = currentPrice - savedPrice;
                        const pct = Math.round((Math.abs(diff) / savedPrice) * 100);
                        if (diff > 0) {
                            priceBadge = {
                                label: `Price increase`,
                                color: "bg-red-100 text-red-700",
                                icon: <TrendingUp className="w-3 h-3" />,
                            };
                        } else if (diff < 0) {
                            priceBadge = {
                                label: `Price drop`,
                                color: "bg-emerald-100 text-emerald-700",
                                icon: <TrendingDown className="w-3 h-3" />,
                            };
                        }
                    }

                    const displayDate = s.departDate
                        ? (() => {
                            const d = new Date(s.departDate + "T00:00:00");
                            return isValid(d) ? format(d, "EEE d/M") : s.departDate;
                        })()
                        : "";
                    const displayReturnDate = s.returnDate
                        ? (() => {
                            const d = new Date(s.returnDate + "T00:00:00");
                            return isValid(d) ? format(d, "EEE d/M") : s.returnDate;
                        })()
                        : "";

                    return (
                        <div
                            key={`${routeKey}-${i}`}
                            className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all group"
                        >
                            {/* Route header */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <Plane className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="font-bold text-gray-900 text-sm">
                                    {s.origin} <span className="text-gray-400">▸</span> {s.destination}
                                </div>
                            </div>

                            {/* Airport names */}
                            <div className="text-xs text-gray-500 mb-2">
                                {getAirportName(s.origin)} → {getAirportName(s.destination)}
                            </div>

                            {/* Dates and trip type */}
                            <div className="text-xs text-gray-500 mb-3">
                                {displayDate}
                                {displayReturnDate ? ` ▸ ${displayReturnDate}` : ""}
                                <span className="text-gray-400 ml-1">
                                    · {s.returnDate ? "Return" : "One way"}
                                </span>
                            </div>

                            {/* Price badge */}
                            {priceBadge && (
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold mb-2 ${priceBadge.color}`}>
                                    {priceBadge.icon}
                                    {priceBadge.label}
                                </div>
                            )}

                            {/* Prices */}
                            <div className="flex items-end justify-between">
                                <div>
                                    {currentPrice !== null ? (
                                        <>
                                            <div className="text-xl font-black text-gray-900">
                                                ${currentPrice}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {formatTHB(currentPrice)}
                                            </div>
                                            {savedPrice !== null && savedPrice !== currentPrice && (
                                                <div className="text-xs text-gray-400 line-through">
                                                    Was ${savedPrice}
                                                </div>
                                            )}
                                        </>
                                    ) : savedPrice !== null ? (
                                        <>
                                            <div className="text-xl font-black text-gray-900">
                                                ${savedPrice}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {formatTHB(savedPrice)}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-gray-400">Price unavailable</div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onReSearch(s)}
                                    className="w-10 h-10 rounded-xl bg-[#FECD00] hover:bg-[#E5B800] flex items-center justify-center transition-colors shadow-sm group-hover:shadow-md"
                                    aria-label="Search again"
                                >
                                    <Search className="w-4 h-4 text-gray-900" />
                                </button>
                            </div>
                        </div>
                    );
                })}
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
