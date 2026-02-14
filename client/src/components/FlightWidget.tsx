import { useState, useEffect } from "react";
import { Plane, Calendar, MapPin, Users, ArrowRightLeft, Armchair } from "lucide-react";

// --- 1. CONFIG DATA ---
const MARKER_ID = "697202";

// ✈️ Unified Airport List (Master Source)
// Logic: Myanmar ports first, then high-traffic SEA hubs.
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
];

// Country → Flag emoji for optgroup labels
const COUNTRY_FLAGS: Record<string, string> = {
    Myanmar: "🇲🇲", Thailand: "🇹🇭", Singapore: "🇸🇬",
    Malaysia: "🇲🇾", Vietnam: "🇻🇳", Cambodia: "🇰🇭",
};

// Dynamic grouping by country for <optgroup>
const DESTINATION_GROUPS = AIRPORTS.reduce<{ label: string; options: typeof AIRPORTS }[]>(
    (acc, airport) => {
        const existing = acc.find(g => g.label.includes(airport.country));
        if (existing) {
            existing.options.push(airport);
        } else {
            acc.push({
                label: `${COUNTRY_FLAGS[airport.country] || ""} ${airport.country}`,
                options: [airport],
            });
        }
        return acc;
    },
    []
);

const CABIN_OPTIONS = [
    { value: "Y", label: "Economy" },
    { value: "W", label: "Premium Eco" },
    { value: "C", label: "Business" },
    { value: "F", label: "First Class" }
];

// Aviasales trip_class mapping: 0=Economy, 1=Business, 2=First
const CABIN_TO_TRIP_CLASS: Record<string, string> = {
    Y: "0", W: "0", C: "1", F: "2"
};

export default function FlightWidget() {
    const [origin, setOrigin] = useState("RGN");
    const [destination, setDestination] = useState("BKK");
    const [departDate, setDepartDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnDate, setReturnDate] = useState("");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [cabinClass, setCabinClass] = useState("Y");
    const [priceHint, setPriceHint] = useState("Check rates");

    const cabinLabel = CABIN_OPTIONS.find(opt => opt.value === cabinClass)?.label || "Economy";

    // --- LOGIC: Use Bot Data (Safe & Fast) ---
    useEffect(() => {
        fetch("/data/flight_data.json")
            .then(res => res.json())
            .then(data => {
                const foundDeal = data.routes?.find((d: Record<string, unknown>) =>
                    d.origin === origin && d.destination === destination
                );

                if (foundDeal) {
                    setPriceHint(`From $${foundDeal.price}`);
                } else {
                    setPriceHint("Check rates");
                }
            })
            .catch(() => setPriceHint("Check rates"));
    }, [origin, destination]);

    const getSelectedCountry = () => {
        const found = AIRPORTS.find(a => a.code === destination);
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

        // Official Aviasales deep link format (query parameters, YYYY-MM-DD dates)
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

        // tp.media redirect — stable Travelpayouts affiliate tracking
        const tpUrl = `https://tp.media/r?marker=${MARKER_ID}&p=4114&u=${encodeURIComponent(targetUrl)}`;
        window.open(tpUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-4 md:p-6 border border-gray-100">

            {/* ROW 1: ROUTE & DATES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">From</label>
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent group-hover:border-emerald-400/50 transition-all">
                        <MapPin className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                        <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-transparent font-bold text-gray-700 outline-none appearance-none cursor-pointer truncate">
                            {AIRPORTS.map((city) => <option key={city.code} value={city.code}>{city.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">To</label>
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent group-hover:border-blue-400/50 transition-all">
                        <Plane className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-transparent font-bold text-gray-700 outline-none appearance-none cursor-pointer truncate">
                            {DESTINATION_GROUPS.map((group) => (
                                <optgroup key={group.label} label={group.label}>
                                    {group.options.map((dest) => <option key={dest.code} value={dest.code}>{dest.name}</option>)}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Depart</label>
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent group-hover:border-rose-400/50 transition-all">
                        <Calendar className="w-5 h-5 text-rose-500 mr-3 shrink-0" />
                        <input type="date" value={departDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDepartDate(e.target.value)} className="w-full bg-transparent font-bold text-gray-700 outline-none cursor-pointer" />
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block flex justify-between"><span>Return</span><span className="text-[10px] text-gray-300 font-normal normal-case self-end">(Optional)</span></label>
                    <div className={`flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent transition-all ${returnDate ? 'border-rose-400/50 bg-rose-50/30' : 'group-hover:border-gray-300'}`}>
                        <ArrowRightLeft className={`w-5 h-5 mr-3 shrink-0 ${returnDate ? 'text-rose-500' : 'text-gray-400'}`} />
                        <input type="date" value={returnDate} min={departDate} onChange={(e) => setReturnDate(e.target.value)} className={`w-full bg-transparent font-bold outline-none cursor-pointer ${returnDate ? 'text-gray-700' : 'text-gray-400'}`} />
                    </div>
                </div>
            </div>

            {/* ROW 2: PASSENGERS & CABIN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl px-3 py-2 flex flex-col items-center justify-center border border-transparent hover:border-gray-200 transition-all">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Adults (12+)</label>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer text-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl px-3 py-2 flex flex-col items-center justify-center border border-transparent hover:border-gray-200 transition-all">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Kids (2-11)</label>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer text-center">
                            {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl px-3 py-2 flex flex-col items-center justify-center border border-transparent hover:border-gray-200 transition-all">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Babies (&lt;2)</label>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <select value={infants} onChange={(e) => setInfants(Number(e.target.value))} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer text-center">
                            {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl px-3 py-2 flex flex-col items-center justify-center border border-transparent hover:border-gray-200 transition-all">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Cabin Class</label>
                    <div className="flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-gray-600" />
                        <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer text-center">
                            {CABIN_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ACTION AREA */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                {/* Price Hint from Bot Data */}
                <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 w-full md:w-auto justify-center md:justify-start">
                    <div className="relative flex h-3 w-3">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase leading-none">Best Price Estimate</span>
                        <span className="text-sm font-black text-emerald-800 leading-tight">{priceHint}</span>
                    </div>
                </div>

                <button onClick={handleSearch} className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group">
                    <Plane className="w-5 h-5 fill-current group-hover:rotate-45 transition-transform duration-300" />
                    <span>Search {returnDate ? "Round-trip" : "One-way"} in {cabinLabel} to {getSelectedCountry()}</span>
                </button>
            </div>

        </div>
    );
}
