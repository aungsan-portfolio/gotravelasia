import Layout from "@/components/Layout";
import FlightAffiliateSearch from "@/components/flights/FlightAffiliateSearch";
import { ArrowLeft, Plane, ShieldCheck, Clock, TrendingDown } from "lucide-react";
import SEO from "@/seo/SEO";

export default function FlightResults() {
    return (
        <Layout>
            <SEO title="Search Results | Go Travel Asia" description="Compare the best flight deals across Southeast Asia." />
            
            <div className="tpwl-page flex flex-col min-h-screen bg-slate-50">
                {/* HERO SECTION - Premium Gradient and Depth */}
                <section className="relative pt-20 pb-12 overflow-hidden bg-[linear-gradient(135deg,#151c42_0%,#20305f_100%)]">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="container max-w-6xl relative z-10">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 text-violet-200/60 hover:text-white text-sm font-bold mb-8 transition-all hover:translate-x-[-4px]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Explorer
                        </a>

                        <div className="max-w-3xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-violet-200/80 backdrop-blur-md">
                                <Plane className="h-4 w-4 text-amber-400" />
                                Real-time Global Comparison
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[1.1]">
                                Search & Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Live Fares</span>
                            </h1>

                            <p className="mt-4 text-lg text-white/60 font-medium max-w-2xl leading-relaxed">
                                We're matching your route against 100+ booking sites to find the absolute cheapest tickets available right now.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {[
                                    { icon: ShieldCheck, text: "Secure booking", color: "text-emerald-400" },
                                    { icon: TrendingDown, text: "Best price guarantee", color: "text-amber-400" },
                                    { icon: Clock, text: "Live updates", color: "text-sky-400" },
                                ].map((badge, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10"
                                    >
                                        <badge.icon className={`w-4 h-4 ${badge.color}`} />
                                        <span className="text-sm font-bold text-white/80">{badge.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FLIGHT WIDGET AREA */}
                    <FlightAffiliateSearch marker={import.meta.env.VITE_TP_MARKER || "12942"} className="lg:max-w-5xl mx-auto" />

                {/* BOTTOM FEATURES BAR - Trust Indicators */}
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="container max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="font-black text-slate-900 text-lg italic">Verified Partners</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Every deal we show comes from a verified airline or travel agency with 100% secure payment systems.
                                </p>
                            </div>
                            <div className="space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-2xl mx-auto md:mx-0">
                                    <TrendingDown className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h4 className="font-black text-slate-900 text-lg italic">The Best Prices</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Our algorithms scour the web in seconds to ensure you never pay more for the exact same seat.
                                </p>
                            </div>
                            <div className="space-y-4 text-right md:text-left">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-50 rounded-2xl ml-auto md:ml-0">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                                <h4 className="font-black text-slate-900 text-lg italic">Real-Time Sync</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    Flight prices change every minute. Our live-sync technology ensures you see the current fare status.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
