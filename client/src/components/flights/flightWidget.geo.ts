import { AIRPORT_MAP, DEFAULT_ORIGIN } from "./flightWidget.data.js";

export const CITY_TO_AIRPORT: Record<string, string> = {
    yangon: "RGN", mandalay: "MDL", bangkok: "BKK",
    "chiang mai": "CNX", chiangmai: "CNX", phuket: "HKT",
    "chiang rai": "CEI", chiangrai: "CEI", krabi: "KBV",
    singapore: "SIN", "kuala lumpur": "KUL", kl: "KUL",
    langkawi: "LGK", penang: "PEN", "george town": "PEN", "kota kinabalu": "BKI",
    "ho chi minh": "SGN", saigon: "SGN", "ho chi minh city": "SGN",
    hanoi: "HAN", "da nang": "DAD", danang: "DAD",
    "phnom penh": "PNH", "siem reap": "REP",
    jakarta: "CGK", bali: "DPS", denpasar: "DPS",
    manila: "MNL", cebu: "CEB", vientiane: "VTE", "luang prabang": "LPQ",
    taipei: "TPE", seoul: "ICN", incheon: "ICN", tokyo: "NRT", osaka: "KIX",
    "hong kong": "HKG", macau: "MFM", macao: "MFM",
    kolkata: "CCU", calcutta: "CCU", delhi: "DEL", "new delhi": "DEL",
    "bandar seri begawan": "BWN",
};

export const COUNTRY_TO_AIRPORT: Record<string, string> = {
    MM: "RGN", TH: "BKK", SG: "SIN", MY: "KUL", VN: "SGN", KH: "PNH",
    ID: "CGK", PH: "MNL", JP: "NRT", KR: "ICN", HK: "HKG", TW: "TPE",
    LA: "VTE", IN: "DEL", BN: "BWN", MO: "MFM",
};

export async function detectOriginAirport(): Promise<string> {
    const cached = sessionStorage.getItem("gt_detected_origin");
    if (cached && AIRPORT_MAP.has(cached)) return cached;
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 4000);
    try {
        const data = await fetch("https://ipapi.co/json/", { signal: ac.signal }).then(r => r.json());
        const city = (data.city ?? "").toLowerCase().trim();
        let code = CITY_TO_AIRPORT[city];
        if (!code || !AIRPORT_MAP.has(code)) code = COUNTRY_TO_AIRPORT[data.country_code];
        if (!code || !AIRPORT_MAP.has(code)) code = DEFAULT_ORIGIN;
        sessionStorage.setItem("gt_detected_origin", code);
        return code;
    } catch { return DEFAULT_ORIGIN; }
    finally { clearTimeout(t); }
}
