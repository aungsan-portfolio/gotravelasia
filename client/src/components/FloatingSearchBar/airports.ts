// ── Shared airports list & search helper ──────────────────────────

export const AIRPORTS = [
    { code: "RGN", city: "Yangon", name: "Yangon Intl", country: "Myanmar" },
    { code: "MDL", city: "Mandalay", name: "Mandalay Intl", country: "Myanmar" },
    { code: "NYU", city: "Bagan", name: "Nyaung U Airport", country: "Myanmar" },
    { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Thailand" },
    { code: "DMK", city: "Bangkok", name: "Don Mueang", country: "Thailand" },
    { code: "CNX", city: "Chiang Mai", name: "Chiang Mai Intl", country: "Thailand" },
    { code: "HKT", city: "Phuket", name: "Phuket Intl", country: "Thailand" },
    { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
    { code: "KUL", city: "Kuala Lumpur", name: "KLIA", country: "Malaysia" },
    { code: "PEN", city: "Penang", name: "Penang Intl", country: "Malaysia" },
    { code: "HAN", city: "Hanoi", name: "Noi Bai Intl", country: "Vietnam" },
    { code: "SGN", city: "Ho Chi Minh City", name: "Tan Son Nhat", country: "Vietnam" },
    { code: "DAD", city: "Da Nang", name: "Da Nang Intl", country: "Vietnam" },
    { code: "REP", city: "Siem Reap", name: "Siem Reap Intl", country: "Cambodia" },
    { code: "PNH", city: "Phnom Penh", name: "Phnom Penh Intl", country: "Cambodia" },
    { code: "HKG", city: "Hong Kong", name: "Hong Kong Intl", country: "China HK" },
    { code: "KMG", city: "Kunming", name: "Kunming Changshui", country: "China" },
    { code: "CAN", city: "Guangzhou", name: "Guangzhou Baiyun", country: "China" },
    { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE" },
];

export type Airport = (typeof AIRPORTS)[number];

export function searchAirports(q: string) {
    if (!q.trim()) return AIRPORTS;
    const lq = q.toLowerCase();
    return AIRPORTS.filter(a =>
        a.code.toLowerCase().includes(lq) ||
        a.city.toLowerCase().includes(lq) ||
        a.name.toLowerCase().includes(lq) ||
        a.country.toLowerCase().includes(lq)
    );
}
