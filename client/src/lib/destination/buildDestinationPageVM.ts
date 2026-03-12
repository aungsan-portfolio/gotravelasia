// client/src/lib/destination/buildDestinationPageVM.ts

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
} from "@/types/destination";

type BuildDestinationPageVMOptions = {
  liveState?: "static" | "live" | "partial" | "error";
  lastUpdated?: string | null;
  sourceLabel?: string | null;
  bookingBaseUrl?: string;
};

type DealTabKey = keyof StaticDestinationRecord["deals"];

const DEAL_TAB_ORDER: DealTabKey[] = [
  "cheapest",
  "fastest",
  "bestValue",
  "weekend",
  "premium",
];

const DEAL_TAB_LABELS: Record<DealTabKey, string> = {
  cheapest: "Cheapest",
  fastest: "Fastest",
  bestValue: "Best value",
  weekend: "Weekend",
  premium: "Premium",
};

function formatMoney(value: number, currency = "THB"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateOnly(iso?: string | null): string {
  if (!iso) return "—";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function parseDurationToMinutes(duration?: string | null): number | null {
  if (!duration) return null;

  const match = duration.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i);
  if (!match) return null;

  const hours = Number(match[1] ?? 0);
  const mins = Number(match[2] ?? 0);
  return hours * 60 + mins;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function minBy<T>(items: T[], getValue: (item: T) => number): T | null {
  if (!items.length) return null;
  return items.reduce((best, item) => (getValue(item) < getValue(best) ? item : best));
}

function maxBy<T>(items: T[], getValue: (item: T) => number): T | null {
  if (!items.length) return null;
  return items.reduce((best, item) => (getValue(item) > getValue(best) ? item : best));
}

function buildBookingUrl(
  bookingBaseUrl: string,
  origin: string,
  destination: string,
  departAt?: string | null,
  returnAt?: string | null
): string {
  const url = new URL(bookingBaseUrl, "https://dummy.local");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (departAt) url.searchParams.set("depart", departAt);
  if (returnAt) url.searchParams.set("return", returnAt);
  return `${url.pathname}${url.search}`;
}

function getStopBadgeTone(stops: number): "green" | "amber" | "red" {
  if (stops <= 0) return "green";
  if (stops === 1) return "amber";
  return "red";
}

function getDealBadge(deal: Deal): string | null {
  if (deal.tag) return deal.tag;
  if (deal.stops === 0) return "Direct";
  if (deal.stops === 1) return "1 stop";
  return `${deal.stops} stops`;
}

function dealHasUsablePrice(deal: Deal): boolean {
  return Number.isFinite(deal.price) && deal.price > 0;
}

function normalizeDeal(
  deal: Deal,
  originCode: string,
  destCode: string,
  bookingBaseUrl: string,
  currency: string
) {
  return {
    ...deal,
    id: `${deal.airlineCode ?? deal.airline}-${deal.d1}-${deal.price}`,
    bookingUrl:
      deal.bookingUrl ??
      buildBookingUrl(bookingBaseUrl, originCode, destCode, deal.d1 ?? null, null),
    badge: getDealBadge(deal) ?? null,
    stopBadgeTone: getStopBadgeTone(deal.stops),
    departLabel: formatDateTime(deal.d1),
    arrivalLabel: formatDateTime(deal.a1),
    priceLabel: formatMoney(deal.price, currency),
    isDirect: deal.stops === 0,
    isOneStop: deal.stops === 1,
  };
}

function normalizeFareEntry(
  entry: FareTableEntry,
  bookingBaseUrl: string,
  currency: string
) {
  const hasReturn =
    Boolean(entry.from2) &&
    Boolean(entry.to2) &&
    Boolean(entry.d2) &&
    entry.s2 !== undefined &&
    entry.s2 !== null;

  return {
    ...entry,
    id:
      "id" in entry && (entry as any).id
        ? String((entry as any).id)
        : `${entry.airlineCode ?? entry.airline}-${entry.from1}-${entry.to1}-${entry.d1}`,
    bookingUrl:
      entry.bookingUrl ??
      buildBookingUrl(bookingBaseUrl, entry.from1, entry.to1, entry.d1 ?? null, entry.d2 ?? null),
    tripType: hasReturn ? "return" : "oneway",
    priceLabel: formatMoney(entry.price, currency),
    outbound: {
      route: `${entry.from1} → ${entry.to1}`,
      departLabel: formatDateTime(entry.d1),
      arrivalLabel: formatDateTime(entry.a1),
      stopsLabel: `${entry.s1} stop${entry.s1 === 1 ? "" : "s"}`,
      durationLabel: entry.dur1 ?? "—",
      stopBadgeTone: getStopBadgeTone(entry.s1),
    },
    returnLeg: hasReturn
      ? {
          route: `${entry.from2} → ${entry.to2}`,
          departLabel: formatDateTime(entry.d2),
          arrivalLabel: formatDateTime(entry.a2),
          stopsLabel: `${entry.s2} stop${entry.s2 === 1 ? "" : "s"}`,
          durationLabel: entry.dur2 ?? "—",
          stopBadgeTone: getStopBadgeTone(entry.s2 ?? 0),
        }
      : null,
  };
}

function summarizeDeals(
  deals: StaticDestinationRecord["deals"],
  currency: string
) {
  const allDeals = DEAL_TAB_ORDER.flatMap((key) => deals[key] ?? []).filter(dealHasUsablePrice);
  const cheapest = minBy(allDeals, (deal) => deal.price);
  const priciest = maxBy(allDeals, (deal) => deal.price);
  const directCount = allDeals.filter((deal) => deal.stops === 0).length;
  const avgPrice = Math.round(average(allDeals.map((deal) => deal.price)));

  return {
    totalDeals: allDeals.length,
    avgPrice,
    avgPriceLabel: formatMoney(avgPrice, currency),
    cheapestPrice: cheapest?.price ?? null,
    cheapestPriceLabel: cheapest ? formatMoney(cheapest.price, currency) : "—",
    cheapestCarrier: cheapest?.airline ?? null,
    highestPrice: priciest?.price ?? null,
    directCount,
  };
}

function summarizePrices(
  priceMonths: PriceMonthDatum[],
  currency: string
) {
  const cheapestMonth = minBy(priceMonths, (row) => row.value);
  const mostExpensiveMonth = maxBy(priceMonths, (row) => row.value);

  return {
    cheapestMonth: cheapestMonth?.month ?? "—",
    cheapestMonthValue: cheapestMonth?.value ?? null,
    cheapestMonthLabel: cheapestMonth ? formatMoney(cheapestMonth.value, currency) : "—",
    priciestMonth: mostExpensiveMonth?.month ?? "—",
    priciestMonthValue: mostExpensiveMonth?.value ?? null,
    priciestMonthLabel: mostExpensiveMonth
      ? formatMoney(mostExpensiveMonth.value, currency)
      : "—",
  };
}

function summarizeHeatmap(
  heatmap: HeatmapDatum[],
  currency: string
) {
  const cells = heatmap.flatMap((row) => row.values);
  const cheapest = minBy(cells, (cell) => cell.price);
  const mostExpensive = maxBy(cells, (cell) => cell.price);

  return {
    lowestCellLabel: cheapest ? `${cheapest.day} · ${formatMoney(cheapest.price, currency)}` : "—",
    highestCellLabel: mostExpensive
      ? `${mostExpensive.day} · ${formatMoney(mostExpensive.price, currency)}`
      : "—",
  };
}

function summarizeWeather(weather: WeatherMonthDatum[]) {
  const warmest = maxBy(weather, (row) => row.avgTempC ?? -Infinity);
  const wettest = maxBy(weather, (row) => row.rainfallMm ?? -Infinity);

  return {
    warmestMonth: warmest?.month ?? "—",
    warmestTempC: warmest?.avgTempC ?? null,
    wettestMonth: wettest?.month ?? "—",
    wettestRainfallMm: wettest?.rainfallMm ?? null,
  };
}

function summarizeAirlines(airlines: AirlineSummary[]) {
  const topCarrier = maxBy(airlines, (row) => row.dealCount ?? 0);
  return {
    topCarrier: topCarrier?.name ?? "—",
    topCarrierDealCount: topCarrier?.dealCount ?? 0,
    airlineCount: airlines.length,
  };
}

function summarizeReviews(reviews: ReviewDatum[]) {
  const topReview = maxBy(reviews, (row) => row.score);
  const avgScore = Number(average(reviews.map((row) => row.score)).toFixed(1));

  return {
    topAirline: topReview?.airline ?? "—",
    topScore: topReview?.score ?? null,
    avgScore,
  };
}

function buildStatus(
  liveState: BuildDestinationPageVMOptions["liveState"],
  lastUpdated?: string | null,
  sourceLabel?: string | null
) {
  const state = liveState ?? "static";

  const labelMap = {
    static: "Static fallback data",
    live: "Live fares loaded",
    partial: "Partial live data",
    error: "Live data unavailable",
  } as const;

  const toneMap = {
    static: "amber",
    live: "green",
    partial: "amber",
    error: "red",
  } as const;

  return {
    state,
    label: labelMap[state],
    tone: toneMap[state],
    lastUpdatedLabel: lastUpdated ? formatDateOnly(lastUpdated) : null,
    sourceLabel: sourceLabel ?? (state === "live" ? "Live API" : "Static registry"),
    isLive: state === "live",
    isFallback: state === "static" || state === "error",
    isPartial: state === "partial",
  };
}

function buildTabs(
  deals: StaticDestinationRecord["deals"],
  originCode: string,
  destCode: string,
  bookingBaseUrl: string,
  currency: string
) {
  const tabs = DEAL_TAB_ORDER.map((key) => {
    const items = (deals[key] ?? []).map((deal) =>
      normalizeDeal(deal, originCode, destCode, bookingBaseUrl, currency)
    );

    const bestPrice = minBy(items, (item) => item.price)?.price ?? null;

    return {
      key,
      label: DEAL_TAB_LABELS[key],
      count: items.length,
      bestPrice,
      bestPriceLabel: bestPrice ? formatMoney(bestPrice, currency) : "—",
      items,
    };
  });

  const activeTab =
    tabs.find((tab) => tab.key === "cheapest" && tab.count > 0)?.key ??
    tabs.find((tab) => tab.count > 0)?.key ??
    "cheapest";

  return { tabs, activeTab };
}

export function buildDestinationPageVM(
  record: StaticDestinationRecord,
  options: BuildDestinationPageVMOptions = {}
): DestinationPageVM {
  const currency = "THB";
  const bookingBaseUrl = options.bookingBaseUrl ?? "/flights";
  const status = buildStatus(options.liveState, options.lastUpdated, options.sourceLabel);

  const dealsSummary = summarizeDeals(record.deals, currency);
  const priceSummary = summarizePrices(record.priceMonths, currency);
  const heatmapSummary = summarizeHeatmap(record.heatmap, currency);
  const weatherSummary = summarizeWeather(record.weather);
  const airlineSummary = summarizeAirlines(record.airlines);
  const reviewSummary = summarizeReviews(record.reviews);

  const dealsTabs = buildTabs(
    record.deals,
    record.origin.code,
    record.dest.code,
    bookingBaseUrl,
    currency
  );

  const fareEntries = record.fareTable.map((entry) =>
    normalizeFareEntry(entry, bookingBaseUrl, currency)
  );

  const routeLabel = `${record.origin.city} → ${record.dest.city}`;
  const canonicalPath = `/flights/to/${record.slug}`;

  // Type assertion step to ensure returnLeg is correctly narrowed to properly match the NormalizedFareTableEntry type expected in entries array
  const formattedEntries = fareEntries.map(e => ({
    ...e,
    tripType: e.tripType as "oneway" | "return"
  }));

  return {
    slug: record.slug,
    canonicalPath,

    status,

    route: {
      origin: record.origin,
      destination: record.dest,
      routeLabel,
      heroNote: record.heroNote,
      bookingCtaHref: buildBookingUrl(
        bookingBaseUrl,
        record.origin.code,
        record.dest.code
      ),
      bookingCtaLabel: `Search flights to ${record.dest.city}`,
    },

    hero: {
      title: `Cheap flights to ${record.dest.city}`,
      subtitle: record.heroNote,
      originLabel: `${record.origin.city} (${record.origin.code})`,
      destinationLabel: `${record.dest.city} (${record.dest.code})`,
      badge: status.label,
      summaryChips: [
        {
          label: "Cheapest month",
          value: priceSummary.cheapestMonth,
          subValue: priceSummary.cheapestMonthLabel,
        },
        {
          label: "Top carrier",
          value: airlineSummary.topCarrier,
          subValue: `${airlineSummary.topCarrierDealCount} deals`,
        },
        {
          label: "Review leader",
          value: reviewSummary.topAirline,
          subValue: reviewSummary.topScore ? `${reviewSummary.topScore}/10` : "—",
        },
      ],
    },

    deals: {
      title: `Flight deals from ${record.origin.city} to ${record.dest.city}`,
      subtitle: `Compare cheapest, fastest, best-value, weekend, and premium fares.`,
      activeTab: dealsTabs.activeTab,
      tabs: dealsTabs.tabs,
      summary: dealsSummary,
    },

    fareFinder: {
      title: "Fare Finder",
      subtitle: `Compare outbound and return fare combinations for ${routeLabel}.`,
      originOptions: Array.from(
        new Set(
          fareEntries.flatMap((entry) =>
            [entry.from1, entry.from2].filter(Boolean) as string[]
          )
        )
      ).map((code) => ({ label: code, value: code })),
      defaultOrigin: fareEntries[0]?.from1 ?? record.origin.code,
      entries: formattedEntries,
      summary: {
        cheapestFareLabel:
          fareEntries.length > 0
            ? formatMoney(
                Math.min(...fareEntries.map((entry) => entry.price)),
                currency
              )
            : "—",
        entryCount: fareEntries.length,
      },
    },

    insights: {
      title: `${record.dest.city} price insights`,
      subtitle: `Seasonality, demand timing, and booking patterns for ${routeLabel}.`,
      priceMonths: record.priceMonths,
      heatmap: record.heatmap,
      summary: {
        cheapestMonth: priceSummary.cheapestMonth,
        cheapestMonthLabel: priceSummary.cheapestMonthLabel,
        priciestMonth: priceSummary.priciestMonth,
        priciestMonthLabel: priceSummary.priciestMonthLabel,
        lowestHeatmapCell: heatmapSummary.lowestCellLabel,
        highestHeatmapCell: heatmapSummary.highestCellLabel,
      },
    },

    airlinesWeather: {
      title: `Airlines and weather for ${record.dest.city}`,
      subtitle: `Common carriers plus monthly weather context for trip planning.`,
      airlines: record.airlines,
      weather: record.weather,
      summary: {
        airlineCount: airlineSummary.airlineCount,
        topCarrier: airlineSummary.topCarrier,
        warmestMonth: weatherSummary.warmestMonth,
        wettestMonth: weatherSummary.wettestMonth,
      },
    },

    reviews: {
      title: `Reviews of airlines flying to ${record.dest.city}`,
      subtitle: `Quick score summary and standout highlights from commonly seen carriers.`,
      items: record.reviews,
      defaultAirlineCode: record.reviews[0]?.airlineCode ?? null,
      summary: {
        topAirline: reviewSummary.topAirline,
        topScore: reviewSummary.topScore,
        avgScore: reviewSummary.avgScore,
      },
    },

    footer: {
      title: `Plan your trip to ${record.dest.city}`,
      faqs: record.faqs,
      nearbyRoutes: record.nearbyRoutes,
      browseLinks: [
        {
          label: `Flights to ${record.dest.city}`,
          href: canonicalPath,
        },
        {
          label: `Flights from ${record.origin.city}`,
          href: `/flights/from/${record.origin.code.toLowerCase()}`,
        },
        {
          label: `Price alerts for ${record.dest.city}`,
          href: `/price-alerts?origin=${record.origin.code}&destination=${record.dest.code}`,
        },
      ],
    },

    seo: {
      title: `Cheap flights from ${record.origin.city} to ${record.dest.city}`,
      description: record.heroNote,
      canonicalPath,
    },

    raw: record,
  };
}
