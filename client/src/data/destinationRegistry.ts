// client/src/data/destinationRegistry.ts
import type {
  StaticDestinationRecord,
  Deal,
  FareTableEntry,
  AirlineSummary,
  ReviewDatum,
  FaqItem,
  PriceMonthDatum,
  HeatmapDatum,
  WeatherMonthDatum,
  RelatedRoute,
} from "@/types/destination";

type AirportSeed = {
  city: string;
  code: string;
  airport: string;
  country: string;
  flag: string;
};

type RouteMetricsSeed = {
  priceRatio: number;
  avgFlightHours: number;
  avgTempC: number;
  avgRainMm: number;
};

type DestinationSeed = AirportSeed &
  RouteMetricsSeed & {
    slug: string;
    aliases?: string[];
    isPopularDestination?: boolean;
    isPopularCity?: boolean;
    climate?: string;
    highlights?: string[];
  };

type OriginSeed = { city: string; code: string; country: string };

type RegistryMaps = {
  byCitySlug: Map<string, StaticDestinationRecord>;
  byCountrySlug: Map<string, StaticDestinationRecord[]>;
  byCode: Map<string, StaticDestinationRecord>;
};

const DEFAULT_ORIGIN: OriginSeed = { city: "Bangkok", code: "BKK", country: "Thailand" };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const BASE_PRICE_MONTH = [7800,7200,6800,6400,6100,5600,5900,6300,6700,7100,8200,9400] as const;

