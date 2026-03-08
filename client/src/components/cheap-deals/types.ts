// ─── Types + Constants ────────────────────────────────────────────────────

export type TargetNiche = "myanmar" | "international";

export type EnhancedDealCard = {
    id: string;
    destination: string;
    destinationCode: string;
    country: string;
    originCode: string;
    imageUrl: string;
    duration: string;
    isDirect: boolean;
    departDate: string;
    returnDate: string;
    price: number;
    currency: string;
    airline: string;
    airlineCode?: string;
    transfers: number;
    fetchedAt: number;
    clickCount: number;
    impressions: number;
};

export const CACHE_TTL_MS = 6 * 60 * 60 * 1000;  // 6 hours
export const DEALS_TO_SHOW = 4;
export const MAX_HOOK_THB = 4900;

export const AIRLINE_NAMES: Record<string, string> = {
    FD: "AirAsia", AK: "AirAsia", D7: "AirAsia X",
    VZ: "VietJet", VJ: "VietJet",
    DD: "Nok Air", SL: "Thai Lion Air",
    TR: "Scoot", TG: "Thai Airways",
    SQ: "Singapore Airlines", MH: "Malaysia Airlines",
    UB: "MNA", "8M": "MAI",
    QR: "Qatar", EK: "Emirates",
};
