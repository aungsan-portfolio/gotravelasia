export type CabinClassInput =
    | "Y"
    | "C"
    | "W"
    | "F"
    | "ECONOMY"
    | "BUSINESS"
    | "COMFORT"
    | "FIRST"
    | string;

export interface TravelpayoutsSearchOptions {
    origin: string;
    destination: string;
    departDate: string; // YYYY-MM-DD
    returnDate?: string | null;
    adults?: number;
    children?: number;
    infants?: number;
    cabinClass?: CabinClassInput;
}

function normalizeIata(code: string): string {
    const value = code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(value)) {
        throw new Error(`Invalid IATA code: "${code}"`);
    }
    return value;
}

function toDdMm(isoDate: string): string {
    const parts = isoDate.split("-");
    if (parts.length !== 3) {
        throw new Error(`Invalid date format: "${isoDate}". Expected YYYY-MM-DD`);
    }

    const [, mm, dd] = parts;

    if (!/^\d{2}$/.test(dd) || !/^\d{2}$/.test(mm)) {
        throw new Error(`Invalid date format: "${isoDate}". Expected YYYY-MM-DD`);
    }

    return `${dd}${mm}`;
}

function toIsoDateDaysFromNow(daysFromNow: number): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysFromNow);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

/**
 * White Label flightSearch class codes:
 * economy -> ""
 * business -> "c"
 * comfort -> "w"
 * first -> "f"
 */
function normalizeWhiteLabelClass(cabinClass?: CabinClassInput): string {
    const value = (cabinClass ?? "Y").toString().trim().toUpperCase();

    switch (value) {
        case "Y":
        case "ECONOMY":
        case "":
            return "";
        case "C":
        case "BUSINESS":
            return "c";
        case "W":
        case "COMFORT":
            return "w";
        case "F":
        case "FIRST":
            return "f";
        default:
            return "";
    }
}

/**
 * Travelpayouts passenger suffix examples:
 * 1    -> 1 adult
 * f21  -> first class, 2 adults, 1 child
 * w101 -> comfort class, 1 adult, 0 children, 1 infant
 */
function buildPassengerSuffix(
    adults = 1,
    children = 0,
    infants = 0
): string {
    const a = Math.max(1, Math.min(9, Math.trunc(adults)));
    const c = Math.max(0, Math.min(9, Math.trunc(children)));
    const i = Math.max(0, Math.min(9, Math.trunc(infants)));

    let suffix = `${a}`;

    // If there are children OR infants, include children digit.
    if (c > 0 || i > 0) {
        suffix += `${c}`;
    }

    // Only include infants digit when infants > 0.
    if (i > 0) {
        suffix += `${i}`;
    }

    return suffix;
}

/**
 * Builds only the raw Travelpayouts "flightSearch" string.
 * Format:
 * {ORIGIN}{DDMM}{DEST}[{DDMM}][class]{adults}{children}{infants}
 */
export function buildTravelpayoutsFlightSearch(
    options: TravelpayoutsSearchOptions
): string {
    const origin = normalizeIata(options.origin);
    const destination = normalizeIata(options.destination);
    const depart = toDdMm(options.departDate);
    const ret = options.returnDate ? toDdMm(options.returnDate) : "";
    const cabin = normalizeWhiteLabelClass(options.cabinClass);
    const passengers = buildPassengerSuffix(
        options.adults ?? 1,
        options.children ?? 0,
        options.infants ?? 0
    );

    return `${origin}${depart}${destination}${ret}${cabin}${passengers}`;
}

/**
 * Builds your in-site results URL:
 * /flights/results?flightSearch=...
 */
export function buildTravelpayoutsResultsUrl(
    options: TravelpayoutsSearchOptions
): string {
    const flightSearch = buildTravelpayoutsFlightSearch(options);
    // Do not encodeURIComponent because we literally want a raw string for NextJS router in our case, but following strict URL generation rules:
    return `/flights/results?flightSearch=${flightSearch}`;
}

/**
 * Convenience helper for SEO pills / featured destinations.
 * Defaults:
 * - one-way
 * - 1 adult
 * - economy
 * - depart date = N days from now
 */
export function buildSeoTravelpayoutsResultsUrl(
    origin: string,
    destination: string,
    daysFromNow = 14
): string {
    return buildTravelpayoutsResultsUrl({
        origin,
        destination,
        departDate: toIsoDateDaysFromNow(daysFromNow),
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: "Y",
    });
}