const DESTINATION_SEEDS: DestinationSeed[] = [
  { slug:"singapore", city:"Singapore", code:"SIN", airport:"Changi Airport", country:"Singapore", flag:"🇸🇬", priceRatio:1.0, avgFlightHours:2.4, avgTempC:27, avgRainMm:190, aliases:["sin"], isPopularDestination:true, isPopularCity:true },
  { slug:"brunei", city:"Brunei", code:"BWN", airport:"Brunei Intl Airport", country:"Brunei", flag:"🇧🇳", priceRatio:1.3, avgFlightHours:3.2, avgTempC:27, avgRainMm:230, aliases:["bandar-seri-begawan","bwn"], isPopularDestination:true },
  { slug:"phnom-penh", city:"Phnom Penh", code:"PNH", airport:"Phnom Penh Intl Airport", country:"Cambodia", flag:"🇰🇭", priceRatio:0.85, avgFlightHours:1.2, avgTempC:28, avgRainMm:150, aliases:["cambodia","pnh"], isPopularDestination:true },
  { slug:"beijing", city:"Beijing", code:"PEK", airport:"Beijing Capital Intl", country:"China", flag:"🇨🇳", priceRatio:1.8, avgFlightHours:5.0, avgTempC:13, avgRainMm:60, aliases:["china","pek"], isPopularDestination:true },
  { slug:"hong-kong", city:"Hong Kong", code:"HKG", airport:"Hong Kong Intl Airport", country:"Hong Kong", flag:"🇭🇰", priceRatio:1.5, avgFlightHours:2.8, avgTempC:23, avgRainMm:180, aliases:["hkg"], isPopularDestination:true },
  { slug:"mumbai", city:"Mumbai", code:"BOM", airport:"Chhatrapati Shivaji Intl", country:"India", flag:"🇮🇳", priceRatio:1.6, avgFlightHours:4.5, avgTempC:28, avgRainMm:200, aliases:["india","bom"], isPopularDestination:true },
  { slug:"jakarta", city:"Jakarta", code:"CGK", airport:"Soekarno-Hatta Intl", country:"Indonesia", flag:"🇮🇩", priceRatio:1.1, avgFlightHours:3.5, avgTempC:27, avgRainMm:175, aliases:["indonesia","cgk"], isPopularDestination:true },
  { slug:"tokyo", city:"Tokyo", code:"NRT", airport:"Narita Intl Airport", country:"Japan", flag:"🇯🇵", priceRatio:2.2, avgFlightHours:6.0, avgTempC:16, avgRainMm:130, aliases:["japan","narita","nrt"], isPopularDestination:true, isPopularCity:true },
  { slug:"macau", city:"Macau", code:"MFM", airport:"Macau Intl Airport", country:"Macau", flag:"🇲🇴", priceRatio:1.4, avgFlightHours:2.5, avgTempC:23, avgRainMm:170, aliases:["mfm"], isPopularDestination:true },
  { slug:"kuala-lumpur", city:"Kuala Lumpur", code:"KUL", airport:"KLIA", country:"Malaysia", flag:"🇲🇾", priceRatio:0.7, avgFlightHours:2.2, avgTempC:28, avgRainMm:210, aliases:["malaysia","kul"], isPopularDestination:true, isPopularCity:true },
  { slug:"manila", city:"Manila", code:"MNL", airport:"Ninoy Aquino Intl", country:"Philippines", flag:"🇵🇭", priceRatio:1.2, avgFlightHours:3.3, avgTempC:28, avgRainMm:190, aliases:["philippines","mnl"], isPopularDestination:true },
  { slug:"seoul", city:"Seoul", code:"ICN", airport:"Incheon Intl Airport", country:"South Korea", flag:"🇰🇷", priceRatio:2.0, avgFlightHours:5.5, avgTempC:12, avgRainMm:110, aliases:["south-korea","icn"], isPopularDestination:true, isPopularCity:true },
  { slug:"taipei", city:"Taipei", code:"TPE", airport:"Taoyuan Intl Airport", country:"Taiwan", flag:"🇹🇼", priceRatio:1.7, avgFlightHours:3.8, avgTempC:23, avgRainMm:160, aliases:["taiwan","tpe"], isPopularDestination:true },
  { slug:"bangkok", city:"Bangkok", code:"BKK", airport:"Suvarnabhumi Airport", country:"Thailand", flag:"🇹🇭", priceRatio:0.3, avgFlightHours:1.0, avgTempC:29, avgRainMm:150, aliases:["thailand","bkk"], isPopularDestination:true, isPopularCity:true },
  { slug:"dubai", city:"Dubai", code:"DXB", airport:"Dubai Intl Airport", country:"United Arab Emirates", flag:"🇦🇪", priceRatio:2.5, avgFlightHours:6.5, avgTempC:28, avgRainMm:10, aliases:["united-arab-emirates","uae","dxb"], isPopularDestination:true },
  { slug:"hanoi", city:"Hanoi", code:"HAN", airport:"Noi Bai Intl Airport", country:"Vietnam", flag:"🇻🇳", priceRatio:0.9, avgFlightHours:1.8, avgTempC:24, avgRainMm:150, aliases:["vietnam","han"], isPopularDestination:true },
  { slug:"yangon", city:"Yangon", code:"RGN", airport:"Yangon Intl Airport", country:"Myanmar", flag:"🇲🇲", priceRatio:0.8, avgFlightHours:1.3, avgTempC:28, avgRainMm:240, aliases:["rgn"], isPopularCity:true },
  { slug:"mandalay", city:"Mandalay", code:"MDL", airport:"Mandalay Intl Airport", country:"Myanmar", flag:"🇲🇲", priceRatio:0.85, avgFlightHours:1.5, avgTempC:27, avgRainMm:130, aliases:["mdl"], isPopularCity:true },

  // ── NEW EXPANSION (Phase 6) ─────────────────────────────────────────
  { 
    slug: "chiang-mai", city: "Chiang Mai", code: "CNX", airport: "Chiang Mai Intl", country: "Thailand", flag: "🇹🇭", 
    priceRatio: 0.82, avgFlightHours: 1.5, avgTempC: 26, avgRainMm: 120, isPopularCity: true,
    climate: "Tropical savanna with a cool, dry season (Nov–Feb).",
    highlights: ["Doi Suthep Temple", "Sunday Walking Street", "Elephant Nature Park"]
  },
  { 
    slug: "phuket", city: "Phuket", code: "HKT", airport: "Phuket Intl Airport", country: "Thailand", flag: "🇹🇭", 
    priceRatio: 0.95, avgFlightHours: 2.0, avgTempC: 28, avgRainMm: 180, isPopularCity: true,
    climate: "Tropical with a distinct dry season (Nov–Apr).",
    highlights: ["Patong Beach", "Phi Phi Islands day trip", "Big Buddha"]
  },
  { 
    slug: "bali", city: "Bali", code: "DPS", airport: "Ngurah Rai Intl", country: "Indonesia", flag: "🇮🇩", 
    priceRatio: 0.98, avgFlightHours: 4.5, avgTempC: 27, avgRainMm: 170, isPopularCity: true,
    climate: "Tropical; dry season (Apr–Oct) is peak tourist season.",
    highlights: ["Tanah Lot Temple", "Ubud Rice Terraces", "Seminyak Beach"]
  },
  { 
    slug: "da-nang", city: "Da Nang", code: "DAD", airport: "Da Nang Intl Airport", country: "Vietnam", flag: "🇻🇳", 
    priceRatio: 0.78, avgFlightHours: 2.5, avgTempC: 25, avgRainMm: 140, isPopularCity: true,
    climate: "Hot and dry Feb–Aug; ideal for beach holidays.",
    highlights: ["My Khe Beach", "Marble Mountains", "Hoi An Ancient Town"]
  },
  { 
    slug: "ho-chi-minh-city", city: "Ho Chi Minh City", code: "SGN", airport: "Tan Son Nhat Intl", country: "Vietnam", flag: "🇻🇳", 
    priceRatio: 0.80, avgFlightHours: 2.0, avgTempC: 28, avgRainMm: 160, isPopularCity: true,
    climate: "Tropical wet-and-dry; warm year-round.",
    highlights: ["War Remnants Museum", "Ben Thanh Market", "Cu Chi Tunnels"]
  },
  { 
    slug: "siem-reap", city: "Siem Reap", code: "SAI", airport: "Siem Reap–Angkor Intl", country: "Cambodia", flag: "🇰🇭", 
    priceRatio: 0.85, avgFlightHours: 2.0, avgTempC: 27, avgRainMm: 150, isPopularCity: true,
    climate: "Tropical monsoon; cool dry season (Nov–Feb) is best.",
    highlights: ["Angkor Wat", "Bayon Temple", "Tonlé Sap Lake"]
  },
  { 
    slug: "osaka", city: "Osaka", code: "OSA", airport: "Kansai Intl Airport", country: "Japan", flag: "🇯🇵", 
    priceRatio: 1.15, avgFlightHours: 6.5, avgTempC: 16, avgRainMm: 110, isPopularCity: true,
    climate: "Humid subtropical; mild winters and hot summers.",
    highlights: ["Dotonbori", "Osaka Castle", "Universal Studios Japan"]
  },
  { 
    slug: "krabi", city: "Krabi", code: "KBV", airport: "Krabi Intl Airport", country: "Thailand", flag: "🇹🇭", 
    priceRatio: 0.90, avgFlightHours: 2.2, avgTempC: 28, avgRainMm: 170,
    climate: "Dry high season (Nov–Apr) with calm seas.",
    highlights: ["Railay Beach", "Tiger Cave Temple", "Four Islands tour"]
  },
  { 
    slug: "penang", city: "Penang", code: "PEN", airport: "Penang Intl Airport", country: "Malaysia", flag: "🇲🇾", 
    priceRatio: 0.75, avgFlightHours: 1.8, avgTempC: 27, avgRainMm: 190,
    climate: "Equatorial; warm and humid year-round.",
    highlights: ["Georgetown Street Art", "Penang Hill", "Gurney Drive Food"]
  },
  { 
    slug: "luang-prabang", city: "Luang Prabang", code: "LPQ", airport: "Luang Prabang Intl", country: "Laos", flag: "🇱🇦", 
    priceRatio: 0.88, avgFlightHours: 1.5, avgTempC: 25, avgRainMm: 140,
    climate: "Tropical highland; pleasant and dry Oct–Feb.",
    highlights: ["Kuang Si Waterfalls", "Alms-giving ceremony", "Royal Palace"]
  },
];

