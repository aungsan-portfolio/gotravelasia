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
} from "../types/destination";

import { DESTINATION_SEEDS, type DestinationSeed } from "../../../shared/destination/registry";

type OriginSeed = { city: string; code: string; country: string };

type RegistryMaps = {
  byCitySlug: Map<string, StaticDestinationRecord>;
  byExactSlug: Map<string, StaticDestinationRecord>;
  byAliasSlug: Map<string, StaticDestinationRecord[]>;
  byCountrySlug: Map<string, StaticDestinationRecord[]>;
  byCode: Map<string, StaticDestinationRecord>;
};

const DEFAULT_ORIGIN: OriginSeed = { city: "Chiang Mai", code: "CNX", country: "Thailand" };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;
const BASE_PRICE_MONTH = [7800,7200,6800,6400,6100,5600,5900,6300,6700,7100,8200,9400] as const;

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

function isoAtMonth(year: number, month: number, day: number, hour: number, minute: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${year}-${mm}-${dd}T${hh}:${min}:00+07:00`;
}

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

function genDeals(seed: DestinationSeed, origin: OriginSeed): Record<string, Deal[]> {
  const base  = roundPrice(4251 * seed.priceRatio);
  const stops = deriveStopCount(seed);
  const mix   = airlineMixFor(seed);

  const FIRST_MONTH_INDEX = 3;
  const MONTHS_TO_GENERATE = 6;

  const result: Record<string, Deal[]> = {};

  for (let i = 0; i < MONTHS_TO_GENERATE; i++) {
    const calendarIndex = FIRST_MONTH_INDEX + i;
    const monthNum      = (calendarIndex % 12) + 1;
    const year          = 2026 + Math.floor(calendarIndex / 12);
    const monthKey      = `${year}-${String(monthNum).padStart(2, "0")}`;

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
  if (currentSeed.type === "country") {
    return DESTINATION_SEEDS
      .filter((s) => s.country === currentSeed.country && s.slug !== currentSeed.slug)
      .sort((a, b) => (Number(b.isPopularDestination) + Number(b.isPopularCity)) - (Number(a.isPopularDestination) + Number(a.isPopularCity)))
      .slice(0, 3)
      .map((s) => ({ city: s.city, code: s.code, href: `/flights/to/${s.slug}`, tag: "Popular City" }));
  }

  return DESTINATION_SEEDS
    .filter((s) => s.slug !== currentSeed.slug && s.country !== currentSeed.country)
    .sort((a, b) => (Number(b.isPopularDestination) + Number(b.isPopularCity)) - (Number(a.isPopularDestination) + Number(a.isPopularCity)))
    .slice(0, 3)
    .map((s) => ({ city: s.city, code: s.code, href: `/flights/to/${s.slug}`, tag: "Popular" }));
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
    priceRatio:  seed.priceRatio,
    type:        seed.type,
  };
}

// ── Registry builder ────────────────────────────────────────────────
function pushAlias(map: Map<string, StaticDestinationRecord[]>, key: string, record: StaticDestinationRecord): void {
  const alias = toSlug(key);
  if (!alias) return;

  const existing = map.get(alias) ?? [];
  if (existing.some((item) => item.slug === record.slug)) return;
  existing.push(record);
  map.set(alias, existing);
}

function buildRegistry(seeds: DestinationSeed[], origin: OriginSeed = DEFAULT_ORIGIN): RegistryMaps {
  const byCitySlug = new Map<string, StaticDestinationRecord>();
  const byExactSlug = new Map<string, StaticDestinationRecord>();
  const byAliasSlug = new Map<string, StaticDestinationRecord[]>();
  const byCountrySlug = new Map<string, StaticDestinationRecord[]>();
  const byCode = new Map<string, StaticDestinationRecord>();

  for (const seed of seeds) {
    const record = buildRecord(seed, origin);
    const exactSlug = toSlug(seed.slug);

    byExactSlug.set(exactSlug, record);
    byCitySlug.set(exactSlug, record);
    byCode.set(seed.code.toUpperCase(), record);

    pushAlias(byAliasSlug, seed.city, record);
    pushAlias(byAliasSlug, seed.code, record);
    for (const alias of seed.aliases ?? []) pushAlias(byAliasSlug, alias, record);

    const countrySlug = toSlug(seed.country);
    const existing = byCountrySlug.get(countrySlug) ?? [];
    existing.push(record);
    byCountrySlug.set(countrySlug, existing);
  }

  for (const [alias, records] of byAliasSlug.entries()) {
    if (records.length === 1) {
      byCitySlug.set(alias, records[0]);
    }
  }

  return { byCitySlug, byExactSlug, byAliasSlug, byCountrySlug, byCode };
}

const REGISTRY = buildRegistry(DESTINATION_SEEDS);
const SAFE_PREFIX_MIN_LENGTH = 6;

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

function findSingleSafePrefixMatch(normalizedSlug: string): StaticDestinationRecord | undefined {
  if (normalizedSlug.length < SAFE_PREFIX_MIN_LENGTH) return undefined;

  const matches = new Map<string, StaticDestinationRecord>();

  for (const [slug, record] of REGISTRY.byExactSlug.entries()) {
    if (slug.startsWith(normalizedSlug)) {
      matches.set(record.slug, record);
    }
  }

  for (const [alias, records] of REGISTRY.byAliasSlug.entries()) {
    if (!alias.startsWith(normalizedSlug)) continue;
    for (const record of records) {
      matches.set(record.slug, record);
    }
  }

  if (matches.size !== 1) return undefined;
  return Array.from(matches.values())[0];
}

export function getDestinationBySlug(slug: string): StaticDestinationRecord | undefined {
  const normalized = toSlug(slug);
  if (!normalized) return undefined;

  const exact = REGISTRY.byExactSlug.get(normalized);
  if (exact) return exact;

  const aliasMatches = REGISTRY.byAliasSlug.get(normalized);
  if (aliasMatches?.length === 1) return aliasMatches[0];

  const countryMatches = REGISTRY.byCountrySlug.get(normalized) ?? [];
  if (countryMatches.length > 0) {
    const countryRecord = countryMatches.find((record) => record.type === "country");
    if (countryRecord) return countryRecord;
    if (countryMatches.length === 1) return countryMatches[0];
    return undefined;
  }

  return findSingleSafePrefixMatch(normalized);
}
export function getDestinationByCode(code: string): StaticDestinationRecord | undefined { return REGISTRY.byCode.get(code.trim().toUpperCase()); }
export function getDestinationsByCountrySlug(countrySlug: string): StaticDestinationRecord[] { return REGISTRY.byCountrySlug.get(toSlug(countrySlug)) ?? []; }
export function getAllSlugs(): string[] { return DESTINATION_SEEDS.map((s) => s.slug); }
export function getAllDestinationRecords(): StaticDestinationRecord[] { return DESTINATION_SEEDS.map((s) => REGISTRY.byCitySlug.get(s.slug)!); }

export const POP_DEST   = DESTINATION_SEEDS.filter((s) => s.isPopularDestination).map((s) => s.country).filter((c, i, a) => a.indexOf(c) === i);
export const POP_CITIES = DESTINATION_SEEDS.filter((s) => s.isPopularCity).map((s) => s.city);
