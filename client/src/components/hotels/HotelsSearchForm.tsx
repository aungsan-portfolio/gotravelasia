import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { AFFILIATE } from "@/lib/config";

const AGODA_CID = AFFILIATE.AGODA_CID;

const HOTEL_CITIES = [
    { name: "Bangkok", slug: "bangkok-th" },
    { name: "Chiang Mai", slug: "chiang-mai-th" },
    { name: "Phuket", slug: "phuket-th" },
    { name: "Krabi", slug: "krabi-th" },
    { name: "Singapore", slug: "singapore-sg" },
    { name: "Kuala Lumpur", slug: "kuala-lumpur-my" },
    { name: "Hanoi", slug: "hanoi-vn" },
    { name: "Ho Chi Minh City", slug: "ho-chi-minh-city-vn" },
];

export default function HotelsSearchForm() {
    const today = new Date().toISOString().split("T")[0];
    const [checkIn, setCheckIn] = useState(today);

    const minCheckOut = checkIn
        ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0]
        : today;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const citySlug = fd.get("city") as string;
        const checkInDate = fd.get("checkIn") as string;
        const checkOutDate = fd.get("checkOut") as string;

        if (!checkInDate || !checkOutDate || new Date(checkOutDate) <= new Date(checkInDate)) {
            alert("Please select valid check-in and check-out dates");
            return;
        }

        const url = `https://www.agoda.com/city/${citySlug}.html?cid=${AGODA_CID}&checkIn=${checkInDate}&checkout=${checkOutDate}&utm_source=gotravelasia&utm_medium=affiliate`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                        Destination
                    </label>
                    <select
                        name="city"
                        defaultValue="bangkok-th"
                        className="w-full px-4 py-3.5 md:py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm min-h-[48px]"
                    >
                        {HOTEL_CITIES.map((city) => (
                            <option key={city.slug} value={city.slug}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                        Check-in
                    </label>
                    <input
                        type="date"
                        name="checkIn"
                        defaultValue={today}
                        min={today}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                        className="w-full px-4 py-3.5 md:py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm min-h-[48px]"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                        Check-out
                    </label>
                    <input
                        type="date"
                        name="checkOut"
                        min={minCheckOut}
                        required
                        className="w-full px-4 py-3.5 md:py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none font-bold text-sm min-h-[48px]"
                    />
                </div>
            </div>
            <Button
                type="submit"
                className="w-full md:w-auto md:self-end bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors h-12 px-10 rounded-xl text-base"
            >
                Search Hotels on Agoda
            </Button>
        </form>
    );
}