// ── Utilities ──────────────────────────────────────────────────────
function toSlug(value: string): string {
  return value.trim().toLowerCase().replace(/&/g,"and").replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");
}
function roundPrice(value: number): number { return Math.max(0, Math.round(value)); }
function clamp(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, value)); }
function formatDuration(hoursFloat: number): string {
  const totalMinutes = Math.max(30, Math.round(hoursFloat * 60));
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

/** Flexible ISO timestamp for any year/month/day */
function isoAtMonth(year: number, month: number, day: number, hour: number, minute: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${year}-${mm}-${dd}T${hh}:${min}:00+07:00`;
}

/** Legacy helper used by genFareTable — April 2026 fixed dates */
function isoAt(day: number, hour: number, minute: number): string {
  return isoAtMonth(2026, 4, day, hour, minute);
}

function deriveStopCount(seed: DestinationSeed): number {
  if (seed.avgFlightHours <= 1.8) return 0;
  if (seed.avgFlightHours <= 4.5) return 1;
  return 1;
}

function buildHeroNote(seed: DestinationSeed): string {
  return `Live fares and ${seed.flag} ${seed.city} booking options. Compare routes, timing, and value before you book.`;
}

function airlineMixFor(seed: DestinationSeed): Array<{ airline: string; airlineCode: string; multiplier: number; tag?: string }> {
  if (seed.code === "SIN") {
    return [
      { airline: "Thai AirAsia",  airlineCode: "FD", multiplier: 1.0,  tag: "Budget" },
      { airline: "Scoot",         airlineCode: "TR", multiplier: 1.04, tag: "Popular" },
      { airline: "Thai Lion Air", airlineCode: "SL", multiplier: 1.08 },
      { airline: "Thai Airways",  airlineCode: "TG", multiplier: 1.22, tag: "Full-service" },
    ];
  }
  return [
    { airline: "Thai AirAsia",  airlineCode: "FD", multiplier: 1.0,  tag: "Budget" },
    { airline: "Scoot",         airlineCode: "TR", multiplier: 1.05, tag: "Budget" },
    { airline: "Thai Lion Air", airlineCode: "SL", multiplier: 1.08 },
    { airline: "Thai Airways",  airlineCode: "TG", multiplier: 1.25, tag: "Full-service" },
  ];
}

// ── Generators ─────────────────────────────────────────────────────
function genPriceMonths(seed: DestinationSeed): PriceMonthDatum[] {
  return MONTHS.map((month, index) => ({
    month,
    value: roundPrice(BASE_PRICE_MONTH[index] * seed.priceRatio),
  }));
}

function genWeather(seed: DestinationSeed): WeatherMonthDatum[] {
  const tempVar = [0,-0.5,0,0.5,1,1,0.5,0.5,0,-0.5,-0.5,-1];
  const rainVar = [0.9,0.7,0.8,0.85,0.95,1.0,0.85,0.9,1.0,1.1,1.2,1.3];
  return MONTHS.map((month, index) => ({
    month,
    avgTempC: roundPrice(seed.avgTempC + tempVar[index]),
    rainfallMm: roundPrice(seed.avgRainMm * rainVar[index]),
  }));
}

function genHeatmap(seed: DestinationSeed): HeatmapDatum[] {
  const weekdayBase = roundPrice(6100 * seed.priceRatio);
  const weekendBase = roundPrice(8500 * seed.priceRatio);
  return [
    { month: "Weekday", values: [
      { day: "Mon", price: weekdayBase,                        level: "low" as const  },
      { day: "Tue", price: roundPrice(weekdayBase * 0.97),    level: "low" as const  },
      { day: "Wed", price: roundPrice(weekdayBase * 0.99),    level: "low" as const  },
      { day: "Thu", price: roundPrice(weekdayBase * 0.92),    level: "low" as const  },
      { day: "Fri", price: roundPrice(weekdayBase * 1.18),    level: "mid" as const  },
    ]},
    { month: "Weekend", values: [
      { day: "Sat AM", price: weekendBase,                     level: "high" as const },
      { day: "Sat PM", price: roundPrice(weekendBase * 1.20), level: "high" as const },
      { day: "Sun AM", price: roundPrice(weekendBase * 0.93), level: "mid" as const  },
      { day: "Sun PM", price: roundPrice(weekendBase * 1.02), level: "high" as const },
      { day: "Sun Eve",price: roundPrice(weekendBase * 0.96), level: "mid" as const  },
    ]},
  ];
}

/**
 * Generate month-segmented deals for the next 6 months (Apr–Sep 2026).
 * Keys are ISO month strings like "2026-04".
 */
function genDeals(seed: DestinationSeed, origin: OriginSeed): Record<string, Deal[]> {
  const base  = roundPrice(4251 * seed.priceRatio);
  const stops = deriveStopCount(seed);
  const mix   = airlineMixFor(seed);

  // April 2026 = month index 3 (0-based)
  const FIRST_MONTH_INDEX = 3;
  const MONTHS_TO_GENERATE = 6;

  const result: Record<string, Deal[]> = {};

  for (let i = 0; i < MONTHS_TO_GENERATE; i++) {
    const calendarIndex = FIRST_MONTH_INDEX + i;           // 3,4,5,6,7,8
    const monthNum      = (calendarIndex % 12) + 1;        // 4,5,6,7,8,9
    const year          = 2026 + Math.floor(calendarIndex / 12);
    const monthKey      = `${year}-${String(monthNum).padStart(2, "0")}`;

    // Seasonal price multiplier relative to base
    const monthMult = BASE_PRICE_MONTH[calendarIndex % 12] / BASE_PRICE_MONTH[0];
    const monthBase = roundPrice(base * monthMult);

    const makeDeal = (
      airline: string,
      airlineCode: string,
      departDay: number,
      departHour: number,
      price: number,
      tag?: string,
      stopCount = stops,
      flightHours = seed.avgFlightHours,
    ): Deal => ({
      from: origin.code,
      to: seed.code,
      d1: isoAtMonth(year, monthNum, departDay, departHour, 30),
      a1: null,
      airline,
      airlineCode,
      logoUrl: `https://pics.avs.io/120/120/${airlineCode}.png`,
      stops: stopCount,
      duration: formatDuration(flightHours + stopCount * 0.9),
      price,
      tag,
    });

    result[monthKey] = [
      makeDeal(mix[0].airline, mix[0].airlineCode,  8, 7,  monthBase,                           "Budget"),
      makeDeal(mix[1].airline, mix[1].airlineCode, 12, 9,  roundPrice(monthBase * mix[1].multiplier), mix[1].tag),
      makeDeal(mix[2].airline, mix[2].airlineCode, 14, 7,  roundPrice(monthBase * mix[2].multiplier), mix[2].tag),
      makeDeal(mix[3].airline, mix[3].airlineCode, 13, 11, roundPrice(monthBase * mix[3].multiplier), mix[3].tag),
      makeDeal(mix[0].airline, mix[0].airlineCode, 19, 18, roundPrice(monthBase * 1.24),         "Weekend"),
      makeDeal(mix[1].airline, mix[1].airlineCode, 25, 19, roundPrice(monthBase * 1.18),         "Weekend"),
    ];
  }

  return result;
}

