// ─────────────────────────────────────────────────────────────────────────────
// 1) BRAND TOKENS & STYLES (Extracted from FlightWidget.tsx)
// ─────────────────────────────────────────────────────────────────────────────
export const B = {
    purple: "#5B0EA6",
    purpleDeep: "#2D0558",
    gold: "#F5C518",
    white: "#FFFFFF",
    text: "#1a0a2e",
    textMuted: "#8B7AA0",
    glassBase: "rgba(255,255,255,0.12)",
    glassBorder: "rgba(255,255,255,0.18)",
    glassFocus: "rgba(245,197,24,0.12)",
    error: "#fba09d",
} as const;

export const cellBorder: React.CSSProperties = {
    borderBottom: `1px solid ${B.glassBorder}`,
    borderRight: `1px solid ${B.glassBorder}`,
};

export const cellFocus: React.CSSProperties = {
    background: B.glassFocus,
    boxShadow: `inset 0 0 0 1.5px ${B.gold}`,
};

export const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: B.gold,
    marginBottom: 2,
    lineHeight: 1,
};

import React from "react";

export const AIRPORTS = [
    // 🇲🇲 HOME (Myanmar)
    { code: "RGN", name: "Yangon (ရန်ကုန်)", country: "Myanmar" },
    { code: "MDL", name: "Mandalay (မန္တလေး)", country: "Myanmar" },

    // 🔥 POPULAR (Southeast Asia & East Asia Hubs)
    { code: "BKK", name: "Bangkok (All Airports)", country: "Thailand", isPopular: true },
    { code: "SIN", name: "Singapore (All Airports)", country: "Singapore", isPopular: true },
    { code: "KUL", name: "Kuala Lumpur", country: "Malaysia", isPopular: true },
    { code: "TYO", name: "Tokyo (All Airports)", country: "Japan", isPopular: true },
    { code: "SEL", name: "Seoul (All Airports)", country: "South Korea", isPopular: true },

    // 🇹🇭 Thailand (Others)
    { code: "DMK", name: "Bangkok (Don Mueang)", country: "Thailand" },
    { code: "CNX", name: "Chiang Mai", country: "Thailand" },
    { code: "HKT", name: "Phuket", country: "Thailand" },

    // 🇻🇳 Vietnam
    { code: "SGN", name: "Ho Chi Minh", country: "Vietnam" },
    { code: "HAN", name: "Hanoi", country: "Vietnam" },
    { code: "DAD", name: "Da Nang", country: "Vietnam" },

    // 🇮🇩 Indonesia
    { code: "JKT", name: "Jakarta (All Airports)", country: "Indonesia" },
    { code: "DPS", name: "Bali (Ngurah Rai)", country: "Indonesia" },

    // 🇵🇭 Philippines
    { code: "MNL", name: "Manila (Ninoy Aquino)", country: "Philippines" },
    { code: "CEB", name: "Cebu (Mactan)", country: "Philippines" },

    // 🇲🇾 Malaysia (Others)
    { code: "BKI", name: "Kota Kinabalu", country: "Malaysia" },

    // 🇹🇼 Taiwan
    { code: "TPE", name: "Taipei (Taoyuan)", country: "Taiwan" },

    // 🇰🇷 South Korea (Others)
    { code: "PUS", name: "Busan (Gimhae)", country: "South Korea" },
    { code: "CJU", name: "Jeju", country: "South Korea" },

    // 🇯🇵 Japan (Others)
    { code: "OSA", name: "Osaka (All Airports)", country: "Japan" },

    // 🇨🇳 China
    { code: "BJS", name: "Beijing (All Airports)", country: "China" },
    { code: "SHA", name: "Shanghai (All Airports)", country: "China" },
    { code: "CAN", name: "Guangzhou", country: "China" },
    { code: "KMG", name: "Kunming", country: "China" },
    { code: "CSX", name: "Changsha", country: "China" },
    { code: "CKG", name: "Chongqing", country: "China" },
    { code: "CTU", name: "Chengdu", country: "China" },

    // 🇭🇰 / 🇲🇴 Hong Kong & Macau
    { code: "HKG", name: "Hong Kong", country: "Hong Kong" },
    { code: "MFM", name: "Macau", country: "Macau" },

    // 🇮🇳 India
    { code: "CCU", name: "Kolkata", country: "India" },
    { code: "DEL", name: "Delhi (Indira Gandhi)", country: "India" },
    { code: "MAA", name: "Chennai", country: "India" },
    { code: "GAY", name: "Gaya", country: "India" },

    // 🇰🇭 Cambodia
    { code: "PNH", name: "Phnom Penh", country: "Cambodia" },

    // 🇦🇪 UAE
    { code: "DXB", name: "Dubai", country: "United Arab Emirates" },

    // 🇧🇳 Brunei
    { code: "BWN", name: "Bandar Seri Begawan", country: "Brunei" },
] as const;

export type Airport = (typeof AIRPORTS)[number];
export type AirportCode = Airport["code"];
export type CabinCode = "Y" | "W" | "C" | "F";

export const AIRPORT_MAP = new Map<string, Airport>(
    (AIRPORTS as unknown as Airport[]).map(a => [a.code, a])
);

// ── UX IMPROVEMENT: Destination Grouping Logic ── //
export const DESTINATION_GROUPS = (() => {
    const groups: { key: string; label: string; options: Airport[] }[] = [];
    const airList = AIRPORTS as unknown as Airport[];

    // 1. Myanmar (Home) - Always absolute top
    const myanmar = airList.filter(a => a.country === "Myanmar");
    if (myanmar.length) {
        groups.push({ key: "Myanmar", label: "🇲🇲 Myanmar (Home)", options: myanmar });
    }

    // 2. Popular Destinations
    const popular = airList.filter(a => (a as any).isPopular);
    if (popular.length) {
        groups.push({ key: "Popular", label: "🔥 Popular Destinations", options: popular });
    }

    // 3. The rest grouped by Country
    const rest = airList.filter(a => a.country !== "Myanmar" && !(a as any).isPopular);
    rest.forEach(airport => {
        let group = groups.find(g => g.key === airport.country);
        if (!group) {
            group = { key: airport.country, label: airport.country, options: [] };
            groups.push(group);
        }
        group.options.push(airport);
    });

    return groups;
})();

export const CABIN_OPTIONS: { value: CabinCode; label: string }[] = [
    { value: "Y", label: "Economy" },
    { value: "W", label: "Premium Eco" },
    { value: "C", label: "Business" },
    { value: "F", label: "First Class" },
];

export const DEFAULT_ORIGIN = "RGN";
