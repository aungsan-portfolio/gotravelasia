import { useEffect, useMemo, useState } from "react";
import { Plane, Calendar, MapPin, Search, ArrowRight, Loader2 } from "lucide-react";

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

// ─── Helpers ────────────────────────────────────────────────────

const MARKER = import.meta.env.VITE_TP_MARKER || "";

function buildAffiliateUrl(
    origin: string,
    destination: string,
    departDate: string
) {
    const params = new URLSearchParams({
        marker: MARKER,
        origin_iata: origin,
        destination_iata: destination,
        depart_date: departDate,
        adults: "1",
        trip_class: "0",
    });
    return `https://www.aviasales.com/search?${params.toString()}`;
}

// ─── Component ──────────────────────────────────────────────────

export default function FlightWidget() {
    const [tripType, setTripType] = useState<"oneway" | "round">("oneway");
    const [origin, setOrigin] = useState("RGN");
    const [dest, setDest] = useState("BKK");
    const [date, setDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);

    // Default departure = tomorrow
    useEffect(() => {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        setDate(t.toISOString().slice(0, 10));
    }, []);

    // Fetch flight data whenever origin/dest changes
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/data/flight_data.json", { cache: "no-store" });
                if (!res.ok) throw new Error("No flight data");
                const data: FlightData = await res.json();
                const found = (data.routes || []).find(
                    (r) => r.origin === origin && r.destination === dest
                );
                if (alive) setDeal(found || null);
            } catch {
                if (alive) setDeal(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [origin, dest]);

    const url = useMemo(
        () => (date ? buildAffiliateUrl(origin, dest, date) : ""),
        [origin, dest, date]
    );

    const onSearch = () => {
        if (!MARKER) {
            alert("Missing VITE_TP_MARKER in .env.local");
            return;
        }
        if (!date) {
            alert("Please select a departure date");
            return;
        }
        if (tripType === "round" && !returnDate) {
            alert("Please select a return date");
            return;
        }
        window.open(url, "_blank");
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-purple-50 p-6 border-b border-purple-100">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-3">
                    <Plane className="w-3 h-3" /> Popular Route
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Traveling from Myanmar?
                </h2>
                <p className="text-gray-600">
                    Find the best flight deals from Yangon or Mandalay to Bangkok &amp;
                    Chiang Mai.
                </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
                {/* Trip type toggle */}
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${tripType === "oneway"
                                    ? "border-purple-600"
                                    : "border-gray-300"
                                }`}
                        >
                            {tripType === "oneway" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            )}
                        </div>
                        <input
                            type="radio"
                            name="tripType"
                            className="hidden"
                            checked={tripType === "oneway"}
                            onChange={() => setTripType("oneway")}
                        />
                        <span
                            className={`text-sm font-medium ${tripType === "oneway" ? "text-purple-700" : "text-gray-500"
                                }`}
                        >
                            One Way
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${tripType === "round"
                                    ? "border-purple-600"
                                    : "border-gray-300"
                                }`}
                        >
                            {tripType === "round" && (
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            )}
                        </div>
                        <input
                            type="radio"
                            name="tripType"
                            className="hidden"
                            checked={tripType === "round"}
                            onChange={() => setTripType("round")}
                        />
                        <span
                            className={`text-sm font-medium ${tripType === "round" ? "text-purple-700" : "text-gray-500"
                                }`}
                        >
                            Round Trip
                        </span>
                    </label>
                </div>

                {/* Route selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> From
                        </label>
                        <div className="relative">
                            <select
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-all"
                            >
                                <option value="RGN">Yangon (RGN)</option>
                                <option value="MDL">Mandalay (MDL)</option>
                            </select>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> To
                        </label>
                        <div className="relative">
                            <select
                                value={dest}
                                onChange={(e) => setDest(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none transition-all"
                            >
                                <option value="BKK">Bangkok (BKK - Full Service)</option>
                                <option value="DMK">Bangkok (DMK - Don Mueang)</option>
                                <option value="CNX">Chiang Mai (CNX)</option>
                            </select>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Departure
                        </label>
                        <input
                            type="date"
                            value={date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {tripType === "round" && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Return
                            </label>
                            <input
                                type="date"
                                value={returnDate}
                                min={date || new Date().toISOString().split("T")[0]}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Search button */}
                <button
                    onClick={onSearch}
                    className="w-full py-4 px-6 bg-gradient-to-r from-[#4b0082] to-[#7b1fa2] hover:from-[#3a006b] hover:to-[#6a1b9a] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5" />
                    Search Flights to Thailand
                </button>

                {/* Dynamic price hint from bot data */}
                <div className="text-center bg-green-50 text-green-700 py-2.5 px-4 rounded-lg text-sm font-semibold border border-green-100 flex items-center justify-center gap-2">
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Checking latest prices…
                        </>
                    ) : deal ? (
                        <>
                            <span className="animate-pulse">⚡</span>
                            Best price: <b>${deal.price}</b> ({deal.airline}) on {deal.date}
                        </>
                    ) : (
                        <>
                            <span className="animate-pulse">⚡</span>
                            Best price guarantee for this route
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
