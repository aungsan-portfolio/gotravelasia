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

    // Reverse-sync: widget registers a callback so floating bar actions reflect back
    registerSwapCallback: (cb: () => void) => void;
    registerClearOriginCallback: (cb: () => void) => void;
    registerClearDestCallback: (cb: () => void) => void;

    // Pure helper — returns URL string only
    buildSearchURL: () => string;
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

    // ── buildSearchURL — pure, no side effects ─────────────────────────────
    const buildSearchURL = useCallback((): string => {
        if (!origin || !destination || !departDate) return "";

        const fmtDDMM = (dateStr: string): string => {
            const [, mm, dd] = dateStr.split("-");
            return dd + mm;
        };

        const cabinMap: Record<CabinCode, string> = { Y: "", W: "w", C: "c", F: "f" };

        let fs = `${origin.code}${fmtDDMM(departDate)}${destination.code}`;
        if (returnDate) fs += fmtDDMM(returnDate);
        fs += `${cabinMap[cabinClass] ?? ""}${adults}`;
        if (childCount > 0) fs += childCount;
        if (infants > 0) fs += infants;

        return `/flights/results?flightSearch=${fs}`;
    }, [origin, destination, departDate, returnDate, cabinClass, adults, childCount, infants]);

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
