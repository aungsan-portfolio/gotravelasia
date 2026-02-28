export const AIRPORTS = [
    { code: "RGN", name: "Yangon (ရန်ကုန်)", country: "Myanmar" },
    { code: "MDL", name: "Mandalay (မန္တလေး)", country: "Myanmar" },
    { code: "BKK", name: "Bangkok (Suvarnabhumi)", country: "Thailand" },
    { code: "DMK", name: "Bangkok (Don Mueang)", country: "Thailand" },
    { code: "CNX", name: "Chiang Mai", country: "Thailand" },
    { code: "HKT", name: "Phuket", country: "Thailand" },
    { code: "SIN", name: "Singapore", country: "Singapore" },
    { code: "KUL", name: "Kuala Lumpur", country: "Malaysia" },
    { code: "SGN", name: "Ho Chi Minh", country: "Vietnam" },
    { code: "HAN", name: "Hanoi", country: "Vietnam" },
    { code: "PNH", name: "Phnom Penh", country: "Cambodia" },
    { code: "REP", name: "Siem Reap", country: "Cambodia" },
    { code: "CGK", name: "Jakarta (Soekarno-Hatta)", country: "Indonesia" },
    { code: "DPS", name: "Bali (Ngurah Rai)", country: "Indonesia" },
    { code: "MNL", name: "Manila (Ninoy Aquino)", country: "Philippines" },
    { code: "CEB", name: "Cebu (Mactan)", country: "Philippines" },
    { code: "CEI", name: "Chiang Rai", country: "Thailand" },
    { code: "KBV", name: "Krabi", country: "Thailand" },
    { code: "DAD", name: "Da Nang", country: "Vietnam" },
    { code: "LGK", name: "Langkawi", country: "Malaysia" },
    { code: "PEN", name: "Penang", country: "Malaysia" },
    { code: "BKI", name: "Kota Kinabalu", country: "Malaysia" },
    { code: "VTE", name: "Vientiane", country: "Laos" },
    { code: "LPQ", name: "Luang Prabang", country: "Laos" },
    { code: "TPE", name: "Taipei (Taoyuan)", country: "Taiwan" },
    { code: "ICN", name: "Seoul (Incheon)", country: "South Korea" },
    { code: "NRT", name: "Tokyo (Narita)", country: "Japan" },
    { code: "KIX", name: "Osaka (Kansai)", country: "Japan" },
    { code: "HKG", name: "Hong Kong", country: "Hong Kong" },
    { code: "MFM", name: "Macau", country: "Macau" },
    { code: "CCU", name: "Kolkata", country: "India" },
    { code: "DEL", name: "Delhi (Indira Gandhi)", country: "India" },
    { code: "BWN", name: "Bandar Seri Begawan", country: "Brunei" },
] as const;

export type Airport = (typeof AIRPORTS)[number];
export type AirportCode = Airport["code"];
export type CabinCode = "Y" | "W" | "C" | "F";

export const AIRPORT_MAP = new Map<string, Airport>(
    (AIRPORTS as unknown as Airport[]).map(a => [a.code, a])
);

export const DESTINATION_GROUPS = (AIRPORTS as unknown as Airport[]).reduce<
    { key: string; label: string; options: Airport[] }[]
>((acc, airport) => {
    const existing = acc.find(g => g.key === airport.country);
    if (existing) existing.options.push(airport);
    else acc.push({ key: airport.country, label: airport.country, options: [airport] });
    return acc;
}, []);

export const CABIN_OPTIONS: { value: CabinCode; label: string }[] = [
    { value: "Y", label: "Economy" },
    { value: "W", label: "Premium Eco" },
    { value: "C", label: "Business" },
    { value: "F", label: "First Class" },
];

export const DEFAULT_ORIGIN = "RGN";
