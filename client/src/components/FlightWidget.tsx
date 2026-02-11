import { useState, useEffect } from "react";
import { Search, Loader2, Plane } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

type Deal = {
    origin: string;
    destination: string;
    price: number;
    currency: string;
    airline: string;
    airline_code: string;
    date: string;
    transfers: number | null;
    flight_num: string | null;
    found_at: string;
};

type FlightData = {
    meta: {
        updated_at: string;
        currency: string;
        direct_only: boolean;
        overall_cheapest?: Deal;
    };
    routes: Deal[];
};

// ─── Config ─────────────────────────────────────────────────────

const AFFILIATE_ID = "697202";

const LOCATIONS = [
    { code: "RGN", name: "Yangon (RGN)" },
    { code: "MDL", name: "Mandalay (MDL)" },
    { code: "BKK", name: "Bangkok (BKK)" },
    { code: "DMK", name: "Don Mueang (DMK)" },
    { code: "CNX", name: "Chiang Mai (CNX)" },
    { code: "SIN", name: "Singapore (SIN)" },
    { code: "KUL", name: "Kuala Lumpur (KUL)" },
    { code: "SGN", name: "Ho Chi Minh (SGN)" },
];

// ─── Component ──────────────────────────────────────────────────

export default function FlightWidget() {
    const [origin, setOrigin] = useState("RGN");
    const [dest, setDest] = useState("BKK");
    const [date, setDate] = useState("");
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);

    // Default departure = tomorrow
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split("T")[0]);
    }, []);

    // Fetch flight data whenever origin/dest changes
    useEffect(() => {
        let alive = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch("/data/flight_data.json", { cache: "no-store" });
                if (!res.ok) throw new Error("No flight data");
                const data: FlightData = await res.json();
                const found = (data.routes || []).find(
                    (r) => r.origin === origin && r.destination === dest
                );
                if (alive) setDeal(found || null);
            } catch (err) {
                console.error("Failed to load flight data", err);
                if (alive) setDeal(null);
            } finally {
                if (alive) setLoading(false);
            }
        };
        fetchData();
        return () => { alive = false; };
    }, [origin, dest]);

    // Build affiliate URL
    const buildUrl = (searchDate: string) => {
        const params = new URLSearchParams({
            marker: AFFILIATE_ID,
            origin_iata: origin,
            destination_iata: dest,
            depart_date: searchDate,
            adults: "1",
            trip_class: "0",
        });
        return `https://www.aviasales.com/search?${params.toString()}`;
    };

    const handleSearch = (searchDate?: string) => {
        const finalDate = searchDate || date;
        if (!finalDate) {
            alert("Please select a departure date");
            return;
        }
        window.open(buildUrl(finalDate), "_blank");
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 font-sans">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 text-purple-600">
                <Plane className="w-6 h-6" />
                <h2 className="text-xl font-bold text-slate-800">GoTravel Flight Finder</h2>
            </div>

            {/* Route selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                        From
                    </label>
                    <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    >
                        {LOCATIONS.map((loc) => (
                            <option key={loc.code} value={loc.code}>{loc.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                        To
                    </label>
                    <select
                        value={dest}
                        onChange={(e) => setDest(e.target.value)}
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    >
                        {LOCATIONS.map((loc) => (
                            <option key={loc.code} value={loc.code}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Date picker */}
            <div className="mb-6 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Departure Date
                </label>
                <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Search button */}
            <button
                onClick={() => handleSearch()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 mb-4"
            >
                <Search className="w-5 h-5" />
                Search Flights
            </button>

            {/* Clickable Deal Badge */}
            <div className="mt-2">
                {loading ? (
                    <div className="flex items-center justify-center text-slate-400 text-xs py-2">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Searching deals...
                    </div>
                ) : deal ? (
                    <button
                        onClick={() => handleSearch(deal.date)}
                        className="w-full group bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer"
                    >
                        <div className="text-left">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                Cheap Deal Found!
                            </p>
                            <p className="text-slate-700 text-sm font-bold">
                                ${deal.price}{" "}
                                <span className="text-xs font-normal">via {deal.airline}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                on {deal.date} · {deal.transfers === 0 ? "Direct" : `${deal.transfers} stop(s)`}
                            </p>
                        </div>
                        <div className="bg-emerald-500 text-white text-[10px] px-3 py-1.5 rounded-full font-bold group-hover:bg-emerald-600 transition-colors whitespace-nowrap">
                            BOOK NOW
                        </div>
                    </button>
                ) : (
                    <div className="text-center py-2 text-slate-400 text-xs italic">
                        🛡️ Best price guarantee for SE Asia
                    </div>
                )}
            </div>
        </div>
    );
}
