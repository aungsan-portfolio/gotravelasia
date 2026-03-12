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
    useMemo,
    useEffect,
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

import { buildTravelpayoutsResultsUrl } from "@/lib/travelpayouts";
import { getDestinationByCode } from "@/data/destinationRegistry";

/**
 * Prevent double decoding of URL parameters (common with affiliate links).
 */
export function safeDecodeParam(param: string): string {
    if (!param) return "";
    try {
        // Decode only once - prevents double-decoding issues
        return decodeURIComponent(param);
    } catch (e) {
        console.warn("Failed to decode param:", param);
        return param; // Return original if decode fails
    }
}

/**
 * Correctly parse trip details to prevent extra return row or date mismatches.
 */
export function parseTripDetails(
    tripType: string,
    returnDateRaw: string | null
): { isRoundTrip: boolean; returnDate: string | null } {
    const type = safeDecodeParam(tripType).toLowerCase();
    const isRoundTrip = type === "roundtrip" || type === "return";

    let returnDate: string | null = null;

    if (isRoundTrip && returnDateRaw) {
        returnDate = safeDecodeParam(returnDateRaw);

        // Validate/extract date if needed (handle ISO T separator)
        if (returnDate && !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)) {
            const datePart = returnDate.split("T")[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
                returnDate = datePart;
            }
        }
    }

    return { isRoundTrip, returnDate };
}

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

    // ── Pre-fill logic (URL → State) ──────────────────────────────────────
    useEffect(() => {
        const search = new URLSearchParams(window.location.search);
        const flightSearch = search.get("flightSearch");
        if (!flightSearch) return;

        // Parse format: {ORIGIN}{DDMM}{DEST}[{DDMM}][class]{adults}{children}{infants}
        // This is the Travelpayouts native search string, but we also support
        // raw key-value pairs if the helper redirected with search.toString().
        
        // If it looks like a standard query string inside the param:
        if (flightSearch.includes("origin=") && flightSearch.includes("destination=")) {
            const inner = new URLSearchParams(flightSearch);
            const originCode = safeDecodeParam(inner.get("origin") || "");
            const destCode = safeDecodeParam(inner.get("destination") || "");
            const departAt = safeDecodeParam(inner.get("depart") || "");
            const returnAtRaw = inner.get("return");
            const tripTypeRaw = inner.get("tripType") || "return";
            const cabinRaw = inner.get("cabin") || "Y";
            const adultsRaw = inner.get("adults") || "1";

            const originRec = getDestinationByCode(originCode.toUpperCase());
            const destRec = getDestinationByCode(destCode.toUpperCase());

            if (originRec) setOriginRaw({ code: originRec.dest.code, name: originRec.dest.city, country: "" });
            if (destRec) setDestinationRaw({ code: destRec.dest.code, name: destRec.dest.city, country: "" });

            if (departAt) {
                const cleanDate = departAt.split("T")[0];
                if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) setDepartDate(cleanDate);
            }

            const { isRoundTrip, returnDate } = parseTripDetails(tripTypeRaw, returnAtRaw);
            setTripType(isRoundTrip ? "return" : "one-way");
            if (returnDate) setReturnDateRaw(returnDate);

            // Cabin mapping
            const cabinMap: Record<string, CabinCode> = { c: "C", w: "W", f: "F", "Y": "Y" };
            setCabinClass(cabinMap[cabinRaw.toUpperCase()] || "Y");
            setAdults(parseInt(adultsRaw) || 1);
            
            return;
        }

        // --- Travelpayouts Native Format parsing (Fallback) ---
        const match = flightSearch.match(/^([A-Z]{3})(\d{4})([A-Z]{3})(\d{4})?([cwf]?)(\d{1,3})$/i);
        if (!match) return;

        const [, originCode, , destCode, retDdMm, cabinSuffix, paxSuffix] = match;

        const originRec = getDestinationByCode(originCode.toUpperCase());
        const destRec = getDestinationByCode(destCode.toUpperCase());

        if (originRec) setOriginRaw({ code: originRec.dest.code, name: originRec.dest.city, country: "" });
        if (destRec) setDestinationRaw({ code: destRec.dest.code, name: destRec.dest.city, country: "" });

        if (retDdMm) setTripType("return");
        else setTripType("one-way");

        const cabinMap: Record<string, CabinCode> = { c: "C", w: "W", f: "F" };
        setCabinClass(cabinMap[cabinSuffix.toLowerCase()] || "Y");

        if (paxSuffix.length >= 1) setAdults(parseInt(paxSuffix[0]) || 1);
        if (paxSuffix.length >= 2) setChildCount(parseInt(paxSuffix[1]) || 0);
        if (paxSuffix.length >= 3) setInfants(parseInt(paxSuffix[2]) || 0);

    }, []);

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
        const buildTravelpayouts = () => {
            if (!origin || !destination) return "/flights/results";
            return buildTravelpayoutsResultsUrl({
                origin: origin.code,
                destination: destination.code,
                departDate,
                returnDate,
                adults,
                children: childCount,
                infants,
                cabinClass,
            });
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
