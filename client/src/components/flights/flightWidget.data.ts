// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// 1) BRAND TOKENS & STYLES (Extracted from FlightWidget.tsx)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    // ðŸ‡²ðŸ‡² HOME (Myanmar)
    { code: "RGN", name: "Yangon (á€›á€”á€ºá€€á€¯á€”á€º)", country: "Myanmar", isPopular: true },
    { code: "MDL", name: "Mandalay (á€™á€”á€¹á€á€œá€±á€¸)", country: "Myanmar", isPopular: true },

    // ðŸ”¥ POPULAR (Southeast Asia & East Asia Hubs)
    { code: "BKK", name: "Bangkok (All Airports)", country: "Thailand", isPopular: true },
    { code: "SIN", name: "Singapore (All Airports)", country: "Singapore", isPopular: true },
    { code: "KUL", name: "Kuala Lumpur", country: "Malaysia", isPopular: true },
    { code: "TYO", name: "Tokyo (All Airports)", country: "Japan", isPopular: true },
    { code: "SEL", name: "Seoul (All Airports)", country: "South Korea", isPopular: true },
    { code: "CNX", name: "Chiang Mai", country: "Thailand", isPopular: true },
    { code: "HKT", name: "Phuket", country: "Thailand", isPopular: true },
    { code: "DPS", name: "Bali (Ngurah Rai)", country: "Indonesia", isPopular: true },
    { code: "DAD", name: "Da Nang", country: "Vietnam", isPopular: true },
    { code: "SGN", name: "Ho Chi Minh", country: "Vietnam", isPopular: true },
    { code: "HKG", name: "Hong Kong", country: "Hong Kong", isPopular: true },
    { code: "TPE", name: "Taipei (Taoyuan)", country: "Taiwan", isPopular: true },
    { code: "OSA", name: "Osaka (All Airports)", country: "Japan", isPopular: true },
    { code: "SAI", name: "Siem Reap", country: "Cambodia", isPopular: true },

    // ðŸ‡¹ðŸ‡­ Thailand (Others)
    { code: "DMK", name: "Bangkok (Don Mueang)", country: "Thailand" },
    { code: "KBV", name: "Krabi", country: "Thailand" },

    // ðŸ‡»ðŸ‡³ Vietnam
    { code: "HAN", name: "Hanoi", country: "Vietnam" },

    // ðŸ‡®ðŸ‡© Indonesia
    { code: "JKT", name: "Jakarta (All Airports)", country: "Indonesia" },

    // ðŸ‡µðŸ‡­ Philippines
    { code: "MNL", name: "Manila (Ninoy Aquino)", country: "Philippines" },
    { code: "CEB", name: "Cebu (Mactan)", country: "Philippines" },

    // ðŸ‡²ðŸ‡¾ Malaysia (Others)
    { code: "BKI", name: "Kota Kinabalu", country: "Malaysia" },
    { code: "PEN", name: "Penang", country: "Malaysia" },

    // ðŸ‡¹ðŸ‡¼ Taiwan

    // ðŸ‡°ðŸ‡· South Korea (Others)
    { code: "PUS", name: "Busan (Gimhae)", country: "South Korea" },
    { code: "CJU", name: "Jeju", country: "South Korea" },

    // ðŸ‡¯ðŸ‡µ Japan (Others)

    // ðŸ‡¨ðŸ‡³ China
    { code: "BJS", name: "Beijing (All Airports)", country: "China" },
    { code: "SHA", name: "Shanghai (All Airports)", country: "China" },
    { code: "CAN", name: "Guangzhou", country: "China" },
    { code: "KMG", name: "Kunming", country: "China" },
    { code: "CSX", name: "Changsha", country: "China" },
    { code: "CKG", name: "Chongqing", country: "China" },
    { code: "CTU", name: "Chengdu", country: "China" },

    // ðŸ‡­ðŸ‡° / ðŸ‡²ðŸ‡´ Hong Kong & Macau
    { code: "MFM", name: "Macau", country: "Macau" },

    // ðŸ‡®ðŸ‡³ India
    { code: "CCU", name: "Kolkata", country: "India" },
    { code: "DEL", name: "Delhi (Indira Gandhi)", country: "India" },
    { code: "MAA", name: "Chennai", country: "India" },
    { code: "GAY", name: "Gaya", country: "India" },

    // ðŸ‡°ðŸ‡­ Cambodia
    { code: "PNH", name: "Phnom Penh", country: "Cambodia" },
    { code: "LPQ", name: "Luang Prabang", country: "Laos" },

    // ðŸ‡¦ðŸ‡ª UAE
    { code: "DXB", name: "Dubai", country: "United Arab Emirates" },

    // ðŸ‡§ðŸ‡³ Brunei
    { code: "BWN", name: "Bandar Seri Begawan", country: "Brunei" },

    // ðŸ‡±ðŸ‡° Sri Lanka
    { code: "CMB", name: "Colombo (Bandaranaike)", country: "Sri Lanka" },

    // ðŸ‡§ðŸ‡© Bangladesh
    { code: "DAC", name: "Dhaka", country: "Bangladesh" },

    // ðŸ‡³ðŸ‡µ Nepal
    { code: "KTM", name: "Kathmandu", country: "Nepal" },

    // ðŸ‡²ðŸ‡³ Maldives
    { code: "MLE", name: "Malé", country: "Maldives" },

    // ðŸ‡§ðŸ‡° More Thailand (domestic & budget carrier hubs)
    { code: "USM", name: "Koh Samui", country: "Thailand" },
    { code: "HDY", name: "Hat Yai", country: "Thailand" },
    { code: "UTP", name: "Pattaya (U-Tapao)", country: "Thailand" },

    // ðŸ‡»ðŸ‡³ More Vietnam
    { code: "PQC", name: "Phu Quoc", country: "Vietnam" },

    // ðŸ‡®ðŸ‡© More Indonesia
    { code: "SUB", name: "Surabaya", country: "Indonesia" },
    { code: "JOG", name: "Yogyakarta", country: "Indonesia" },

    // ðŸ‡°ðŸ‡· More South Korea
    { code: "GMP", name: "Seoul (Gimpo)", country: "South Korea" },

    // ðŸ‡¯ðŸ‡µ More Japan
    { code: "FUK", name: "Fukuoka", country: "Japan" },
    { code: "OKA", name: "Okinawa (Naha)", country: "Japan" },
    { code: "NGO", name: "Nagoya (Chubu)", country: "Japan" },

    // ðŸ‡¨ðŸ‡³ More China
    { code: "XIY", name: "Xi'an", country: "China" },
    { code: "HGH", name: "Hangzhou", country: "China" },
    { code: "SZX", name: "Shenzhen", country: "China" },

    // ðŸ‡®ðŸ‡³ More India
    { code: "BOM", name: "Mumbai", country: "India" },
    { code: "BLR", name: "Bangalore", country: "India" },

    // ðŸ‡¦ðŸ‡ª More Middle East
    { code: "AUH", name: "Abu Dhabi", country: "United Arab Emirates" },
    { code: "DOH", name: "Doha", country: "Qatar" },
    { code: "IST", name: "Istanbul", country: "Turkey" },] as const;

export type Airport = (typeof AIRPORTS)[number];
export type AirportCode = Airport["code"];
export type CabinCode = "Y" | "W" | "C" | "F";

export const AIRPORT_MAP = new Map<string, Airport>(
    (AIRPORTS as unknown as Airport[]).map(a => [a.code, a])
);

// â”€â”€ UX IMPROVEMENT: Destination Grouping Logic â”€â”€ //
export const DESTINATION_GROUPS = (() => {
    const groups: { key: string; label: string; options: Airport[] }[] = [];
    const airList = AIRPORTS as unknown as Airport[];

    // 1. Myanmar (Home) - Always absolute top
    const myanmar = airList.filter(a => a.country === "Myanmar");
    if (myanmar.length) {
        groups.push({ key: "Myanmar", label: "ðŸ‡²ðŸ‡² Myanmar (Home)", options: myanmar });
    }

    // 2. Popular Destinations
    const popular = airList.filter(a => (a as any).isPopular);
    if (popular.length) {
        groups.push({ key: "Popular", label: "ðŸ”¥ Popular Destinations", options: popular });
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
