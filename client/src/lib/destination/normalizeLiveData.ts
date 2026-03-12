// client/src/lib/destination/normalizeLiveData.ts

import type {
  Deal,
  FareTableEntry,
  StaticDestinationRecord,
} from "@/types/destination";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

type LiveDeal = DeepPartial<Deal>;
type LiveFareEntry = DeepPartial<FareTableEntry>;
type LiveDealsSection = Partial<Record<keyof StaticDestinationRecord["deals"], LiveDeal[]>>;

export type NormalizedLiveDestinationData =
  Omit<DeepPartial<StaticDestinationRecord>, "deals" | "fareTable"> & {
    deals?: LiveDealsSection;
    fareTable?: LiveFareEntry[];
  };

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): UnknownRecord | undefined {
  return isRecord(value) ? value : undefined;
}

function cleanString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

function cleanNumber(value: unknown): number | undefined {
  if (isFiniteNumber(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function cleanNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return cleanString(value);
}

function pickFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const cleaned = cleanString(value);
    if (cleaned) return cleaned;
  }
  return undefined;
}

function pickFirstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const cleaned = cleanNumber(value);
    if (cleaned !== undefined) return cleaned;
  }
  return undefined;
}

function upperCode(value: unknown): string | undefined {
  const cleaned = cleanString(value);
  return cleaned ? cleaned.toUpperCase() : undefined;
}

