// client/src/data/destinationRegistry.ts
// Maps URL slugs → full destination page data.
// Phase 2: swap static data for API calls.

import type {
    DestinationInfo, OriginInfo, FlightMeta, FlightDealsData, FareTableEntry,
    CheapAirline, AirlineReview,
} from "./destinationData";

// ── Full bundle type ─────────────────────────────────────────────
export interface DestinationBundle {
    dest: DestinationInfo;
    origin: OriginInfo;
    meta: FlightMeta;
    deals: FlightDealsData;
    fareTable: FareTableEntry[];
    priceMonth: { m: string; p: number }[];
    bookLead: { d: string; p: number }[];
    weekly: { day: string; n: number }[];
    durations: { c: string; h: number }[];
    heatmap: { d: string; Morning: number; Midday: number; Afternoon: number; Evening: number; Night: number }[];
    rainfall: { m: string; mm: number }[];
    temperature: { m: string; c: number }[];
    popAirlines: { name: string; emoji: string; from: number }[];
    cheapAl: CheapAirline[];
    reviews: AirlineReview[];
    faqs: { q: string; a: string }[];
}

// ── Helpers ──────────────────────────────────────────────────────
function slug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
}

/** Scale an array of {m,p} by a ratio, adding slight randomness */
function scalePrices(base: { m: string; p: number }[], ratio: number): { m: string; p: number }[] {
    return base.map(d => ({ m: d.m, p: Math.round(d.p * ratio * (0.92 + Math.random() * 0.16)) }));
}
function scaleBookLead(ratio: number): { d: string; p: number }[] {
    return [
        { d: "90+days", p: Math.round(5200 * ratio) },
        { d: "60-90d", p: Math.round(5600 * ratio) },
        { d: "30-60d", p: Math.round(6200 * ratio) },
        { d: "14-30d", p: Math.round(7100 * ratio) },
        { d: "7-14d", p: Math.round(8400 * ratio) },
        { d: "0-7d", p: Math.round(9800 * ratio) },
    ];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BASE_PRICE_MONTH = [7800, 7200, 6800, 6400, 6100, 5600, 5900, 6300, 6700, 7100, 8200, 9400];

function genPriceMonth(ratio: number) {
    return MONTHS.map((m, i) => ({ m, p: Math.round(BASE_PRICE_MONTH[i] * ratio) }));
}

function genWeekly(base = 50) {
    return DAYS.map(day => ({ day, n: Math.round(base + (Math.random() - 0.3) * 20) }));
}

function genHeatmap(ratio: number) {
    const base = [
        { d: "Mon", Morning: 7200, Midday: 6100, Afternoon: 6800, Evening: 8200, Night: 7600 },
        { d: "Tue", Morning: 6900, Midday: 5900, Afternoon: 6500, Evening: 7900, Night: 7200 },
        { d: "Wed", Morning: 7100, Midday: 6000, Afternoon: 6700, Evening: 8100, Night: 7400 },
        { d: "Thu", Morning: 6400, Midday: 5400, Afternoon: 6100, Evening: 7600, Night: 6900 },
        { d: "Fri", Morning: 7800, Midday: 7200, Afternoon: 8100, Evening: 9200, Night: 8500 },
        { d: "Sat", Morning: 8500, Midday: 8100, Afternoon: 8900, Evening: 10200, Night: 9400 },
        { d: "Sun", Morning: 7600, Midday: 6800, Afternoon: 7400, Evening: 8600, Night: 7900 },
    ];
    return base.map(r => ({
        d: r.d,
        Morning: Math.round(r.Morning * ratio), Midday: Math.round(r.Midday * ratio),
        Afternoon: Math.round(r.Afternoon * ratio), Evening: Math.round(r.Evening * ratio),
        Night: Math.round(r.Night * ratio),
    }));
}

function genFaqs(city: string, code: string, airport: string): { q: string; a: string }[] {
    return [
        { q: `What airport do you fly into for flights to ${city}?`, a: `You'll fly into ${airport} (${code}). GoTravel Asia compares prices across all major airlines serving this route.` },
        { q: `Can I find cheaper flights to ${city} with stopovers?`, a: `Yes. Flights with one stop are often significantly cheaper. Toggle 1-stop in the filters to see budget-friendly options.` },
        { q: `What is the best airline to fly to ${city}?`, a: `It depends on your priorities. Check the airline review cards above for ratings on comfort, food, crew and boarding.` },
        { q: `How much is a return flight to ${city}?`, a: `Prices vary by season. Check the price chart above for monthly estimates. Book 60+ days ahead for the best deals.` },
        { q: `Can GoTravel Asia notify me if prices drop?`, a: `Yes! Use Price Alerts to track your route. We'll email you when prices drop to your target.` },
        { q: `Does ${airport} have rental cars?`, a: `Most major airports offer car hire. Use GoTravel Asia Car Rental to compare prices.` },
        { q: `Are there hotels close to ${airport}?`, a: `Yes. Many transit and city hotels within 5km. Use our hotel search to compare options.` },
        { q: `When is the cheapest time to fly to ${city}?`, a: `Low season varies by destination. Check the "Best time to book" section above for data-driven advice.` },
    ];
}

function genDeals(city: string, code: string, ratio: number): FlightDealsData {
    const p = (base: number) => Math.round(base * ratio);
    return {
        Cheapest: [
            { id: 1, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Thu 2/4", t1: "10:40", a1: "13:05", ret: "Tue 7/4", t2: "14:40", a2: "17:20", stops: 0, dur: "2h 25m", price: p(4251), found: "3/3" },
            { id: 2, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Fri 10/4", t1: "17:15", a1: "19:45", ret: "Wed 15/4", t2: "21:45", a2: "00:15+1", stops: 0, dur: "2h 30m", price: p(4314), found: "5/3" },
            { id: 3, al: "Scoot", logo: "✈️", from: "BKK", d1: "Thu 23/4", t1: "22:30", a1: "01:00+1", ret: "Sun 26/4", t2: "18:00", a2: "20:35", stops: 0, dur: "2h 30m", price: p(4350), found: "4/3" },
            { id: 4, al: "Multiple Airlines", logo: "🛫", from: "BKK", d1: "Mon 20/4", t1: "17:30", a1: "22:55", ret: "Fri 24/4", t2: "06:30", a2: "09:05", stops: 1, dur: "5h 25m", price: p(4500), found: "6/3" },
        ],
        Best: [
            { id: 5, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Thu 23/4", t1: "10:40", a1: "13:05", ret: "Sun 26/4", t2: "14:40", a2: "17:20", stops: 0, dur: "2h 25m", price: p(5456), found: "8/3" },
            { id: 6, al: "Thai Airways", logo: "🐘", from: "BKK", d1: "Mon 20/4", t1: "22:15", a1: "12:45+1", ret: "Wed 22/4", t2: "11:20", a2: "16:55", stops: 0, dur: "2h 45m", price: p(6327), found: "3/3" },
        ],
        Direct: [
            { id: 7, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Thu 2/4", t1: "17:15", a1: "19:45", ret: "Tue 7/4", t2: "21:45", a2: "00:15+1", stops: 0, dur: "2h 30m", price: p(4251), found: "3/3" },
            { id: 8, al: "Scoot", logo: "✈️", from: "BKK", d1: "Mon 11/5", t1: "20:35", a1: "23:05", ret: "Wed 13/5", t2: "16:15", a2: "18:50", stops: 0, dur: "2h 30m", price: p(4346), found: "8/3" },
        ],
        "Last-minute": [
            { id: 9, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Sun 15/3", t1: "07:55", a1: "10:20", ret: "Mon 23/3", t2: "21:30", a2: "00:00+1", stops: 0, dur: "2h 25m", price: p(4505), found: "5/3" },
        ],
        "One-way": [
            { id: 10, al: "Multiple Airlines", logo: "🛫", from: "DMK", d1: "Tue 2/6", t1: "19:55", a1: "11:45+1", ret: null, stops: 1, dur: "15h 50m", price: p(1776), found: "4/3" },
            { id: 11, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Sun 15/3", t1: "10:50", a1: "13:30", ret: null, stops: 0, dur: "2h 40m", price: p(1808), found: "4/3" },
        ],
    };
}

function genFareTable(code: string, airport: string, ratio: number): FareTableEntry[] {
    const p = (base: number) => Math.round(base * ratio);
    return [
        { route: `BKK→${code}`, from: "Bangkok Suvarnabhumi", d1: "Mon 20/4 22:15", a1: "Tue 21/4 12:45", s1: 1, dur1: "13h 30m", from2: airport, d2: "Wed 22/4 11:20", a2: "16:55", s2: 1, dur2: "6h 35m", price: p(4949), note: "Cheapest return" },
        { route: `BKK→${code}`, from: "Bangkok Suvarnabhumi", d1: "Fri 17/4 15:25", a1: "Fri 17/4 23:55", s1: 1, dur1: "7h 30m", from2: airport, d2: "Fri 24/4 18:50", a2: "23:15", s2: 1, dur2: "5h 25m", price: p(5139), note: null },
        { route: `DMK→${code}`, from: "Bangkok Don Mueang", d1: "Thu 23/4 10:40", a1: "Thu 23/4 14:05", s1: 0, dur1: "2h 25m", from2: airport, d2: "Sun 26/4 14:40", a2: "16:20", s2: 0, dur2: "2h 40m", price: p(5456), note: null },
        { route: `DMK→${code}`, from: "Bangkok Don Mueang", d1: "Thu 16/4 10:40", a1: "Thu 16/4 14:05", s1: 0, dur1: "2h 25m", from2: airport, d2: "Mon 20/4 20:40", a2: "22:10", s2: 0, dur2: "2h 30m", price: p(5520), note: "Fastest journey" },
    ];
}

function genReviews(city: string, code: string): AirlineReview[] {
    return [
        { name: "Thai Airways", e: "🐘", r: 7.8, lbl: "Good", cnt: 391, from: 6327, sc: { Entertainment: 7.2, Comfort: 7.5, Food: 7.0, Crew: 7.8, Boarding: 7.6 }, rev: { u: "TravellerTH", dt: "Jan 2026", rt: `BKK-${code}`, s: 7.5, t: `Comfortable flight to ${city}. Friendly crew and decent food.` } },
        { name: "Thai AirAsia", e: "🔴", r: 7.5, lbl: "Good", cnt: 235, from: 2941, sc: { Entertainment: 6.5, Comfort: 7.0, Food: 6.8, Crew: 7.5, Boarding: 7.8 }, rev: { u: "BudgetFlyer", dt: "Mar 2026", rt: `DMK-${code}`, s: 7.0, t: `Good budget option for ${city}. On time and efficient boarding.` } },
        { name: "Thai Lion Air", e: "🦁", r: 7.1, lbl: "Good", cnt: 43, from: 3414, sc: { Entertainment: 6.0, Comfort: 6.8, Food: 6.2, Crew: 7.2, Boarding: 7.4 }, rev: { u: "LionFan", dt: "Feb 2026", rt: `DMK-${code}`, s: 7.0, t: `Cheap and cheerful flight to ${city}. Got what I paid for.` } },
        { name: "Scoot", e: "✈️", r: 6.7, lbl: "Okay", cnt: 319, from: 3175, sc: { Entertainment: 5.8, Comfort: 6.2, Food: 5.5, Crew: 7.0, Boarding: 7.3 }, rev: { u: "ScootUser", dt: "Jan 2026", rt: `BKK-${code}`, s: 6.5, t: `Basic but affordable for ${city}. Price is right.` } },
    ];
}

// ── Destination definitions ──────────────────────────────────────
interface DestDef {
    city: string; code: string; airport: string; country: string; flag: string;
    /** Price ratio relative to Singapore baseline */
    priceRatio: number;
    flightDur: number;
    avgTemp: number;
    avgRain: number;
}

const DEST_DEFS: DestDef[] = [
    // Countries (Popular Destinations)
    { city: "Singapore", code: "SIN", airport: "Changi Airport", country: "Singapore", flag: "🇸🇬", priceRatio: 1.0, flightDur: 2.4, avgTemp: 27, avgRain: 190 },
    { city: "Brunei", code: "BWN", airport: "Brunei Intl Airport", country: "Brunei", flag: "🇧🇳", priceRatio: 1.3, flightDur: 3.2, avgTemp: 27, avgRain: 230 },
    { city: "Phnom Penh", code: "PNH", airport: "Phnom Penh Intl Airport", country: "Cambodia", flag: "🇰🇭", priceRatio: 0.85, flightDur: 1.2, avgTemp: 28, avgRain: 150 },
    { city: "Beijing", code: "PEK", airport: "Beijing Capital Intl", country: "China", flag: "🇨🇳", priceRatio: 1.8, flightDur: 5.0, avgTemp: 13, avgRain: 60 },
    { city: "Hong Kong", code: "HKG", airport: "Hong Kong Intl Airport", country: "Hong Kong", flag: "🇭🇰", priceRatio: 1.5, flightDur: 2.8, avgTemp: 23, avgRain: 180 },
    { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Intl", country: "India", flag: "🇮🇳", priceRatio: 1.6, flightDur: 4.5, avgTemp: 28, avgRain: 200 },
    { city: "Jakarta", code: "CGK", airport: "Soekarno-Hatta Intl", country: "Indonesia", flag: "🇮🇩", priceRatio: 1.1, flightDur: 3.5, avgTemp: 27, avgRain: 175 },
    { city: "Tokyo", code: "NRT", airport: "Narita Intl Airport", country: "Japan", flag: "🇯🇵", priceRatio: 2.2, flightDur: 6.0, avgTemp: 16, avgRain: 130 },
    { city: "Macau", code: "MFM", airport: "Macau Intl Airport", country: "Macau", flag: "🇲🇴", priceRatio: 1.4, flightDur: 2.5, avgTemp: 23, avgRain: 170 },
    { city: "Kuala Lumpur", code: "KUL", airport: "KLIA", country: "Malaysia", flag: "🇲🇾", priceRatio: 0.7, flightDur: 2.2, avgTemp: 28, avgRain: 210 },
    { city: "Manila", code: "MNL", airport: "Ninoy Aquino Intl", country: "Philippines", flag: "🇵🇭", priceRatio: 1.2, flightDur: 3.3, avgTemp: 28, avgRain: 190 },
    { city: "Seoul", code: "ICN", airport: "Incheon Intl Airport", country: "South Korea", flag: "🇰🇷", priceRatio: 2.0, flightDur: 5.5, avgTemp: 12, avgRain: 110 },
    { city: "Taipei", code: "TPE", airport: "Taoyuan Intl Airport", country: "Taiwan", flag: "🇹🇼", priceRatio: 1.7, flightDur: 3.8, avgTemp: 23, avgRain: 160 },
    { city: "Bangkok", code: "BKK", airport: "Suvarnabhumi Airport", country: "Thailand", flag: "🇹🇭", priceRatio: 0.3, flightDur: 0.0, avgTemp: 29, avgRain: 150 },
    { city: "Dubai", code: "DXB", airport: "Dubai Intl Airport", country: "United Arab Emirates", flag: "🇦🇪", priceRatio: 2.5, flightDur: 6.5, avgTemp: 28, avgRain: 10 },
    { city: "Hanoi", code: "HAN", airport: "Noi Bai Intl Airport", country: "Vietnam", flag: "🇻🇳", priceRatio: 0.9, flightDur: 1.8, avgTemp: 24, avgRain: 150 },
    // Cities (Popular Cities not already above)
    { city: "Yangon", code: "RGN", airport: "Yangon Intl Airport", country: "Myanmar", flag: "🇲🇲", priceRatio: 0.8, flightDur: 1.3, avgTemp: 28, avgRain: 240 },
    { city: "Mandalay", code: "MDL", airport: "Mandalay Intl Airport", country: "Myanmar", flag: "🇲🇲", priceRatio: 0.85, flightDur: 1.5, avgTemp: 27, avgRain: 130 },
];

// ── Build the registry map ───────────────────────────────────────
function buildBundle(def: DestDef): DestinationBundle {
    const dest: DestinationInfo = { city: def.city, code: def.code, airport: def.airport, country: def.country, flag: def.flag };
    const origin: OriginInfo = { city: "Bangkok", code: "BKK" };

    const cheapest = Math.round(1776 * def.priceRatio);
    const retFrom = Math.round(4251 * def.priceRatio);

    const meta: FlightMeta = {
        cheapestOneWay: cheapest, returnFrom: retFrom, oneWayFrom: cheapest,
        popularIn: "December", cheapestIn: "June", avgPrice: Math.round(6376 * def.priceRatio),
        searches: Math.round(17341 * (1 / def.priceRatio) * 0.8),
        updated: "8 Mar 2026", bookAdvance: 64, cheapestDay: "Thursday", cheapestTime: "midday",
        avoidDay: "Saturday", avoidTime: "evenings",
    };

    const durations = [
        { c: "Bangkok", h: def.flightDur },
        { c: "Chiang Mai", h: +(def.flightDur + 1.4).toFixed(1) },
        { c: "Phuket", h: +(def.flightDur + 0.3).toFixed(1) },
        { c: "Hat Yai", h: +(def.flightDur - 0.6 > 0.5 ? def.flightDur - 0.6 : 0.8).toFixed(1) },
        { c: "Chiang Rai", h: +(def.flightDur + 1.8).toFixed(1) },
    ];

    // Temp & rain – seasonal variation around the destination avg
    const tempVariation = [0, -0.5, 0, 0.5, 1, 1, 0.5, 0.5, 0, -0.5, -0.5, -1];
    const rainVariation = [0.9, 0.7, 0.8, 0.85, 0.95, 1.0, 0.85, 0.9, 1.0, 1.1, 1.2, 1.3];

    const temperature = MONTHS.map((m, i) => ({ m, c: Math.round(def.avgTemp + tempVariation[i]) }));
    const rainfall = MONTHS.map((m, i) => ({ m, mm: Math.round(def.avgRain * rainVariation[i]) }));

    return {
        dest, origin, meta,
        deals: genDeals(def.city, def.code, def.priceRatio),
        fareTable: genFareTable(def.code, def.airport, def.priceRatio),
        priceMonth: genPriceMonth(def.priceRatio),
        bookLead: scaleBookLead(def.priceRatio),
        weekly: genWeekly(),
        durations,
        heatmap: genHeatmap(def.priceRatio),
        rainfall, temperature,
        popAirlines: [
            { name: "Scoot", emoji: "✈️", from: Math.round(3175 * def.priceRatio) },
            { name: "Thai AirAsia", emoji: "🔴", from: Math.round(2941 * def.priceRatio) },
            { name: "Thai Lion Air", emoji: "🦁", from: Math.round(3414 * def.priceRatio) },
            { name: "Thai Airways", emoji: "🐘", from: Math.round(6327 * def.priceRatio) },
        ],
        cheapAl: [
            { name: "Thai AirAsia", pct: 95, from: Math.round(2941 * def.priceRatio) },
            { name: "Thai Lion Air", pct: 82, from: Math.round(3414 * def.priceRatio) },
            { name: "Scoot", pct: 75, from: Math.round(3175 * def.priceRatio) },
            { name: "Thai Airways", pct: 42, from: Math.round(6327 * def.priceRatio) },
        ],
        reviews: genReviews(def.city, def.code),
        faqs: genFaqs(def.city, def.code, def.airport),
    };
}

// Pre-build registry keyed by slug
const REGISTRY = new Map<string, DestinationBundle>();

for (const def of DEST_DEFS) {
    REGISTRY.set(slug(def.city), buildBundle(def));
    // Also map by country name for "Popular Destinations" which use country names
    if (slug(def.country) !== slug(def.city)) {
        REGISTRY.set(slug(def.country), buildBundle(def));
    }
}

// ── Public API ───────────────────────────────────────────────────
export function getDestinationBySlug(s: string): DestinationBundle | undefined {
    return REGISTRY.get(s.toLowerCase());
}

export function getAllSlugs(): string[] {
    return Array.from(new Set(DEST_DEFS.map(d => slug(d.city))));
}

export { POP_DEST, POP_CITIES } from "./destinationData";
