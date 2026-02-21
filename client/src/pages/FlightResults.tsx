import { useEffect } from "react";
import Layout from "@/components/Layout";
import { ArrowLeft, Plane, ShieldCheck } from "lucide-react";

const TPWL_SCRIPT_URL = "https://tpwidg.com/wl_web/main.js?wl_id=12942";

export default function FlightResults() {
    useEffect(() => {
        // Read flightSearch param from URL (passed by FlightWidget)
        const urlParams = new URLSearchParams(window.location.search);
        const flightSearch = urlParams.get("flightSearch");

        // Set Travelpayouts configuration before loading the script
        (window as any).TPWL_CONFIGURATION = {
            ...(window as any).TPWL_CONFIGURATION,
            resultsURL: window.location.origin + "/flights/results",
        };

        // Check if script is already loaded
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

        // Hide the loading hint once tickets appear
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
            {/* ═══════════ HERO HEADER ═══════════ */}
            <section className="relative pt-20 pb-8 overflow-hidden" style={{
                background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)"
            }}>
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                </div>

                <div className="container max-w-6xl relative z-10">
                    {/* Back button */}
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-100 hover:text-white text-sm font-medium mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </a>

                    {/* Title */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                            <Plane className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                                Search & Compare Flights
                            </h1>
                            <p className="text-blue-100/80 text-sm md:text-base font-medium mt-1">
                                Compare prices from 100+ airlines • Best deals guaranteed
                            </p>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-4 mb-2">
                        {[
                            { icon: ShieldCheck, text: "Secure booking" },
                            { icon: Plane, text: "500+ routes" },
                        ].map((badge, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/15"
                            >
                                <badge.icon className="w-3.5 h-3.5 text-emerald-300" />
                                <span className="text-xs font-semibold text-white/90">{badge.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SEARCH FORM ═══════════ */}
            <section
                className="relative -mt-2 pb-4"
                style={{ backgroundColor: "#F0F2F5" }}
            >
                <div className="container max-w-6xl">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 -mt-4 relative z-20">
                        {/* Travelpayouts Search Form renders here */}
                        <div id="tpwl-search"></div>
                    </div>
                </div>
            </section>

            {/* ═══════════ SEARCH RESULTS ═══════════ */}
            <section
                className="py-6 min-h-[60vh]"
                style={{ backgroundColor: "#F0F2F5" }}
            >
                <div className="container max-w-6xl">
                    {/* Travelpayouts Search Results render here */}
                    <div id="tpwl-tickets"></div>

                    {/* Loading hint */}
                    <div id="tpwl-loading-hint" className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
                            <Plane className="w-8 h-8 text-blue-500 animate-pulse" />
                        </div>
                        <p className="text-xl font-bold text-gray-700 mb-2">
                            ✈️ Searching for the best flights...
                        </p>
                        <p className="text-sm text-gray-400 max-w-md mx-auto">
                            We're comparing prices across 100+ airlines to find you the cheapest deals. This usually takes a few seconds.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════ FOOTER TRUST SECTION ═══════════ */}
            <section className="py-8 bg-white border-t border-gray-100">
                <div className="container max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl">🔒</div>
                            <h4 className="font-bold text-gray-800 text-sm">Secure Booking</h4>
                            <p className="text-xs text-gray-500">All transactions are encrypted and processed by verified travel agencies</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl">💰</div>
                            <h4 className="font-bold text-gray-800 text-sm">Best Price Guarantee</h4>
                            <p className="text-xs text-gray-500">We compare hundreds of travel sites to find you the lowest fares</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl">✅</div>
                            <h4 className="font-bold text-gray-800 text-sm">Trusted Partners</h4>
                            <p className="text-xs text-gray-500">Book through Aviasales, Trip.com, Agoda & other verified platforms</p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
