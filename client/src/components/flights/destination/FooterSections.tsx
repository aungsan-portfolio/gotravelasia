import { useState } from "react";
import { Link } from "wouter";
import { Card, GhostBtn, Wrap, SectionTitle, SectionSub } from "./ui";
import { ChevronDown, Plane } from "lucide-react";
import type { DestinationPageVM } from "@/types/destination";

type Props = {
    data: DestinationPageVM;
    popDest: string[];
    popCities: string[];
};

function destSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
}

// ── FAQ Accordion ────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-none">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex justify-between items-center py-4 text-left font-semibold text-sm text-slate-100 cursor-pointer group outline-none"
            >
                <span className="group-hover:text-violet-300 transition-colors">{q}</span>
                <div className={`shrink-0 ml-4 transition-transform duration-200 text-violet-400 group-hover:text-violet-300 ${open ? "rotate-180" : ""}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-48 opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"}`}>
                <div className="text-[13px] text-slate-400 leading-relaxed font-medium pr-8">{a}</div>
            </div>
        </div>
    );
}

// ── Browse Section ───────────────────────────────────────────────
const BROWSE_TABS = ["Flights to", "By cabin class", "Flights from", "Popular routes", "Popular destinations"] as const;

function BrowseSection({ data }: { data: DestinationPageVM }) {
    const city = data.dest.city;
    const [tab, setTab] = useState<typeof BROWSE_TABS[number]>("Flights to");

    const contentMap: Record<string, { h: string; links: string[] }[]> = {
        "Flights to": [
            { h: "Best flight deals", links: [`Phuket to ${city}`, `Ko Samui to ${city}`, `Chiang Mai to ${city}`, `Hat Yai to ${city}`] },
            { h: "Popular routes", links: [`Bangkok BKK to ${city}`, `Bangkok DMK to ${city}`, `Chiang Rai to ${city}`, `Krabi to ${city}`] },
            { h: "By cabin class", links: [`Economy to ${city}`, `Premium Economy to ${city}`, `Business Class to ${city}`, `First Class to ${city}`] },
        ],
        "By cabin class": [
            { h: "Economy", links: ["Best economy deals", "Economy from Bangkok", "Economy from Chiang Mai", "Budget carriers"] },
            { h: "Business", links: ["Business class deals", "Lie-flat beds", "Business from BKK", "Thai Airways business"] },
            { h: "First Class", links: [`First class to ${city}`, "Luxury travel", "Private suites", "Award miles"] },
        ],
        "Flights from": [
            { h: "From Thailand", links: [`Bangkok to ${city}`, `Chiang Mai to ${city}`, `Phuket to ${city}`, `Hat Yai to ${city}`] },
            { h: "From nearby", links: [`Kuala Lumpur to ${city}`, `Singapore to ${city}`, `Hong Kong to ${city}`, `Hanoi to ${city}`] },
            { h: "From far", links: [`Tokyo to ${city}`, `Seoul to ${city}`, `Mumbai to ${city}`, `Dubai to ${city}`] },
        ],
        "Popular routes": [
            { h: "Direct flights", links: [`Bangkok → ${city} nonstop`, `Chiang Mai → ${city}`, `Phuket → ${city}`, `Krabi → ${city}`] },
            { h: "Budget routes", links: [`Cheapest to ${city}`, "Low-cost carriers", "Off-peak deals", "Student fares"] },
            { h: "Premium routes", links: [`Business class to ${city}`, `First class to ${city}`, "Thai Airways premium", "ANA premium"] },
        ],
        "Popular destinations": [
            { h: "Southeast Asia", links: ["Flights to Singapore", "Flights to Bangkok", "Flights to Kuala Lumpur", "Flights to Manila"] },
            { h: "East Asia", links: ["Flights to Tokyo", "Flights to Seoul", "Flights to Hong Kong", "Flights to Taipei"] },
            { h: "South Asia", links: ["Flights to Mumbai", "Flights to Dubai", "Flights to Yangon", "Flights to Phnom Penh"] },
        ],
    };

    const content = contentMap[tab] || contentMap["Flights to"];

    return (
        <Wrap className="py-8">
            <SectionTitle>Browse thousands of different options on GoTravel Asia</SectionTitle>
            <SectionSub>Toggle through the tabs below to find thousands of options for your next trip.</SectionSub>

            <div className="flex flex-wrap gap-2 mb-6">
                {BROWSE_TABS.map(t => (
                    <GhostBtn
                        key={t}
                        active={tab === t}
                        onClick={() => setTab(t)}
                        className="text-[11px] px-3.5 py-1.5 font-semibold"
                    >
                        {t}
                    </GhostBtn>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.map(g => (
                    <Card key={g.h} className="p-5">
                        <div className="text-xs font-bold text-slate-100 mb-4">{g.h}</div>
                        <div className="flex flex-col">
                            {g.links.map(l => (
                                <div key={l} className="py-2.5 border-b border-white/10 last:border-none text-xs font-medium text-violet-400 cursor-pointer hover:text-fuchsia-400 transition-colors flex items-center gap-2 group">
                                    <span className="text-violet-600 group-hover:text-fuchsia-500 transition-colors text-[10px]">▶</span>
                                    <span>{l}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </Wrap>
    );
}

// ── Fly With GoTravel / Trust badges ─────────────────────────────
function FlyWithGoTravel() {
    return (
        <Wrap className="py-16">
            <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-500/5 border border-violet-500/20 rounded-3xl p-8 lg:p-12 shadow-2xl shadow-violet-900/10">
                <SectionTitle>
                    <span className="text-fuchsia-400 mr-2">✦</span>
                    Fly with GoTravel Asia
                </SectionTitle>
                <SectionSub>Find the best flight deals — where travellers enjoy low prices and wide availability.</SectionSub>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-10">
                    {[
                        { ic: "🎯", t: "100% Free", b: "GoTravel Asia is completely free to use, so you can start saving the moment you arrive." },
                        { ic: "🔄", t: "Book With Flexibility", b: "Find flights with no change fees. Plan ahead with confidence and flexibility." },
                        { ic: "🧠", t: "Travel Smart", b: "Millions come to us for insights and data-driven graphs that inform booking decisions." },
                    ].map(f => (
                        <div key={f.t} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                            <div className="text-[32px] mb-4 bg-white/[0.05] w-14 h-14 flex items-center justify-center rounded-xl border border-white/10">{f.ic}</div>
                            <div className="font-extrabold text-sm mb-2 text-slate-100">{f.t}</div>
                            <div className="text-xs text-slate-400 leading-relaxed font-medium">{f.b}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Wrap>
    );
}

// ── Footer ───────────────────────────────────────────────────────
function Footer({ data, popDest, popCities }: Props) {
    return (
        <div className="bg-[#05030f] border-t border-white/10 pt-16 pb-10 px-6 mt-10">
            <div className="max-w-[1100px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
                    {/* Routes */}
                    {data.nearbyRoutes.length > 0 && (
                        <div>
                            <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Routes Worth Comparing</div>
                            <div className="flex flex-col gap-2.5">
                                {data.nearbyRoutes.map(r => (
                                    <Link key={r.href} href={r.href} className="text-xs font-semibold text-violet-400/80 cursor-pointer hover:text-slate-100 transition-colors">
                                        Flights to {r.city} ({r.code}) {r.tag ? `· ${r.tag}` : ""}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Popular Destinations */}
                    <div>
                        <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Popular Destinations</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {popDest.map(d => (
                                <Link key={d} href={`/flights/to/${destSlug(d)}`} className="text-xs font-semibold text-violet-400/80 cursor-pointer hover:text-slate-100 transition-colors line-clamp-1">
                                    Flights to {d}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
                        <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-5">GoTravel Asia</div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white">
                                <Plane size={16} fill="currentColor" />
                            </div>
                            <span className="text-[15px] font-black tracking-tight">
                                <span className="text-slate-100">GoTravel</span>
                                <span className="text-fuchsia-400"> Asia</span>
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 leading-relaxed mb-5 font-medium">
                            Southeast Asia's flight comparison platform. Free to use. Real prices from 900+ travel sites.
                        </div>
                        <div className="text-[11px] text-slate-600 font-bold flex items-center gap-1.5">
                            <span>🔒</span> {data.updatedAt ? `Prices last updated: ${new Date(data.updatedAt).toLocaleString()}` : "Showing saved route data"}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

                <div className="flex flex-col md:flex-row justify-between items-center text-[11px] font-semibold text-slate-600 mt-6 gap-3 text-center md:text-left">
                    <span>© 2026 GoTravel Asia · All rights reserved</span>
                    <span>Prices subject to change. Always verify on airline or travel site before booking.</span>
                </div>
            </div>
        </div>
    );
}

// ── Combined export ──────────────────────────────────────────────
export default function FooterSections({ data, popDest, popCities }: Props) {
    return (
        <>
            {/* FAQ section */}
            <Wrap className="py-10">
                <div id="faq-section">
                    <SectionTitle>FAQs about flying to {data.dest.city}</SectionTitle>
                </div>
                <Card className="px-6 py-2">
                    {data.faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
                </Card>
            </Wrap>

            <BrowseSection data={data} />
            <FlyWithGoTravel />
            <Footer data={data} popDest={popDest} popCities={popCities} />
        </>
    );
}
