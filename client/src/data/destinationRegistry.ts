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

// ── Internal seed models ─────────────────────────────────────────

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
  };

type OriginSeed = {
  city: string;
  code: string;
  country: string;
};

type RegistryMaps = {
  byCitySlug: Map<string, StaticDestinationRecord>;
  byCountrySlug: Map<string, StaticDestinationRecord[]>;
  byCode: Map<string, StaticDestinationRecord>;
};

const DEFAULT_ORIGIN: OriginSeed = {
  city: "Bangkok",
  code: "BKK",
  country: "Thailand",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const BASE_PRICE_MONTH = [7800, 7200, 6800, 6400, 6100, 5600, 5900, 6300, 6700, 7100, 8200, 9400] as const;

const DESTINATION_SEEDS: DestinationSeed[] = [
  {
    slug: "singapore",
    city: "Singapore",
    code: "SIN",
    airport: "Changi Airport",
    country: "Singapore",
    flag: "🇸🇬",
    priceRatio: 1.0,
    avgFlightHours: 2.4,
    avgTempC: 27,
    avgRainMm: 190,
    aliases: ["sin"],
    isPopularDestination: true,
    isPopularCity: true,
  },
  {
    slug: "brunei",
    city: "Brunei",
    code: "BWN",
    airport: "Brunei Intl Airport",
    country: "Brunei",
    flag: "🇧🇳",
    priceRatio: 1.3,
    avgFlightHours: 3.2,
    avgTempC: 27,
    avgRainMm: 230,
    aliases: ["bandar-seri-begawan", "bwn"],
    isPopularDestination: true,
  },
  {
    slug: "phnom-penh",
    city: "Phnom Penh",
    code: "PNH",
    airport: "Phnom Penh Intl Airport",
    country: "Cambodia",
    flag: "🇰🇭",
    priceRatio: 0.85,
    avgFlightHours: 1.2,
    avgTempC: 28,
    avgRainMm: 150,
    aliases: ["cambodia", "pnh"],
    isPopularDestination: true,
  },
  {
    slug: "beijing",
    city: "Beijing",
    code: "PEK",
    airport: "Beijing Capital Intl",
    country: "China",
    flag: "🇨🇳",
    priceRatio: 1.8,
    avgFlightHours: 5.0,
    avgTempC: 13,
    avgRainMm: 60,
    aliases: ["china", "pek"],
    isPopularDestination: true,
  },
  {
    slug: "hong-kong",
    city: "Hong Kong",
    code: "HKG",
    airport: "Hong Kong Intl Airport",
    country: "Hong Kong",
    flag: "🇭🇰",
    priceRatio: 1.5,
    avgFlightHours: 2.8,
    avgTempC: 23,
    avgRainMm: 180,
    aliases: ["hkg"],
    isPopularDestination: true,
  },
  {
    slug: "mumbai",
    city: "Mumbai",
    code: "BOM",
    airport: "Chhatrapati Shivaji Intl",
    country: "India",
    flag: "🇮🇳",
    priceRatio: 1.6,
    avgFlightHours: 4.5,
    avgTempC: 28,
    avgRainMm: 200,
    aliases: ["india", "bom"],
    isPopularDestination: true,
  },
  {
    slug: "jakarta",
    city: "Jakarta",
    code: "CGK",
    airport: "Soekarno-Hatta Intl",
    country: "Indonesia",
    flag: "🇮🇩",
    priceRatio: 1.1,
    avgFlightHours: 3.5,
    avgTempC: 27,
    avgRainMm: 175,
    aliases: ["indonesia", "cgk"],
    isPopularDestination: true,
  },
  {
    slug: "tokyo",
    city: "Tokyo",
    code: "NRT",
    airport: "Narita Intl Airport",
    country: "Japan",
    flag: "🇯🇵",
    priceRatio: 2.2,
    avgFlightHours: 6.0,
    avgTempC: 16,
    avgRainMm: 130,
    aliases: ["japan", "narita", "nrt"],
    isPopularDestination: true,
    isPopularCity: true,
  },
  {
    slug: "macau",
    city: "Macau",
    code: "MFM",
    airport: "Macau Intl Airport",
    country: "Macau",
    flag: "🇲🇴",
    priceRatio: 1.4,
    avgFlightHours: 2.5,
    avgTempC: 23,
    avgRainMm: 170,
    aliases: ["mfm"],
    isPopularDestination: true,
  },
  {
    slug: "kuala-lumpur",
    city: "Kuala Lumpur",
    code: "KUL",
    airport: "KLIA",
    country: "Malaysia",
    flag: "🇲🇾",
    priceRatio: 0.7,
    avgFlightHours: 2.2,
    avgTempC: 28,
    avgRainMm: 210,
    aliases: ["malaysia", "kul"],
    isPopularDestination: true,
    isPopularCity: true,
  },
  {
    slug: "manila",
    city: "Manila",
    code: "MNL",
    airport: "Ninoy Aquino Intl",
    country: "Philippines",
    flag: "🇵🇭",
    priceRatio: 1.2,
    avgFlightHours: 3.3,
    avgTempC: 28,
    avgRainMm: 190,
    aliases: ["philippines", "mnl"],
    isPopularDestination: true,
  },
  {
    slug: "seoul",
    city: "Seoul",
    code: "ICN",
    airport: "Incheon Intl Airport",
    country: "South Korea",
    flag: "🇰🇷",
    priceRatio: 2.0,
    avgFlightHours: 5.5,
    avgTempC: 12,
    avgRainMm: 110,
    aliases: ["south-korea", "icn"],
    isPopularDestination: true,
    isPopularCity: true,
  },
  {
    slug: "taipei",
    city: "Taipei",
    code: "TPE",
    airport: "Taoyuan Intl Airport",
    country: "Taiwan",
    flag: "🇹🇼",
    priceRatio: 1.7,
    avgFlightHours: 3.8,
    avgTempC: 23,
    avgRainMm: 160,
    aliases: ["taiwan", "tpe"],
    isPopularDestination: true,
  },
  {
    slug: "bangkok",
    city: "Bangkok",
    code: "BKK",
    airport: "Suvarnabhumi Airport",
    country: "Thailand",
    flag: "🇹🇭",
    priceRatio: 0.3,
    avgFlightHours: 1.0,
    avgTempC: 29,
    avgRainMm: 150,
    aliases: ["thailand", "bkk"],
    isPopularDestination: true,
    isPopularCity: true,
  },
  {
    slug: "dubai",
    city: "Dubai",
    code: "DXB",
    airport: "Dubai Intl Airport",
    country: "United Arab Emirates",
    flag: "🇦🇪",
    priceRatio: 2.5,
    avgFlightHours: 6.5,
    avgTempC: 28,
    avgRainMm: 10,
    aliases: ["united-arab-emirates", "uae", "dxb"],
    isPopularDestination: true,
  },
  {
    slug: "hanoi",
    city: "Hanoi",
    code: "HAN",
    airport: "Noi Bai Intl Airport",
    country: "Vietnam",
    flag: "🇻🇳",
    priceRatio: 0.9,
    avgFlightHours: 1.8,
    avgTempC: 24,
    avgRainMm: 150,
    aliases: ["vietnam", "han"],
    isPopularDestination: true,
  },
  {
    slug: "yangon",
    city: "Yangon",
    code: "RGN",
    airport: "Yangon Intl Airport",
    country: "Myanmar",
    flag: "🇲🇲",
    priceRatio: 0.8,
    avgFlightHours: 1.3,
    avgTempC: 28,
    avgRainMm: 240,
    aliases: ["rgn"],
    isPopularCity: true,
  },
  {
    slug: "mandalay",
    city: "Mandalay",
    code: "MDL",
    airport: "Mandalay Intl Airport",
    country: "Myanmar",
    flag: "🇲🇲",
    priceRatio: 0.85,
    avgFlightHours: 1.5,
    avgTempC: 27,
    avgRainMm: 130,
    aliases: ["mdl"],
    isPopularCity: true,
  },
];

// ── Utilities ────────────────────────────────────────────────────

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function roundPrice(value: number): number {
  return Math.max(0, Math.round(value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(hoursFloat: number): string {
  const totalMinutes = Math.max(30, Math.round(hoursFloat * 60));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
}

function isoAt(day: number, hour: number, minute: number): string {
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `2026-04-${dd}T${hh}:${mm}:00+07:00`;
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
      { airline: "Thai AirAsia", airlineCode: "FD", multiplier: 1.0, tag: "Budget" },
      { airline: "Scoot", airlineCode: "TR", multiplier: 1.04, tag: "Popular" },
      { airline: "Thai Lion Air", airlineCode: "SL", multiplier: 1.08 },
      { airline: "Thai Airways", airlineCode: "TG", multiplier: 1.22, tag: "Full-service" },
    ];
  }

  return [
    { airline: "Thai AirAsia", airlineCode: "FD", multiplier: 1.0, tag: "Budget" },
    { airline: "Scoot", airlineCode: "TR", multiplier: 1.05, tag: "Budget" },
    { airline: "Thai Lion Air", airlineCode: "SL", multiplier: 1.08 },
    { airline: "Thai Airways", airlineCode: "TG", multiplier: 1.25, tag: "Full-service" },
  ];
}

// ── Generators ───────────────────────────────────────────────────

function genPriceMonths(seed: DestinationSeed): PriceMonthDatum[] {
  return MONTHS.map((month, index) => ({
    month,
    value: roundPrice(BASE_PRICE_MONTH[index] * seed.priceRatio),
  }));
}

function genWeather(seed: DestinationSeed): WeatherMonthDatum[] {
  const tempVar = [0, -0.5, 0, 0.5, 1, 1, 0.5, 0.5, 0, -0.5, -0.5, -1];
  const rainVar = [0.9, 0.7, 0.8, 0.85, 0.95, 1.0, 0.85, 0.9, 1.0, 1.1, 1.2, 1.3];

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
    {
      month: "Weekday",
      values: [
        { day: "Mon", price: weekdayBase, level: "low" as const },
        { day: "Tue", price: roundPrice(weekdayBase * 0.97), level: "low" as const },
        { day: "Wed", price: roundPrice(weekdayBase * 0.99), level: "low" as const },
        { day: "Thu", price: roundPrice(weekdayBase * 0.92), level: "low" as const },
        { day: "Fri", price: roundPrice(weekdayBase * 1.18), level: "mid" as const },
      ],
    },
    {
      month: "Weekend",
      values: [
        { day: "Sat AM", price: weekendBase, level: "high" as const },
        { day: "Sat PM", price: roundPrice(weekendBase * 1.2), level: "high" as const },
        { day: "Sun AM", price: roundPrice(weekendBase * 0.93), level: "mid" as const },
        { day: "Sun PM", price: roundPrice(weekendBase * 1.02), level: "high" as const },
        { day: "Sun Eve", price: roundPrice(weekendBase * 0.96), level: "mid" as const },
      ],
    },
  ];
}

function genDeals(seed: DestinationSeed, origin: OriginSeed): StaticDestinationRecord["deals"] {
  const base = roundPrice(4251 * seed.priceRatio);
  const stops = deriveStopCount(seed);
  const fastestStops = seed.avgFlightHours <= 2.0 ? 0 : stops;

  const makeDeal = (
    airline: string,
    airlineCode: string,
    departDay: number,
    departHour: number,
    price: number,
    tag?: string,
    stopCount = stops,
    flightHours = seed.avgFlightHours
  ): Deal => ({
    from: origin.code,
    to: seed.code,
    d1: isoAt(departDay, departHour, 30),
    a1: null,
    airline,
    airlineCode,
    logoUrl: `https://pics.avs.io/120/120/${airlineCode}.png`,
    stops: stopCount,
    duration: formatDuration(flightHours + stopCount * 0.9),
    price,
    tag,
  });

  const mix = airlineMixFor(seed);

  return {
    cheapest: [
      makeDeal(mix[0].airline, mix[0].airlineCode, 10, 8, base, "Budget"),
      makeDeal(mix[1].airline, mix[1].airlineCode, 12, 9, roundPrice(base * mix[1].multiplier), mix[1].tag),
      makeDeal(mix[2].airline, mix[2].airlineCode, 14, 7, roundPrice(base * mix[2].multiplier), mix[2].tag),
    ],
    fastest: [
      makeDeal(mix[0].airline, mix[0].airlineCode, 9, 6, roundPrice(base * 1.18), "Quick", fastestStops, seed.avgFlightHours),
      makeDeal(mix[3].airline, mix[3].airlineCode, 11, 7, roundPrice(base * 1.28), mix[3].tag, fastestStops, seed.avgFlightHours * 0.95),
    ],
    bestValue: [
      makeDeal(mix[1].airline, mix[1].airlineCode, 16, 10, roundPrice(base * 0.97), "Best value"),
      makeDeal(mix[0].airline, mix[0].airlineCode, 18, 12, roundPrice(base * 1.02), "Balanced"),
    ],
    weekend: [
      makeDeal(mix[0].airline, mix[0].airlineCode, 19, 18, roundPrice(base * 1.24), "Weekend"),
      makeDeal(mix[1].airline, mix[1].airlineCode, 24, 19, roundPrice(base * 1.31), "Weekend"),
    ],
    premium: [
      makeDeal(mix[3].airline, mix[3].airlineCode, 13, 11, roundPrice(base * 1.55), "Premium", fastestStops, seed.avgFlightHours),
    ],
  };
}

function genFareTable(seed: DestinationSeed, origin: OriginSeed): FareTableEntry[] {
  const base = roundPrice(4949 * seed.priceRatio);
  const stops = deriveStopCount(seed);
  const outDur = formatDuration(seed.avgFlightHours + stops * 0.8);
  const backDur = formatDuration(seed.avgFlightHours + stops * 0.9);

  return [
    {
      from1: origin.code,
      to1: seed.code,
      d1: isoAt(20, 22, 15),
      a1: null,
      s1: stops,
      dur1: outDur,
      from2: seed.code,
      to2: origin.code,
      d2: isoAt(27, 11, 20),
      a2: null,
      s2: stops,
      dur2: backDur,
      airline: "Multiple Airlines",
      price: base,
    },
    {
      from1: origin.code === "BKK" ? "DMK" : origin.code,
      to1: seed.code,
      d1: isoAt(23, 10, 40),
      a1: null,
      s1: seed.avgFlightHours <= 2.0 ? 0 : stops,
      dur1: formatDuration(seed.avgFlightHours + (seed.avgFlightHours <= 2.0 ? 0 : 0.6)),
      from2: seed.code,
      to2: origin.code === "BKK" ? "DMK" : origin.code,
      d2: isoAt(26, 14, 40),
      a2: null,
      s2: seed.avgFlightHours <= 2.0 ? 0 : stops,
      dur2: formatDuration(seed.avgFlightHours + (seed.avgFlightHours <= 2.0 ? 0 : 0.7)),
      airline: "Thai AirAsia",
      airlineCode: "FD",
      logoUrl: `https://pics.avs.io/120/120/FD.png`,
      price: roundPrice(base * 1.1),
    },
    {
      from1: origin.code,
      to1: seed.code,
      d1: isoAt(17, 15, 25),
      a1: null,
      s1: stops,
      dur1: formatDuration(seed.avgFlightHours + 1.0),
      airline: "Scoot",
      airlineCode: "TR",
      logoUrl: `https://pics.avs.io/120/120/TR.png`,
      price: roundPrice(base * 1.04),
    },
  ];
}

function genAirlines(seed: DestinationSeed): AirlineSummary[] {
  const stops = deriveStopCount(seed);
  const ratio = clamp(seed.priceRatio, 0.5, 2.5);

  return [
    {
      code: "FD",
      name: "Thai AirAsia",
      logoUrl: `https://pics.avs.io/120/120/FD.png`,
      dealCount: Math.max(2, Math.round(10 / ratio)),
      commonStops: stops,
      tags: ["Budget", "Popular"],
      confidenceLabel: "Frequently available",
    },
    {
      code: "TR",
      name: "Scoot",
      logoUrl: `https://pics.avs.io/120/120/TR.png`,
      dealCount: Math.max(2, Math.round(8 / ratio)),
      commonStops: Math.max(1, stops),
      tags: ["Budget"],
    },
    {
      code: "SL",
      name: "Thai Lion Air",
      logoUrl: `https://pics.avs.io/120/120/SL.png`,
      dealCount: Math.max(1, Math.round(6 / ratio)),
      commonStops: stops,
      tags: ["Budget"],
    },
    {
      code: "TG",
      name: "Thai Airways",
      logoUrl: `https://pics.avs.io/120/120/TG.png`,
      dealCount: Math.max(1, Math.round(3 / ratio)),
      commonStops: seed.avgFlightHours <= 2.0 ? 0 : 1,
      tags: ["Premium", "Full-service"],
      confidenceLabel: "Full-service carrier",
    },
  ];
}

function genReviews(seed: DestinationSeed): ReviewDatum[] {
  return [
    {
      airline: "Singapore Airlines",
      airlineCode: "SQ",
      logoUrl: `https://pics.avs.io/120/120/SQ.png`,
      score: 8.2,
      highlights: [
        `Excellent in-flight service on routes to ${seed.city}`,
        "Premium cabin options",
        "Consistently high ratings",
      ],
    },
    {
      airline: "Thai Airways",
      airlineCode: "TG",
      logoUrl: `https://pics.avs.io/120/120/TG.png`,
      score: 7.8,
      highlights: [
        `Comfortable flights to ${seed.city}`,
        "Good connectivity via Bangkok",
        "Decent in-flight meals",
      ],
    },
    {
      airline: "Thai AirAsia",
      airlineCode: "FD",
      logoUrl: `https://pics.avs.io/120/120/FD.png`,
      score: 7.5,
      highlights: [
        "Competitive pricing",
        `Popular budget option to ${seed.city}`,
        "Efficient boarding",
      ],
    },
    {
      airline: "Scoot",
      airlineCode: "TR",
      logoUrl: `https://pics.avs.io/120/120/TR.png`,
      score: 6.7,
      highlights: [
        "Affordable fares",
        `Basic but reliable for ${seed.city}`,
        "Good for budget travelers",
      ],
    },
  ];
}

function genFaqs(seed: DestinationSeed): FaqItem[] {
  return [
    {
      q: `What airport do you fly into for flights to ${seed.city}?`,
      a: `You'll usually fly into ${seed.airport} (${seed.code}). Check terminal and baggage info before your flight.`,
    },
    {
      q: `Can I find cheaper flights to ${seed.city} with stopovers?`,
      a: `Yes. One-stop options are often cheaper than the fastest itineraries. Use the fare table above to compare value and timing.`,
    },
    {
      q: `When is the best time to fly to ${seed.city}?`,
      a: `Midweek departures usually offer better value than weekend departures. Seasonal demand still affects final fares.`,
    },
    {
      q: `How far in advance should I book flights to ${seed.city}?`,
      a: `Booking 4 to 8 weeks ahead often gives you a good balance of price and availability on this route.`,
    },
    {
      q: `What airlines fly to ${seed.city}?`,
      a: `Thai AirAsia, Scoot, Thai Lion Air, and Thai Airways are common carriers in this fallback dataset. Actual availability can vary.`,
    },
    {
      q: `Does GoTravel Asia track price drops for ${seed.city}?`,
      a: `Yes. Price alerts can be used to monitor route changes and notify users when fares drop.`,
    },
  ];
}

function genNearbyRoutes(currentSeed: DestinationSeed): RelatedRoute[] {
  const pool = DESTINATION_SEEDS
    .filter((seed) => seed.slug !== currentSeed.slug)
    .filter((seed) => seed.country !== currentSeed.country || seed.code !== currentSeed.code)
    .slice(0, 6);

  const priority = pool
    .sort((a, b) => {
      const aScore = Number(Boolean(a.isPopularDestination)) + Number(Boolean(a.isPopularCity));
      const bScore = Number(Boolean(b.isPopularDestination)) + Number(Boolean(b.isPopularCity));
      return bScore - aScore;
    })
    .slice(0, 3);

  return priority.map((seed) => ({
    city: seed.city,
    code: seed.code,
    href: `/flights/to/${seed.slug}`,
    tag: seed.country === currentSeed.country ? "Nearby" : "Popular",
  }));
}

// ── Record builder ───────────────────────────────────────────────

function buildRecord(seed: DestinationSeed, origin: OriginSeed = DEFAULT_ORIGIN): StaticDestinationRecord {
  return {
    slug: seed.slug,
    origin: {
      city: origin.city,
      code: origin.code,
      country: origin.country,
    },
    dest: {
      city: seed.city,
      code: seed.code,
      country: seed.country,
    },
    heroNote: buildHeroNote(seed),
    deals: genDeals(seed, origin),
    fareTable: genFareTable(seed, origin),
    airlines: genAirlines(seed),
    priceMonths: genPriceMonths(seed),
    heatmap: genHeatmap(seed),
    reviews: genReviews(seed),
    weather: genWeather(seed),
    faqs: genFaqs(seed),
    nearbyRoutes: genNearbyRoutes(seed),
  };
}

// ── Registry builder ─────────────────────────────────────────────

function addAlias(map: Map<string, StaticDestinationRecord>, key: string, record: StaticDestinationRecord): void {
  const alias = toSlug(key);
  if (!alias || map.has(alias)) return;
  map.set(alias, record);
}

function buildRegistry(seeds: DestinationSeed[], origin: OriginSeed = DEFAULT_ORIGIN): RegistryMaps {
  const byCitySlug = new Map<string, StaticDestinationRecord>();
  const byCountrySlug = new Map<string, StaticDestinationRecord[]>();
  const byCode = new Map<string, StaticDestinationRecord>();

  for (const seed of seeds) {
    const record = buildRecord(seed, origin);

    byCitySlug.set(seed.slug, record);
    byCode.set(seed.code.toUpperCase(), record);

    addAlias(byCitySlug, seed.city, record);
    addAlias(byCitySlug, seed.code, record);

    for (const alias of seed.aliases ?? []) {
      addAlias(byCitySlug, alias, record);
    }

    const countrySlug = toSlug(seed.country);
    const currentCountryRecords = byCountrySlug.get(countrySlug) ?? [];
    currentCountryRecords.push(record);
    byCountrySlug.set(countrySlug, currentCountryRecords);
  }

  return { byCitySlug, byCountrySlug, byCode };
}

const REGISTRY = buildRegistry(DESTINATION_SEEDS);

// ── Public API ───────────────────────────────────────────────────

export function getDestinationBySlug(slug: string): StaticDestinationRecord | undefined {
  return REGISTRY.byCitySlug.get(toSlug(slug));
}

export function getDestinationByCode(code: string): StaticDestinationRecord | undefined {
  return REGISTRY.byCode.get(code.trim().toUpperCase());
}

export function getDestinationsByCountrySlug(countrySlug: string): StaticDestinationRecord[] {
  return REGISTRY.byCountrySlug.get(toSlug(countrySlug)) ?? [];
}

export function getAllSlugs(): string[] {
  return DESTINATION_SEEDS.map((seed) => seed.slug);
}

export function getAllDestinationRecords(): StaticDestinationRecord[] {
  return DESTINATION_SEEDS.map((seed) => REGISTRY.byCitySlug.get(seed.slug)!);
}

export const POP_DEST = DESTINATION_SEEDS
  .filter((seed) => seed.isPopularDestination)
  .map((seed) => seed.country)
  .filter((country, index, arr) => arr.indexOf(country) === index);

export const POP_CITIES = DESTINATION_SEEDS
  .filter((seed) => seed.isPopularCity)
  .map((seed) => seed.city);
