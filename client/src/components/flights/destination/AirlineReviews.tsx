import { useState } from "react";
import { Card, ScoreBar, Wrap, SectionTitle, SectionSub } from "./ui";
import type { DestinationPageVM } from "@/types/destination";

type Props = { data: DestinationPageVM };

export default function AirlineReviews({ data }: Props) {
    const [idx, setIdx] = useState(0);
    const reviews = data.reviews;

    if (!reviews.length) return null;

    const al = reviews[idx];

    return (
        <Wrap className="py-12">
            <SectionTitle>Traveler confidence panel</SectionTitle>
            <SectionSub>
                Airline performance overview based on route data and traveler feedback.
            </SectionSub>

            {/* Airline selector tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {reviews.map((a, i) => (
                    <button
                        key={a.airline}
                        type="button"
                        onClick={() => setIdx(i)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${idx === i
                            ? "border-violet-600 bg-violet-600/20 text-violet-300"
                            : "border-white/10 bg-white/[0.035] text-slate-400 hover:bg-white/5 hover:text-slate-300"
                            }`}
                    >
                        <span>{a.airlineCode ?? "—"}</span>
                        <span>{a.airline}</span>
                        <span className={`text-[11px] font-extrabold ml-1 ${a.score >= 8 ? "text-emerald-500" : a.score >= 7 ? "text-cyan-400" : "text-amber-500"
                            }`}>
                            {a.score.toFixed(1)}
                        </span>
                    </button>
                ))}
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="flex flex-col lg:grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">

                    {/* Score + highlights */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-sm font-bold text-violet-300 border border-white/[0.05]">
                                {al.airlineCode ?? "—"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-base font-extrabold text-slate-100 truncate">{al.airline}</div>
                                <div className="text-[11px] text-slate-500 font-medium">Route performance</div>
                            </div>
                            <div className="text-center shrink-0">
                                <div className={`text-[34px] leading-none font-black tracking-tighter ${al.score >= 8 ? "text-emerald-500" : "text-cyan-400"
                                    }`}>{al.score.toFixed(1)}</div>
                                <div className={`text-[11px] font-bold ${al.score >= 8 ? "text-emerald-500" : "text-cyan-400"
                                    }`}>{al.score >= 8 ? "Very good" : al.score >= 7 ? "Good" : "Average"}</div>
                            </div>
                        </div>

                        {/* Score bar for overall */}
                        <ScoreBar label="Overall score" score={al.score} />

                        {/* Highlights */}
                        <div className="mt-4 space-y-2">
                            {al.highlights.map((h) => (
                                <div key={h} className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-slate-300 font-medium">
                                    {h}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="p-6 flex flex-col justify-center">
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 text-center">
                            <div className="text-xs text-slate-500 mb-1 font-medium">Score overview</div>
                            <div className="text-[34px] font-black text-violet-400 tracking-tighter leading-tight">
                                {al.score.toFixed(1)}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 mb-5 font-medium">
                                out of 10
                            </div>

                            <div className="text-xs text-slate-400 leading-relaxed font-medium mb-4">
                                {al.airline} is a {al.score >= 8 ? "highly rated" : al.score >= 7 ? "well-rated" : "reasonably rated"} option
                                on the {data.origin.city} → {data.dest.city} route.
                            </div>
                        </div>

                        {/* Quick facts */}
                        <div className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06] pt-2">
                            {[
                                ["Route", `${data.origin.city} → ${data.dest.city}`],
                                ["Duration", data.typicalDuration ?? "—"],
                                ["Stops", data.directAvailability ?? "—"],
                                ["Airlines on route", `${data.airlines.length} carriers`],
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
