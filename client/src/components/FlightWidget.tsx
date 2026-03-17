import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { AirportAutocomplete } from "@/components/AirportAutocomplete";
import { 
    AlertTriangle, 
    RefreshCw, 
    ExternalLink, 
    Loader2, 
    ShieldAlert,
    Plane,
    XCircle
} from "lucide-react";

type WidgetStatus = "idle" | "loading" | "ready" | "blocked";

declare global {
  interface Window {
    TPWL_CONFIGURATION?: Record<string, any>;
    TPWL?: any;
  }
}

type Props = {
    marker: string; // Travelpayouts wl_id / affiliate id
};

const LOAD_TIMEOUT_MS = 9000;
const SCRIPT_ID = "tp-flight-widget-script";
const TP_MARKER = "697202";
const TP_PROGRAM_ID = "4114";

// Utility for CSS classes
function cn(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

/**
 * Checks if the widget has actually rendered something useful into the host.
 */
function hasRenderedWidget(host: HTMLElement | null) {
  if (!host) return false;

  // Travelpayouts usually renders an iframe or a complex div structure
  const iframe = host.querySelector("iframe");
  if (iframe) return true;

  const usefulElements = Array.from(host.querySelectorAll("*")).filter((el) => {
    const tag = el.tagName.toLowerCase();
    return tag !== "script" && tag !== "style";
  });

  const text = (host.textContent || "").trim();
  // If we have actual UI elements or significant text, it's probably rendered
  return usefulElements.length > 0 || text.length > 30;
}

/**
 * Builds a precise affiliate deep link if the widget is blocked.
 */
function buildFlightFallbackUrl(input: {
    originCode?: string;
    destCode?: string;
    departDate?: string;
    returnDate?: string;
    adults?: number;
}) {
    if (!input.originCode || !input.destCode || !input.departDate) {
        return "/flights/results"; // Base fallback
    }

    const aviasales = new URL("https://www.aviasales.com/search");
    aviasales.searchParams.set("origin_iata", input.originCode.toUpperCase());
    aviasales.searchParams.set("destination_iata", input.destCode.toUpperCase());
    aviasales.searchParams.set("depart_date", input.departDate);
    aviasales.searchParams.set("one_way", input.returnDate ? "false" : "true");
    aviasales.searchParams.set("adults", String(input.adults || 1));
    aviasales.searchParams.set("locale", "en");
    aviasales.searchParams.set("currency", "USD");

    if (input.returnDate) {
        aviasales.searchParams.set("return_date", input.returnDate);
    }

    const partner = new URL("https://tp.media/r");
    partner.searchParams.set("marker", TP_MARKER);
    partner.searchParams.set("p", TP_PROGRAM_ID);
    partner.searchParams.set("u", aviasales.toString());

    return partner.toString();
}

export default function FlightWidget({ marker }: Props) {
    const widgetHostRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<MutationObserver | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const [status, setStatus] = useState<WidgetStatus>("idle");
    const [attempt, setAttempt] = useState(0);

    // Read search parameters from project's context
    const { 
        origin, setOrigin, 
        destination, setDestination, 
        registerClearOriginCallback, 
        registerClearDestCallback,
        departDate, returnDate, 
        adults, childCount, infants, 
        tripType 
    } = useFlightSearch();

    const cleanup = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const removeOldScript = useCallback(() => {
        const existing = document.getElementById(SCRIPT_ID);
        if (existing) existing.remove();

        // Clean up global pop-up iframes and styles
        document.querySelectorAll('style[id^="tpwl-"]').forEach(el => el.remove());
        document.querySelectorAll('body > iframe[src*="travelpayouts"], body > iframe[src*="tpwidg"]').forEach(el => el.remove());
        
        if (window.TPWL) {
            delete window.TPWL;
        }
    }, []);

    const checkReady = useCallback(() => {
        if (hasRenderedWidget(widgetHostRef.current)) {
            setStatus("ready");
            cleanup();
        }
    }, [cleanup]);

    const mountWidget = useCallback(() => {
        const host = widgetHostRef.current;
        if (!host) return;

        cleanup();
        removeOldScript();
        setStatus("loading");
        
        // Safety: clear host but keep React-friendly if possible
        host.innerHTML = "";

        // Prepare parameters from context
        const initParams: any = {};
        if (origin) initParams.origin = { name: origin.name, iata: origin.code };
        if (destination) initParams.destination = { name: destination.name, iata: destination.code };
        if (departDate) initParams.departDate = departDate;
        if (tripType === "return" && returnDate) {
            initParams.returnDate = returnDate;
        } else {
            initParams.oneWay = true;
        }
        initParams.passengers = {
            adults: adults > 0 ? adults : 1,
            children: childCount || 0,
            infants: infants || 0,
        };

        // Set global configuration
        window.TPWL_CONFIGURATION = {
            ...window.TPWL_CONFIGURATION,
            resultsURL: window.location.origin + "/flights/results",
            marker: TP_MARKER,
            init: initParams,
        };

        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.async = true;
        script.type = "module";
        script.src = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(marker)}`;

        script.onload = () => {
            // Give it a tiny bit of time to start rendering
            window.setTimeout(checkReady, 700);
        };

        script.onerror = () => {
            setStatus("blocked");
            cleanup();
        };

        // Observe the host for any DOM changes (rendering start)
        observerRef.current = new MutationObserver(() => {
            checkReady();
        });

        observerRef.current.observe(host, {
            childList: true,
            subtree: true,
            attributes: true,
        });

        // Fail-safe timeout
        timeoutRef.current = window.setTimeout(() => {
            if (hasRenderedWidget(host)) {
                setStatus("ready");
            } else {
                setStatus("blocked");
            }
            cleanup();
        }, LOAD_TIMEOUT_MS);

        host.appendChild(script);
    }, [marker, origin, destination, departDate, returnDate, adults, childCount, infants, tripType, checkReady, cleanup, removeOldScript]);

    useEffect(() => {
        mountWidget();
        return () => {
            cleanup();
            removeOldScript();
        };
    }, [attempt, mountWidget, cleanup, removeOldScript]);

    const handleRetry = () => setAttempt(prev => prev + 1);

    const fallbackUrl = useMemo(() => buildFlightFallbackUrl({
        originCode: origin?.code,
        destCode: destination?.code,
        departDate,
        returnDate,
        adults
    }), [origin, destination, departDate, returnDate, adults]);

    const isLoading = status === "loading";
    const isBlocked = status === "blocked";

    return (
        <div className="bg-[#f8fafc] min-h-screen py-6 md:py-8">
            <div className="max-w-6xl mx-auto px-4">
                
                {/* ── ALERTS & STATUS ── */}
                {isBlocked && (
                    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-100 rounded-xl">
                                <ShieldAlert className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-amber-900 leading-none">Flight Search Blocked</h2>
                                <p className="mt-2 text-sm text-amber-800/80 leading-relaxed">
                                    Privacy settings or an AdBlocker may be preventing the search widget from loading. 
                                    Please try disabling protection for this site or use the direct search link below.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        onClick={handleRetry}
                                        className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-100 active:scale-95"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Retry Widget
                                    </button>
                                    <a
                                        href={fallbackUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 shadow-md active:scale-95"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Open Direct Search
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MAIN SEARCH WIDGET CARD ── */}
                <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    
                    {/* CARD HEADER / CONTROLS */}
                    <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <Plane className="h-5 w-5 text-indigo-600" />
                                    Flight Search
                                </h3>
                                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <span>Status:</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full",
                                        status === "ready" ? "bg-emerald-100 text-emerald-700" :
                                        status === "loading" ? "bg-blue-100 text-blue-700" :
                                        "bg-amber-100 text-amber-700"
                                    )}>
                                        {status}
                                    </span>
                                </div>
                            </div>

                            {/* CUSTOM AIRPORT SEARCH FORM (Pre-filters context) */}
                            <div className="flex flex-col sm:flex-row gap-3 md:w-2/3">
                                <div className="flex-1 min-w-0">
                                    <AirportAutocomplete
                                        label="From"
                                        value={origin}
                                        onChange={setOrigin}
                                        onClear={() => registerClearOriginCallback(() => setOrigin(null as any))}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <AirportAutocomplete
                                        label="To"
                                        value={destination}
                                        onChange={setDestination}
                                        onClear={() => registerClearDestCallback(() => setDestination(null as any))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* WIDGET HOST AREA */}
                    <div className={cn(
                        "relative min-h-[500px] transition-all duration-300",
                        status === "ready" ? "opacity-100" : "opacity-60 grayscale-[0.5]"
                    )}>
                        
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                                <div className="relative">
                                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-900">Connecting to travel partners…</p>
                                <p className="mt-1 text-xs text-slate-500 font-medium">Gathering the best fares from 100+ airlines</p>
                            </div>
                        )}

                        {/* Blocked Overlay */}
                        {isBlocked && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 p-6 text-center">
                                <XCircle className="h-10 w-10 text-slate-300 mb-3" />
                                <h4 className="text-slate-900 font-bold">Widget Unavailable</h4>
                                <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                                    This widget cannot load in your current browser session. 
                                    Please use the direct search flow.
                                </p>
                            </div>
                        )}

                        {/* ACTUAL WIDGET DOM ELEMENTS */}
                        <div className="p-2 md:p-4">
                            <div ref={widgetHostRef} id="tpwl-search" className="w-full" />
                            <div id="tpwl-tickets" className="w-full mt-6" />
                        </div>
                    </div>
                </div>

                {/* DEBUG FOOTER (Optional/Hidden in production but helpful for now) */}
                <details className="mt-8 opacity-40 hover:opacity-100 transition-opacity">
                    <summary className="text-xs font-bold text-slate-500 cursor-pointer uppercase tracking-widest px-2">Diagnostic Data</summary>
                    <div className="mt-2 p-4 bg-slate-900 rounded-2xl text-[10px] font-mono text-emerald-400 overflow-auto max-h-40 shadow-inner">
                        <pre>{JSON.stringify({ 
                            origin: origin?.code, 
                            destination: destination?.code, 
                            departDate, 
                            tripType,
                            status, 
                            attempt 
                        }, null, 2)}</pre>
                    </div>
                </details>

            </div>
        </div>
    );
}
