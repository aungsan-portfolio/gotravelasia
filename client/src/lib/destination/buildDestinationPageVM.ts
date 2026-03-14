// client/src/lib/destination/buildDestinationPageVM.ts
import { getDestinationsByCountrySlug } from "../../data/destinationRegistry";
import type {
  Deal,
  FareTableEntry,
  StaticDestinationRecord,
  DestinationPageVM,
  PriceMonthDatum,
  HeatmapDatum,
  WeatherMonthDatum,
  AirlineSummary,
  ReviewDatum,
} from "../../types/destination";

type BuildDestinationPageVMOptions = {
  liveState?: "static" | "live" | "partial" | "error";
  lastUpdated?: string | null;
  sourceLabel?: string | null;
  bookingBaseUrl?: string;
};

// ── Airport name lookup (for FareFinder origin dropdown) ────────────
const AIRPORT_NAMES: Record<string, string> = {
  BKK: "Suvarnabhumi (BKK)",
  DMK: "Don Mueang (DMK)",
  CNX: "Chiang Mai (CNX)",
  HKT: "Phuket (HKT)",
  USM: "Koh Samui (USM)",
  UTP: "U-Tapao Pattaya (UTP)",
  SIN: "Singapore Changi (SIN)",
  KUL: "Kuala Lumpur (KUL)",
  ICN: "Seoul Incheon (ICN)",
  NRT: "Tokyo Narita (NRT)",
  HND: "Tokyo Haneda (HND)",
  HKG: "Hong Kong Intl (HKG)",
  PEK: "Beijing Capital (PEK)",
  PVG: "Shanghai Pudong (PVG)",
  CAN: "Guangzhou (CAN)",
  CTU: "Chengdu (CTU)",
  KMG: "Kunming (KMG)",
  RGN: "Yangon (RGN)",
  MDL: "Mandalay (MDL)",
  DPS: "Bali Ngurah Rai (DPS)",
  SGN: "Ho Chi Minh (SGN)",
  HAN: "Hanoi Noi Bai (HAN)",
  DAD: "Da Nang (DAD)",
  MNL: "Manila Ninoy Aquino (MNL)",
  KIX: "Osaka Kansai (KIX)",
  TPE: "Taipei Taoyuan (TPE)",
  DXB: "Dubai Intl (DXB)",
  KBV: "Krabi (KBV)",
  HKT_CHECK: "Phuket (HKT)",
};

function airportLabel(code: string): string {
  return AIRPORT_NAMES[code.toUpperCase()] ?? code;
}

// ── Formatters ──────────────────────────────────────────────────────
function formatMoney(value: number, currency = "THB"): string {
  try {
    return new Intl.NumberFormat("en-US", { style:"currency", currency, maximumFractionDigits:0 }).format(value);
  } catch { return `${value.toLocaleString()} ${currency}`; }
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { weekday:"short", day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }).format(date);
}

function formatDateOnly(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { day:"2-digit", month:"short", year:"numeric" }).format(date);
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function minBy<T>(items: T[], getValue: (item: T) => number): T | null {
  if (!items.length) return null;
  return items.reduce((best, item) => getValue(item) < getValue(best) ? item : best);
}

function maxBy<T>(items: T[], getValue: (item: T) => number): T | null {
  if (!items.length) return null;
  return items.reduce((best, item) => getValue(item) > getValue(best) ? item : best);
}

function buildBookingUrl(
  bookingBaseUrl: string,
  origin: string,
  destination: string,
  departAt?: string | null,
  returnAt?: string | null,
): string {
  const url = new URL(bookingBaseUrl, "https://dummy.local");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (departAt)  url.searchParams.set("depart", departAt);
  if (returnAt)  url.searchParams.set("return", returnAt);
  return `${url.pathname}${url.search}`;
}

function getStopBadgeTone(stops: number): "green" | "amber" | "red" {
  if (stops <= 0) return "green";
  if (stops === 1) return "amber";
  return "red";
}

function getDealBadge(deal: Deal): string | null {
  if (deal.tag)        return deal.tag;
  if (deal.stops === 0) return "Direct";
  if (deal.stops === 1) return "1 stop";
  return `${deal.stops} stops`;
}

function dealHasUsablePrice(deal: Deal): boolean {
  return Number.isFinite(deal.price) && deal.price > 0;
}

