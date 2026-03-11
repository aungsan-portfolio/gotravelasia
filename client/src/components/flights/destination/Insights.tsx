import React from "react";
import { Wrap, Card, ChartTooltip } from "./ui";
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { DestinationPageVM } from "@/types/destination";

type Props = { data: DestinationPageVM };

export default function Insights({ data }: Props) {
    // Transform priceMonths to recharts format
    const priceChartData = data.priceMonths.map(d => ({ m: d.month, p: d.value }));

    return (
        <>
            {/* Price trend area chart */}
            <Wrap className="py-8">
                <h2 className="text-[22px] font-extrabold text-slate-100 tracking-tight mb-1.5">
                    Best time to book a flight to {data.dest.city}
                </h2>
                <p className="text-[13px] text-slate-400 mb-5 font-medium">
                    Flexible schedule? Discover the best time to fly with our price data.
                </p>

                <Card className="p-5">
                    <div className="text-[11px] text-slate-500 mb-4 font-semibold uppercase tracking-wider">
                        Estimated return price (฿) · Based on past data
                    </div>

                    {priceChartData.length > 0 ? (
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={priceChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="m" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area type="monotone" dataKey="p" name="Est. price" stroke="#a78bfa" strokeWidth={2.5} fill="url(#ag)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-sm text-white/50 py-8 text-center">No pricing data available</div>
                    )}

                    {/* Quick insights */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                        <InsightCard icon="📅" label="Availability" value={data.directAvailability ?? "—"} />
                        <InsightCard icon="⏱" label="Typical duration" value={data.typicalDuration ?? "—"} />
                        <InsightCard icon="💰" label="Lowest found" value={data.lowestFare ? `฿${data.lowestFare.toLocaleString()}` : "—"} />
                        <InsightCard icon="📊" label="Airlines on route" value={`${data.airlines.length} carriers`} />
                    </div>
                </Card>
            </Wrap>

            {/* Heatmap */}
            {data.heatmap.length > 0 && (
                <Wrap className="pb-8">
                    <h2 className="text-[22px] font-extrabold text-slate-100 tracking-tight mb-1.5">
                        Fare heatmap
                    </h2>
                    <p className="text-[13px] text-slate-400 mb-5 font-medium">
                        <span className="text-emerald-500 font-bold">Green</span> = cheapest ·
                        <span className="text-amber-500 font-bold ml-1">Amber</span> = mid ·
                        <span className="text-rose-400 font-bold ml-1">Red</span> = most expensive
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {data.heatmap.map((block) => (
                            <Card key={block.month} className="p-5">
                                <div className="text-sm font-bold text-white/80 mb-3">{block.month}</div>
                                <div className="grid grid-cols-5 gap-2">
                                    {block.values.map((cell) => (
                                        <div
                                            key={`${block.month}-${cell.day}`}
                                            className={`rounded-xl px-3 py-3 text-center text-xs ${cell.level === "low"
                                                ? "bg-emerald-500/20 text-emerald-200"
                                                : cell.level === "mid"
                                                    ? "bg-amber-500/20 text-amber-200"
                                                    : "bg-rose-500/20 text-rose-200"
                                                }`}
                                        >
                                            <div>{cell.day}</div>
                                            <div className="mt-1 font-semibold">฿{cell.price.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Wrap>
            )}
        </>
    );
}

function InsightCard({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 hover:bg-white/[0.05] transition-colors">
            <div className="text-base mb-1">{icon}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{label}</div>
            <div className="text-[11px] font-bold text-slate-100 leading-snug">{value}</div>
        </div>
    );
}
