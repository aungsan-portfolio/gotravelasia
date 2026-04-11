import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, isValid } from "date-fns";
import posthog from "posthog-js";
import { z } from "zod";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { AIRPORT_MAP, DEFAULT_ORIGIN, CABIN_OPTIONS, type CabinCode } from "./flightWidget.data.js";
import { detectOriginAirport } from "./flightWidget.geo.js";
import { recentSearches, type RecentSearchRecord } from "./flightWidget.recent.js";
import { usePriceHint } from "@/hooks/useFlightData";
import { persistSearchToSession } from "@/lib/detectRouteFromContext";
import { useFlightWidgetPriceIntelligence } from "@/hooks/useFlightWidgetPriceIntelligence";

export const ENABLE_LOCAL_RESULTS = false; // Use local Flight Search Hook instead of redirecting (false for PROD)

const flightSearchSchema = z
    .object({
        origin: z.string().min(1),
        destination: z.string().min(1),
        departDate: z.string().min(1, "Please select a departure date"),
        returnDate: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.origin === data.destination) {
            ctx.addIssue({ code: "custom", message: "Origin and destination cannot be the same", path: ["destination"] });
        }
        if (data.returnDate && data.returnDate < data.departDate) {
            ctx.addIssue({ code: "custom", message: "Return date must be after departure date", path: ["returnDate"] });
        }
    });

