import type { CurrencyCode } from "../config/fx.js";

export type CalendarEntry = {
    price?: number;
    currency?: CurrencyCode;
    origin?: string;
    destination?: string;
    airline?: string;
    departure_at?: string;
    return_at?: string;
    transfers?: number;
    flight_number?: string;
    is_bot_data?: boolean;
    is_amadeus?: boolean;
    is_estimated_amadeus?: boolean;
    is_v3?: boolean;
    is_legacy_tp?: boolean;
};

export type PrioritySource = "v3" | "bot" | "legacy" | "amadeus";

/**
 * Priorities for price merge logic.
 * Lower number = higher priority.
 */
export const SOURCE_PRIORITY: Record<PrioritySource, number> = {
    v3: 1,
    bot: 2,
    legacy: 3,
    amadeus: 4,
};

function getCurrentSource(e: CalendarEntry): PrioritySource {
    if (e.is_v3) return "v3";
    if (e.is_bot_data) return "bot";
    if (e.is_amadeus) return "amadeus";
    if (e.is_legacy_tp) return "legacy";
    return "legacy"; // Default fallback
}

/**
 * Merges a flight price into a calendar map, ensuring the strict source precedence
 * hierarchy is respected.
 * 
 * Rules:
 * - A better-priority source replaces a worse-priority source, even if the price is higher.
 * - For equal-priority sources, keep the lowest price.
 * - A worse-priority source must never overwrite a better-priority source.
 */
export function addPrice(
    merged: Record<string, CalendarEntry>,
    dateStr: string,
    price: number,
    entry: Omit<CalendarEntry, 'price' | 'is_v3' | 'is_bot_data' | 'is_amadeus' | 'is_legacy_tp'>,
    source: PrioritySource
): void {
    if (!dateStr || price <= 0 || !Number.isFinite(price)) return;

    const current = merged[dateStr];
    const currentSource = current ? getCurrentSource(current) : null;

    // Create the fully decorated entry for this source
    const newEntry: CalendarEntry = {
        ...entry,
        price,
        is_v3: source === "v3",
        is_bot_data: source === "bot",
        is_legacy_tp: source === "legacy",
        is_amadeus: source === "amadeus",
    };

    // If there is no existing entry, or the new source is higher priority (lower number)
    if (!current || SOURCE_PRIORITY[source] < SOURCE_PRIORITY[currentSource!]) {
        merged[dateStr] = newEntry;
        return;
    }

    // If it's the exact same priority source, only overwrite if the new price is lower
    if (source === currentSource && price < (current.price ?? Number.POSITIVE_INFINITY)) {
        merged[dateStr] = newEntry;
    }
}
