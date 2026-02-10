import React, { useState, useEffect } from "react";

const AFFILIATE_ID = "14566451"; // Your ID

// --- 1. CONFIGURATION ---
const POPULAR_CITIES = [
    "Bangkok", "Chiang Mai", "Phuket", "Krabi",
    "Koh Samui", "Koh Phangan", "Koh Tao",
    "Pattaya", "Hua Hin", "Hat Yai", "Surat Thani"
];

// Display name → actual 12Go slug mapping
const CITY_ALIASES: Record<string, string> = {
    "bangkok": "bangkok",
    "chiang mai": "chiang-mai",
    "phuket": "phuket",
    "krabi": "krabi",
    "koh samui": "koh-samui",
    "koh phangan": "koh-phangan",
    "koh tao": "koh-tao",
    "pattaya": "pattaya",
    "hua hin": "hua-hin",
    "hat yai": "hat-yai",
    "surat thani": "surat-thani"
};

// --- 2. HELPER FUNCTIONS ---
const slugifyCity = (city: string): string => {
    const cleanInput = String(city || "").toLowerCase().trim();
    if (!cleanInput) return "";
    // Check mapping first, then fallback to regex
    return CITY_ALIASES[cleanInput] || cleanInput.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
};

interface BuildUrlParams {
    fromCity: string;
    toCity: string;
    travelDate: string;
}

const buildCustomerUrl = ({ fromCity, toCity, travelDate }: BuildUrlParams): string => {
    const origin = slugifyCity(fromCity);
    const destination = slugifyCity(toCity);

    // Fallback to homepage if invalid
    if (!origin || !destination || origin === destination) {
        return "https://12go.asia/en";
    }

    const routeUrl = new URL(`https://12go.asia/en/travel/${origin}/${destination}`);

    if (travelDate) routeUrl.searchParams.set("date", travelDate);

    // ✅ DOUBLE LOCK TRACKING (အရေးကြီးသည်)
    routeUrl.searchParams.set("referer", AFFILIATE_ID);
    routeUrl.searchParams.set("z", AFFILIATE_ID);

    return routeUrl.toString();
};

// --- 3. MAIN COMPONENT ---
const TravelSearchWidget: React.FC = () => {
    const [from, setFrom] = useState("Bangkok");
    const [to, setTo] = useState("Chiang Mai");
    const [date, setDate] = useState("");
    const [error, setError] = useState("");

    // Default date: Tomorrow (More realistic than 7 days)
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split("T")[0]);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!from || !to) return setError("Please select departure and destination.");
        if (!date) return setError("Please select a travel date.");
        if (from === to) return setError("Origin and Destination cannot be the same.");

        const url = buildCustomerUrl({ fromCity: from, toCity: to, travelDate: date });
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const setQuickRoute = (fromCity: string, toCity: string) => {
        setFrom(fromCity);
        setTo(toCity);
        setError(""); // Clear errors if any
    };

    return (
        <div className="max-w-md mx-auto p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h3 className="mt-0 mb-4 text-xl font-bold text-gray-800 dark:text-white">✈️ Book Your Trip</h3>

            {/* Quick Route Pills */}
            <div className="flex gap-2 mb-5 flex-wrap">
                <span className="text-sm text-gray-500 self-center">Quick:</span>
                <button
                    type="button"
                    onClick={() => setQuickRoute("Bangkok", "Chiang Mai")}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-100 transition-all dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                >
                    BKK → Chiang Mai
                </button>
                <button
                    type="button"
                    onClick={() => setQuickRoute("Bangkok", "Phuket")}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-100 transition-all dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                >
                    BKK → Phuket
                </button>
                <button
                    type="button"
                    onClick={() => setQuickRoute("Bangkok", "Koh Samui")}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-100 transition-all dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                >
                    BKK → Samui
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="flex gap-2.5">
                    {/* FROM */}
                    <div className="flex-1">
                        <select
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 text-base bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">From</option>
                            {POPULAR_CITIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* TO */}
                    <div className="flex-1">
                        <select
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 text-base bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">To</option>
                            {POPULAR_CITIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* DATE */}
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg border border-gray-300 text-base box-border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                {error && <p className="text-red-600 text-sm text-center">⚠️ {error}</p>}

                <button
                    type="submit"
                    className="w-full p-3.5 bg-orange-500 text-white border-none rounded-lg text-base font-bold cursor-pointer mt-2 hover:bg-orange-600 transition-colors"
                >
                    Check Schedules on 12Go ➜
                </button>
            </form>
        </div>
    );
};

export default TravelSearchWidget;