export function useFlightWidgetState() {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const todayDate = useMemo(() => new Date(today + "T00:00:00"), [today]);

    const ctx = useFlightSearch();

    const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
    const [destination, setDestination] = useState("SIN");

    const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");

    const [departDate, setDepartDate] = useState(today);
    const [returnDate, setReturnDate] = useState("");

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    const [cabinClass, setCabinClass] = useState<CabinCode>("Y");

    const [detectingLocation, setDetectingLocation] = useState(true);
    const [formError, setFormError] = useState("");

    const [openPax, setOpenPax] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarMode, setCalendarMode] = useState<"depart" | "return">("depart");

    const [calendarCheapestPrice, setCalendarCheapestPrice] = useState<number | null>(null);
    const [committedSearchTs, setCommittedSearchTs] = useState<number>(0);
    const [committedPriceQuery, setCommittedPriceQuery] = useState<{
        origin: string;
        destination: string;
        departDate: string;
        returnDate?: string;
    } | null>(null);

    const paxTriggerRef = useRef<HTMLButtonElement>(null);
    const doneButtonRef = useRef<HTMLButtonElement>(null);
    const hasOpenedPax = useRef(false);

    // ... (context sync useEffect)

    // ... (geo-detect useEffect)

    // ... (swap callback useEffect)

    // ... (infant clamp useEffect)

    // ... (esc close useEffect)

    // ... (pax focus management useEffect)

    const departDateObj = useMemo(() => {
        const d = new Date(departDate + "T00:00:00");
        return isValid(d) ? d : undefined;
    }, [departDate]);

    const returnDateObj = useMemo(() => {
        if (!returnDate) return undefined;
        const d = new Date(returnDate + "T00:00:00");
        return isValid(d) ? d : undefined;
    }, [returnDate]);

    const lowestPrice = usePriceHint(origin, destination, !!returnDate);

    const committedOrigin = committedPriceQuery?.origin ?? "";
    const committedDestination = committedPriceQuery?.destination ?? "";
    const committedDepartDate = committedPriceQuery?.departDate ?? "";
    const committedReturnDate = committedPriceQuery?.returnDate;

    // Non-visual bridge: runs only after explicit user commit.
    const priceIntelligence = useFlightWidgetPriceIntelligence({
        committed: committedSearchTs > 0 && committedOrigin.length > 0,
        origin: committedOrigin,
        destination: committedDestination,
        departDate: committedDepartDate,
        returnDate: committedReturnDate,
    });
    const displayPrice = lowestPrice || calendarCheapestPrice;

    const validateSearch = useCallback(() => {
        const parsed = flightSearchSchema.safeParse({
            origin,
            destination,
            departDate,
            returnDate: returnDate || undefined,
        });
        if (!parsed.success) {
            setFormError(parsed.error.issues[0]?.message || "Please review your inputs.");
            return false;
        }
        setFormError("");
        return true;
    }, [origin, destination, departDate, returnDate]);

    // ✅ One-way fix inside calendar select
    const handleCalendarSelect = useCallback((date: Date | undefined) => {
        if (!date) return;
        const isoStr = format(date, "yyyy-MM-dd");

        if (calendarMode === "depart") {
            setDepartDate(isoStr);
            if (returnDate && returnDate < isoStr) {
                setReturnDate("");
            }

            if (tripType === "oneway") {
                setCalendarOpen(false);     // ✅ close for one-way
            } else {
                setCalendarMode("return");  // return flow
            }
        } else {
            setReturnDate(isoStr);
            setCalendarOpen(false);
        }
    }, [calendarMode, returnDate, tripType]);

    const handleSearch = useCallback(() => {
        if (!validateSearch()) return false;

        recentSearches.save({
            origin,
            destination,
            departDate,
            returnDate,
            priceAtSearch: lowestPrice || calendarCheapestPrice,
            timestamp: Date.now(),
        });

        // Persist search context so PriceAlertPopup can auto-detect route
        persistSearchToSession(origin, destination, departDate);

        if (posthog.__loaded) posthog.capture("search_flights_clicked", { origin, destination, departDate, returnDate, flexibility: ctx.flexibility });

        const committedAt = Date.now();
        setCommittedPriceQuery({
            origin,
            destination,
            departDate,
            returnDate: returnDate || undefined,
        });
        setCommittedSearchTs(committedAt);

        if (ENABLE_LOCAL_RESULTS) {
            return true;
        }

        // SYNC STATE TO CONTEXT BEFORE BUILDING URL
        ctx.setOrigin({ code: origin, name: origin, country: "" });
        ctx.setDestination({ code: destination, name: destination, country: "" });
        ctx.setDepartDate(departDate);
        ctx.setReturnDate(returnDate || "");
        ctx.setAdults(adults);
        ctx.setChildCount(children);
        ctx.setInfants(infants);
        ctx.setCabinClass(cabinClass);

        const urls = ctx.buildSearchURL();
        if (urls) {
            window.location.href = urls.travelpayouts;
        }
        return false;
    }, [validateSearch, origin, destination, departDate, returnDate, adults, children, infants, cabinClass, lowestPrice, calendarCheapestPrice, ctx]);

    const handleTripComSearch = useCallback(() => {
        if (!validateSearch()) return;

        if (posthog.__loaded) posthog.capture("trip_com_clicked", { origin, destination, departDate, returnDate });

        const tripParams = new URLSearchParams({
            locale: "en_US",
            dcity: origin,
            acity: destination,
            ddate: departDate,
            class: ({ Y: "0", W: "0", C: "1", F: "2" }[cabinClass] ?? "0"),
            quantity: String(adults + children),
            searchBoxArg: "t",
            Allianceid: "7796167",
            SID: "293794502",
        });
        if (returnDate) tripParams.set("rdate", returnDate);

        window.open(`https://www.trip.com/flights?${tripParams.toString()}`, "_blank", "noopener,noreferrer");
    }, [validateSearch, origin, destination, departDate, returnDate, cabinClass, adults, children]);

    return {
        todayDate,
        origin, setOrigin,
        destination, setDestination,
        tripType, setTripType,
        departDate, setDepartDate,
        returnDate, setReturnDate,
        adults, setAdults,
        children, setChildren,
        infants, setInfants,
        cabinClass, setCabinClass,
        flexibility: ctx.flexibility,
        setFlexibility: ctx.setFlexibility,
        detectingLocation,
        formError,
        openPax, setOpenPax,
        calendarOpen, setCalendarOpen,
        calendarMode, setCalendarMode,
        departDateObj,
        returnDateObj,
        displayPrice,
        lowestPrice,
        calendarCheapestPrice,
        setCalendarCheapestPrice,
        priceIntelligence,

        paxTriggerRef,
        doneButtonRef,

        handleCalendarSelect,
        handleSearch,
        handleTripComSearch,
    };
}
