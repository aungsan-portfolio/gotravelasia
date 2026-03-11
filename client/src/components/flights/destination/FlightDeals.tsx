import { useMemo, useState } from "react";
import type { DestinationPageVM } from "@/types/destination";
import { AmberBtn, Card, StopBadge, Wrap } from "./ui";

type Props = { data: DestinationPageVM };

const tabs = ["cheapest", "fastest", "bestValue", "weekend", "premium"] as const;

function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function FlightDeals({ data }: Props) {
    const [active, setActive] = useState<(typeof tabs)[number]>("cheapest");
    const deals = useMemo(() => data.deals[active] ?? [], [data, active]);

    return (
        <Wrap className="pt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white">Top booking picks</h2>
                    <p className="text-sm text-white/60">
                        Live and fallback-ready options for {data.dest.city}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`rounded-full px-3 py-1.5 text-sm capitalize ${active === tab
                                ? "bg-amber-400 text-black font-bold"
                                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                                }`}
                            onClick={() => setActive(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {deals.length === 0 ? (
                <Card className="p-5 text-white/70 text-sm">
                    No live fares in this category right now.
                </Card>
            ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                    {deals.map((deal, index) => (
                        <Card
                            key={`${deal.airline}-${deal.from}-${deal.to}-${deal.d1}-${index}`}
                            className="p-5 text-white"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-lg font-semibold">{deal.airline}</div>
                                    <div className="text-sm text-white/60">
                                        {deal.from} → {data.dest.code}
                                    </div>
                                </div>
                                {deal.tag && (
                                    <span className="rounded-full bg-violet-500/20 px-2 py-1 text-xs text-violet-200">
                                        {deal.tag}
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-white/70">
                                <div>Departure: {formatDateTime(deal.d1)}</div>
                                {deal.a1 && <div>Arrival: {formatDateTime(deal.a1)}</div>}
                                <div>Duration: {deal.duration || "—"}</div>
                                <StopBadge stops={deal.stops} />
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-white/50">Fare</div>
                                    <div className="text-2xl font-bold text-amber-300">
                                        ฿{deal.price.toLocaleString()}
                                    </div>
                                </div>
                                {deal.bookingUrl ? (
                                    <AmberBtn as="a" href={deal.bookingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm">
                                        Check fare
                                    </AmberBtn>
                                ) : (
                                    <AmberBtn className="px-4 py-2 text-sm" disabled>Check fare</AmberBtn>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </Wrap>
    );
}