function genFareTable(seed: DestinationSeed, origin: OriginSeed): FareTableEntry[] {
  const base    = roundPrice(4949 * seed.priceRatio);
  const stops   = deriveStopCount(seed);
  const outDur  = formatDuration(seed.avgFlightHours + stops * 0.8);
  const backDur = formatDuration(seed.avgFlightHours + stops * 0.9);
  return [
    { from1:origin.code, to1:seed.code, d1:isoAt(20,22,15), a1:null, s1:stops, dur1:outDur, from2:seed.code, to2:origin.code, d2:isoAt(27,11,20), a2:null, s2:stops, dur2:backDur, airline:"Multiple Airlines", price:base },
    { from1:origin.code==="BKK"?"DMK":origin.code, to1:seed.code, d1:isoAt(23,10,40), a1:null, s1:seed.avgFlightHours<=2.0?0:stops, dur1:formatDuration(seed.avgFlightHours+(seed.avgFlightHours<=2.0?0:0.6)), from2:seed.code, to2:origin.code==="BKK"?"DMK":origin.code, d2:isoAt(26,14,40), a2:null, s2:seed.avgFlightHours<=2.0?0:stops, dur2:formatDuration(seed.avgFlightHours+(seed.avgFlightHours<=2.0?0:0.7)), airline:"Thai AirAsia", airlineCode:"FD", logoUrl:"https://pics.avs.io/120/120/FD.png", price:roundPrice(base*1.1) },
    { from1:origin.code, to1:seed.code, d1:isoAt(17,15,25), a1:null, s1:stops, dur1:formatDuration(seed.avgFlightHours+1.0), airline:"Scoot", airlineCode:"TR", logoUrl:"https://pics.avs.io/120/120/TR.png", price:roundPrice(base*1.04) },
  ];
}