function normalizeIsoLike(value: unknown): string | null | undefined {
  if (value === null) return null;
  const cleaned = cleanString(value);
  if (!cleaned) return undefined;

  const date = new Date(cleaned);
  if (Number.isNaN(date.getTime())) return cleaned;
  return date.toISOString();
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getNested(obj: unknown, path: string[]): unknown {
  let current = obj;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function findPayload(input: unknown): UnknownRecord | undefined {
  if (!isRecord(input)) return undefined;

  const directCandidates = [
    input.data,
    input.payload,
    input.result,
    input.destination,
    input.page,
  ];

  for (const candidate of directCandidates) {
    if (isRecord(candidate)) return candidate;
  }

  const nestedCandidates = [
    getNested(input, ["data", "data"]),
    getNested(input, ["data", "destination"]),
    getNested(input, ["data", "payload"]),
    getNested(input, ["result", "data"]),
  ];

  for (const candidate of nestedCandidates) {
    if (isRecord(candidate)) return candidate;
  }

  return input;
}

function normalizeOrigin(payload: UnknownRecord): NormalizedLiveDestinationData["origin"] | undefined {
  const origin = asRecord(payload.origin) ?? asRecord(payload.from);
  if (!origin) return undefined;

  const city = pickFirstString(origin.city, origin.originCity, origin.name);
  const code = upperCode(origin.code ?? origin.iata ?? origin.origin);
  const country = pickFirstString(origin.country, origin.countryName);

  if (!city && !code && !country) return undefined;

  return {
    ...(city ? { city } : {}),
    ...(code ? { code } : {}),
    ...(country ? { country } : {}),
  };
}

function normalizeDest(payload: UnknownRecord): NormalizedLiveDestinationData["dest"] | undefined {
  const dest = asRecord(payload.dest) ?? asRecord(payload.destination) ?? asRecord(payload.to);
  if (!dest) return undefined;

  const city = pickFirstString(dest.city, dest.destinationCity, dest.name);
  const code = upperCode(dest.code ?? dest.iata ?? dest.destination);
  const country = pickFirstString(dest.country, dest.countryName);

  if (!city && !code && !country) return undefined;

  return {
    ...(city ? { city } : {}),
    ...(code ? { code } : {}),
    ...(country ? { country } : {}),
  };
}

function normalizeDeal(input: unknown): LiveDeal | null {
  const row = asRecord(input);
  if (!row) return null;

  const from = upperCode(row.from ?? row.origin ?? row.originCode);
  const to = upperCode(row.to ?? row.destination ?? row.destinationCode);
  const d1 = normalizeIsoLike(row.d1 ?? row.departAt ?? row.departure_at ?? row.departure);
  const a1 = normalizeIsoLike(row.a1 ?? row.arriveAt ?? row.arrival_at ?? row.arrival_time);
  const airline = pickFirstString(row.airline, row.airlineName, row.carrier, row.name);
  const airlineCode = upperCode(row.airlineCode ?? row.airline_code ?? row.carrierCode);
  const stops = pickFirstNumber(row.stops, row.stopCount, row.transfers) ?? 0;
  const duration = pickFirstString(row.duration, row.flyDuration, row.flight_duration, row.durationLabel);
  const price = pickFirstNumber(row.price, row.amount, row.value);
  const tag = cleanString(row.tag ?? row.label);
  const bookingUrl = cleanString(row.bookingUrl ?? row.deepLink ?? row.url ?? row.link);

  if (!from && !to && price === undefined && !airline) return null;

  return {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(d1 ? { d1 } : {}),
    ...(a1 !== undefined ? { a1 } : {}),
    ...(airline ? { airline } : {}),
    ...(airlineCode ? { airlineCode } : {}),
    stops,
    ...(duration ? { duration } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(tag ? { tag } : {}),
    ...(bookingUrl ? { bookingUrl } : {}),
  };
}

function normalizeDeals(payload: UnknownRecord): LiveDealsSection | undefined {
  const dealsRoot =
    asRecord(payload.deals) ??
    asRecord(payload.flightDeals) ??
    asRecord(payload.sections);

  if (!dealsRoot) return undefined;

  const tabAliases: Record<keyof StaticDestinationRecord["deals"], string[]> = {
    cheapest: ["cheapest", "cheap", "budget"],
    fastest: ["fastest", "quick", "shortest"],
    bestValue: ["bestValue", "best", "best_value"],
    weekend: ["weekend", "weekendDeals", "weekend_deals"],
    premium: ["premium", "business", "fullService"],
  };

  const result: Record<string, any> = {};

  (Object.keys(tabAliases) as Array<keyof StaticDestinationRecord["deals"]>).forEach((key) => {
    let rawTab: unknown;

    for (const alias of tabAliases[key]) {
      rawTab = dealsRoot[alias];
      if (Array.isArray(rawTab)) break;
    }

    const items = asArray(rawTab)
      .map(normalizeDeal)
      .filter(Boolean) as Array<
      NonNullable<DeepPartial<StaticDestinationRecord["deals"][keyof StaticDestinationRecord["deals"]][number]>>
    >;

    if (items.length > 0) {
      result[key] = items;
    }
  });

  return Object.keys(result).length ? (result as LiveDealsSection) : undefined;
}

function normalizeFareEntry(input: unknown): LiveFareEntry | null {
  const row = asRecord(input);
  if (!row) return null;

  const from1 = upperCode(row.from1 ?? row.origin ?? row.originCode);
  const to1 = upperCode(row.to1 ?? row.destination ?? row.destinationCode);
  const d1 = normalizeIsoLike(row.d1 ?? row.departAt ?? row.departure_at ?? row.departure);
  const a1 = normalizeIsoLike(row.a1 ?? row.arriveAt ?? row.arrival_at);

  const from2 = upperCode(row.from2 ?? row.returnFrom);
  const to2 = upperCode(row.to2 ?? row.returnTo);
  const d2 = normalizeIsoLike(row.d2 ?? row.returnDepartAt ?? row.return_departure_at);
  const a2 = normalizeIsoLike(row.a2 ?? row.returnArriveAt ?? row.return_arrival_at);

  const s1 = pickFirstNumber(row.s1, row.stops, row.outboundStops, row.transfers);
  const s2 = row.s2 === null ? null : pickFirstNumber(row.s2, row.returnStops, row.inboundStops);

  const dur1 = pickFirstString(row.dur1, row.duration, row.outboundDuration);
  const dur2 =
    row.dur2 === null
      ? null
      : pickFirstString(row.dur2, row.returnDuration, row.inboundDuration);

  const airline = pickFirstString(row.airline, row.airlineName, row.carrier);
  const airlineCode = upperCode(row.airlineCode ?? row.airline_code ?? row.carrierCode);
  const price = pickFirstNumber(row.price, row.amount, row.value);
  const bookingUrl = cleanString(row.bookingUrl ?? row.deepLink ?? row.url ?? row.link);

  if (!from1 && !to1 && price === undefined && !airline) return null;

  return {
    ...(from1 ? { from1 } : {}),
    ...(to1 ? { to1 } : {}),
    ...(d1 ? { d1 } : {}),
    ...(a1 !== undefined ? { a1 } : {}),
    ...(s1 !== undefined ? { s1 } : {}),
    ...(dur1 ? { dur1 } : {}),
    ...(from2 ? { from2 } : {}),
    ...(to2 ? { to2 } : {}),
    ...(d2 ? { d2 } : {}),
    ...(a2 !== undefined ? { a2 } : {}),
    ...(s2 !== undefined ? { s2 } : {}),
    ...(dur2 !== undefined ? { dur2 } : {}),
    ...(airline ? { airline } : {}),
    ...(airlineCode ? { airlineCode } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(bookingUrl ? { bookingUrl } : {}),
  };
}

function normalizeFareTable(payload: UnknownRecord): LiveFareEntry[] | undefined {
  const raw =
    payload.fareTable ??
    payload.fares ??
    payload.fareFinder ??
    payload.fare_matrix;

  const items = asArray(raw)
    .map(normalizeFareEntry)
    .filter(Boolean) as Array<NonNullable<DeepPartial<StaticDestinationRecord["fareTable"][number]>>>;

  return items.length ? items : undefined;
}

function normalizePriceMonths(payload: UnknownRecord): NormalizedLiveDestinationData["priceMonths"] | undefined {
  const raw =
    payload.priceMonths ??
    payload.pricesByMonth ??
    payload.priceTrend ??
    getNested(payload, ["insights", "priceMonths"]) ??
    getNested(payload, ["insights", "pricesByMonth"]);

  const items = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const month = pickFirstString(row.month, row.m, row.label);
      const value = pickFirstNumber(row.value, row.price, row.p, row.amount);

      if (!month || value === undefined) return null;
      return { month, value };
    })
    .filter(Boolean) as Array<{ month: string; value: number }>;

  return items.length ? items : undefined;
}

function normalizeHeatmap(payload: UnknownRecord): NormalizedLiveDestinationData["heatmap"] | undefined {
  const raw =
    payload.heatmap ??
    payload.bookingHeatmap ??
    getNested(payload, ["insights", "heatmap"]);

  const rows = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const month = pickFirstString(row.month, row.label, row.segment);
      const values = asArray(row.values)
        .map((cell) => {
          const c = asRecord(cell);
          if (!c) return null;

          const day = pickFirstString(c.day, c.label);
          const price = pickFirstNumber(c.price, c.value, c.amount);
          const levelRaw = cleanString(c.level);

          const level =
            levelRaw === "low" || levelRaw === "mid" || levelRaw === "high"
              ? levelRaw
              : undefined;

          if (!day || price === undefined || !level) return null;

          return { day, price, level };
        })
        .filter(Boolean);

      if (!month || !values.length) return null;
      return { month, values };
    })
    .filter(Boolean) as Array<{ month: string; values: Array<{ day: string; price: number; level: "low" | "mid" | "high" }> }>;

  return rows.length ? rows : undefined;
}

