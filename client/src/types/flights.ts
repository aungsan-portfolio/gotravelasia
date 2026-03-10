export type RawFlightRoute = {
    origin: string;
    destination: string;
    price: number;
    currency?: string;
    airline_code?: string;
    airline?: string;
    date?: string;
    transfers?: number;
    flight_num?: string;
    region?: string;
    found_at?: string;
    fetchedAt?: number;
};

export type RawFlightDataset = {
    routes?: RawFlightRoute[];
};

export type FlightDeal = {
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
    tripType: "one-way" | "round-trip";
    stops: number;
    duration: string;
    departDate: string;
    returnDate: string | null;
    provider: string;
    deepLink: string;
    region: string;
    updatedAt: string;
    foundAt: string;
};

export type FlightDestinationPageData = {
    originCode: string;
    originCity: string;
    destinationCode: string;
    destinationCity: string;
    currency: string;
    cheapestPrice: number;
    updatedAt: string;
    deals: FlightDeal[];
};

export type SummaryCard = {
    label: string;
    value: string;
    helperText?: string;
};

export type UseFlightDestinationDataResult = {
    data: FlightDestinationPageData | null;
    isLoading: boolean;
    error: Error | string | boolean | null;
};