function normalizeDeal(deal: Deal, originCode: string, destCode: string, bookingBaseUrl: string, currency: string) {
  return {
    ...deal,
    id: `${deal.airlineCode ?? deal.airline}-${deal.d1}-${deal.price}`,
    bookingUrl: deal.bookingUrl ?? buildBookingUrl(bookingBaseUrl, originCode, destCode, deal.d1 ?? null, null),
    badge: getDealBadge(deal) ?? null,
    stopBadgeTone: getStopBadgeTone(deal.stops),
    departLabel: formatDateTime(deal.d1),
    arrivalLabel: formatDateTime(deal.a1),
    priceLabel: formatMoney(deal.price, currency),
    isDirect: deal.stops === 0,
    isOneStop: deal.stops === 1,
    found: deal.found,
  };
}

function normalizeFareEntry(entry: FareTableEntry, bookingBaseUrl: string, currency: string) {
  const hasReturn =
    Boolean(entry.from2) && Boolean(entry.to2) && Boolean(entry.d2) &&
    entry.s2 !== undefined && entry.s2 !== null;
  return {
    ...entry,
    id: entry.id != null
      ? String(entry.id)
      : `${entry.airlineCode ?? entry.airline}-${entry.from1}-${entry.to1}-${entry.d1}`,
    bookingUrl: entry.bookingUrl ?? buildBookingUrl(bookingBaseUrl, entry.from1, entry.to1, entry.d1 ?? null, entry.d2 ?? null),
    tripType:   hasReturn ? "return" : "oneway",
    priceLabel: formatMoney(entry.price, currency),
    outbound: {
      route:         `${entry.from1} → ${entry.to1}`,
      departLabel:   formatDateTime(entry.d1),
      arrivalLabel:  formatDateTime(entry.a1),
      stopsLabel:    `${entry.s1} stop${entry.s1 === 1 ? "" : "s"}`,
      durationLabel: entry.dur1 ?? "—",
      stopBadgeTone: getStopBadgeTone(entry.s1),
    },
    returnLeg: hasReturn ? {
      route:         `${entry.from2} → ${entry.to2}`,
      departLabel:   formatDateTime(entry.d2),
      arrivalLabel:  formatDateTime(entry.a2),
      stopsLabel:    `${entry.s2} stop${entry.s2 === 1 ? "" : "s"}`,
      durationLabel: entry.dur2 ?? "—",
      stopBadgeTone: getStopBadgeTone(entry.s2 ?? 0),
    } : null,
  };
}

// ── Summarizers ─────────────────────────────────────────────────────
function summarizeDeals(deals: StaticDestinationRecord["deals"], currency: string) {
  // deals is now Record<string, Deal[]>
  const allDeals = Object.values(deals).flat().filter(dealHasUsablePrice);
  const cheapest = minBy(allDeals, (d) => d.price);
  const priciest = maxBy(allDeals, (d) => d.price);
  const avgPrice  = Math.round(average(allDeals.map((d) => d.price)));
  return {
    totalDeals: allDeals.length,
    avgPrice,
    avgPriceLabel:      formatMoney(avgPrice, currency),
    cheapestPrice:      cheapest?.price ?? null,
    cheapestPriceLabel: cheapest ? formatMoney(cheapest.price, currency) : "—",
    cheapestCarrier:    cheapest?.airline ?? null,
    highestPrice:       priciest?.price ?? null,
    directCount:        allDeals.filter((d) => d.stops === 0).length,
  };
}

function summarizePrices(priceMonths: PriceMonthDatum[], currency: string) {
  const cheapest     = minBy(priceMonths, (r) => r.value);
  const mostExpensive = maxBy(priceMonths, (r) => r.value);
  return {
    cheapestMonth:      cheapest?.month ?? "—",
    cheapestMonthValue: cheapest?.value ?? null,
    cheapestMonthLabel: cheapest ? formatMoney(cheapest.value, currency) : "—",
    priciestMonth:      mostExpensive?.month ?? "—",
    priciestMonthValue: mostExpensive?.value ?? null,
    priciestMonthLabel: mostExpensive ? formatMoney(mostExpensive.value, currency) : "—",
  };
}

function summarizeHeatmap(heatmap: HeatmapDatum[], currency: string) {
  const cells     = heatmap.flatMap((r) => r.values);
  const cheapest  = minBy(cells, (c) => c.price);
  const priciest  = maxBy(cells, (c) => c.price);
  return {
    lowestCellLabel:  cheapest ? `${cheapest.day} · ${formatMoney(cheapest.price, currency)}` : "—",
    highestCellLabel: priciest ? `${priciest.day} · ${formatMoney(priciest.price, currency)}` : "—",
  };
}

