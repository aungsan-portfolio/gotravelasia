import type { FlightDeal } from "@/types/flights";
import { buildSeoTravelpayoutsResultsUrl } from "@/lib/travelpayouts";
import OptimizedImage from "@/seo/OptimizedImage";

function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(price);
}

function DealCard({ deal, currency }: { deal: FlightDeal; currency: string }) {
    const deepLink = deal.deepLink && deal.deepLink !== "#"
        ? deal.deepLink
        : buildSeoTravelpayoutsResultsUrl(deal.originCode, deal.destinationCode, 14);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-slate-50 p-1">
                        <OptimizedImage
                            src={`http://pics.avs.io/120/120/${deal.airlineCode || "none"}.png`}
                            alt={deal.airline}
                            width={120}
                            height={120}
                            imgClassName="h-full w-full object-contain"
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                            {deal.tripType}
                        </p>
                        <h3 className="mt-0.5 text-lg font-bold text-slate-900 line-clamp-1 leading-tight">
                            {deal.airline}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                            {deal.originCode} → {deal.destinationCode}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-extrabold text-slate-900">
                        {formatPrice(deal.price, currency)}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">{deal.provider}</p>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Stops
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 cursor-default">
                        {deal.stops === 0 ? "Nonstop" : `${deal.stops} stop`}
                    </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Flight no.
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 cursor-default">{deal.flightNum || "N/A"}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Depart
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 cursor-default">{deal.departDate}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Found
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 cursor-default" title={deal.foundAt}>{deal.foundAt.split(" ")[0] || "N/A"}</p>
                </div>
            </div>

            <div className="mt-5">
                <a
                    href={deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:ring-4 focus:ring-slate-200"
                >
                    View fare
                </a>
            </div>
        </article>
    );
}

export default function DealsGrid({ deals = [], currency = "USD" }: { deals: FlightDeal[]; currency?: string }) {
    return (
        <div id="deals" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deals.map((deal, idx) => (
                <DealCard key={`${deal.originCode}-${deal.destinationCode}-${deal.id}-${idx}`} deal={deal} currency={currency} />
            ))}
        </div>
    );
}