function genAirlines(seed: DestinationSeed): AirlineSummary[] {
  const stops = deriveStopCount(seed);
  const ratio = clamp(seed.priceRatio, 0.5, 2.5);
  const base = roundPrice(4680 * seed.priceRatio);

  return [
    {
      code: "FD",
      name: "Thai AirAsia",
      logoUrl: `https://pics.avs.io/120/120/FD.png`,
      dealCount: Math.max(2, Math.round(10 / ratio)),
      commonStops: stops,
      avgPrice: roundPrice(base * 1.0),
      tags: ["Budget", "Popular"],
      confidenceLabel: "Frequently available",
    },
    {
      code: "TR",
      name: "Scoot",
      logoUrl: `https://pics.avs.io/120/120/TR.png`,
      dealCount: Math.max(2, Math.round(8 / ratio)),
      commonStops: Math.max(1, stops),
      avgPrice: roundPrice(base * 1.06),
      tags: ["Budget"],
    },
    {
      code: "SL",
      name: "Thai Lion Air",
      logoUrl: `https://pics.avs.io/120/120/SL.png`,
      dealCount: Math.max(1, Math.round(6 / ratio)),
      commonStops: stops,
      avgPrice: roundPrice(base * 1.1),
      tags: ["Budget"],
    },
    {
      code: "TG",
      name: "Thai Airways",
      logoUrl: `https://pics.avs.io/120/120/TG.png`,
      dealCount: Math.max(1, Math.round(3 / ratio)),
      commonStops: seed.avgFlightHours <= 2.0 ? 0 : 1,
      avgPrice: roundPrice(base * 1.28),
      tags: ["Premium", "Full-service"],
      confidenceLabel: "Full-service carrier",
    },
  ];
}

