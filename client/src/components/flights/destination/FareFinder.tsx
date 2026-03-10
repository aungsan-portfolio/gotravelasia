import { useState } from "react";
import { Wrap, Card, AmberBtn, StopBadge, HR } from "./ui";
import type { FareTableEntry, FlightMeta } from "../../../data/destinationData";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const PER = 5;

export interface FareFinderProps {
    rows: FareTableEntry[];
    meta: FlightMeta;
}

export default function FareFinder({ rows, meta }: FareFinderProps) {
    const [orig, setOrig] = useState("All");
    const [pg, setPg] = useState(1);

    const filtered = orig === "All" ? rows : rows.filter(r => r.from.includes(orig) || r.route.startsWith(orig));
    const pages = Math.ceil(filtered.length / PER);
    const shown = filtered.slice((pg - 1) * PER, pg * PER);

    return (
        <Wrap className="py-10">
            <h2 className="text-[22px] font-extrabold text-slate-100 tracking-tight mb-1.5">
                GoTravel Asia Fare Finder
            </h2>
            <p className="text-[13px] text-slate-400 mb-5 font-medium">
                Locate flights that fit your budget. {meta.searches.toLocaleString()} searches in last 7 days.
            </p>

            <Card className="p-0 overflow-hidden">
                <div className="p-5 pb-0">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-4 items-center">
                        <select
                            value={orig}
                            onChange={e => { setOrig(e.target.value); setPg(1); }}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100 text-xs font-semibold cursor-pointer outline-none [color-scheme:dark] hover:bg-white/10 transition-colors"
                        >
                            <option value="All">All Bangkok airports</option>
                            <option value="BKK">Bangkok Suvarnabhumi (BKK)</option>
                            <option value="DMK">Bangkok Don Mueang (DMK)</option>
                        </select>

                        <button className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-400 text-xs font-semibold cursor-pointer outline-none hover:bg-white/10 transition-colors flex items-center gap-2">
                            Route: BKK-SIN
                        </button>
                        <button className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-400 text-xs font-semibold cursor-pointer outline-none hover:bg-white/10 transition-colors flex items-center gap-2">
                            Price: Any
                        </button>
                        <button className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-400 text-xs font-semibold cursor-pointer outline-none hover:bg-white/10 transition-colors flex items-center gap-1 border-dashed">
                            <Plus size={14} /> Add filter
                        </button>

                        <div className="ml-auto text-[11px] text-slate-500 font-medium">
                            {filtered.length} results · Sorted cheapest · Deals found 6/3
                        </div>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:grid grid-cols-[100px_1fr_1fr_120px] gap-3 px-5 py-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-white/5 border-y border-white/10">
                    <span>Route</span>
                    <span>Outbound</span>
                    <span>Return</span>
                    <span className="text-right">Price</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5">
                    {shown.map((r, i) => (
                        <div key={i} className="flex flex-col lg:grid lg:grid-cols-[100px_1fr_1fr_120px] gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                            <div className="flex justify-between lg:block border-b border-white/5 pb-3 lg:border-none lg:pb-0">
                                <div>
                                    <div className="text-[11px] font-bold text-slate-100">{r.route}</div>
                                    {r.note && <div className="text-[9px] text-cyan-400 font-bold mt-1 uppercase tracking-wider bg-cyan-400/10 px-1.5 py-0.5 rounded inline-block">{r.note}</div>}
                                </div>
                                {/* Mobile Price Display */}
                                <div className="lg:hidden text-right">
                                    <div className="text-[19px] font-black text-violet-300 tracking-tight leading-none">฿{r.price.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex justify-between lg:block mt-1 lg:mt-0">
                                <div className="w-1/2 lg:w-auto pr-2 border-r border-white/5 lg:border-none lg:pr-0">
                                    <div className="text-[11px] font-bold text-slate-100">{r.from}</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{r.d1} → {r.a1}</div>
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <StopBadge stops={r.s1} />
                                        <span className="text-[10px] text-slate-500 font-medium">{r.dur1}</span>
                                    </div>
                                </div>

                                <div className="w-1/2 lg:w-auto pl-4 lg:pl-0">
                                    <div className="text-[11px] font-bold text-slate-100">{r.from2}</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{r.d2} → {r.a2}</div>
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <StopBadge stops={r.s2} />
                                        <span className="text-[10px] text-slate-500 font-medium">{r.dur2}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:flex flex-col items-end justify-center pt-2 lg:pt-0">
                                <div className="text-[19px] font-black text-violet-300 tracking-tight leading-none">฿{r.price.toLocaleString()}</div>
                                <AmberBtn className="mt-2 text-[10px] px-3 py-1.5 rounded-md w-full max-w-[100px]">Pick Dates</AmberBtn>
                            </div>

                            {/* Mobile CTA */}
                            <div className="lg:hidden mt-2 pt-3 border-t border-white/5 text-right w-full">
                                <AmberBtn className="w-full text-xs py-2.5">Pick Dates</AmberBtn>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center items-center gap-1 p-4 bg-white/[0.02] border-t border-white/5">
                        <button
                            onClick={() => setPg(p => Math.max(1, p - 1))}
                            disabled={pg === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPg(p)}
                                className={`w-8 h-8 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${p === pg
                                        ? "bg-violet-600 border border-violet-500 text-white shadow-md shadow-violet-500/20"
                                        : "bg-transparent border border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => setPg(p => Math.min(pages, p + 1))}
                            disabled={pg === pages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </Card>
        </Wrap>
    );
}
