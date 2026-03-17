import type { RouteVM } from "@/types/destination";

export function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(price);
}

export function formatUpdatedAt(value: string) {
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

interface DestinationHeroProps {
    routeVm: RouteVM;
    cheapestPrice: number;
    currency: string;
    updatedAt: string;
    dealsCount: number;
}

export default function DestinationHero({
    routeVm,
    cheapestPrice,
    currency,
    updatedAt,
    dealsCount,
}: DestinationHeroProps) {
    const isCountry = routeVm.type === "country";
    const toLabel = isCountry 
        ? routeVm.destination.city 
        : `${routeVm.destination.city} (${routeVm.destination.code})`;

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-900 to-fuchsia-800 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%)]" />
            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                        GoTravel Asia Deals
                    </div>

                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-200">
                        Flights
                    </p>

                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl leading-tight">
                        {cheapestPrice > 0 && (
                            <span className="text-amber-400 block sm:inline mr-3">
                                {formatPrice(cheapestPrice, currency)}+
                            </span>
                        )}
                        Cheap flights to {toLabel}
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-100 sm:text-lg">
                        Based on the latest fetched route data. Prices for {routeVm.routeLabel} may change as availability updates.
                    </p>

                    {routeVm.climate && (
                         <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-indigo-50 border border-white/10">
                            🌤️ <span className="font-medium">{routeVm.climate}</span>
                         </div>
                    )}

                    {routeVm.highlights && (
                         <p className="mt-4 text-sm text-indigo-100 font-medium italic">
                            Top attractions: {routeVm.highlights.join(", ")}
                         </p>
                    )}

                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                            <p className="text-xs uppercase tracking-wide text-indigo-200">
                                Lowest current fare
                            </p>
                            <p className="mt-2 text-2xl font-bold">
                                {formatPrice(cheapestPrice, currency)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                            <p className="text-xs uppercase tracking-wide text-indigo-200">
                                Deals found
                            </p>
                            <p className="mt-2 text-2xl font-bold">{dealsCount}</p>
                        </div>

                        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                            <p className="text-xs uppercase tracking-wide text-indigo-200">
                                Last updated
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                {formatUpdatedAt(updatedAt)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href="#deals"
                            className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-indigo-50"
                        >
                            View deals
                        </a>
                        <a
                            href="#faq"
                            className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                            Read FAQ
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
