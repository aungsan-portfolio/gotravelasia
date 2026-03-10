// client/src/data/destinationData.ts
// Replaces static destinationData.js with a fully typed file.
// This sets up the perfect foundation to later swap with dynamic fetch calls `/api/flights/to/${slug}`

export interface DestinationInfo {
    city: string;
    code: string;
    airport: string;
    country: string;
    flag: string;
}

export interface OriginInfo {
    city: string;
    code: string;
}

export interface FlightMeta {
    cheapestOneWay: number;
    returnFrom: number;
    oneWayFrom: number;
    popularIn: string;
    cheapestIn: string;
    avgPrice: number;
    searches: number;
    updated: string;
    bookAdvance: number;
    cheapestDay: string;
    cheapestTime: string;
    avoidDay: string;
    avoidTime: string;
}

export interface Deal {
    id: number;
    al: string;
    logo: string;
    from: string;
    d1: string;
    t1: string;
    a1: string;
    ret: string | null;
    t2?: string;
    a2?: string;
    stops: number;
    dur: string;
    price: number;
    found: string;
}

export interface FlightDealsData {
    Cheapest: Deal[];
    Best: Deal[];
    Direct: Deal[];
    "Last-minute": Deal[];
    "One-way": Deal[];
}

export const DEST: DestinationInfo = { city: "Singapore", code: "SIN", airport: "Changi Airport", country: "Singapore", flag: "🇸🇬" };
export const ORIGIN: OriginInfo = { city: "Bangkok", code: "BKK" };
export const META: FlightMeta = { cheapestOneWay: 1776, returnFrom: 4251, oneWayFrom: 1776, popularIn: "December", cheapestIn: "June", avgPrice: 6376, searches: 17341, updated: "8 Mar 2026", bookAdvance: 64, cheapestDay: "Thursday", cheapestTime: "midday", avoidDay: "Saturday", avoidTime: "evenings" };