function normalizeAirlines(payload: UnknownRecord): NormalizedLiveDestinationData["airlines"] | undefined {
  const raw =
    payload.airlines ??
    payload.airlineSummary ??
    getNested(payload, ["sections", "airlines"]);

  const items = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const code = upperCode(row.code ?? row.airlineCode ?? row.airline_code);
      const name = pickFirstString(row.name, row.airline, row.airlineName);
      const dealCount = pickFirstNumber(row.dealCount, row.count, row.deals);
      const commonStops = pickFirstNumber(row.commonStops, row.stops, row.stopCount);
      const confidenceLabel = cleanString(row.confidenceLabel ?? row.confidence);
      const tags = asArray(row.tags).filter(isNonEmptyString);

      if (!code || !name) return null;

      return {
        code,
        name,
        ...(dealCount !== undefined ? { dealCount } : {}),
        ...(commonStops !== undefined ? { commonStops } : {}),
        ...(tags.length ? { tags } : {}),
        ...(confidenceLabel ? { confidenceLabel } : {}),
      };
    })
    .filter(Boolean) as Array<NonNullable<DeepPartial<StaticDestinationRecord["airlines"][number]>>>;

  return items.length ? items : undefined;
}

function normalizeReviews(payload: UnknownRecord): NormalizedLiveDestinationData["reviews"] | undefined {
  const raw =
    payload.reviews ??
    payload.airlineReviews ??
    getNested(payload, ["sections", "reviews"]);

  const items = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const airline = pickFirstString(row.airline, row.name, row.airlineName);
      const airlineCode = upperCode(row.airlineCode ?? row.airline_code ?? row.code);
      const score = pickFirstNumber(row.score, row.rating, row.value);
      const highlights = asArray(row.highlights).filter(isNonEmptyString);

      if (!airline || !airlineCode) return null;

      return {
        airline,
        airlineCode,
        ...(score !== undefined ? { score } : {}),
        ...(highlights.length ? { highlights } : {}),
      };
    })
    .filter(Boolean) as Array<NonNullable<DeepPartial<StaticDestinationRecord["reviews"][number]>>>;

  return items.length ? items : undefined;
}

