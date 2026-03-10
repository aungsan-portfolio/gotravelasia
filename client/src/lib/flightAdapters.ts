export interface NormalizedDeal {
    id: string;
    airline: string;
    airlineCode: string;
    flightNum: string;
    originCode: string;
    originCity: string;
    destinationCode: string;
    destinationCity: string;
    price: number;
    currency: string;
    tripType: string;
    stops: number;
    duration: string;
    departDate: string;
    returnDate: string | null;
    provider: string;
    deepLink: string;
    region: string;
    updatedAt: string;
    foundAt: string;
}

export interface DestinationPageData {
    originCode: string;
    originCity: string;
    destinationCode: string;
    destinationCity: string;
    currency: string;
    cheapestPrice: number;
    updatedAt: string;
    deals: NormalizedDeal[];
}

function safeString(value: any, fallback = ""): string {
    if (value === null || value === undefined) return fallback;
    return String(value).trim();
}

function safeUpper(value: any, fallback = ""): string {
    return safeString(value, fallback).toUpperCase();
}

function safeNumber(value: any, fallback = 0): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function toArray<T>(value: T | T[]): T[] {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return [value];
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

function getCityFromAirport(code: string) {
    const upper = safeUpper(code);
    return AIRPORT_CITY_MAP[upper] || upper;
}

function normalizeUpdatedAt(raw: any): string {
    if (raw?.fetchedAt) {
        const ts = Number(raw.fetchedAt);
        if (Number.isFinite(ts)) {
            return new Date(ts).toISOString();
        }
    }

    if (raw?.found_at) {
        const found = String(raw.found_at).replace(" ", "T");
        const parsed = new Date(found);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }
    }

    return new Date().toISOString();
}

function normalizeDeal(route: any, index: number): NormalizedDeal {
    const originCode = safeUpper(route.origin);
    const destinationCode = safeUpper(route.destination);

    const price = safeNumber(route.price, 0);
    const currency = safeString(route.currency, "USD");
    const airline = safeString(route.airline, "Unknown Airline");
    const airlineCode = safeString(route.airline_code, "");
    const flightNum = safeString(route.flight_num, "");
    const region = safeString(route.region, "");
    const date = safeString(route.date, "N/A");
    const stops = safeNumber(route.transfers, 0);

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
        foundAt: safeString(route.found_at, ""),
    };
}

function filterByRoute(deals: NormalizedDeal[], originCode: string, destinationCode: string) {
    const origin = safeUpper(originCode);
    const dest = safeUpper(destinationCode);

    return deals.filter((deal) => {
        const dealOrigin = safeUpper(deal.originCode);
        const dealDest = safeUpper(deal.destinationCode);

        const originMatch =
            dealOrigin === origin ||
            (origin === "BKK" && dealOrigin === "DMK");

        return originMatch && dealDest === dest;
    });
}

function getLatestUpdatedAt(deals: NormalizedDeal[]) {
    if (!deals.length) return new Date().toISOString();

    return [...deals]
        .sort(
            (a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0]
        .updatedAt;
}

function getCheapestPrice(deals: NormalizedDeal[]) {
    if (!deals.length) return 0;
    return Math.min(...deals.map((deal) => deal.price));
}

export function adaptFlightDataset(rawData: any, originCode: string, destinationCode: string): DestinationPageData | null {
    const routes = toArray(rawData?.routes || rawData);

    const normalizedDeals = routes
        .map((route, index) => normalizeDeal(route, index))
        .filter((deal) => deal.originCode && deal.destinationCode && deal.price > 0);

    const routeDeals = filterByRoute(normalizedDeals, originCode, destinationCode);

    if (!routeDeals.length) return null;

    const sortedDeals = [...routeDeals].sort((a, b) => a.price - b.price);

    return {
        originCode: safeUpper(originCode),
        originCity: sortedDeals[0]?.originCity || getCityFromAirport(originCode),
        destinationCode: safeUpper(destinationCode),
        destinationCity:
            sortedDeals[0]?.destinationCity || getCityFromAirport(destinationCode),
        currency: sortedDeals[0]?.currency || "USD",
        cheapestPrice: getCheapestPrice(sortedDeals),
        updatedAt: getLatestUpdatedAt(sortedDeals),
        deals: sortedDeals,
    };
}