function genReviews(seed: DestinationSeed): ReviewDatum[] {
  return [
    {
      airline: "Singapore Airlines", airlineCode: "SQ", logoUrl: "https://pics.avs.io/120/120/SQ.png", score: 8.2,
      highlights: [`Excellent in-flight service on routes to ${seed.city}`, "Premium cabin options", "Consistently high ratings"],
      subScores: [
        { label: "Comfort",       score: 8.8 },
        { label: "Food",          score: 8.5 },
        { label: "Service",       score: 8.9 },
        { label: "Boarding",      score: 8.0 },
        { label: "Entertainment", score: 8.4 },
      ],
    },
    {
      airline: "Thai Airways", airlineCode: "TG", logoUrl: "https://pics.avs.io/120/120/TG.png", score: 7.8,
      highlights: [`Comfortable flights to ${seed.city}`, "Good connectivity via Bangkok", "Decent in-flight meals"],
      subScores: [
        { label: "Comfort",       score: 7.9 },
        { label: "Food",          score: 7.7 },
        { label: "Service",       score: 7.8 },
        { label: "Boarding",      score: 7.5 },
        { label: "Entertainment", score: 7.2 },
      ],
    },
    {
      airline: "Thai AirAsia", airlineCode: "FD", logoUrl: "https://pics.avs.io/120/120/FD.png", score: 7.5,
      highlights: ["Competitive pricing", `Popular budget option to ${seed.city}`, "Efficient boarding"],
      subScores: [
        { label: "Comfort",       score: 7.0 },
        { label: "Food",          score: 6.5 },
        { label: "Service",       score: 7.6 },
        { label: "Boarding",      score: 8.2 },
        { label: "Entertainment", score: 6.0 },
      ],
    },
    {
      airline: "Scoot", airlineCode: "TR", logoUrl: "https://pics.avs.io/120/120/TR.png", score: 6.7,
      highlights: ["Affordable fares", `Basic but reliable for ${seed.city}`, "Good for budget travelers"],
      subScores: [
        { label: "Comfort",       score: 6.5 },
        { label: "Food",          score: 5.8 },
        { label: "Service",       score: 6.9 },
        { label: "Boarding",      score: 7.0 },
        { label: "Entertainment", score: 5.5 },
      ],
    },
  ];
}