function normalizeWeather(payload: UnknownRecord): NormalizedLiveDestinationData["weather"] | undefined {
  const raw =
    payload.weather ??
    payload.weatherMonths ??
    getNested(payload, ["sections", "weather"]);

  const items = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const month = pickFirstString(row.month, row.m, row.label);
      const avgTempC = pickFirstNumber(row.avgTempC, row.tempC, row.temperature, row.avg_temp_c);
      const rainfallMm = pickFirstNumber(row.rainfallMm, row.rainMm, row.rainfall, row.rainfall_mm);

      if (!month) return null;

      return {
        month,
        ...(avgTempC !== undefined ? { avgTempC } : {}),
        ...(rainfallMm !== undefined ? { rainfallMm } : {}),
      };
    })
    .filter(Boolean) as Array<NonNullable<DeepPartial<StaticDestinationRecord["weather"][number]>>>;

  return items.length ? items : undefined;
}

function normalizeFaqs(payload: UnknownRecord): NormalizedLiveDestinationData["faqs"] | undefined {
  const raw =
    payload.faqs ??
    payload.faq ??
    getNested(payload, ["sections", "faqs"]);

  const items = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const q = pickFirstString(row.q, row.question, row.title);
      const a = pickFirstString(row.a, row.answer, row.body);

      if (!q || !a) return null;
      return { q, a };
    })
    .filter(Boolean) as Array<NonNullable<DeepPartial<StaticDestinationRecord["faqs"][number]>>>;

  return items.length ? items : undefined;
}

function normalizeNearbyRoutes(payload: UnknownRecord): NormalizedLiveDestinationData["nearbyRoutes"] | undefined {
  const raw =
    payload.nearbyRoutes ??
    payload.relatedRoutes ??
    payload.routes ??
    getNested(payload, ["sections", "nearbyRoutes"]);

  const items = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const city = pickFirstString(row.city, row.name);
      const code = upperCode(row.code ?? row.iata);
      const href =
        cleanString(row.href) ??
        (city ? `/flights/to/${slugify(city)}` : undefined);
      const tag = cleanString(row.tag ?? row.label);

      if (!city || !code || !href) return null;

      return {
        city,
        code,
        href,
        ...(tag ? { tag } : {}),
      };
    })
    .filter(Boolean) as Array<NonNullable<DeepPartial<StaticDestinationRecord["nearbyRoutes"][number]>>>;

  return items.length ? items : undefined;
}

export function normalizeLiveData(input: unknown): NormalizedLiveDestinationData | null {
  const payload = findPayload(input);
  if (!payload) return null;

  const origin = normalizeOrigin(payload);
  const dest = normalizeDest(payload);

  const slugSource =
    cleanString(payload.slug) ??
    cleanString(payload.destinationSlug) ??
    dest?.city;

  const slug = slugSource ? slugify(slugSource) : undefined;
  const heroNote =
    pickFirstString(payload.heroNote, payload.summary, payload.description);

  const deals = normalizeDeals(payload);
  const fareTable = normalizeFareTable(payload);
  const priceMonths = normalizePriceMonths(payload);
  const heatmap = normalizeHeatmap(payload);
  const airlines = normalizeAirlines(payload);
  const reviews = normalizeReviews(payload);
  const weather = normalizeWeather(payload);
  const faqs = normalizeFaqs(payload);
  const nearbyRoutes = normalizeNearbyRoutes(payload);

  const normalized: NormalizedLiveDestinationData = {
    ...(slug ? { slug } : {}),
    ...(origin ? { origin } : {}),
    ...(dest ? { dest } : {}),
    ...(heroNote ? { heroNote } : {}),
    ...(deals ? { deals } : {}),
    ...(fareTable ? { fareTable } : {}),
    ...(priceMonths ? { priceMonths } : {}),
    ...(heatmap ? { heatmap } : {}),
    ...(airlines ? { airlines } : {}),
    ...(reviews ? { reviews } : {}),
    ...(weather ? { weather } : {}),
    ...(faqs ? { faqs } : {}),
    ...(nearbyRoutes ? { nearbyRoutes } : {}),
  };

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export default normalizeLiveData;
