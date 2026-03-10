import { useState } from "react";
import { Card, AmberBtn, ScoreBar, Wrap, SectionTitle, SectionSub } from "./ui";
import type { DestinationInfo, FlightMeta, AirlineReview } from "../../../data/destinationData";
import { ArrowRight } from "lucide-react";

export interface AirlineReviewsProps {
    dest: DestinationInfo;
    meta: FlightMeta;
    reviews: AirlineReview[];
}

export default function AirlineReviews({ dest, meta, reviews }: AirlineReviewsProps) {
    const [idx, setIdx] = useState(0);
    const al = reviews[idx];

    return (
        <Wrap className="py-24">
            <SectionTitle>Reviews of airlines servicing {dest.city}</SectionTitle>
            <SectionSub>
                Read reviews and discover the travel experience offered by airlines. Updated {meta.updated}.
            </SectionSub>

            {/* Airline selector tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {reviews.map((a, i) => (
                    <button
                        key={a.name}
                        onClick={() => setIdx(i)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${idx === i
                                ? "border-violet-600 bg-violet-600/20 text-violet-300"
                                : "border-white/10 bg-white/[0.035] text-slate-400 hover:bg-white/5 hover:text-slate-300"
                            }`}
                    >
                        <span>{a.e}</span>
                        <span>{a.name}</span>
                        <span className={`text-[11px] font-extrabold ml-1 ${a.r >= 8 ? "text-emerald-500" : a.r >= 7 ? "text-cyan-400" : "text-amber-500"
                            }`}>
                            {a.r}
                        </span>
                    </button>
                ))}
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="flex flex-col lg:grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">

                    {/* Score breakdown */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="text-[38px] leading-none shrink-0">{al.e}</div>
                            <div className="flex-1 min-w-0">
                                <div className="text-base font-extrabold text-slate-100 truncate">{al.name}</div>
                                <div className="text-[11px] text-slate-500 font-medium">{al.cnt.toLocaleString()} reviews</div>
                            </div>
                            <div className="text-center shrink-0">
                                <div className={`text-[34px] leading-none font-black tracking-tighter ${al.r >= 8 ? "text-emerald-500" : "text-cyan-400"
                                    }`}>{al.r}</div>
                                <div className={`text-[11px] font-bold ${al.r >= 8 ? "text-emerald-500" : "text-cyan-400"
                                    }`}>{al.lbl}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(al.sc).map(([k, v]) => <ScoreBar key={k} label={k} score={v} />)}
                        </div>
                    </div>

                    {/* Review card */}
                    <div className="p-6 bg-white/[0.01]">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-[13px] font-bold text-slate-100">Latest Review</div>
                            <div className="text-[11px] text-slate-500 font-medium">1/{al.cnt}</div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 shadow-inner">
                            <div className="flex justify-between mb-1.5">
                                <span className="text-xs font-semibold text-slate-100">{al.rev.u}</span>
                                <span className="text-[11px] text-slate-500">{al.rev.dt}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mb-3">{al.rev.rt}</div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg leading-none font-black text-cyan-400 w-8">{al.rev.s.toFixed(1)}</span>
                                <div className="flex-1 h-1 bg-white/[0.07] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-400 rounded-full"
                                        style={{ width: `${al.rev.s * 10}%` }}
                                    />
                                </div>
                            </div>

                            <div className="text-xs text-slate-400 leading-relaxed font-medium">"{al.rev.t}"</div>
                        </div>

                        <button className="mt-4 w-full py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-violet-400 text-xs font-bold hover:bg-violet-600/10 hover:border-violet-500/30 transition-all group">
                            <span>Read All Reviews</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* CTA + quick facts */}
                    <div className="p-6 flex flex-col justify-center">
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 text-center">
                            <div className="text-xs text-slate-500 mb-1 font-medium">Flights from Bangkok</div>
                            <div className="text-[34px] font-black text-violet-400 tracking-tighter leading-tight">
                                ฿{al.from.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 mb-5 font-medium">per person · one-way</div>

                            <AmberBtn className="w-full py-3.5 text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow">
                                <span>Check {al.name} Prices</span>
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </AmberBtn>
                        </div>

                        <div className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06] pt-2">
                            {[
                                ["Route", "Bangkok → Singapore"],
                                ["Avg time", "~2h 25m nonstop"],
                                ["Best day", "Thursday midday"],
                                ["Book ahead", "64+ days"],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between text-[11px] py-2">
                                    <span className="text-slate-500 font-medium">{k}</span>
                                    <span className="text-slate-200 font-bold">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </Card>
        </Wrap>
    );
}
