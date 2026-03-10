import { useState } from "react";
import { Wrap, AmberBtn, StopBadge } from "./ui";
import type { DestinationInfo, FlightMeta, FlightDealsData, Deal } from "../../../data/destinationData";
import { PlaneTakeoff, Info } from "lucide-react";

const TABS = ["Cheapest", "Best", "Direct", "Last-minute", "One-way"] as const;

interface LegProps {
    time: string;
    arrTime: string;
    from: string;
    to: string;
    dur: string;
    stops: number;
    date: string;
}

function Leg({ time, arrTime, from, to, dur, stops, date }: LegProps) {
    return (
        <div className="flex-1 min-w-[140px]">
            <div className="text-[10px] text-slate-500 mb-1 font-medium">{date}</div>
            <div className="flex items-center gap-2 lg:gap-4">
                <div className="text-center">
                    <div className="text-base lg:text-[17px] font-extrabold text-slate-100 tracking-tight">{time}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{from}</div>
                </div>

                <div className="flex-1 text-center min-w-[50px] relative mt-1">
                    <div className="text-[9px] text-violet-400 mb-0.5 font-bold tracking-wide">{dur}</div>
                    <div className="h-px bg-gradient-to-r from-transparent via-violet-600 to-transparent w-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-500 bg-[#120e2e] px-1">
                        <PlaneTakeoff size={12} />
                    </div>
                    <div className="mt-1">
                        <StopBadge stops={stops} />
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-base lg:text-[17px] font-extrabold text-slate-100 tracking-tight">{arrTime}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{to}</div>
                </div>
            </div>
        </div>
    );
}

function FlightCard({ f }: { f: Deal }) {
    return (
        <div className="group flex flex-col md:flex-row items-start md:items-center gap-4 lg:gap-6 bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-violet-600/10 rounded-2xl p-4 lg:p-5 cursor-pointer transition-all hover:-translate-y-0.5 duration-200">
            <div className="min-w-[88px] flex items-center gap-3 md:block">
                <div className="text-[22px] leading-none bg-white/5 w-10 h-10 rounded-full flex items-center justify-center border border-white/10 group-hover:border-violet-500/30 group-hover:bg-violet-500/20 transition-colors">{f.logo}</div>
                <div>
                    <div className="text-[11px] font-bold text-slate-100 mt-2 leading-tight">{f.al}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 font-medium">{f.from} › SIN</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col xl:flex-row gap-4 w-full justify-between items-center">
                <Leg time={f.t1} arrTime={f.a1} from={f.from} to="SIN" dur={f.dur} stops={f.stops} date={f.d1} />

                {f.ret && f.t2 && f.a2 && (
                    <>
                        <div className="hidden xl:block w-px h-11 bg-white/10" />
                        <div className="xl:hidden w-full h-px bg-white/10" />
                        <Leg time={f.t2} arrTime={f.a2} from="SIN" to={f.from} dur={f.dur} stops={f.stops} date={f.ret} />
                    </>
                )}
            </div>

            <div className="text-left md:text-right min-w-[110px] w-full md:w-auto pt-3 md:pt-0 border-t border-white/10 md:border-none flex items-center md:block justify-between">
                <div>
                    <div className="text-[10px] text-slate-500 mb-0.5 font-medium">Deal found {f.found}</div>
                    <div className="text-[22px] font-black text-violet-300 tracking-tight">฿{f.price.toLocaleString()}</div>
                </div>
                <AmberBtn className="mt-0 md:mt-2 py-1.5 px-3">Pick Dates</AmberBtn>
            </div>
        </div>
    );
}

export interface FlightDealsProps {
    deals: FlightDealsData;
    dest: DestinationInfo;
    meta: FlightMeta;
}

export default function FlightDeals({ deals, dest, meta }: FlightDealsProps) {
    const [tab, setTab] = useState<keyof FlightDealsData>("Cheapest");

    return (
        <Wrap className="py-10">
            <h2 className="text-[22px] font-extrabold text-slate-100 tracking-tight mb-1.5">
                Cheap flight deals to {dest.city}
            </h2>
            <p className="text-[13px] text-slate-400 mb-4 font-medium">
                Based on {meta.searches.toLocaleString()} user searches · Updated {meta.updated}
            </p>

            {/* Info banner */}
            <div className="flex gap-3 items-center bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-4 py-3 mb-6 text-xs text-slate-400">
                <Info size={16} className="text-cyan-500 shrink-0" />
                <span className="font-medium leading-relaxed">
                    Prices are the cheapest found in the last 72 hrs. Click a deal to see full fare conditions.
                </span>
                <span className="ml-auto text-cyan-400 font-bold cursor-pointer hover:underline shrink-0">Learn more</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
                {TABS.map(t => {
                    const count = deals[t]?.length || 0;
                    return (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all border flex items-center gap-1.5 ${tab === t
                                    ? "border-violet-500 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-slate-100 shadow-md shadow-violet-500/20"
                                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                                }`}
                        >
                            <span>{t}</span>
                            {count > 0 && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tab === t ? "bg-white/20 text-white" : "bg-white/10 text-slate-400"
                                    }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {(deals[tab] || []).map(f => <FlightCard key={f.id} f={f} />)}
            </div>
        </Wrap>
    );
}
