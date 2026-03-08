import { useState, useEffect } from "react";
import OptimizedImage from "@/seo/OptimizedImage";
import { ArrowRight, Plane, Tag } from "lucide-react";
import { formatPrice } from "./utils";
import { USD_TO_THB_RATE } from "@/const";

export default function SpecialOffers() {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/special-offers?origin=RGN&currency=usd")
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    // Filter out any broken offers, take top 4
                    setOffers(data.data.slice(0, 4));
                }
            })
            .catch(err => console.error("Failed to fetch special offers", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return null; // Don't show anything while loading (optional supplement)
    if (offers.length === 0) return null; // Hide if no special offers exist right now

    return (
        <section className="w-full bg-gradient-to-b from-white to-gray-50 py-12 md:py-16">
            <div className="max-w-[1152px] mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-[24px] md:text-[32px] font-[800] text-[#1a1f36] tracking-tight flex items-center gap-2">
                            <Tag className="w-6 h-6 text-rose-500" />
                            Special Fares
                        </h2>
                        <p className="text-[15px] text-[#4f566b] mt-1.5 font-medium">
                            Abnormally low prices found by travelers recently
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {offers.map((offer, i) => (
                        <a
                            key={i}
                            href={`/flights/results?flightSearch=${offer.origin}${new Date(offer.departure_at).getDate().toString().padStart(2, '0')}${(new Date(offer.departure_at).getMonth() + 1).toString().padStart(2, '0')}${offer.destination}1`}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                        >
                            <div className="p-5 flex flex-col h-full relative">
                                {/* Discount logic just for display impact */}
                                <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    HOT DEAL
                                </div>

                                <span className="text-xs font-semibold text-rose-500 mb-2 uppercase tracking-wide">
                                    {offer.airline_title || offer.airline}
                                </span>

                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                    {offer.origin_name} <ArrowRight className="inline w-4 h-4 text-gray-400 mx-1" /> {offer.destination_name}
                                </h3>

                                <p className="text-sm text-gray-500 mb-6">
                                    {new Date(offer.departure_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 mb-0.5">As low as</span>
                                        <span className="text-xl font-black text-gray-900 leading-none">
                                            {formatPrice(offer.price, "USD")}
                                        </span>
                                    </div>
                                    <div className="bg-rose-50 text-rose-600 rounded-full p-2 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                        <Plane className="w-5 h-5 -rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