function genFaqs(seed: DestinationSeed): FaqItem[] {
  return [
    { q:`What airport do you fly into for flights to ${seed.city}?`,          a:`You'll usually fly into ${seed.airport} (${seed.code}). Check terminal and baggage info before your flight.` },
    { q:`Can I find cheaper flights to ${seed.city} with stopovers?`,         a:`Yes. One-stop options are often cheaper than the fastest itineraries. Use the fare table above to compare value and timing.` },
    { q:`When is the best time to fly to ${seed.city}?`,                      a:`Midweek departures usually offer better value than weekend departures. Seasonal demand still affects final fares.` },
    { q:`How far in advance should I book flights to ${seed.city}?`,          a:`Booking 4 to 8 weeks ahead often gives you a good balance of price and availability on this route.` },
    { q:`What airlines fly to ${seed.city}?`,                                 a:`Thai AirAsia, Scoot, Thai Lion Air, and Thai Airways are common carriers in this fallback dataset. Actual availability can vary.` },
    { q:`Does GoTravel Asia track price drops for ${seed.city}?`,             a:`Yes. Price alerts can be used to monitor route changes and notify users when fares drop.` },
  ];
}

function genAdvanceBooking(seed: DestinationSeed): StaticDestinationRecord["advanceBooking"] {
  const base = roundPrice(5200 * seed.priceRatio);

  return [
    { days: 7, avgPrice: roundPrice(base * 1.22) },
    { days: 14, avgPrice: roundPrice(base * 1.12) },
    { days: 21, avgPrice: roundPrice(base * 1.04) },
    { days: 30, avgPrice: roundPrice(base * 0.97) },
    { days: 45, avgPrice: roundPrice(base * 0.93) },
    { days: 60, avgPrice: roundPrice(base * 0.95) },
    { days: 90, avgPrice: roundPrice(base * 1.01) },
  ];
}

function genTimeOfDay(seed: DestinationSeed): StaticDestinationRecord["timeOfDay"] {
  const base = roundPrice(5050 * seed.priceRatio);

  return [
    { slot: "Morning", avgPrice: roundPrice(base * 0.96) },
    { slot: "Afternoon", avgPrice: roundPrice(base * 1.02) },
    { slot: "Evening", avgPrice: roundPrice(base * 1.08) },
    { slot: "Night", avgPrice: roundPrice(base * 0.99) },
  ];
}

function genNearbyRoutes(currentSeed: DestinationSeed): RelatedRoute[] {
  return DESTINATION_SEEDS
    .filter((s) => s.slug !== currentSeed.slug && s.country !== currentSeed.country)
    .sort((a, b) => (Number(b.isPopularDestination) + Number(b.isPopularCity)) - (Number(a.isPopularDestination) + Number(a.isPopularCity)))
    .slice(0, 3)
    .map((s) => ({ city:s.city, code:s.code, href:`/flights/to/${s.slug}`, tag:"Popular" }));
}

// ── Record builder ──────────────────────────────────────────────────
function buildRecord(seed: DestinationSeed, origin: OriginSeed = DEFAULT_ORIGIN): StaticDestinationRecord {
  return {
    slug: seed.slug,
    origin: { city:origin.city, code:origin.code, country:origin.country },
    dest:   { city:seed.city,   code:seed.code,   country:seed.country   },
    heroNote:    buildHeroNote(seed),
    deals:       genDeals(seed, origin),
    fareTable:   genFareTable(seed, origin),
    airlines:    genAirlines(seed),
    priceMonths: genPriceMonths(seed),
    heatmap:     genHeatmap(seed),
    advanceBooking: genAdvanceBooking(seed),
    timeOfDay:   genTimeOfDay(seed),
    reviews:     genReviews(seed),
    weather:     genWeather(seed),
    faqs:        genFaqs(seed),
    nearbyRoutes:genNearbyRoutes(seed),
    climate:     seed.climate,
    highlights:  seed.highlights,
  };
}

