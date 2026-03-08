import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, isValid } from "date-fns";
import posthog from "posthog-js";
import { z } from "zod";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { AIRPORT_MAP, DEFAULT_ORIGIN, CABIN_OPTIONS, type CabinCode } from "./flightWidget.data";
import { detectOriginAirport } from "./flightWidget.geo";
import { recentSearches, type RecentSearchRecord } from "./flightWidget.recent";
import { usePriceHint } from "@/hooks/useFlightData";
import { persistSearchToSession } from "@/lib/detectRouteFromContext";

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

    const [tripType, setTripType] = useState<"return" | "one-way">("return");

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

    const paxTriggerRef = useRef<HTMLButtonElement>(null);
    const doneButtonRef = useRef<HTMLButtonElement>(null);
    const hasOpenedPax = useRef(false);

    // context sync
    useEffect(() => {
        const originAirport = AIRPORT_MAP.get(origin) ?? null;
        const destAirport = AIRPORT_MAP.get(destination) ?? null;
        ctx.setOrigin(originAirport ? { code: originAirport.code, name: originAirport.name, country: originAirport.country } : null);
        ctx.setDestination(destAirport ? { code: destAirport.code, name: destAirport.name, country: destAirport.country } : null);
        ctx.setDepartDate(departDate);
        ctx.setReturnDate(returnDate);
        ctx.setTripType(tripType);
        ctx.setAdults(adults);
        ctx.setChildCount(children);
        ctx.setInfants(infants);
        ctx.setCabinClass(cabinClass);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origin, destination, departDate, returnDate, tripType, adults, children, infants, cabinClass]); // Omit ctx to prevent infinite loops

    const geoDetected = useRef(false);

    // geo-detect (run strictly ONCE)
    useEffect(() => {
        if (geoDetected.current) return;
        geoDetected.current = true;

        detectOriginAirport().then(code => {
            setOrigin(code);
            const airport = AIRPORT_MAP.get(code);
            if (airport) ctx.setOriginIfEmpty({ code: airport.code, name: airport.name, country: airport.country });
            setDetectingLocation(false);
        }).catch(() => setDetectingLocation(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Register swap callback so FloatingSearchBar can tell this widget to swap
    useEffect(() => {
        ctx.registerSwapCallback(() => {
            setOrigin(prevO => {
                setDestination(prevD => {
                    setOrigin(prevD);
                    return prevO;
                });
                return prevO;
            });
        });
    }, [ctx]);

    // clamp infants <= adults
    useEffect(() => setInfants(x => Math.min(x, adults)), [adults]);

    // esc close
    useEffect(() => {
        const fn = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setCalendarOpen(false);
                setOpenPax(false);
            }
        };
        document.addEventListener("keydown", fn);
        return () => document.removeEventListener("keydown", fn);
    }, []);

    // pax focus management
    useEffect(() => {
        if (!openPax) return;
        hasOpenedPax.current = true;
        const r1 = requestAnimationFrame(() => requestAnimationFrame(() => doneButtonRef.current?.focus()));
        return () => cancelAnimationFrame(r1);
    }, [openPax]);

    useEffect(() => {
        if (!openPax && hasOpenedPax.current) paxTriggerRef.current?.focus();
    }, [openPax]);

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

            if (tripType === "one-way") {
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
        if (!validateSearch()) return;

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

        const urls = ctx.buildSearchURL();
        if (urls) {
            window.location.href = urls.travelpayouts;
        }
    }, [validateSearch, origin, destination, departDate, returnDate, lowestPrice, calendarCheapestPrice, ctx]);

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

        paxTriggerRef,
        doneButtonRef,

        handleCalendarSelect,
        handleSearch,
        handleTripComSearch,
    };
}
