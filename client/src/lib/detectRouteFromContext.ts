/**
 * detectRouteFromContext.ts
 * ─────────────────────────────────────────────────────────────────
 * Pure utility — no framework deps. Vite + TypeScript compatible.
 *
 * Detects the current flight route from multiple context sources:
 *   1. URL pathname  →  /flights/results/RGN-BKK
 *   2. URL params    →  ?origin=RGN&destination=BKK
 *   3. sessionStorage (set by FlightWidget on submit)
 *   4. window.__GOTRAVEL_SEARCH__ (set by search results page)
 *
 * USAGE in useFlightWidgetState.ts:
 *   import { persistSearchToSession } from "@/lib/detectRouteFromContext"
 *   // Inside handleSearch:
 *   persistSearchToSession(origin, destination, departDate)
 * ─────────────────────────────────────────────────────────────────
 */

const IATA_NAMES: Record<string, string> = {
    RGN: "Yangon", MDL: "Mandalay", NYU: "Nyaung U (Bagan)",
    BMO: "Bhamo", MYT: "Myitkyina", TVY: "Dawei",
    BKK: "Bangkok", DMK: "Bangkok", CNX: "Chiang Mai",
    HKT: "Phuket", USM: "Koh Samui", KBV: "Krabi",
    SIN: "Singapore", KUL: "Kuala Lumpur", PEN: "Penang",
    HAN: "Hanoi", SGN: "Ho Chi Minh City", DAD: "Da Nang",
    PNH: "Phnom Penh", REP: "Siem Reap", VTE: "Vientiane",
    HKG: "Hong Kong", TPE: "Taipei", ICN: "Seoul",
    PVG: "Shanghai", CAN: "Guangzhou", KMG: "Kunming",
    DXB: "Dubai", DOH: "Doha",
};

export interface DetectedRoute {
    origin: string;
    destination: string;
    date: string | null;
    label: string;
    source: "url-path" | "url-params" | "session" | "window";
}

export const iataToCity = (code?: string): string =>
    IATA_NAMES[code?.toUpperCase() ?? ""] ?? code?.toUpperCase() ?? "Unknown";

export const buildRouteLabel = (o: string, d: string): string =>
    `${iataToCity(o)} → ${iataToCity(d)}`;

/**
 * Reads current flight route from multiple context sources.
 * Returns null if no route context is found (e.g. homepage).
 */
export function detectRouteFromContext(): DetectedRoute | null {
    if (typeof window === "undefined") return null;

    // 1. URL pathname — /flights/results or /search/RGN-BKK/2026-05-01
    const pathMatch = window.location.pathname.match(
        /\/(?:search|flights\/results)\/([A-Z]{3})-([A-Z]{3})(?:\/(\d{4}-\d{2}-\d{2}))?/i
    );
    if (pathMatch) {
        const [, origin, destination, date] = pathMatch;
        return {
            origin: origin.toUpperCase(), destination: destination.toUpperCase(),
            date: date ?? null, label: buildRouteLabel(origin, destination), source: "url-path",
        };
    }

    // 2. URL query params — ?origin=RGN&destination=BKK
    const p = new URLSearchParams(window.location.search);
    const qO = p.get("origin") ?? p.get("from");
    const qD = p.get("destination") ?? p.get("to");
    if (qO && qD) {
        return {
            origin: qO.toUpperCase(), destination: qD.toUpperCase(),
            date: p.get("date") ?? null, label: buildRouteLabel(qO, qD), source: "url-params",
        };
    }

    // 3. sessionStorage — set by FlightWidget onSubmit
    try {
        const raw = sessionStorage.getItem("gt_last_search");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.origin && parsed?.destination) {
                return {
                    ...parsed,
                    label: buildRouteLabel(parsed.origin, parsed.destination),
                    source: "session" as const,
                };
            }
        }
    } catch { /* private mode */ }

    // 4. Window global — set for immediate same-page access
    try {
        const g = (window as any).__GOTRAVEL_SEARCH__;
        if (g?.origin && g?.destination) {
            return {
                ...g,
                label: buildRouteLabel(g.origin, g.destination),
                source: "window" as const,
            };
        }
    } catch { /* ignore */ }

    return null;
}

/**
 * Call in useFlightWidgetState.ts handleSearch() to persist route for popup.
 */
export function persistSearchToSession(
    origin: string,
    destination: string,
    date: string | null = null
): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem("gt_last_search", JSON.stringify({
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            date,
        }));
        (window as any).__GOTRAVEL_SEARCH__ = { origin, destination, date };
    } catch { /* ignore */ }
}

/** Clear stale context after alert is saved */
export function clearSearchContext(): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.removeItem("gt_last_search");
        delete (window as any).__GOTRAVEL_SEARCH__;
    } catch { /* ignore */ }
}
