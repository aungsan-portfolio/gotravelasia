import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import { Wrap, Card, AmberBtn, ChartTooltip } from "./ui";
import type { DestinationPageVM } from "@/types/destination";

type Props = { data: DestinationPageVM };

export default function AirlinesWeather({ data }: Props) {
    // Transform weather data for recharts
    const rainfallData = data.weather.map(w => ({ m: w.month, mm: w.rainfallMm ?? 0 }));
    const tempData = data.weather.map(w => ({ m: w.month, c: w.avgTempC ?? 0 }));

    return (
        <Wrap className="py-2">
            {/* Airlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Popular airlines */}
                <Card className="p-5">
                    <div className="font-bold text-sm mb-1 text-slate-100">Airlines on this route</div>
                    <div className="text-xs text-slate-400 mb-5 font-medium">
                        Based on GoTravel Asia route data
                    </div>

                    <div className="flex flex-col gap-3">
                        {data.airlines.map(airline => (
                            <div key={airline.code} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-bold text-violet-300 border border-white/[0.05]">
                                    {airline.code}
                                </div>
                                <div className="flex-1">
                                    <div className="text-[13px] font-bold text-slate-100">{airline.name}</div>
                                    <div className="text-[11px] text-slate-500 font-medium">
                                        {airline.dealCount ?? 0} deals · {typeof airline.commonStops === "number" ? (airline.commonStops === 0 ? "Direct" : `${airline.commonStops} stop`) : "—"}
                                    </div>
                                </div>
                                {airline.tags?.length ? (
                                    <div className="flex gap-1">
                                        {airline.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-200">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Cheapest airlines — progress bars */}
                <Card className="p-5">
                    <div className="font-bold text-sm mb-1 text-slate-100">Airline availability</div>
                    <div className="text-xs text-slate-400 mb-5 font-medium">Relative deal count across carriers</div>

                    <div className="flex flex-col gap-3.5">
                        {data.airlines.map((a, i) => {
                            const max = Math.max(...data.airlines.map(x => x.dealCount ?? 1));
                            const pct = ((a.dealCount ?? 0) / max) * 100;
                            return (
                                <div key={a.code}>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span className="font-semibold text-slate-200">{a.name}</span>
                                        <span className="text-violet-400 font-bold">{a.dealCount ?? 0} deals</span>
                                    </div>
                                    <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-violet-600 to-cyan-500"}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Weather charts */}
            {data.weather.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Rainfall */}
                    <Card className="p-5">
                        <div className="font-bold text-sm mb-1 text-slate-100">Rainfall in {data.dest.city} by month</div>
                        <div className="text-xs text-slate-400 mb-5 font-medium">Monthly average precipitation (mm)</div>

                        <div className="h-[140px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={rainfallData} barSize={12} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="m" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip fmt={v => `${v}mm`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="mm" name="Rainfall" radius={[3, 3, 0, 0]}>
                                        {rainfallData.map((d, i) => (
                                            <Cell key={i} fill={d.mm >= 250 ? "#f87171" : d.mm <= 160 ? "#10b981" : "#7c3aed"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Temperature */}
                    <Card className="p-5">
                        <div className="font-bold text-sm mb-1 text-slate-100">Temperature in {data.dest.city} by month</div>
                        <div className="text-xs text-slate-400 mb-5 font-medium">Monthly average temperature (°C)</div>

                        <div className="h-[140px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={tempData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="m" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis domain={[24, 30]} tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}°`} />
                                    <Tooltip content={<ChartTooltip fmt={v => `${v}°C`} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="c"
                                        name="Temp"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={{ fill: "#0b0719", stroke: "#f59e0b", strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}
        </Wrap>
    );
}
