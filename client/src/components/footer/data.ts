import { AIRPORTS } from "@/components/flights/flightWidget.data";
import type { Airport } from "./types.js";

/** Single typed reference to avoid repeated `as` casts */
const typedAirports = AIRPORTS as readonly Airport[];

export const POPULAR_DESTINATIONS: Airport[] = typedAirports.filter(
    (a) => a.isPopular === true || a.country === "Myanmar"
);

export const COUNTRIES: string[] = Array.from(
    new Set(typedAirports.map((a) => a.country))
)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

export const EXPLORE_CITIES = [
    { code: "BKK", name: "Bangkok", country: "Thailand" },
    { code: "HKT", name: "Phuket", country: "Thailand" },
    { code: "CNX", name: "Chiang Mai", country: "Thailand" },
    { code: "SIN", name: "Singapore", country: "Singapore" },
    { code: "DPS", name: "Bali", country: "Indonesia" },
    { code: "TYO", name: "Tokyo", country: "Japan" },
] as const;

export const PARTNER_LINKS = [
    ["Aviasales", "https://aviasales.com"],
    ["Agoda", "https://agoda.com"],
    ["Trip.com", "https://trip.com"],
    ["12Go Asia", "https://12go.asia"],
    ["Klook", "https://klook.com"],
    ["Airalo", "https://airalo.com"],
    ["Travelpayouts", "https://travelpayouts.com"],
] as const;

export const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookie Settings", href: "/cookies" },
    { label: "Sitemap", href: "/sitemap.xml" },
] as const;

/**
 * Country → primary airport code map.
 * Preserved for future destination lookup use.
 */
export const COUNTRY_PRIMARY_AIRPORT: Record<string, string> = {
    Thailand: "BKK",
    Japan: "TYO",
    Singapore: "SIN",
    Indonesia: "DPS",
    Malaysia: "KUL",
    Vietnam: "SGN",
    Cambodia: "PNH",
    Philippines: "MNL",
    Myanmar: "RGN",
    "South Korea": "ICN",
    India: "DEL",
    "Sri Lanka": "CMB",
    Laos: "VTE",
    China: "PEK",
    "Hong Kong": "HKG",
    Taiwan: "TPE",
    Maldives: "MLE",
    Nepal: "KTM",
};
