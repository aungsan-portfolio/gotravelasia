import { useEffect } from "react";
import Layout from "@/components/Layout";
import { ArrowLeft, Plane, ShieldCheck, Clock, TrendingDown } from "lucide-react";
import { AFFILIATE } from "@/lib/config";

const TPWL_SCRIPT_URL = `https://tpwidg.com/wl_web/main.js?wl_id=${AFFILIATE.TPWL_ID}`;

export default function FlightResults() {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const flightSearch = urlParams.get("flightSearch");

        (window as any).TPWL_CONFIGURATION = {
            ...(window as any).TPWL_CONFIGURATION,
            resultsURL: window.location.origin + "/flights/results",
        };

        const existingScript = document.querySelector(
            `script[src^="https://tpwidg.com/wl_web/main.js"]`
        );

        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement("script");
        script.async = true;
        script.type = "module";
        script.src = flightSearch
            ? `${TPWL_SCRIPT_URL}&flightSearch=${flightSearch}`
            : TPWL_SCRIPT_URL;
        document.head.appendChild(script);

        const observer = new MutationObserver(() => {
            const ticketsEl = document.getElementById("tpwl-tickets");
            const hintEl = document.getElementById("tpwl-loading-hint");
            if (ticketsEl && ticketsEl.children.length > 0 && hintEl) {
                hintEl.style.display = "none";
            }
        });

        const ticketsEl = document.getElementById("tpwl-tickets");
        if (ticketsEl) {
            observer.observe(ticketsEl, { childList: true, subtree: true });
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <Layout>
            <div className="tpwl-page">
                <section className="relative pt-16 pb-10 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
                    </div>

                    <div className="container max-w-6xl relative z-10">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium mb-5 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </a>

                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                                <Plane className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                                    Search & Compare Flights
                                </h1>
                                <p className="text-white/50 text-sm font-medium mt-0.5">
                                    Compare prices from 100+ airlines
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: ShieldCheck, text: "Secure booking" },
                                { icon: TrendingDown, text: "Best price guarantee" },
                                { icon: Clock, text: "Real-time prices" },
                            ].map((badge, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-1.5 bg-white/8 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10"
                                >
                                    <badge.icon className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-xs font-medium text-white/70">{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative -mt-1" style={{ backgroundColor: "#eef1f6" }}>
                    <div className="container max-w-6xl">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200/60 p-3 md:p-5 -mt-4 relative z-20">
                            <div id="tpwl-search"></div>
                        </div>
                    </div>
                </section>

                <section className="py-4 min-h-[60vh]" style={{ backgroundColor: "#eef1f6" }}>
                    <div className="container max-w-6xl">
                        <div id="tpwl-tickets"></div>

                        <div id="tpwl-loading-hint" className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-xl mb-4 animate-pulse">
                                <Plane className="w-7 h-7 text-blue-500" />
                            </div>
                            <p className="text-lg font-bold text-gray-800 mb-1.5">
                                Searching for the best flights...
                            </p>
                            <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                Comparing prices across 100+ airlines to find the cheapest deals.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-8 bg-white border-t border-gray-100">
                    <div className="container max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mb-1">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Secure Booking</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">All transactions are encrypted and processed by verified travel agencies</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg mb-1">
                                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Best Price Guarantee</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">We compare hundreds of travel sites to find you the lowest fares</p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg mb-1">
                                    <Plane className="w-5 h-5 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Trusted Partners</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">Book through Aviasales, Trip.com, Agoda & other verified platforms</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
