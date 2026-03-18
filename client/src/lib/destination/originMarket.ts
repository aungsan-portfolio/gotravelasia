// client/src/lib/destination/originMarket.ts

import type { OriginMarket } from "@/types/destination";

/**
 * Resolves a country code (ISO 3166-1 alpha-2) to a GoTravelAsia origin market.
 * Unknown / missing codes fall back to GLOBAL.
 */
export function resolveOriginMarket(countryCode?: string | null): OriginMarket {
  switch ((countryCode ?? "").toUpperCase().trim()) {
    case "MM": return "MM";
    case "TH": return "TH";
    case "SG": return "SG";
    case "MY": return "MY";
    default:   return "GLOBAL";
  }
}

/**
 * Returns the relevant departure airport IATA codes for a given market.
 * Used to filter live fare queries to origin-relevant routes.
 */
export function getOriginAirportsForMarket(market: OriginMarket): string[] {
  switch (market) {
    case "MM":     return ["RGN", "MDL"];
    case "TH":     return ["BKK", "DMK", "CNX", "HKT"];
    case "SG":     return ["SIN"];
    case "MY":     return ["KUL", "PEN"];
    case "GLOBAL": return ["RGN", "BKK", "SIN", "KUL"];
  }
}