// ── Registry builder ────────────────────────────────────────────────
function addAlias(map: Map<string, StaticDestinationRecord>, key: string, record: StaticDestinationRecord): void {
  const alias = toSlug(key);
  if (!alias || map.has(alias)) return;
  map.set(alias, record);
}

function buildRegistry(seeds: DestinationSeed[], origin: OriginSeed = DEFAULT_ORIGIN): RegistryMaps {
  const byCitySlug    = new Map<string, StaticDestinationRecord>();
  const byCountrySlug = new Map<string, StaticDestinationRecord[]>();
  const byCode        = new Map<string, StaticDestinationRecord>();

  for (const seed of seeds) {
    const record = buildRecord(seed, origin);
    byCitySlug.set(seed.slug, record);
    byCode.set(seed.code.toUpperCase(), record);
    addAlias(byCitySlug, seed.city, record);
    addAlias(byCitySlug, seed.code, record);
    for (const alias of seed.aliases ?? []) addAlias(byCitySlug, alias, record);

    const countrySlug = toSlug(seed.country);
    const existing = byCountrySlug.get(countrySlug) ?? [];
    existing.push(record);
    byCountrySlug.set(countrySlug, existing);
  }
  return { byCitySlug, byCountrySlug, byCode };
}

const REGISTRY = buildRegistry(DESTINATION_SEEDS);

// ── Public API ──────────────────────────────────────────────────────
const AIRPORT_CITY_MAP: Record<string, string> = {
  BKK: "Bangkok",
  DMK: "Bangkok",
  CNX: "Chiang Mai",
  HKT: "Phuket",
  SIN: "Singapore",
  KUL: "Kuala Lumpur",
  ICN: "Seoul",
  NRT: "Tokyo",
  HND: "Tokyo",
  HKG: "Hong Kong",
  RGN: "Yangon",
  MDL: "Mandalay",
  DPS: "Bali",
  SGN: "Ho Chi Minh City",
  HAN: "Hanoi",
  MNL: "Manila",
  KIX: "Osaka",
  TPE: "Taipei",
  SYD: "Sydney",
  MEL: "Melbourne",
  LHR: "London",
  CDG: "Paris",
  DXB: "Dubai",
  DAD: "Da Nang",
  USM: "Koh Samui",
  KBV: "Krabi",
};

export function generateDynamicDestination(
  originCode: string,
  destCode: string
): StaticDestinationRecord {
  const code = destCode.toUpperCase();
  const city = AIRPORT_CITY_MAP[code] || code;

  const seed: DestinationSeed = {
    slug: `${originCode.toLowerCase()}-${destCode.toLowerCase()}`,
    city,
    code,
    airport: `${city} Airport`,
    country: "Destination",
    flag: "✈️",
    priceRatio: 1.2,
    avgFlightHours: 3.5,
    avgTempC: 25,
    avgRainMm: 120,
  };

  const originSeed: OriginSeed = {
    city: AIRPORT_CITY_MAP[originCode.toUpperCase()] || originCode.toUpperCase(),
    code: originCode.toUpperCase(),
    country: "Origin",
  };

  return buildRecord(seed, originSeed);
}

export function getDestinationBySlug(slug: string): StaticDestinationRecord | undefined { return REGISTRY.byCitySlug.get(toSlug(slug)); }
export function getDestinationByCode(code: string): StaticDestinationRecord | undefined { return REGISTRY.byCode.get(code.trim().toUpperCase()); }
export function getDestinationsByCountrySlug(countrySlug: string): StaticDestinationRecord[] { return REGISTRY.byCountrySlug.get(toSlug(countrySlug)) ?? []; }
export function getAllSlugs(): string[] { return DESTINATION_SEEDS.map((s) => s.slug); }
export function getAllDestinationRecords(): StaticDestinationRecord[] { return DESTINATION_SEEDS.map((s) => REGISTRY.byCitySlug.get(s.slug)!); }

export const POP_DEST   = DESTINATION_SEEDS.filter((s) => s.isPopularDestination).map((s) => s.country).filter((c, i, a) => a.indexOf(c) === i);
export const POP_CITIES = DESTINATION_SEEDS.filter((s) => s.isPopularCity).map((s) => s.city);