function summarizeWeather(weather: WeatherMonthDatum[]) {
  const warmest = maxBy(weather, (r) => r.avgTempC   ?? -Infinity);
  const wettest = maxBy(weather, (r) => r.rainfallMm ?? -Infinity);
  return {
    warmestMonth:     warmest?.month ?? "—",
    warmestTempC:     warmest?.avgTempC ?? null,
    wettestMonth:     wettest?.month ?? "—",
    wettestRainfallMm:wettest?.rainfallMm ?? null,
  };
}

function summarizeAirlines(airlines: AirlineSummary[]) {
  const topCarrier = maxBy(airlines, (r) => r.dealCount ?? 0);
  return {
    topCarrier:         topCarrier?.name ?? "—",
    topCarrierDealCount:topCarrier?.dealCount ?? 0,
    airlineCount:       airlines.length,
  };
}

function summarizeReviews(reviews: ReviewDatum[]) {
  const topReview = maxBy(reviews, (r) => r.score);
  return {
    topAirline: topReview?.airline ?? "—",
    topScore:   topReview?.score ?? null,
    avgScore:   Number(average(reviews.map((r) => r.score)).toFixed(1)),
  };
}

// ── Status builder ──────────────────────────────────────────────────
function buildStatus(
  liveState: BuildDestinationPageVMOptions["liveState"],
  lastUpdated?: string | null,
  sourceLabel?: string | null,
) {
  const state = liveState ?? "static";
  return {
    state,
    label:            ({ static:"Static fallback data", live:"Live fares loaded", partial:"Partial live data", error:"Live data unavailable" } as const)[state],
    tone:             ({ static:"amber",                 live:"green",            partial:"amber",             error:"red" } as const)[state] as "green"|"amber"|"red",
    lastUpdatedLabel: lastUpdated ? formatDateOnly(lastUpdated) : null,
    sourceLabel:      sourceLabel ?? (state === "live" ? "Live API" : "Static registry"),
    isLive:     state === "live",
    isFallback: state === "static" || state === "error",
    isPartial:  state === "partial",
  };
}

// ── Tabs builder (month-based) ──────────────────────────────────────
function buildTabs(
  deals: StaticDestinationRecord["deals"],
  originCode: string,
  destCode: string,
  bookingBaseUrl: string,
  currency: string,
) {
  const monthKeys = Object.keys(deals).sort();

  const tabs = monthKeys.map((key) => {
    const [yearStr, monthStr] = key.split("-");
    const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);

    const label      = date.toLocaleDateString("en-US", { month: "short", year: "numeric" }); // "Apr 2026"
    const monthLabel = date.toLocaleDateString("en-US", { month: "long"  });                   // "April"

    const items = (deals[key] ?? []).map((deal) =>
      normalizeDeal(deal, originCode, destCode, bookingBaseUrl, currency)
    );
    const bestPrice = items.length > 0 ? Math.min(...items.map((i) => i.price)) : null;

    return {
      key,
      label,
      monthLabel,
      count: items.length,
      bestPrice,
      bestPriceLabel: bestPrice ? formatMoney(bestPrice, currency) : "—",
      items,
    };
  });

  const activeTab = tabs[0]?.key ?? "";
  return { tabs, activeTab };
}

// ── Default search dates: first month of the deals ribbon ───────────
function deriveDefaultSearchDates(deals: StaticDestinationRecord["deals"]): {
  defaultDepartDate: string;
  defaultReturnDate: string;
} {
  const firstKey = Object.keys(deals).sort()[0];
  if (firstKey) {
    return {
      defaultDepartDate: `${firstKey}-10`,
      defaultReturnDate: `${firstKey}-17`,
    };
  }
  // Fallback: ~4 weeks from today
  const depart = new Date(Date.now() + 28 * 864e5);
  const ret    = new Date(Date.now() + 35 * 864e5);
  return {
    defaultDepartDate: depart.toISOString().split("T")[0],
    defaultReturnDate: ret.toISOString().split("T")[0],
  };
}

// ── Budget derivation for FareFinder slider ────────────────────────
function deriveFareBudget(entries: Array<{ price: number }>) {
  const prices = entries
    .map((e) => e.price)
    .filter((p) => Number.isFinite(p) && p > 0)
    .sort((a, b) => a - b);

  if (!prices.length) {
    return { budgetMin: 0, budgetMax: 0, defaultBudget: 0, budgetStep: 100 };
  }

  const budgetMin = prices[0];
  const budgetMax = prices[prices.length - 1];
  const spread = budgetMax - budgetMin;

  let budgetStep = 100;
  if (budgetMax > 10000) budgetStep = 250;
  if (budgetMax > 25000) budgetStep = 500;
  if (spread < 1000) budgetStep = 50;

  return { budgetMin, budgetMax, defaultBudget: budgetMax, budgetStep };
}

