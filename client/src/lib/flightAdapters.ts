import type {
    FlightDeal,
    FlightDestinationPageData,
    RawFlightRoute,
} from "../types/flights.js";

function safeString(value: unknown, fallback = ""): string {
    if (value === null || value === undefined) return fallback;
    return String(value).trim();
}

function safeUpper(value: unknown, fallback = ""): string {
    return safeString(value, fallback).toUpperCase();
}

function safeNumber(value: unknown, fallback = 0): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function toRoutesArray(rawData: unknown): RawFlightRoute[] {
    if (!rawData) return [];

    // Handle if rawData is already an array of routes
    if (Array.isArray(rawData)) return rawData as RawFlightRoute[];

    // Handle if rawData is an object with a routes property
    if (typeof rawData === 'object' && 'routes' in rawData && Array.isArray((rawData as any).routes)) {
        return (rawData as any).routes as RawFlightRoute[];
    }

    return [];
}

const AIRPORT_CITY_MAP: Record<string, string> = {
    BKK: "Bangkok",
    DMK: "Bangkok",
    CNX: "Chiang Mai",
    HKT: "Phuket",
    SIN: "Singapore",
    KUL: "Kuala Lumpur",
    ICN: "Seoul",
    NRT: "Tokyo",
    HND: "Tokyo",
    HKG: "Hong Kong",
    RGN: "Yangon",
    MDL: "Mandalay",
    DPS: "Bali",
    SGN: "Ho Chi Minh City",
    HAN: "Hanoi",
    MNL: "Manila",
    KIX: "Osaka",
    TPE: "Taipei"
};

function getCityFromAirport(code: string): string {
    const upper = safeUpper(code);
    return AIRPORT_CITY_MAP[upper] || upper;
}

function normalizeUpdatedAt(route: RawFlightRoute): string {
    if (route.fetchedAt) {
        const ts = Number(route.fetchedAt);
        if (Number.isFinite(ts)) {
            return new Date(ts).toISOString();
        }
    }

    if (route.found_at) {
        const parsed = new Date(route.found_at.replace(" ", "T"));
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }
    }

    return new Date().toISOString();
}

function normalizeDeal(route: RawFlightRoute, index: number): FlightDeal {
    const originCode = safeUpper(route.origin);
    const destinationCode = safeUpper(route.destination);
    const airlineCode = safeString(route.airline_code);
    const flightNum = safeString(route.flight_num);
    const airline = safeString(route.airline, "Unknown Airline");
    const currency = safeString(route.currency, "USD");
    const date = safeString(route.date, "N/A");
    const region = safeString(route.region);
    const foundAt = safeString(route.found_at);
    const stops = safeNumber(route.transfers, 0);
    const price = safeNumber(route.price, 0);

    return {
        id: `${originCode}-${destinationCode}-${airlineCode}-${flightNum}-${date}-${index}`,
        airline,
        airlineCode,
        flightNum,
        originCode,
        originCity: getCityFromAirport(originCode),
        destinationCode,
        destinationCity: getCityFromAirport(destinationCode),
        price,
        currency,
        tripType: "one-way",
        stops,
        duration: "TBA",
        departDate: date,
        returnDate: null,
        provider: "GoTravel Data",
        deepLink: "#",
        region,
        updatedAt: normalizeUpdatedAt(route),
        foundAt,
    };
}

function matchesOriginRoute(requestedOrigin: string, actualOrigin: string): boolean {
    const requested = safeUpper(requestedOrigin);
    const actual = safeUpper(actualOrigin);

    return actual === requested || (requested === "BKK" && actual === "DMK");
}

function filterByRoute(
    deals: FlightDeal[],
    originCode: string,
    destinationCode: string
): FlightDeal[] {
    const requestedDestination = safeUpper(destinationCode);

    return deals.filter((deal) => {
        return (
            matchesOriginRoute(originCode, deal.originCode) &&
            safeUpper(deal.destinationCode) === requestedDestination
        );
    });
}

function getLatestUpdatedAt(deals: FlightDeal[]): string {
    if (!deals.length) return new Date().toISOString();

    return [...deals].sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })[0].updatedAt;
}

function getCheapestPrice(deals: FlightDeal[]): number {
    if (!deals.length) return 0;
    return Math.min(...deals.map((deal) => deal.price));
}

export function adaptFlightDataset(
    rawData: unknown,
    originCode: string,
    destinationCode: string
): FlightDestinationPageData | null {
    const routes = toRoutesArray(rawData);

    const normalizedDeals = routes
        .map((route, index) => normalizeDeal(route, index))
        .filter((deal) => {
            return Boolean(deal.originCode && deal.destinationCode && deal.price > 0);
        });

    const routeDeals = filterByRoute(normalizedDeals, originCode, destinationCode);

    if (!routeDeals.length) return null;

    const sortedDeals = [...routeDeals].sort((a, b) => a.price - b.price);
    const first = sortedDeals[0];

    return {
        originCode: safeUpper(originCode),
        originCity: first?.originCity || getCityFromAirport(originCode),
        destinationCode: safeUpper(destinationCode),
        destinationCity: first?.destinationCity || getCityFromAirport(destinationCode),
        currency: first?.currency || "USD",
        cheapestPrice: getCheapestPrice(sortedDeals),
        updatedAt: getLatestUpdatedAt(sortedDeals),
        deals: sortedDeals,
    };
}
