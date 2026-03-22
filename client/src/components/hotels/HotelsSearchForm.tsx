import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CITIES_BY_COUNTRY } from "@/lib/cities";

export default function HotelsSearchForm() {
    const [, setLocation] = useLocation();
    
    const today = new Date().toISOString().split("T")[0];
    const defIn = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const defOut = new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0];

    const [citySlug, setCitySlug] = useState("bangkok");
    const [checkIn, setCheckIn] = useState(defIn);
    const [checkOut, setCheckOut] = useState(defOut);
    const [adults, setAdults] = useState(2);
    const [rooms, setRooms] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams({
            city: citySlug,
            checkIn,
            checkOut,
            adults: adults.toString(),
            rooms: rooms.toString(),
        });
        setLocation(`/hotels?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Destination */}
                <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
                        Destination
                    </label>
                    <select
                        value={citySlug}
                        onChange={(e) => setCitySlug(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white"
                    >
                        {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
                            <optgroup key={country} label={`${data.flag} ${country}`}>
                                {data.cities.filter(c => c.hasHotels).map(c => (
                                    <option key={c.slug} value={c.slug} className="text-gray-900">
                                        {c.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Check-in */}
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
                        Check-in
                    </label>
                    <input
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white [color-scheme:dark]"
                    />
                </div>

                {/* Check-out */}
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
                        Check-out
                    </label>
                    <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white [color-scheme:dark]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Rooms */}
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
                        Rooms
                    </label>
                    <select
                        value={rooms}
                        onChange={(e) => setRooms(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white"
                    >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n} className="text-gray-900">{n} Room{n > 1 ? 's' : ''}</option>)}
                    </select>
                </div>

                {/* Adults */}
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1.5 block ml-1">
                        Adults
                    </label>
                    <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-sm text-white"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n} className="text-gray-900">{n} Adult{n > 1 ? 's' : ''}</option>)}
                    </select>
                </div>

                {/* Empty space for alignment */}
                <div className="hidden md:block"></div>

                {/* Submit button */}
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#0d0b1e] font-bold transition-all h-[46px] rounded-xl text-base shadow-lg shadow-yellow-400/20"
                    >
                        Compare Prices
                    </button>
                </div>
            </div>
        </form>
    );
}
