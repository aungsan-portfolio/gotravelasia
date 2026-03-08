// ─── Destination route data ────────────────────────────────────────────────

export interface DestinationMeta {
    toCode: string;
    city: string;
    country: string;
    image: string;
}

export const MYANMAR_ORIGINS = ["RGN", "MDL"] as const;

export const MYANMAR_DESTINATIONS: DestinationMeta[] = [
    { toCode: "BKK", city: "Bangkok", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "DMK", city: "Bangkok (DMK)", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "CNX", city: "Chiang Mai", country: "Thailand", image: "/images/chiang-mai.webp" },
    { toCode: "SIN", city: "Singapore", country: "Singapore", image: "/images/destinations/singapore.webp" },
    { toCode: "KUL", city: "Kuala Lumpur", country: "Malaysia", image: "/images/destinations/kuala-lumpur.webp" },
    { toCode: "HAN", city: "Hanoi", country: "Vietnam", image: "/images/destinations/hanoi.webp" },
    { toCode: "SGN", city: "Ho Chi Minh City", country: "Vietnam", image: "/images/destinations/ho-chi-minh.webp" },
    { toCode: "DAD", city: "Da Nang", country: "Vietnam", image: "/images/destinations/da-nang.webp" },
    { toCode: "NHA", city: "Nha Trang", country: "Vietnam", image: "/images/destinations/nha-trang.webp" },
    { toCode: "PQC", city: "Phu Quoc", country: "Vietnam", image: "/images/destinations/phu-quoc.webp" },
    { toCode: "CAN", city: "Guangzhou", country: "China", image: "/images/destinations/hanoi.webp" },
    { toCode: "SEL", city: "Seoul", country: "South Korea", image: "/images/destinations/seoul.webp" },
    { toCode: "TYO", city: "Tokyo", country: "Japan", image: "/images/tokyo.webp" },
    { toCode: "HKT", city: "Phuket", country: "Thailand", image: "/images/phuket.webp" },
    { toCode: "DPS", city: "Bali", country: "Indonesia", image: "/images/bali.webp" },
];

export const ASIA_ORIGINS = ["BKK", "DMK", "CNX", "HKT", "SIN"] as const;

export const ASIA_DESTINATIONS: DestinationMeta[] = [
    { toCode: "CNX", city: "Chiang Mai", country: "Thailand", image: "/images/chiang-mai.webp" },
    { toCode: "HKT", city: "Phuket", country: "Thailand", image: "/images/phuket.webp" },
    { toCode: "BKK", city: "Bangkok", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "DMK", city: "Bangkok (DMK)", country: "Thailand", image: "/images/bangkok.webp" },
    { toCode: "SIN", city: "Singapore", country: "Singapore", image: "/images/destinations/singapore.webp" },
    { toCode: "KUL", city: "Kuala Lumpur", country: "Malaysia", image: "/images/destinations/kuala-lumpur.webp" },
    { toCode: "SGN", city: "Ho Chi Minh City", country: "Vietnam", image: "/images/destinations/ho-chi-minh.webp" },
    { toCode: "RGN", city: "Yangon", country: "Myanmar", image: "/images/destinations/yangon.png" },
    { toCode: "MDL", city: "Mandalay", country: "Myanmar", image: "/images/destinations/mandalay.png" },
    { toCode: "HAN", city: "Hanoi", country: "Vietnam", image: "/images/destinations/hanoi.webp" },
    { toCode: "MNL", city: "Manila", country: "Philippines", image: "/images/destinations/manila.webp" },
    { toCode: "DPS", city: "Bali", country: "Indonesia", image: "/images/bali.webp" },
    { toCode: "SEL", city: "Seoul", country: "South Korea", image: "/images/destinations/seoul.webp" },
    { toCode: "OSA", city: "Osaka", country: "Japan", image: "/images/destinations/osaka.webp" },
    { toCode: "TYO", city: "Tokyo", country: "Japan", image: "/images/tokyo.webp" },
];