// ── Main builder ────────────────────────────────────────────────────
export function buildDestinationPageVM(
  record: StaticDestinationRecord,
  options: BuildDestinationPageVMOptions = {},
): DestinationPageVM {
  const currency       = "THB";
  const bookingBaseUrl = options.bookingBaseUrl ?? "/flights";

  const status         = buildStatus(options.liveState, options.lastUpdated, options.sourceLabel);
  const dealsSummary   = summarizeDeals(record.deals, currency);
  const priceSummary   = summarizePrices(record.priceMonths, currency);
  const heatmapSummary = summarizeHeatmap(record.heatmap, currency);
  const weatherSummary = summarizeWeather(record.weather);
  const airlineSummary = summarizeAirlines(record.airlines);
  const reviewSummary  = summarizeReviews(record.reviews);
  const dealsTabs      = buildTabs(record.deals, record.origin.code, record.dest.code, bookingBaseUrl, currency);

  const fareEntries = record.fareTable.map((e) => normalizeFareEntry(e, bookingBaseUrl, currency));
  const formattedEntries = fareEntries.map((e) => ({ ...e, tripType: e.tripType as "oneway" | "return" }));
  const fareBudget = deriveFareBudget(fareEntries);

  const isCountry = record.type === "country";

  const routeLabel = isCountry
    ? `${record.origin.city} (${record.origin.code}) TO ${record.dest.city}`
    : `${record.origin.city} (${record.origin.code}) TO ${record.dest.city} (${record.dest.code})`;

  const canonicalPath = `/flights/to/${record.slug}`;

  const { defaultDepartDate, defaultReturnDate } = deriveDefaultSearchDates(record.deals);

  const normalizedHighlights = Array.isArray(record.highlights)
    ? record.highlights
    : record.highlights
      ? record.highlights.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

  return {
    slug: record.slug,
    canonicalPath,
    status,
    route: {
      origin:          record.origin,
      destination:     record.dest,
      routeLabel:      routeLabel.replace(" TO ", " → "),
      heroNote:        record.heroNote,
      bookingCtaHref:  buildBookingUrl(bookingBaseUrl, record.origin.code, record.dest.code),
      bookingCtaLabel: `Search flights to ${record.dest.city}`,
      climate:         record.climate,
      highlights:      normalizedHighlights,
      priceRatio:      record.priceRatio,
      type:            record.type,
    },

    hero: {
      title:            isCountry ? `Find the best flights to ${record.dest.city}` : `Cheap flights to ${record.dest.city}`,
      subtitle:         record.heroNote || (isCountry ? `Explore top destinations across ${record.dest.city}.` : undefined),
      originLabel:      `${record.origin.city} (${record.origin.code})`,
      destinationLabel: isCountry ? record.dest.city : `${record.dest.city} (${record.dest.code})`,

      badge:            status.label,

      summaryChips: [
        { label:"Cheapest month",  value:priceSummary.cheapestMonth,     subValue:priceSummary.cheapestMonthLabel },
        { label:"Top carrier",     value:airlineSummary.topCarrier,      subValue:`${airlineSummary.topCarrierDealCount} deals` },
        { label:"Review leader",   value:reviewSummary.topAirline,       subValue:reviewSummary.topScore ? `${reviewSummary.topScore}/10` : "—" },
      ],
      searchForm: {
        originCode:        record.origin.code,
        originLabel:       `${record.origin.city} (${record.origin.code})`,
        destinationCode:   record.dest.code,
        destinationLabel:  `${record.dest.city} (${record.dest.code})`,
        defaultTripType:   "return",
        defaultDepartDate,
        defaultReturnDate,
        defaultPassengers: 1,
        bookingSearchUrl:  bookingBaseUrl,
      },
    },
    deals: {
      title:    `Flight deals from ${record.origin.city} to ${record.dest.city}`,
      subtitle: `Browse cheapest fares by month. Select a month to see available deals.`,
      activeTab: dealsTabs.activeTab,
      tabs:      dealsTabs.tabs,
      summary:   dealsSummary,
    },
    fareFinder: {
      title:    "Fare Finder",
      subtitle: `Compare outbound and return fare combinations for ${routeLabel}.`,
      originOptions: Array.from(
        new Set(fareEntries.flatMap((e) => [e.from1, e.from2].filter(Boolean) as string[]))
      ).map((code) => ({ label: airportLabel(code), value: code })),
      defaultOrigin: fareEntries[0]?.from1 ?? record.origin.code,
      entries: formattedEntries,
      summary: {
        cheapestFareLabel: fareEntries.length > 0
          ? formatMoney(Math.min(...fareEntries.map((e) => e.price)), currency)
          : "—",
        entryCount: fareEntries.length,
        budgetMin: fareBudget.budgetMin,
        budgetMax: fareBudget.budgetMax,
        defaultBudget: fareBudget.defaultBudget,
        budgetStep: fareBudget.budgetStep,
        filteredCountLabel: `${fareEntries.length} fare option${fareEntries.length === 1 ? "" : "s"}`,
      },
    },
    insights: {
      title:    isCountry
        ? `${record.dest.city} travel & price insights`
        : `${record.dest.city} price insights`,
      subtitle: `Seasonality, demand timing, and booking patterns for ${routeLabel}.`,
      priceMonths: record.priceMonths,
      heatmap:     record.heatmap,
      advanceBooking: record.advanceBooking,
      timeOfDay:   record.timeOfDay,
      summary: {
        cheapestMonth:      priceSummary.cheapestMonth,
        cheapestMonthLabel: priceSummary.cheapestMonthLabel,
        priciestMonth:      priceSummary.priciestMonth,
        priciestMonthLabel: priceSummary.priciestMonthLabel,
        lowestHeatmapCell:  heatmapSummary.lowestCellLabel,
        highestHeatmapCell: heatmapSummary.highestCellLabel,
      },
    },
    airlinesWeather: {
      title:    isCountry
        ? `Airlines flying to ${record.dest.city} — weather guide`
        : `Airlines and weather for ${record.dest.city}`,
      subtitle: isCountry
        ? `Common airlines serving major airports in ${record.dest.city}, plus monthly weather context.`
        : `Common carriers plus monthly weather context for trip planning.`,
      airlines: record.airlines,
      weather:  record.weather,
      climate:  record.climate,
      summary: {
        airlineCount: airlineSummary.airlineCount,
        topCarrier:   airlineSummary.topCarrier,
        warmestMonth: weatherSummary.warmestMonth,
        wettestMonth: weatherSummary.wettestMonth,
      },
    },
    reviews: {
      title:    isCountry
        ? `Airline reviews for flights to ${record.dest.city}`
        : `Reviews of airlines flying to ${record.dest.city}`,
      subtitle: `Quick score summary and standout highlights from commonly seen carriers.`,
      items:              record.reviews,
      defaultAirlineCode: record.reviews[0]?.airlineCode ?? null,
      highlights:         normalizedHighlights,
      summary: {
        topAirline: reviewSummary.topAirline,
        topScore:   reviewSummary.topScore,
        avgScore:   reviewSummary.avgScore,
      },
    },
    footer: {
      title:        `Plan your trip to ${record.dest.city}`,
      faqs:         record.faqs,
      nearbyRoutes: record.nearbyRoutes,
      browseLinks: [
        { label:`Flights to ${record.dest.city}`,           href:canonicalPath },
        { label:`Flights from ${record.origin.city}`,       href:`/flights/from/${record.origin.code.toLowerCase()}` },
        { label:`Price alerts for ${record.dest.city}`,     href:`/price-alerts?origin=${record.origin.code}&destination=${record.dest.code}` },
      ],
    },
    seo: {
      title: isCountry
        ? `Cheap flights to ${record.dest.city} from ${record.origin.city}`
        : `Cheap flights from ${record.origin.city} to ${record.dest.city}`,
      description:   record.heroNote,
      canonicalPath,
    },
    raw: record,
    isCountry,
    countryCities: isCountry
      ? getDestinationsByCountrySlug(record.dest.country ?? "")
          .filter((r) => r.slug !== record.slug)   // exclude self
          .map((cityRec) => {
            const allDeals = Object.values(cityRec.deals).flat();
            const cheapest = allDeals.length > 0
              ? Math.min(...allDeals.map((d) => d.price))
              : null;
            return {
              name: cityRec.dest.city,
              code: cityRec.dest.code,
              slug: cityRec.slug,
              startingFrom: cheapest ? formatMoney(cheapest, currency) : null,
              href: `/flights/to/${cityRec.slug}`,
            };
          })
      : [],
  };
}
