import { useState } from "react";
import { AmberBtn } from "./ui";
import { ArrowLeftRight, Search } from "lucide-react";
import type { DestinationPageVM } from "@/types/destination";

type Props = { data: DestinationPageVM };

export default function HeroSearch({ data }: Props) {
    const [tripType, setTripType] = useState("Return");
    const [from, setFrom] = useState(`${data.origin.city} (${data.origin.code})`);
    const [to, setTo] = useState(`${data.dest.city} (${data.dest.code})`);
    const [dep, setDep] = useState("");
    const [ret, setRet] = useState("");
    const [pax, setPax] = useState(1);
    const [cabin, setCabin] = useState("Economy");

    const swap = () => {
        const t = from;
        setFrom(to);
        setTo(t);
    };

    return (
        <div className="bg-gradient-to-br from-[#160838] via-[#1d0a4a] to-[#0b0719] border-b border-white/10 relative overflow-hidden">
            {/* Glow orbs */}
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.22)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute -bottom-10 left-[200px] w-[280px] h-[280px] rounded-full bg-[radial-gradient(circle,rgba(232,121,249,0.1)_0%,transparent_70%)] pointer-events-none" />

            <div className="max-w-[1100px] mx-auto px-6 py-9 relative z-10">
                {/* Breadcrumb */}
                <div className="flex gap-1.5 text-xs text-slate-500 mb-4 items-center font-medium">
                    <span className="text-violet-400 hover:text-violet-300 cursor-pointer transition-colors">Home</span>
                    <span>›</span>
                    <span className="text-violet-400 hover:text-violet-300 cursor-pointer transition-colors">{data.dest.country ?? "Destination"}</span>
                    <span>›</span>
                    <span className="text-slate-300">Cheap flights to {data.dest.city}</span>
                </div>

                {/* Headline */}
                <div className="text-[11px] text-violet-400 font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5">
                    <span className="text-amber-500">✦</span> Cheap Flights
                </div>
                <h1 className="text-[42px] font-black tracking-tight leading-tight mb-1.5 text-slate-100">
                    <span className="text-amber-500 font-mono">
                        ฿{data.lowestFare?.toLocaleString() ?? "—"}+
                    </span>{" "}
                    Cheap flights to {data.dest.city}
                </h1>
                <p className="text-slate-400 text-xs mb-6 font-medium">
                    {data.updatedAt
                        ? `Fares updated ${new Date(data.updatedAt).toLocaleString()}`
                        : "Showing saved route data"}
                    . Fares subject to change.
                </p>

                {data.isLiveRefreshing && (
                    <div className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs text-cyan-200 font-medium">
                        ✨ Refreshing live fares...
                    </div>
                )}

                {data.liveFailed && (
                    <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-200 font-medium">
                        Live fares are temporarily unavailable. Showing saved route data.
                    </div>
                )}

                {/* Widget */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                    {/* Trip type */}
                    <div className="flex gap-1.5 mb-4">
                        {["Return", "One-way", "Multi-city"].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTripType(t)}
                                className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${tripType === t
                                    ? "border-violet-600 bg-violet-600/20 text-violet-300"
                                    : "border-white/10 bg-transparent text-slate-400 hover:border-white/20"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Inputs Row */}
                    <div className="flex flex-col lg:flex-row gap-2 items-center mb-3">
                        {/* From */}
                        <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 w-full lg:flex-1 relative group focus-within:border-violet-500/50 transition-colors">
                            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-1">From</div>
                            <input
                                value={from}
                                onChange={e => setFrom(e.target.value)}
                                className="bg-transparent border-none outline-none text-slate-100 text-[13px] font-bold w-full"
                            />
                        </div>

                        {/* Swap */}
                        <button
                            type="button"
                            onClick={swap}
                            className="w-9 h-9 shrink-0 rounded-full bg-violet-600/20 border border-white/10 flex items-center justify-center text-violet-400 cursor-pointer hover:bg-violet-600/30 transition-colors z-10 -my-3 lg:my-0 lg:-mx-4"
                        >
                            <ArrowLeftRight size={14} />
                        </button>

                        {/* To */}
                        <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 w-full lg:flex-1 relative group focus-within:border-violet-500/50 transition-colors">
                            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-1">To</div>
                            <input
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                className="bg-transparent border-none outline-none text-slate-100 text-[13px] font-bold w-full"
                            />
                        </div>

                        {/* Depart */}
                        <div className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 w-full lg:flex-1 relative group focus-within:border-violet-500/50 transition-colors">
                            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Depart</div>
                            <input
                                type="date"
                                value={dep}
                                onChange={e => setDep(e.target.value)}
                                className={`bg-transparent border-none outline-none text-xs font-bold w-full [color-scheme:dark] ${dep ? "text-slate-100" : "text-slate-500"}`}
                            />
                        </div>

                        {/* Return */}
                        <div className={`bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 w-full lg:flex-1 transition-all ${tripType === "One-way" ? "opacity-40 grayscale" : "focus-within:border-violet-500/50"}`}>
                            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Return</div>
                            <input
                                type="date"
                                value={ret}
                                onChange={e => setRet(e.target.value)}
                                disabled={tripType === "One-way"}
                                className={`bg-transparent border-none outline-none text-xs font-bold w-full [color-scheme:dark] ${ret ? "text-slate-100" : "text-slate-500"} ${tripType === "One-way" ? "cursor-not-allowed" : "cursor-pointer"}`}
                            />
                        </div>

                        {/* Search Button */}
                        <AmberBtn className="w-full lg:w-auto px-6 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
                            <Search size={16} strokeWidth={3} />
                            <span>Search</span>
                        </AmberBtn>
                    </div>

                    {/* Pax / cabin */}
                    <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400 mt-4">
                        <div className="flex gap-1.5 items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                            <button type="button" onClick={() => setPax(p => Math.max(1, p - 1))} className="w-[22px] h-[22px] rounded border border-white/10 text-violet-400 flex items-center justify-center hover:bg-white/10 transition-colors">-</button>
                            <span className="text-slate-100 font-bold min-w-[16px] text-center">{pax}</span>
                            <button type="button" onClick={() => setPax(p => Math.min(9, p + 1))} className="w-[22px] h-[22px] rounded border border-white/10 text-violet-400 flex items-center justify-center hover:bg-white/10 transition-colors">+</button>
                            <span className="ml-1">{pax === 1 ? "adult" : "adults"}</span>
                        </div>

                        <select
                            value={cabin}
                            onChange={e => setCabin(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100 font-semibold outline-none [color-scheme:dark] cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            {["Economy", "Premium Economy", "Business", "First"].map(c => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>

                        <span className="ml-auto flex items-center gap-1.5 mt-2 sm:mt-0 font-medium tracking-wide">
                            <span>Searching</span>
                            <span className="text-violet-400 font-bold bg-violet-400/10 px-1.5 py-0.5 rounded text-[10px]">900+</span>
                            <span>travel sites</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
