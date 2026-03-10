import React from "react";
import { Wrap, Card, ChartTooltip } from "./ui";
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { DestinationInfo, FlightMeta } from "../../../data/destinationData";

export interface InsightsProps {
    dest: DestinationInfo;
    meta: FlightMeta;
    priceMonth: { m: string; p: number }[];
    bookLead: { d: string; p: number }[];
    weekly: { day: string; n: number }[];
    durations: { c: string; h: number }[];
    heatmap: any[];
}

export default function Insights({ dest, meta, priceMonth, bookLead, weekly, durations, heatmap }: InsightsProps) {
    const hmAll = heatmap.flatMap(x => [x.Morning, x.Midday, x.Afternoon, x.Evening, x.Night]);
    const hmMin = Math.min(...hmAll), hmMax = Math.max(...hmAll);
    const pct = (v: number) => (v - hmMin) / (hmMax - hmMin);

    return (
        <>
            {/* 5 Best time to book */}
            <Wrap className="py-8">
                <h2 className="text-[22px] font-extrabold text-slate-100 tracking-tight mb-1.5">
                    Best time to book a flight to {dest.city}
                </h2>
                <p className="text-[13px] text-slate-400 mb-5 font-medium">
                    Flexible schedule? Discover the best time to fly with our price prediction graph.
                </p>

                <Card className="p-5">
                    <div className="text-[11px] text-slate-500 mb-4 font-semibold uppercase tracking-wider">
                        Estimated return price (฿) · Based on past data
                    </div>

                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={priceMonth} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                        {[
                            [`Book ${meta.bookAdvance}+ days early`, "📅", "Best price"],
                            [`Fly ${meta.cheapestDay} at ${meta.cheapestTime}`, "🟢", "Cheapest"],
                            [`Avoid ${meta.avoidDay} ${meta.avoidTime}`, "🔴", "Most expensive"],
                            [`Cheapest month: ${meta.cheapestIn}`, "💚", "Low season"],
                        ].map(([v, ic, lbl]) => (
                            <div key={lbl} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 hover:bg-white/[0.05] transition-colors">
                                <div className="text-base mb-1">{ic}</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{lbl}</div>
                                <div className="text-[11px] font-bold text-slate-100 leading-snug">{v}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </Wrap>

            {/* 6 4-chart grid */}
            <Wrap className="py-8">
                <h2 className="text-[22px] font-extrabold text-slate-100 tracking-tight mb-1.5">
                    GoTravel Asia Insights
                </h2>
                <p className="text-[13px] text-slate-400 mb-5 font-medium">
                    Everything you need to know about your flight to {dest.city}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Booking lead */}
                    <Card className="p-5">
                        <div className="font-bold text-sm mb-1 text-slate-100">When is the best time to book?</div>
                        <div className="text-xs text-slate-400 mb-4 font-medium">
                            Book at least <span className="text-amber-500 font-bold">{meta.bookAdvance} days</span> in advance for cheapest prices
                        </div>
                        <div className="h-[155px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bookLead} barSize={24} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="d" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `฿${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="p" name="Avg price" radius={[4, 4, 0, 0]}>
                                        {bookLead.map((d, i) => (
                                            <Cell key={i} fill={i === 0 ? "#10b981" : i === 5 ? "#f87171" : "#7c3aed"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Flight durations */}
                    <Card className="p-5">
                        <div className="font-bold text-sm mb-1 text-slate-100">How long is the flight to {dest.city}?</div>
                        <div className="text-xs text-slate-400 mb-5 font-medium">Average flight times from major Thai cities</div>
                        {durations.map((d, i) => (
                            <div key={d.c} className={i !== durations.length - 1 ? "mb-3" : ""}>
                                <div className="flex justify-between text-xs mb-1.5 font-medium">
                                    <span className="text-slate-200">{d.c}</span>
                                    <span className="text-violet-400 font-bold">{d.h}h</span>
                                </div>
                                <div className="h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                                        style={{ width: `${(d.h / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </Card>

                    {/* Weekly availability */}
                    <Card className="p-5">
                        <div className="font-bold text-sm mb-1 text-slate-100">Weekly flight availability to {dest.city}</div>
                        <div className="text-xs text-slate-400 mb-4 font-medium">
                            Most: <span className="text-amber-500 font-bold">Friday (65/day)</span> ·
                            Least: <span className="text-slate-500 font-bold">Monday (47/day)</span>
                        </div>
                        <div className="h-[155px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weekly} barSize={20} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip fmt={v => `${v} flights`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="n" name="Flights" radius={[4, 4, 0, 0]}>
                                        {weekly.map((d, i) => (
                                            <Cell key={i} fill={d.day === "Fri" ? "#f59e0b" : d.day === "Mon" ? "#475569" : "#7c3aed"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Day/time heatmap */}
                    <Card className="p-5">
                        <div className="font-bold text-sm mb-1 text-slate-100">When is the cheapest time to fly?</div>
                        <div className="text-xs text-slate-400 mb-4 font-medium">
                            <span className="text-emerald-500 font-bold">Green</span> = cheapest ·
                            <span className="text-red-400 font-bold">Red</span> = most expensive
                        </div>

                        <div className="grid grid-cols-[44px_repeat(5,1fr)] gap-1">
                            <div />
                            {["Morn", "Midday", "Arvo", "Even", "Night"].map(h => (
                                <div key={h} className="text-[9px] text-slate-500 text-center font-bold pb-1 truncate">{h}</div>
                            ))}

                            {heatmap.map(row => {
                                const keys = ["Morning", "Midday", "Afternoon", "Evening", "Night"];
                                return (
                                    <React.Fragment key={row.d}>
                                        <div className="text-[10px] text-slate-400 font-bold flex items-center">{row.d}</div>
                                        {keys.map(k => {
                                            const v = row[k];
                                            const p = pct(v);
                                            const bg = p > 0.75
                                                ? `rgba(248,113,113,${0.18 + p * 0.45})`
                                                : p < 0.25
                                                    ? `rgba(16,185,129,${0.15 + (1 - p) * 0.4})`
                                                    : `rgba(124,58,237,${0.12 + p * 0.3})`;

                                            return (
                                                <div
                                                    key={k}
                                                    className="rounded p-1 text-center text-[9px] text-slate-100 font-semibold flex items-center justify-center min-h-[28px]"
                                                    style={{ background: bg }}
                                                >
                                                    ฿{(v / 1000).toFixed(1)}k
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </Wrap>
        </>
    );
}
