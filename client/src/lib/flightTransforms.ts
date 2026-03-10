import type { FlightDeal, SummaryCard } from "../types/flights";

export function formatCurrency(value: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

export function average(numbers: number[]): number {
    if (!numbers.length) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function getTopAirline(deals: FlightDeal[]): string {
    const counts = deals.reduce<Record<string, number>>((acc, deal) => {
        const key = deal.airline || "Unknown Airline";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "N/A";
}

function getLatestDepartDate(deals: FlightDeal[]): string {
    const dates = deals.map((deal) => deal.departDate).filter(d => Boolean(d) && d !== "N/A").sort();
    return dates[dates.length - 1] || "N/A";
}

export function buildSummaryCards(
    deals: FlightDeal[] = [],
    currency = "USD"
): SummaryCard[] {
    if (!deals.length) return [];

    const prices = deals
        .map((deal) => Number(deal.price))
        .filter((price) => Number.isFinite(price) && price > 0);

    const nonstopCount = deals.filter((deal) => Number(deal.stops) === 0).length;
    const topAirline = getTopAirline(deals);
    const latestDepartDate = getLatestDepartDate(deals);

    return [
        {
            label: "Lowest fare",
            value: formatCurrency(Math.min(...prices), currency),
            helperText: "Cheapest currently available price in this dataset.",
        },
        {
            label: "Average fare",
            value: formatCurrency(Math.round(average(prices)), currency),
            helperText: "Average based on currently displayed deals only.",
        },
        {
            label: "Top airline",
            value: topAirline,
            helperText: "Most frequently appearing airline in current results.",
        },
        {
            label: "Nonstop options",
            value: `${nonstopCount}`,
            helperText: `Latest listed departure: ${latestDepartDate}`,
        },
    ];
}
