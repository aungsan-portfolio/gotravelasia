import { useEffect } from "react";
import Layout from "@/components/Layout";

const TPWL_SCRIPT_URL = "https://tpwidg.com/wl_web/main.js?wl_id=12942";

export default function FlightResults() {
    useEffect(() => {
        // Set Travelpayouts configuration before loading the script
        (window as any).TPWL_CONFIGURATION = {
            ...(window as any).TPWL_CONFIGURATION,
            resultsURL: "https://gotravel-asia.vercel.app/flights/results",
        };

        // Check if script is already loaded
        const existingScript = document.querySelector(
            `script[src="${TPWL_SCRIPT_URL}"]`
        );
        if (!existingScript) {
            const script = document.createElement("script");
            script.async = true;
            script.type = "module";
            script.src = TPWL_SCRIPT_URL;
            document.head.appendChild(script);
        }

        // Cleanup: remove script on unmount to prevent duplicates on re-navigation
        return () => {
            // Travelpayouts widget handles its own state, so we only clean up
            // the search container's contents to allow re-render on next visit
            const searchEl = document.getElementById("tpwl-search");
            const ticketsEl = document.getElementById("tpwl-tickets");
            if (searchEl) searchEl.innerHTML = "";
            if (ticketsEl) ticketsEl.innerHTML = "";
        };
    }, []);

    return (
        <Layout>
            {/* ═══════════ SEARCH FORM HEADER ═══════════ */}
            <section
                className="pt-24 pb-6"
                style={{ backgroundColor: "#F0F2F5" }}
            >
                <div className="container max-w-6xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">✈️</span>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                                Search & Compare Flights
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">
                                Powered by Aviasales — Compare 100+ airlines
                            </p>
                        </div>
                    </div>

                    {/* Travelpayouts Search Form renders here */}
                    <div id="tpwl-search"></div>
                </div>
            </section>

            {/* ═══════════ SEARCH RESULTS ═══════════ */}
            <section
                className="py-8 min-h-[60vh]"
                style={{ backgroundColor: "#F0F2F5" }}
            >
                <div className="container max-w-6xl">
                    {/* Travelpayouts Search Results render here */}
                    <div id="tpwl-tickets"></div>

                    {/* Loading hint (hidden once results appear) */}
                    <div id="tpwl-loading-hint" className="text-center py-12 text-gray-400">
                        <p className="text-lg font-medium">
                            👆 Use the search form above to find flights
                        </p>
                        <p className="text-sm mt-2">
                            Enter your origin, destination, and dates to see live prices
                        </p>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
