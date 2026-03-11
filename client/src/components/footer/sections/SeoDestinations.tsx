import { COUNTRIES, POPULAR_DESTINATIONS } from "../data";
import { toSlug } from "../utils";

export default function SeoDestinations() {
    return (
        <div className="border-t border-white/[0.08] relative z-10">
            <div className="container max-w-[1100px] mx-auto py-9 px-6 sm:px-12">

                {/* Popular countries — Myanmar excluded (home country, not a destination) */}
                <div className="mb-7">
                    <p
                        className="text-[12px] font-semibold tracking-[1.5px] uppercase mb-3.5"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                        Popular destinations
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-1.5">
                        {COUNTRIES.filter((c) => c !== "Myanmar").map((country) => (
                            <a
                                key={country}
                                href={`/flights/to/${toSlug(country)}`}
                                className="text-[13px] font-medium no-underline transition-colors hover:text-[#FFD700] truncate"
                                style={{ color: "#7b5baa" }}
                            >
                                Flights to {country}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Popular cities */}
                <div>
                    <p
                        className="text-[12px] font-semibold tracking-[1.5px] uppercase mb-3.5"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                    >
                        Popular cities
                    </p>

                    {POPULAR_DESTINATIONS.length === 0 ? (
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                            No destinations available.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-1.5">
                            {POPULAR_DESTINATIONS.map((airport) => {
                                const cityName = airport.name.replace(/\s*\(.*?\)\s*/g, "");
                                return (
                                    <a
                                        key={airport.code}
                                        href={`/flights/to/${toSlug(cityName)}`}
                                        className="text-[13px] font-medium no-underline transition-colors hover:text-[#FFD700] truncate"
                                        style={{ color: "#7b5baa" }}
                                    >
                                        Flights to {cityName}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
