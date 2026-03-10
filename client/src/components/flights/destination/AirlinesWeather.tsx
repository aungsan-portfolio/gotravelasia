import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import { Wrap, Card, AmberBtn, ChartTooltip } from "./ui";
import type { DestinationInfo, CheapAirline } from "../../../data/destinationData";

interface PopularAirline {
    name: string;
    emoji: string;
    from: number;
}

interface WeatherData {
    m: string;
    mm?: number;
    c?: number;
}

export interface AirlinesWeatherProps {
    dest: DestinationInfo;
    popAirlines: PopularAirline[];
    cheapAl: CheapAirline[];
    rainfall: WeatherData[];
    temperature: WeatherData[];
}

function PopularAirlines({ dest, popAirlines }: { dest: DestinationInfo, popAirlines: PopularAirline[] }) {
    return (
        <Card className="p-5">
            <div className="font-bold text-sm mb-1 text-slate-100">Most popular airlines to {dest.city}</div>
            <div className="text-xs text-slate-400 mb-5 font-medium">From Bangkok · Based on GoTravel Asia user searches</div>

            <div className="flex flex-col gap-3">
                {popAirlines.map(a => (
                    <div key={a.name} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-[22px] border border-white/[0.05]">
                            {a.emoji}
                        </div>
                        <div className="flex-1">
                            <div className="text-[13px] font-bold text-slate-100">{a.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">from ฿{a.from.toLocaleString()}</div>
                        </div>
                        <AmberBtn className="text-[10px] px-3 py-1.5 rounded-lg">Search</AmberBtn>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function CheapestAirlines({ dest, cheapAl }: { dest: DestinationInfo, cheapAl: CheapAirline[] }) {
    return (
        <Card className="p-5">
            <div className="font-bold text-sm mb-1 text-slate-100">Cheapest airlines to {dest.city}</div>
            <div className="text-xs text-slate-400 mb-5 font-medium">Relative price index (lower = cheaper)</div>

            <div className="flex flex-col gap-3.5">
                {cheapAl.map((a, i) => (
                    <div key={a.name}>
                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                            <span className="font-semibold text-slate-200">{a.name}</span>
                            <span className="text-violet-400 font-bold">from ฿{a.from.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${i === 0 ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-violet-600 to-cyan-500"}`}
                                style={{ width: `${a.pct}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function RainfallChart({ dest, rainfall }: { dest: DestinationInfo, rainfall: WeatherData[] }) {
    return (
        <Card className="p-5">
            <div className="font-bold text-sm mb-1 text-slate-100">Rainfall in {dest.city} by month</div>
            <div className="text-xs text-slate-400 mb-5 font-medium">
                Driest: <span className="text-emerald-500 font-bold">July (150mm)</span> ·
                Wettest: <span className="text-red-400 font-bold">December (269mm)</span>
            </div>

            <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfall} barSize={12} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                        <XAxis dataKey="m" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip fmt={v => `${v}mm`} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="mm" name="Rainfall" radius={[3, 3, 0, 0]}>
                            {rainfall.map((d, i) => (
                                <Cell key={i} fill={d.mm === 269 ? "#f87171" : d.mm === 150 ? "#10b981" : "#7c3aed"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

function TemperatureChart({ dest, temperature }: { dest: DestinationInfo, temperature: WeatherData[] }) {
    return (
        <Card className="p-5">
            <div className="font-bold text-sm mb-1 text-slate-100">Temperature in {dest.city} by month</div>
            <div className="text-xs text-slate-400 mb-5 font-medium">
                Warmest: <span className="text-amber-500 font-bold">Mar–Jun (28°C)</span> ·
                Coolest: <span className="text-cyan-400 font-bold">December (26°C)</span>
            </div>

            <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={temperature} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
    );
}

export default function AirlinesWeather({ dest, popAirlines, cheapAl, rainfall, temperature }: AirlinesWeatherProps) {
    return (
        <Wrap className="py-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <PopularAirlines dest={dest} popAirlines={popAirlines} />
                <CheapestAirlines dest={dest} cheapAl={cheapAl} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RainfallChart dest={dest} rainfall={rainfall} />
                <TemperatureChart dest={dest} temperature={temperature} />
            </div>
        </Wrap>
    );
}
