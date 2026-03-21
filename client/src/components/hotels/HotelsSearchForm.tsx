import { useState, useMemo } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { SEA_CITIES, buildAgodaSearchUrl } from "@/lib/agoda/links";
import { trackAffiliateClick } from "@/lib/tracking";

interface Props {
    layout?: "default" | "compact";
    initialCity?: string;
}

export default function HotelsSearchForm({ layout = "default", initialCity = "" }: Props) {
    const today = new Date().toISOString().split("T")[0];
    
    // Check if initialCity matches any of our slugs
    const initialCityId = useMemo(() => {
        if (!initialCity) return SEA_CITIES[0].id;
        const found = SEA_CITIES.find(c => 
            c.slug.toLowerCase() === initialCity.toLowerCase() || 
            c.displayName.toLowerCase() === initialCity.toLowerCase()
        );
        return found ? found.id : SEA_CITIES[0].id;
    }, [initialCity]);

    // Form State
    const [cityId, setCityId] = useState<number>(initialCityId);
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [childrenAges, setChildrenAges] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    const minCheckOut = checkIn
        ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0]
        : today;

    const selectedCity = useMemo(() => 
        SEA_CITIES.find(c => c.id === cityId) || SEA_CITIES[0]
    , [cityId]);

    const handleChildrenCountChange = (count: number) => {
        setChildrenAges(prev => 
            Array.from({ length: count }, (_, i) => prev[i] ?? 8) // Default age 8
        );
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const url = buildAgodaSearchUrl({
                city: selectedCity,
                checkIn,
                checkOut,
                adults,
                children: childrenAges,
                rooms
            });

            // Track the click before opening
            trackAffiliateClick('agoda', {
                city: selectedCity.slug,
                checkIn,
                checkout: checkOut,
                adults: String(adults),
                children: String(childrenAges.length)
            });

            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid search parameters");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="hotel-search-form">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Destination */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                        Destination
                    </label>
                    <select
                        value={cityId}
                        onChange={(e) => setCityId(Number(e.target.value))}
                        data-testid="hotel-destination-select"
                        aria-label="Hotel destination"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm text-white"
                    >
                        {SEA_CITIES.map((city) => (
                            <option key={city.id} value={city.id} className="text-gray-900">
                                {city.displayName} ({city.country})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Check-in */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                        Check-in
                    </label>
                    <input
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                        data-testid="hotel-checkin-input"
                        aria-label="Check-in"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm text-white [color-scheme:dark]"
                    />
                </div>

                {/* Check-out */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                        Check-out
                    </label>
                    <input
                        type="date"
                        value={checkOut}
                        min={minCheckOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                        data-testid="hotel-checkout-input"
                        aria-label="Check-out"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm text-white [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Guests & Rooms */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                        Rooms
                    </label>
                    <select
                        value={rooms}
                        onChange={(e) => setRooms(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm text-white"
                    >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} className="text-gray-900">{n} Room{n > 1 ? 's' : ''}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                        Adults
                    </label>
                    <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm text-white"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n} className="text-gray-900">{n} Adult{n > 1 ? 's' : ''}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">
                        Children
                    </label>
                    <select
                        value={childrenAges.length}
                        onChange={(e) => handleChildrenCountChange(Number(e.target.value))}
                        data-testid="hotel-children-count"
                        aria-label="Children"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm text-white"
                    >
                        {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} className="text-gray-900">{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                    </select>
                </div>
                
                {/* Child Ages Dropdowns */}
                {childrenAges.length > 0 && (
                    <div className="md:col-span-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                        {childrenAges.map((age, i) => (
                            <div key={i}>
                                <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">Child {i + 1} Age</label>
                                <select
                                    value={age}
                                    onChange={(e) => {
                                        const next = [...childrenAges];
                                        next[i] = Number(e.target.value);
                                        setChildrenAges(next);
                                    }}
                                    data-testid={`hotel-child-age-${i}`}
                                    aria-label={`Child ${i + 1} age`}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white outline-none focus:ring-1 focus:ring-orange-400"
                                >
                                    <option value={0} className="text-gray-900">Under 1</option>
                                    {Array.from({ length: 17 }, (_, a) => (
                                        <option key={a + 1} value={a + 1} className="text-gray-900">{a + 1} yr old</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                {error ? (
                    <p className="text-red-400 text-xs font-medium animate-pulse" role="alert">
                        ⚠️ {error}
                    </p>
                ) : (
                    <p className="text-gray-500 text-[10px] italic">
                        * You will be redirected to Agoda for booking
                    </p>
                )}
                
                <Button
                    type="submit"
                    data-testid="hotel-search-submit"
                    className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all h-12 px-10 rounded-xl text-base shadow-lg shadow-orange-500/20"
                >
                    Search Hotels on Agoda
                </Button>
            </div>
        </form>
    );
}