export const DEALS: FlightDealsData = {
    Cheapest: [
        { id: 1, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Thu 2/4", t1: "17:15", a1: "19:45", ret: "Tue 7/4", t2: "21:45", a2: "00:15+1", stops: 0, dur: "2h 30m", price: 4251, found: "3/3" },
        { id: 2, al: "Scoot", logo: "✈️", from: "BKK", d1: "Thu 23/4", t1: "22:30", a1: "01:00+1", ret: "Sun 26/4", t2: "18:00", a2: "20:35", stops: 0, dur: "2h 30m", price: 4251, found: "3/3" },
        { id: 3, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Tue 21/4", t1: "10:40", a1: "13:05", ret: "Thu 23/4", t2: "20:40", a2: "23:10", stops: 0, dur: "2h 25m", price: 4283, found: "4/3" },
        { id: 4, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Fri 10/7", t1: "17:15", a1: "19:45", ret: "Wed 29/7", t2: "12:10", a2: "14:40", stops: 0, dur: "2h 30m", price: 4314, found: "7/3" },
        { id: 5, al: "Multiple Airlines", logo: "🛫", from: "BKK", d1: "Thu 23/4", t1: "17:30", a1: "22:55", ret: "Mon 27/4", t2: "06:30", a2: "09:05", stops: 1, dur: "5h 25m", price: 4346, found: "4/3" },
    ],
    Best: [
        { id: 6, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Thu 23/4", t1: "10:40", a1: "13:05", ret: "Sun 26/4", t2: "14:40", a2: "17:20", stops: 0, dur: "2h 25m", price: 5456, found: "8/3" },
        { id: 7, al: "Multiple Airlines", logo: "🛫", from: "BKK", d1: "Mon 20/4", t1: "22:15", a1: "12:45+1", ret: "Wed 22/4", t2: "11:20", a2: "16:55", stops: 1, dur: "13h 30m", price: 4949, found: "3/3" },
        { id: 8, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Thu 16/4", t1: "10:40", a1: "13:05", ret: "Mon 20/4", t2: "20:40", a2: "23:10", stops: 0, dur: "2h 25m", price: 5520, found: "5/3" },
        { id: 9, al: "Multiple Airlines", logo: "🛫", from: "BKK", d1: "Fri 17/4", t1: "15:25", a1: "23:55", ret: "Fri 24/4", t2: "18:50", a2: "23:15", stops: 1, dur: "7h 30m", price: 5139, found: "3/3" },
    ],
    Direct: [
        { id: 10, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Thu 2/4", t1: "17:15", a1: "19:45", ret: "Tue 7/4", t2: "21:45", a2: "00:15+1", stops: 0, dur: "2h 30m", price: 4251, found: "3/3" },
        { id: 11, al: "Scoot", logo: "✈️", from: "BKK", d1: "Mon 11/5", t1: "20:35", a1: "23:05", ret: "Wed 13/5", t2: "16:15", a2: "18:50", stops: 0, dur: "2h 30m", price: 4346, found: "8/3" },
        { id: 12, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Wed 8/4", t1: "10:40", a1: "13:05", ret: "Mon 13/4", t2: "14:40", a2: "17:20", stops: 0, dur: "2h 25m", price: 4441, found: "8/3" },
    ],
    "Last-minute": [
        { id: 13, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Sun 15/3", t1: "07:55", a1: "10:20", ret: "Mon 23/3", t2: "21:30", a2: "00:00+1", stops: 0, dur: "2h 25m", price: 4505, found: "5/3" },
        { id: 14, al: "Scoot", logo: "✈️", from: "BKK", d1: "Wed 1/4", t1: "22:30", a1: "01:00+1", ret: "Sun 5/4", t2: "18:00", a2: "20:35", stops: 0, dur: "2h 30m", price: 4314, found: "5/3" },
    ],
    "One-way": [
        { id: 15, al: "Multiple Airlines", logo: "🛫", from: "DMK", d1: "Tue 2/6", t1: "19:55", a1: "11:45+1", ret: null, stops: 1, dur: "15h 50m", price: 1776, found: "4/3" },
        { id: 16, al: "Thai AirAsia", logo: "🔴", from: "DMK", d1: "Sun 15/3", t1: "10:50", a1: "13:30", ret: null, stops: 0, dur: "2h 40m", price: 1808, found: "4/3" },
        { id: 17, al: "Scoot", logo: "✈️", from: "BKK", d1: "Wed 22/4", t1: "20:35", a1: "23:05", ret: null, stops: 0, dur: "2h 30m", price: 1808, found: "7/3" },
        { id: 18, al: "Thai Lion Air", logo: "🦁", from: "DMK", d1: "Thu 12/3", t1: "07:55", a1: "10:20", ret: null, stops: 0, dur: "2h 25m", price: 1903, found: "3/3" },
    ],
};

export const FLIGHT_TABS = Object.keys(DEALS) as (keyof FlightDealsData)[];

export interface FareTableEntry {
    route: string;
    from: string;
    d1: string;
    a1: string;
    s1: number;
    dur1: string;
    from2: string;
    d2: string;
    a2: string;
    s2: number;
    dur2: string;
    price: number;
    note: string | null;
}

export const FARE_TABLE: FareTableEntry[] = [
    { route: "BKK→SIN", from: "Bangkok Suvarnabhumi", d1: "Mon 20/4 22:15", a1: "Tue 21/4 12:45", s1: 1, dur1: "13h 30m", from2: "Singapore Changi", d2: "Wed 22/4 11:20", a2: "16:55", s2: 1, dur2: "6h 35m", price: 4949, note: "Cheapest return" },
    { route: "BKK→SIN", from: "Bangkok Suvarnabhumi", d1: "Fri 17/4 15:25", a1: "Fri 17/4 23:55", s1: 1, dur1: "7h 30m", from2: "Singapore Changi", d2: "Fri 24/4 18:50", a2: "23:15", s2: 1, dur2: "5h 25m", price: 5139, note: null },
    { route: "DMK→SIN", from: "Bangkok Don Mueang", d1: "Thu 23/4 10:40", a1: "Thu 23/4 14:05", s1: 0, dur1: "2h 25m", from2: "Singapore Changi", d2: "Sun 26/4 14:40", a2: "16:20", s2: 0, dur2: "2h 40m", price: 5456, note: null },
    { route: "DMK→SIN", from: "Bangkok Don Mueang", d1: "Thu 16/4 10:40", a1: "Thu 16/4 14:05", s1: 0, dur1: "2h 25m", from2: "Singapore Changi", d2: "Mon 20/4 20:40", a2: "22:10", s2: 0, dur2: "2h 30m", price: 5520, note: "Fastest journey" },
    { route: "BKK→SIN", from: "Bangkok Suvarnabhumi", d1: "Sun 19/4 22:15", a1: "Mon 20/4 12:45", s1: 1, dur1: "13h 30m", from2: "Singapore Changi", d2: "Sun 26/4 07:30", a2: "16:55", s2: 1, dur2: "10h 25m", price: 5774, note: null },
    { route: "BKK→SIN", from: "Bangkok Suvarnabhumi", d1: "Thu 26/3 15:25", a1: "Thu 26/3 23:15", s1: 1, dur1: "6h 50m", from2: "Singapore Changi", d2: "Tue 31/3 12:10", a2: "21:00", s2: 1, dur2: "9h 50m", price: 6091, note: null },
    { route: "DMK→SIN", from: "Bangkok Don Mueang", d1: "Wed 29/4 16:50", a1: "Wed 29/4 20:15", s1: 0, dur1: "2h 25m", from2: "Singapore Changi", d2: "Mon 4/5 20:40", a2: "22:10", s2: 0, dur2: "2h 30m", price: 6123, note: null },
    { route: "BKK→SIN", from: "Bangkok Suvarnabhumi", d1: "Wed 1/4 22:15", a1: "Thu 2/4 12:45", s1: 1, dur1: "13h 30m", from2: "Singapore Changi", d2: "Wed 8/4 16:55", a2: "23:20", s2: 1, dur2: "7h 25m", price: 6186, note: null },
];

export const PRICE_MONTH = [{ m: "Jan", p: 7800 }, { m: "Feb", p: 7200 }, { m: "Mar", p: 6800 }, { m: "Apr", p: 6400 }, { m: "May", p: 6100 }, { m: "Jun", p: 5600 }, { m: "Jul", p: 5900 }, { m: "Aug", p: 6300 }, { m: "Sep", p: 6700 }, { m: "Oct", p: 7100 }, { m: "Nov", p: 8200 }, { m: "Dec", p: 9400 }];
export const BOOK_LEAD = [{ d: "90+days", p: 5200 }, { d: "60-90d", p: 5600 }, { d: "30-60d", p: 6200 }, { d: "14-30d", p: 7100 }, { d: "7-14d", p: 8400 }, { d: "0-7d", p: 9800 }];
export const WEEKLY = [{ day: "Mon", n: 47 }, { day: "Tue", n: 52 }, { day: "Wed", n: 55 }, { day: "Thu", n: 58 }, { day: "Fri", n: 65 }, { day: "Sat", n: 61 }, { day: "Sun", n: 53 }];
export const DURATIONS = [{ c: "Bangkok", h: 2.4 }, { c: "Chiang Mai", h: 3.8 }, { c: "Phuket", h: 2.7 }, { c: "Hat Yai", h: 1.75 }, { c: "Chiang Rai", h: 4.2 }];

export const HEATMAP = [
    { d: "Mon", Morning: 7200, Midday: 6100, Afternoon: 6800, Evening: 8200, Night: 7600 },
    { d: "Tue", Morning: 6900, Midday: 5900, Afternoon: 6500, Evening: 7900, Night: 7200 },
    { d: "Wed", Morning: 7100, Midday: 6000, Afternoon: 6700, Evening: 8100, Night: 7400 },
    { d: "Thu", Morning: 6400, Midday: 5400, Afternoon: 6100, Evening: 7600, Night: 6900 },
    { d: "Fri", Morning: 7800, Midday: 7200, Afternoon: 8100, Evening: 9200, Night: 8500 },
    { d: "Sat", Morning: 8500, Midday: 8100, Afternoon: 8900, Evening: 10200, Night: 9400 },
    { d: "Sun", Morning: 7600, Midday: 6800, Afternoon: 7400, Evening: 8600, Night: 7900 },
];

export const RAINFALL = [{ m: "Jan", mm: 230 }, { m: "Feb", mm: 170 }, { m: "Mar", mm: 185 }, { m: "Apr", mm: 175 }, { m: "May", mm: 165 }, { m: "Jun", mm: 162 }, { m: "Jul", mm: 150 }, { m: "Aug", mm: 155 }, { m: "Sep", mm: 162 }, { m: "Oct", mm: 195 }, { m: "Nov", mm: 250 }, { m: "Dec", mm: 269 }];
export const TEMPERATURE = [{ m: "Jan", c: 27 }, { m: "Feb", c: 27 }, { m: "Mar", c: 28 }, { m: "Apr", c: 28 }, { m: "May", c: 28 }, { m: "Jun", c: 28 }, { m: "Jul", c: 28 }, { m: "Aug", c: 28 }, { m: "Sep", c: 27 }, { m: "Oct", c: 27 }, { m: "Nov", c: 27 }, { m: "Dec", c: 26 }];
export const POP_AIRLINES = [{ name: "Scoot", emoji: "✈️", from: 3175 }, { name: "Thai AirAsia", emoji: "🔴", from: 2941 }, { name: "Thai Lion Air", emoji: "🦁", from: 3414 }, { name: "Thai Airways", emoji: "🐘", from: 6327 }];

export interface CheapAirline {
    name: string;
    pct: number;
    from: number;
}
export const CHEAP_AL: CheapAirline[] = [
    { name: "Jetstar Asia", pct: 95, from: 2600 },
    { name: "Thai AirAsia", pct: 88, from: 2941 },
    { name: "Thai Lion Air", pct: 82, from: 3414 },
    { name: "Scoot", pct: 75, from: 3175 },
    { name: "Singapore Airlines", pct: 42, from: 6327 }
];

export interface ReviewScore {
    Entertainment: number;
    Comfort: number;
    Food: number;
    Crew: number;
    Boarding: number;
}
export interface ReviewInstance {
    u: string;
    dt: string;
    rt: string;
    s: number;
    t: string;
}
export interface AirlineReview {
    name: string;
    e: string;
    r: number;
    lbl: string;
    cnt: number;
    from: number;
    sc: ReviewScore;
    rev: ReviewInstance;
}

export const REVIEWS: AirlineReview[] = [
    { name: "Singapore Airlines", e: "🇸🇬", r: 8.2, lbl: "Very Good", cnt: 1471, from: 6327, sc: { Entertainment: 8.0, Comfort: 8.0, Food: 7.8, Crew: 8.6, Boarding: 8.3 }, rev: { u: "Anonymous", dt: "Feb 2026", rt: "BKK-SIN", s: 6.0, t: "Seat selection was not easy to change. Premium economy nothing special. Safe flight overall." } },
    { name: "Thai Airways", e: "🐘", r: 7.8, lbl: "Good", cnt: 391, from: 6327, sc: { Entertainment: 7.2, Comfort: 7.5, Food: 7.0, Crew: 7.8, Boarding: 7.6 }, rev: { u: "TravellerTH", dt: "Jan 2026", rt: "BKK-SIN", s: 7.5, t: "Comfortable flight, friendly crew. Food was decent. Would fly again." } },
    { name: "Thai AirAsia", e: "🔴", r: 7.5, lbl: "Good", cnt: 235, from: 2941, sc: { Entertainment: 6.5, Comfort: 7.0, Food: 6.8, Crew: 7.5, Boarding: 7.8 }, rev: { u: "BudgetFlyer", dt: "Mar 2026", rt: "DMK-SIN", s: 7.0, t: "Good budget option. On time. Boarding smooth and efficient." } },
    { name: "Thai Lion Air", e: "🦁", r: 7.1, lbl: "Good", cnt: 43, from: 3414, sc: { Entertainment: 6.0, Comfort: 6.8, Food: 6.2, Crew: 7.2, Boarding: 7.4 }, rev: { u: "LionFan", dt: "Feb 2026", rt: "DMK-SIN", s: 7.0, t: "Cheap and cheerful. Got what I paid for. Seat small but fine for 2.5 hours." } },
    { name: "Scoot", e: "✈️", r: 6.7, lbl: "Okay", cnt: 319, from: 3175, sc: { Entertainment: 5.8, Comfort: 6.2, Food: 5.5, Crew: 7.0, Boarding: 7.3 }, rev: { u: "ScootUser", dt: "Jan 2026", rt: "BKK-SIN", s: 6.5, t: "Basic experience. Seats ok for budget. Entertainment minimal but price is right." } },
];

export const FAQS = [
    { q: "What airport do you fly into for flights to Singapore?", a: "You'll fly into Singapore Changi Airport (SIN), 16.9 km from city centre. SIN handles ~57 flights/day from Bangkok across 7 airlines." },
    { q: "Can I find cheaper flights to Singapore with stopovers?", a: "Yes. Flights via Kuala Lumpur or Jakarta are often cheaper. Toggle 1-stop in the filters above." },
    { q: "What is the best airline to fly to Singapore?", a: "Based on GoTravel Asia reviews, Singapore Airlines (8.2/10) ranks highest. For budget, Thai AirAsia (7.5) and Thai Lion Air (7.1) offer best value." },
    { q: "How much is a return flight to Singapore?", a: "Average is ฿6,376. Cheapest found: ฿4,251. June offers lowest prices; December the highest." },
    { q: "Where does the fastest flight to Singapore depart from?", a: "Hat Yai (HDY) is fastest at ~1h 45m. From Bangkok it's ~2h 25m nonstop." },
    { q: "Can GoTravel Asia notify me if prices become cheaper?", a: "Yes! Use Price Alerts to track your route. We'll email you when prices drop to your target." },
    { q: "Does Singapore Changi have rental cars?", a: "Yes. Car hire available at Changi. Use GoTravel Asia Car Rental to compare prices." },
    { q: "Are there hotels close to Singapore Changi?", a: "Yes. Ambassador Transit Hotel is 0km from Changi. Many budget-to-luxury options within 5km." },
];

export const POP_DEST = ["Brunei", "Cambodia", "China", "Hong Kong", "India", "Indonesia", "Japan", "Macau", "Malaysia", "Philippines", "Singapore", "South Korea", "Taiwan", "Thailand", "United Arab Emirates", "Vietnam"];
export const POP_CITIES = ["Yangon", "Mandalay", "Bangkok", "Singapore", "Kuala Lumpur", "Tokyo", "Seoul"];
