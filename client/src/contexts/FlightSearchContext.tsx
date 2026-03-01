/**
 * FlightSearchContext.tsx — Global shared state for flight search
 *
 * Both FlightWidget (writer) and FloatingSearchBar (reader + search)
 * consume this context.  buildSearchURL() is a PURE function —
 * tracking / side-effects are the caller's responsibility.
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    type ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Airport {
    code: string;    // "RGN"
    name: string;    // "Yangon (ရန်ကုန်)"
    country: string; // "Myanmar"
}

export type CabinCode = "Y" | "W" | "C" | "F";
export type TripType = "return" | "one-way";
export type FlexibilityType = "exact" | "3days" | "week" | "month";

export interface FlightSearchState {
    // Core
    tripType: TripType;
    origin: Airport | null;
    destination: Airport | null;
    departDate: string;   // "YYYY-MM-DD" or ""
    returnDate: string;   // "YYYY-MM-DD" or ""

    // Passengers
    adults: number;
    childCount: number;
    infants: number;
    cabinClass: CabinCode;

    // Flexibility
    flexibility: FlexibilityType;

    // Actions
    setTripType: (t: TripType) => void;
    setOrigin: (a: Airport | null) => void;
    setOriginIfEmpty: (a: Airport) => void;
    setDestination: (a: Airport | null) => void;
    swapAirports: () => void;
    setDepartDate: (d: string) => void;
    setReturnDate: (d: string) => void;
    setAdults: (n: number) => void;
    setChildCount: (n: number) => void;
    setInfants: (n: number) => void;
    setCabinClass: (c: CabinCode) => void;
    setFlexibility: (f: FlexibilityType) => void;

    // Reverse-sync: widget registers a callback so floating bar actions reflect back
    registerSwapCallback: (cb: () => void) => void;
    registerClearOriginCallback: (cb: () => void) => void;
    registerClearDestCallback: (cb: () => void) => void;

    // Return Affiliate URLs
    buildSearchURL: () => { skyscanner: string; travelpayouts: string } | null;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const FlightSearchContext = createContext<FlightSearchState | null>(null);

export function useFlightSearch(): FlightSearchState {
    const ctx = useContext(FlightSearchContext);
    if (!ctx) throw new Error("useFlightSearch must be used within <FlightSearchProvider>");
    return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function FlightSearchProvider({ children }: { children: ReactNode }) {
    const [tripType, setTripType] = useState<TripType>("return");
    const [origin, setOriginRaw] = useState<Airport | null>(null);
    const [destination, setDestinationRaw] = useState<Airport | null>(null);
    const [departDate, setDepartDate] = useState("");
    const [returnDate, setReturnDateRaw] = useState("");
    const [adults, setAdults] = useState(1);
    const [childCount, setChildCount] = useState(0);
    const [infants, setInfants] = useState(0);
    const [cabinClass, setCabinClass] = useState<CabinCode>("Y");
    const [flexibility, setFlexibility] = useState<FlexibilityType>("exact");

    // ── Wrapped setters ────────────────────────────────────────────────────
    const setOrigin = useCallback((a: Airport | null) => {
        setOriginRaw(a);
        if (a === null) clearOriginCallbackRef.current?.();
    }, []);

    const setOriginIfEmpty = useCallback((a: Airport) => {
        setOriginRaw(prev => (prev === null ? a : prev));
    }, []);

    const setDestination = useCallback((a: Airport | null) => {
        setDestinationRaw(a);
        if (a === null) clearDestCallbackRef.current?.();
    }, []);

    // Reverse-sync callback refs
    const swapCallbackRef = useRef<(() => void) | null>(null);
    const clearOriginCallbackRef = useRef<(() => void) | null>(null);
    const clearDestCallbackRef = useRef<(() => void) | null>(null);

    const registerSwapCallback = useCallback((cb: () => void) => { swapCallbackRef.current = cb; }, []);
    const registerClearOriginCallback = useCallback((cb: () => void) => { clearOriginCallbackRef.current = cb; }, []);
    const registerClearDestCallback = useCallback((cb: () => void) => { clearDestCallbackRef.current = cb; }, []);

    // Swap — correct approach using functional setState
    const swapAirports = useCallback(() => {
        setOriginRaw(prevOrigin => {
            setDestinationRaw(prevDest => {
                // Set origin to what dest was
                setOriginRaw(prevDest);
                return prevOrigin; // Set dest to what origin was
            });
            return prevOrigin; // placeholder, will be overwritten
        });
        // Also notify widget to swap its local state
        swapCallbackRef.current?.();
    }, []);

    const setReturnDate = useCallback((d: string) => setReturnDateRaw(d), []);

    // ── buildSearchURL ─────────────────────────────
    const buildSearchURL = useCallback((): { skyscanner: string; travelpayouts: string } | null => {
        if (!origin || !destination || !departDate) return null;

        // --- Date formatting helper ---
        const formatDate = (date: string) => date.replace(/-/g, ""); // "2024-03-15" → "20240315"
        const monthOnly = (date: string) => date.slice(0, 7).replace(/-/g, ""); // "202403"

        // --- Skyscanner URL builder ---
        const buildSkyscanner = () => {
            const base = "https://www.skyscanner.com/transport/flights";

            let depSegment: string;
            switch (flexibility) {
                case "3days":
                    depSegment = `${formatDate(departDate)}`;
                    break;
                case "week":
                    depSegment = `${formatDate(departDate)}`; // Skyscanner uses "anytime" for full flex
                    break;
                case "month":
                    depSegment = monthOnly(departDate); // e.g. "202403"
                    break;
                default: // "exact"
                    depSegment = formatDate(departDate);
            }

            const retSegment = returnDate ? formatDate(returnDate) : undefined;

            let url = `${base}/${origin.code.toLowerCase()}/${destination.code.toLowerCase()}/${depSegment}`;
            if (retSegment) url += `/${retSegment}`;
            url += `/?adults=${adults}&currency=THB`;

            if (flexibility === "3days") url += "&dateFlexibility=3";
            if (flexibility === "week") url += "&dateFlexibility=7";

            return url;
        };

        // --- Travelpayouts White Label (in-site) URL builder ---
        // Format: /flights/results?flightSearch={origin}{DD}{MM}{destination}{adults}
        const buildTravelpayouts = () => {
            const d = new Date(departDate + "T00:00:00");
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");

            let fs = `${origin.code}${dd}${mm}${destination.code}${adults}`;

            // If return trip, append return date segment
            if (returnDate) {
                const rd = new Date(returnDate + "T00:00:00");
                const rdd = String(rd.getDate()).padStart(2, "0");
                const rmm = String(rd.getMonth() + 1).padStart(2, "0");
                fs += `${rdd}${rmm}`;
            }

            return `/flights/results?flightSearch=${fs}`;
        };

        return {
            skyscanner: buildSkyscanner(),
            travelpayouts: buildTravelpayouts(),
        };
    }, [origin, destination, departDate, returnDate, adults, flexibility]);

    // ── Value ──────────────────────────────────────────────────────────────
    const value: FlightSearchState = {
        tripType,
        origin,
        destination,
        departDate,
        returnDate,
        adults,
        childCount,
        infants,
        cabinClass,

        setTripType,
        setOrigin,
        setOriginIfEmpty,
        setDestination,
        swapAirports,
        setDepartDate,
        setReturnDate,
        setAdults,
        setChildCount,
        setInfants,
        setCabinClass,
        flexibility,
        setFlexibility,

        registerSwapCallback,
        registerClearOriginCallback,
        registerClearDestCallback,

        buildSearchURL,
    };

    return (
        <FlightSearchContext.Provider value={value}>
            {children}
        </FlightSearchContext.Provider>
    );
}
