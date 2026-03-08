import { useEffect, useRef, useState } from "react";
import { useFlightSearch } from "@/contexts/FlightSearchContext";

type Props = {
    marker: string;          // TravelPayouts wl_id / affiliate id
};

export default function FlightWidget({
    marker,
}: Props) {
    const mountedRef = useRef(false);
    const [blocked, setBlocked] = useState(false);

    // Read search parameters from context
    const { origin, destination, departDate, returnDate, adults, childCount, infants, tripType } = useFlightSearch();

    useEffect(() => {
        // Prevent double-run in React Strict Mode (dev) & rerenders
        if (mountedRef.current) return;
        mountedRef.current = true;

        const SCRIPT_ID = "tp-flight-widget-script";

        // Clean any old widget DOM (safety)
        const searchEl = document.getElementById("tpwl-search");
        const ticketsEl = document.getElementById("tpwl-tickets");
        if (searchEl) searchEl.innerHTML = "";
        if (ticketsEl) ticketsEl.innerHTML = "";

        // Create a small "adblock detection" by attempting script load
        let timeout = window.setTimeout(() => {
            // if script didn't load in time, likely blocked by extension/privacy
            setBlocked(true);
        }, 4000);

        // If script already exists, don't append again
        const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (existing) {
            window.clearTimeout(timeout);
            // Script exists already; widget should render if not blocked
            return;
        }

        // --- Prepare pre-fill parameters from context ---
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

        // Set TPWL_CONFIGURATION before loading script (TP white-label expects this)
        (window as any).TPWL_CONFIGURATION = {
            ...(window as any).TPWL_CONFIGURATION,
            resultsURL: "https://gotravel-asia.vercel.app",
            init: initParams,
        };

        const s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.async = true;
        s.type = "module";
        s.src = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(marker)}`;

        s.onload = () => {
            window.clearTimeout(timeout);
            setBlocked(false);
        };

        s.onerror = () => {
            window.clearTimeout(timeout);
            setBlocked(true);
        };

        document.head.appendChild(s);

        return () => {
            window.clearTimeout(timeout);
            // CRITICAL FIX: The TravelPayouts script injects numerous global nodes/iframes that crash React routing (white screen).
            // We must aggressively clean up everything it injects or force a clean mount next time.
            const script = document.getElementById(SCRIPT_ID);
            if (script) script.remove();

            // The widget creates its own styles and hidden iframes. 
            // In a SPA, if these aren't removed, the next render will clash.
            document.querySelectorAll('iframe[src*="travelpayouts"], iframe[src*="tpwidg"], style[id^="tpwl-"]').forEach(el => el.remove());

            // Clean out the container manually so React doesn't get confused by mutated nodes.
            const searchEl = document.getElementById("tpwl-search");
            const ticketsEl = document.getElementById("tpwl-tickets");
            if (searchEl) searchEl.innerHTML = "";
            if (ticketsEl) ticketsEl.innerHTML = "";

            // Also reset the mounted ref so it can re-init if the user comes back.
            mountedRef.current = false;
        };
    }, [marker, origin, destination, departDate, returnDate, adults, childCount, infants, tripType]);

    return (
        <div style={{ background: "#eef1f6", minHeight: "100vh" }}>
            <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 1rem" }}>
                <div
                    style={{
                        background: "white",
                        borderRadius: "1rem",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        border: "1px solid rgba(229,231,235,0.6)",
                        padding: "0.75rem 1.25rem",
                        marginTop: "1rem",
                    }}
                >
                    {blocked && (
                        <div
                            style={{
                                padding: "12px 14px",
                                marginBottom: 12,
                                borderRadius: 12,
                                background: "#fff7ed",
                                border: "1px solid #fed7aa",
                            }}
                        >
                            <b>⚠️ Flight widget မပေါ်သေးပါ</b>
                            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5, color: "#92400e" }}>
                                Browser extension (Adblock/Brave Shields/Tracking protection) သို့မဟုတ် Third-party cookies ပိတ်ထားလို့
                                widget script ကို block ဖြစ်နိုင်ပါတယ်။ <br />
                                ✔️ Site အတွက် Adblock ပိတ်ပြီး Refresh လုပ်ပါ။ <br />
                                ✔️ Incognito mode / အခြား browser နဲ့ စမ်းပါ။
                            </div>
                        </div>
                    )}

                    {/* Must be stable IDs that the widget expects */}
                    <div id="tpwl-search" style={{ width: "100%" }} />
                </div>
            </div>

            <div style={{ maxWidth: 1152, margin: "0 auto", padding: "1rem" }}>
                <div id="tpwl-tickets" style={{ width: "100%" }} />
            </div>
        </div>
    );
}
