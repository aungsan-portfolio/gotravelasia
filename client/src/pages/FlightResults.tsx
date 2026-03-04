import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { Loader2, RefreshCw, ArrowLeft, Plane, ShieldCheck, Clock, TrendingDown } from "lucide-react";

export default function FlightResults() {
    const [location] = useLocation();
    const [iframeHeight, setIframeHeight] = useState(1200);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const searchParams = location.split("?")[1] || "";
    const iframeSrc = `/flight-widget.html${searchParams ? `?${searchParams}` : ""}`;

    // === INTERSECTION OBSERVER (Lazy Load) ===
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Height listener
    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.action === "setHeight") {
                setIframeHeight(Math.max(e.data.height, 800));
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    const handleLoad = () => setLoading(false);
    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    const handleRetry = () => {
        setLoading(true);
        setError(false);
        if (iframeRef.current) {
            iframeRef.current.src = iframeSrc + `&t=${Date.now()}`;
        }
    };

    return (
        <Layout>
            <div className="tpwl-page flex flex-col min-h-screen">
                {/* PRESERVED HERO SECTION FROM ORIGINAL CODE */}
                <section className="relative pt-16 pb-10 overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl" />
                    </div>

                    <div className="container max-w-6xl relative z-10">
                        <a
                            href="/"
                            onClick={(e) => {
                                // If they click this specifically (rather than Logo), 
                                // we can just let it do standard Wouter navigation or native depending on preference.
                                // Since this bug is fixed globally via iframe, normal wouter Link would also be fine,
                                // but we keep the native behavior for absolute safety.
                            }}
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

                {/* IFRAME CONTAINER */}
                <div ref={containerRef} className="relative flex-1" style={{ backgroundColor: "#eef1f6", minHeight: "800px" }}>

                    {/* Loading Overlay */}
                    {loading && isVisible && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center pt-20" style={{ backgroundColor: "#eef1f6" }}>
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-xl mb-4 animate-pulse">
                                <Plane className="w-7 h-7 text-blue-500" />
                            </div>
                            <p className="text-lg font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                Searching for the best flights...
                            </p>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto text-center">
                                Comparing prices across 100+ airlines to find the cheapest deals.
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && isVisible && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-20 text-center bg-white/90 backdrop-blur-sm">
                            <p className="text-red-600 text-xl font-bold mb-2">Failed to load results</p>
                            <p className="text-gray-500 mb-6">Please check your connection and try again.</p>
                            <button
                                onClick={handleRetry}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm"
                            >
                                <RefreshCw size={18} />
                                Retry Search
                            </button>
                        </div>
                    )}

                    {/* Iframe */}
                    {isVisible && (
                        <iframe
                            ref={iframeRef}
                            src={iframeSrc}
                            className={`w-full border-0 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                            style={{ height: `${iframeHeight}px`, minHeight: "800px" }}
                            onLoad={handleLoad}
                            onError={handleError}
                            title="Travelpayouts Flight Results"
                            loading="eager"
                            fetchPriority="high"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                        />
                    )}
                </div>

                {/* BOTTOM FEATURES BAR (from original) */}
                <section className="py-8 bg-white border-t border-gray-100 mt-auto">
                    <div className="container max-w-6xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mb-1">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Secure Booking</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    All transactions are encrypted and processed by verified travel agencies
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg mb-1">
                                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Best Price Guarantee</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    We compare hundreds of travel sites to find you the lowest fares
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg mb-1">
                                    <Plane className="w-5 h-5 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Trusted Partners</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Book through Aviasales, Trip.com, Agoda & other verified platforms
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
