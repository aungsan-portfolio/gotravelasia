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
type LiveDealsSection = Record<string, LiveDeal[]>;

export type NormalizedLiveDestinationData = Omit<
  DeepPartial<StaticDestinationRecord>,
  "deals" | "fareTable"
> & {
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

function normalizeOrigin(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["origin"] | undefined {
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

function normalizeDest(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["dest"] | undefined {
  const dest =
    asRecord(payload.dest) ??
    asRecord(payload.destination) ??
    asRecord(payload.to);

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

function extractMonthKeyFromValue(value: unknown): string | undefined {
  const cleaned = cleanString(value);
  if (!cleaned) return undefined;

  const directMonthMatch = cleaned.match(/^(\d{4})-(\d{2})$/);
  if (directMonthMatch) return directMonthMatch[0];

  const date = new Date(cleaned);
  if (Number.isNaN(date.getTime())) return undefined;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function extractMonthKeyFromDealLike(row: UnknownRecord): string | undefined {
  return extractMonthKeyFromValue(
    row.d1 ??
      row.departAt ??
      row.departure_at ??
      row.departure ??
      row.departDate ??
      row.date,
  );
}

function pushDeal(
  result: LiveDealsSection,
  monthKey: string,
  deal: LiveDeal,
): void {
  if (!result[monthKey]) {
    result[monthKey] = [];
  }
  result[monthKey].push(deal);
}

function normalizeDeal(input: unknown): LiveDeal | null {
  const row = asRecord(input);
  if (!row) return null;

  const from = upperCode(row.from ?? row.origin ?? row.originCode);
  const to = upperCode(row.to ?? row.destination ?? row.destinationCode);
  const d1 = normalizeIsoLike(
    row.d1 ?? row.departAt ?? row.departure_at ?? row.departure,
  );
  const a1 = normalizeIsoLike(
    row.a1 ?? row.arriveAt ?? row.arrival_at ?? row.arrival_time,
  );
  const airline = pickFirstString(
    row.airline,
    row.airlineName,
    row.carrier,
    row.name,
  );
  const airlineCode = upperCode(
    row.airlineCode ?? row.airline_code ?? row.carrierCode,
  );
  const logoUrl = cleanString(row.logoUrl ?? row.logo_url);
  const stops = pickFirstNumber(row.stops, row.stopCount, row.transfers) ?? 0;
  const duration = pickFirstString(
    row.duration,
    row.flyDuration,
    row.flight_duration,
    row.durationLabel,
  );
  const price = pickFirstNumber(row.price, row.amount, row.value);
  const badge = cleanString(row.badge);
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
    ...(logoUrl ? { logoUrl } : {}),
    stops,
    ...(duration ? { duration } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(badge ? { badge } : {}),
    ...(tag ? { tag } : {}),
    ...(bookingUrl ? { bookingUrl } : {}),
  };
}

function groupDealsByMonth(
  source: unknown[],
  forcedMonthKey?: string,
): LiveDealsSection | undefined {
  const result: LiveDealsSection = {};

  for (const item of source) {
    const normalized = normalizeDeal(item);
    if (!normalized) continue;

    const monthKey =
      forcedMonthKey ??
      extractMonthKeyFromValue(normalized.d1) ??
      extractMonthKeyFromDealLike(asRecord(item) ?? {});

    if (!monthKey) continue;
    pushDeal(result, monthKey, normalized);
  }

  const keys = Object.keys(result).sort();
  if (!keys.length) return undefined;

  const sorted: LiveDealsSection = {};
  for (const key of keys) {
    sorted[key] = result[key];
  }
  return sorted;
}

function normalizeDeals(payload: UnknownRecord): LiveDealsSection | undefined {
  const rawDeals =
    payload.deals ??
    payload.flightDeals ??
    getNested(payload, ["sections", "deals"]) ??
    getNested(payload, ["data", "deals"]);

  if (!rawDeals) return undefined;

  if (Array.isArray(rawDeals)) {
    return groupDealsByMonth(rawDeals);
  }

  const dealsRoot = asRecord(rawDeals);
  if (!dealsRoot) return undefined;

  const result: LiveDealsSection = {};

  const appendGrouped = (grouped?: LiveDealsSection) => {
    if (!grouped) return;
    for (const [key, items] of Object.entries(grouped)) {
      if (!result[key]) result[key] = [];
      result[key].push(...items);
    }
  };

  for (const [rawKey, rawValue] of Object.entries(dealsRoot)) {
    if (Array.isArray(rawValue)) {
      const explicitMonthKey = extractMonthKeyFromValue(rawKey);
      appendGrouped(groupDealsByMonth(rawValue, explicitMonthKey));
      continue;
    }

    const nested = asRecord(rawValue);
    if (!nested) continue;

    const nestedItems =
      asArray(nested.items).length > 0
        ? asArray(nested.items)
        : asArray(nested.results).length > 0
          ? asArray(nested.results)
          : asArray(nested.data);

    if (nestedItems.length > 0) {
      const explicitMonthKey =
        extractMonthKeyFromValue(rawKey) ??
        extractMonthKeyFromValue(nested.month) ??
        extractMonthKeyFromValue(nested.key);
      appendGrouped(groupDealsByMonth(nestedItems, explicitMonthKey));
    }
  }

  const keys = Object.keys(result).sort();
  if (!keys.length) return undefined;

  const sorted: LiveDealsSection = {};
  for (const key of keys) {
    sorted[key] = result[key];
  }

  return sorted;
}

function normalizeFareEntry(input: unknown): LiveFareEntry | null {
  const row = asRecord(input);
  if (!row) return null;

  const from1 = upperCode(row.from1 ?? row.origin ?? row.originCode);
  const to1 = upperCode(row.to1 ?? row.destination ?? row.destinationCode);
  const d1 = normalizeIsoLike(
    row.d1 ?? row.departAt ?? row.departure_at ?? row.departure,
  );
  const a1 = normalizeIsoLike(row.a1 ?? row.arriveAt ?? row.arrival_at);

  const from2 = upperCode(row.from2 ?? row.returnFrom);
  const to2 = upperCode(row.to2 ?? row.returnTo);
  const d2 = normalizeIsoLike(row.d2 ?? row.returnDepartAt ?? row.return_departure_at);
  const a2 = normalizeIsoLike(row.a2 ?? row.returnArriveAt ?? row.return_arrival_at);

  const s1 = pickFirstNumber(row.s1, row.stops, row.outboundStops, row.transfers);
  const s2 = row.s2 === null ? null : pickFirstNumber(row.s2, row.returnStops, row.inboundStops);

  const dur1 = pickFirstString(row.dur1, row.duration, row.outboundDuration);
  const dur2 =
    row.dur2 === null ? null : pickFirstString(row.dur2, row.returnDuration, row.inboundDuration);

  const airline = pickFirstString(row.airline, row.airlineName, row.carrier);
  const airlineCode = upperCode(row.airlineCode ?? row.airline_code ?? row.carrierCode);
  const logoUrl = cleanString(row.logoUrl ?? row.logo_url);
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
    ...(logoUrl ? { logoUrl } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(bookingUrl ? { bookingUrl } : {}),
  };
}

function normalizeFareTable(
  payload: UnknownRecord,
): LiveFareEntry[] | undefined {
  const raw =
    payload.fareTable ??
    payload.fares ??
    payload.fareFinder ??
    payload.fare_matrix;

  const items = asArray(raw)
    .map(normalizeFareEntry)
    .filter(Boolean) as LiveFareEntry[];

  return items.length ? items : undefined;
}

function normalizePriceMonths(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["priceMonths"] | undefined {
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
      const label = cleanString(row.labelText ?? row.displayLabel);

      if (!month || value === undefined) return null;

      return {
        month,
        value,
        ...(label ? { label } : {}),
      };
    })
    .filter(Boolean) as NormalizedLiveDestinationData["priceMonths"];

  return items!.length ? items : undefined;
}

function normalizeHeatmap(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["heatmap"] | undefined {
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
    .filter(Boolean) as NormalizedLiveDestinationData["heatmap"];

  return rows!.length ? rows : undefined;
}

function normalizeAirlines(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["airlines"] | undefined {
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
      const logoUrl = cleanString(row.logoUrl ?? row.logo_url);
      const dealCount = pickFirstNumber(row.dealCount, row.count, row.deals);
      const commonStops = pickFirstNumber(row.commonStops, row.stops, row.stopCount);
      const confidenceLabel = cleanString(row.confidenceLabel ?? row.confidence);
      const tags = asArray(row.tags).filter(isNonEmptyString);

      if (!code || !name) return null;

      return {
        code,
        name,
        ...(logoUrl ? { logoUrl } : {}),
        ...(dealCount !== undefined ? { dealCount } : {}),
        ...(commonStops !== undefined ? { commonStops } : {}),
        ...(tags.length ? { tags } : {}),
        ...(confidenceLabel ? { confidenceLabel } : {}),
      };
    })
    .filter(Boolean) as NormalizedLiveDestinationData["airlines"];

  return items!.length ? items : undefined;
}

function normalizeReviews(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["reviews"] | undefined {
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
      const logoUrl = cleanString(row.logoUrl ?? row.logo_url);
      const score = pickFirstNumber(row.score, row.rating, row.value);
      const highlights = asArray(row.highlights).filter(isNonEmptyString);

      if (!airline || !airlineCode) return null;

      return {
        airline,
        airlineCode,
        ...(logoUrl ? { logoUrl } : {}),
        ...(score !== undefined ? { score } : {}),
        ...(highlights.length ? { highlights } : {}),
      };
    })
    .filter(Boolean) as NormalizedLiveDestinationData["reviews"];

  return items!.length ? items : undefined;
}

function normalizeWeather(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["weather"] | undefined {
  const raw =
    payload.weather ??
    payload.weatherMonths ??
    getNested(payload, ["sections", "weather"]);

  const items = asArray(raw)
    .map((entry) => {
      const row = asRecord(entry);
      if (!row) return null;

      const month = pickFirstString(row.month, row.m, row.label);
      const avgTempC = pickFirstNumber(
        row.avgTempC,
        row.tempC,
        row.temperature,
        row.avg_temp_c,
      );
      const rainfallMm = pickFirstNumber(
        row.rainfallMm,
        row.rainMm,
        row.rainfall,
        row.rainfall_mm,
      );

      if (!month) return null;

      return {
        month,
        ...(avgTempC !== undefined ? { avgTempC } : {}),
        ...(rainfallMm !== undefined ? { rainfallMm } : {}),
      };
    })
    .filter(Boolean) as NormalizedLiveDestinationData["weather"];

  return items!.length ? items : undefined;
}

function normalizeFaqs(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["faqs"] | undefined {
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
    .filter(Boolean) as NormalizedLiveDestinationData["faqs"];

  return items!.length ? items : undefined;
}

function normalizeNearbyRoutes(
  payload: UnknownRecord,
): NormalizedLiveDestinationData["nearbyRoutes"] | undefined {
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
    .filter(Boolean) as NormalizedLiveDestinationData["nearbyRoutes"];

  return items!.length ? items : undefined;
}

export function normalizeLiveData(
  input: unknown,
): NormalizedLiveDestinationData | null {
  const payload = findPayload(input);
  if (!payload) return null;

  const origin = normalizeOrigin(payload);
  const dest = normalizeDest(payload);

  const slugSource =
    cleanString(payload.slug) ??
    cleanString(payload.destinationSlug) ??
    dest?.city;

  const slug = slugSource ? slugify(slugSource) : undefined;
  const heroNote = pickFirstString(
    payload.heroNote,
    payload.summary,
    payload.description,
  );

  const deals = normalizeDeals(payload);
  const fareTable = normalizeFareTable(payload);
  const priceMonths = normalizePriceMonths(payload);
  const heatmap = normalizeHeatmap(payload);
  const airlines = normalizeAirlines(payload);
  const reviews = normalizeReviews(payload);
  const weather = normalizeWeather(payload);
  const faqs = normalizeFaqs(payload);
  const nearbyRoutes = normalizeNearbyRoutes(payload);

  const type = (payload.type ?? getNested(input, ["meta", "type"])) as "country" | "city" | "airport" | undefined;
  const climate = pickFirstString(payload.climate, getNested(input, ["meta", "climate"]));
  const highlightsRaw = payload.highlights ?? getNested(input, ["meta", "highlights"]);
  const highlights = Array.isArray(highlightsRaw) ? highlightsRaw.filter(isNonEmptyString) : undefined;
  const priceRatio = pickFirstNumber(payload.priceRatio, getNested(input, ["meta", "priceRatio"]));

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
    ...(type ? { type } : {}),
    ...(climate ? { climate } : {}),
    ...(highlights ? { highlights } : {}),
    ...(priceRatio !== undefined ? { priceRatio } : {}),
  };

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export default normalizeLiveData;
