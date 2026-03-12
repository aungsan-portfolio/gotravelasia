// client/src/lib/destination/mergeDestinationData.ts

import type { StaticDestinationRecord } from "@/types/destination";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type MergeDestinationDataOptions = {
  preferLive?: boolean;
};

type MergeableRecord = DeepPartial<StaticDestinationRecord> | null | undefined;

const DEAL_TABS: Array<keyof StaticDestinationRecord["deals"]> = [
  "cheapest",
  "fastest",
  "bestValue",
  "weekend",
  "premium",
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function hasItems<T>(value: T[] | null | undefined): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function pickString(staticValue: string, liveValue: unknown): string {
  return isNonEmptyString(liveValue) ? liveValue.trim() : staticValue;
}

function pickNumber(staticValue: number, liveValue: unknown): number {
  return isFiniteNumber(liveValue) ? liveValue : staticValue;
}

function pickNullableString(
  staticValue: string | null | undefined,
  liveValue: unknown
): string | null | undefined {
  if (liveValue === null) return null;
  if (isNonEmptyString(liveValue)) return liveValue.trim();
  return staticValue;
}

function mergeShallowObject<T extends Record<string, unknown>>(
  staticObj: T,
  liveObj: DeepPartial<T> | undefined
): T {
  if (!liveObj) return clone(staticObj);

  const merged = { ...staticObj } as T;

  for (const key of Object.keys(staticObj) as Array<keyof T>) {
    const staticValue = staticObj[key];
    const liveValue = liveObj[key];

    if (typeof staticValue === "string") {
      merged[key] = pickString(staticValue, liveValue) as T[keyof T];
      continue;
    }

    if (typeof staticValue === "number") {
      merged[key] = pickNumber(staticValue, liveValue) as T[keyof T];
      continue;
    }

    if (liveValue !== undefined) {
      merged[key] = liveValue as T[keyof T];
    }
  }

  return merged;
}

function mergeDeal(
  staticDeal: StaticDestinationRecord["deals"][keyof StaticDestinationRecord["deals"]][number] | undefined,
  liveDeal: DeepPartial<StaticDestinationRecord["deals"][keyof StaticDestinationRecord["deals"]][number]>
) {
  const base = staticDeal
    ? clone(staticDeal)
    : {
        from: "",
        to: "",
        d1: "",
        a1: null,
        airline: "",
        airlineCode: undefined,
        stops: 0,
        duration: "",
        price: 0,
        tag: undefined,
      };

  return {
    ...base,
    from: pickString(base.from, liveDeal.from),
    to: pickString(base.to, liveDeal.to),
    d1: pickString(base.d1, liveDeal.d1),
    a1: pickNullableString(base.a1, liveDeal.a1) ?? null,
    airline: pickString(base.airline, liveDeal.airline),
    airlineCode: pickNullableString(base.airlineCode, liveDeal.airlineCode) ?? undefined,
    stops: pickNumber(base.stops, liveDeal.stops),
    duration: pickString(base.duration, liveDeal.duration),
    price: pickNumber(base.price, liveDeal.price),
    tag: pickNullableString(base.tag, liveDeal.tag) ?? undefined,
    logoUrl: pickNullableString(
      (base as { logoUrl?: string }).logoUrl,
      (liveDeal as { logoUrl?: string }).logoUrl
    ) ?? undefined,
    bookingUrl: pickNullableString(
      (base as { bookingUrl?: string }).bookingUrl,
      (liveDeal as { bookingUrl?: string }).bookingUrl
    ) ?? undefined,
  };
}

function mergeFareEntry(
  staticEntry: StaticDestinationRecord["fareTable"][number] | undefined,
  liveEntry: DeepPartial<StaticDestinationRecord["fareTable"][number]>
) {
  const base = staticEntry
    ? clone(staticEntry)
    : {
        from1: "",
        to1: "",
        d1: "",
        a1: null,
        s1: 0,
        dur1: "",
        from2: undefined,
        to2: undefined,
        d2: undefined,
        a2: undefined,
        s2: null,
        dur2: undefined,
        airline: "",
        airlineCode: undefined,
        price: 0,
        bookingUrl: undefined,
      };

  return {
    ...base,
    from1: pickString(base.from1, liveEntry.from1),
    to1: pickString(base.to1, liveEntry.to1),
    d1: pickString(base.d1, liveEntry.d1),
    a1: pickNullableString(base.a1, liveEntry.a1) ?? null,
    s1: pickNumber(base.s1 ?? 0, liveEntry.s1),
    dur1: pickString(base.dur1 ?? "", liveEntry.dur1),
    from2: pickNullableString(base.from2, liveEntry.from2) ?? undefined,
    to2: pickNullableString(base.to2, liveEntry.to2) ?? undefined,
    d2: pickNullableString(base.d2, liveEntry.d2) ?? undefined,
    a2: pickNullableString(base.a2, liveEntry.a2) ?? undefined,
    s2:
      liveEntry.s2 === null
        ? null
        : isFiniteNumber(liveEntry.s2)
          ? liveEntry.s2
          : base.s2 ?? null,
    dur2: pickNullableString(base.dur2, liveEntry.dur2) ?? undefined,
    airline: pickString(base.airline, liveEntry.airline),
    airlineCode: pickNullableString(base.airlineCode, liveEntry.airlineCode) ?? undefined,
    price: pickNumber(base.price, liveEntry.price),
    logoUrl: pickNullableString(
      (base as { logoUrl?: string }).logoUrl,
      (liveEntry as { logoUrl?: string }).logoUrl
    ) ?? undefined,
    bookingUrl: pickNullableString(
      (base as { bookingUrl?: string }).bookingUrl,
      (liveEntry as { bookingUrl?: string }).bookingUrl
    ) ?? undefined,
  };
}

function mergePriceMonths(
  staticRows: StaticDestinationRecord["priceMonths"],
  liveRows: DeepPartial<StaticDestinationRecord["priceMonths"]> | undefined
): StaticDestinationRecord["priceMonths"] {
  if (!hasItems(liveRows as StaticDestinationRecord["priceMonths"])) return clone(staticRows);

  return (liveRows as Array<DeepPartial<StaticDestinationRecord["priceMonths"][number]>>)
    .map((row, index) => {
      const fallback = staticRows[index];
      if (!fallback) return null;

      return {
        month: pickString(fallback.month, row.month),
        value: pickNumber(fallback.value, row.value),
      };
    })
    .filter(Boolean) as StaticDestinationRecord["priceMonths"];
}

function mergeHeatmap(
  staticRows: StaticDestinationRecord["heatmap"],
  liveRows: DeepPartial<StaticDestinationRecord["heatmap"]> | undefined
): StaticDestinationRecord["heatmap"] {
  if (!hasItems(liveRows as StaticDestinationRecord["heatmap"])) return clone(staticRows);

  return (liveRows as Array<DeepPartial<StaticDestinationRecord["heatmap"][number]>>)
    .map((row, rowIndex) => {
      const fallback = staticRows[rowIndex];
      if (!fallback) return null;

      const values =
        hasItems(row.values as typeof fallback.values)
          ? row.values!.map((cell, cellIndex) => {
              const fallbackCell = fallback.values[cellIndex];
              if (!fallbackCell) return null;

              return {
                day: pickString(fallbackCell.day, cell.day),
                price: pickNumber(fallbackCell.price, cell.price),
                level:
                  cell.level === "low" || cell.level === "mid" || cell.level === "high"
                    ? cell.level
                    : fallbackCell.level,
              };
            }).filter(Boolean)
          : fallback.values;

      return {
        month: pickString(fallback.month, row.month),
        values,
      };
    })
    .filter(Boolean) as StaticDestinationRecord["heatmap"];
}

function mergeWeather(
  staticRows: StaticDestinationRecord["weather"],
  liveRows: DeepPartial<StaticDestinationRecord["weather"]> | undefined
): StaticDestinationRecord["weather"] {
  if (!hasItems(liveRows as StaticDestinationRecord["weather"])) return clone(staticRows);

  return (liveRows as Array<DeepPartial<StaticDestinationRecord["weather"][number]>>)
    .map((row, index) => {
      const fallback = staticRows[index];
      if (!fallback) return null;

      return {
        month: pickString(fallback.month, row.month),
        avgTempC: pickNumber(fallback.avgTempC ?? 0, row.avgTempC),
        rainfallMm: pickNumber(fallback.rainfallMm ?? 0, row.rainfallMm),
      };
    })
    .filter(Boolean) as StaticDestinationRecord["weather"];
}

function mergeAirlines(
  staticRows: StaticDestinationRecord["airlines"],
  liveRows: DeepPartial<StaticDestinationRecord["airlines"]> | undefined
): StaticDestinationRecord["airlines"] {
  if (!hasItems(liveRows as StaticDestinationRecord["airlines"])) return clone(staticRows);

  return (liveRows as Array<DeepPartial<StaticDestinationRecord["airlines"][number]>>)
    .map((row, index) => {
      const fallback = staticRows[index];
      const base = fallback ?? {
        code: "",
        name: "",
        dealCount: 0,
        commonStops: 0,
        tags: [],
      };

      return {
        ...base,
        code: pickString(base.code, row.code),
        name: pickString(base.name, row.name),
        dealCount: pickNumber(base.dealCount ?? 0, row.dealCount),
        commonStops: pickNumber(base.commonStops ?? 0, row.commonStops),
        tags: hasItems(row.tags as string[]) ? [...(row.tags as string[])] : [...(base.tags || [])],
        logoUrl: pickNullableString(
          (base as { logoUrl?: string }).logoUrl,
          (row as { logoUrl?: string }).logoUrl
        ) ?? undefined,
        confidenceLabel: pickNullableString(base.confidenceLabel, row.confidenceLabel) ?? undefined,
      };
    })
    .filter((row) => isNonEmptyString(row.code) && isNonEmptyString(row.name));
}

function mergeReviews(
  staticRows: StaticDestinationRecord["reviews"],
  liveRows: DeepPartial<StaticDestinationRecord["reviews"]> | undefined
): StaticDestinationRecord["reviews"] {
  if (!hasItems(liveRows as StaticDestinationRecord["reviews"])) return clone(staticRows);

  return (liveRows as Array<DeepPartial<StaticDestinationRecord["reviews"][number]>>)
    .map((row, index) => {
      const fallback = staticRows[index];
      const base = fallback ?? {
        airline: "",
        airlineCode: "",
        score: 0,
        highlights: [],
      };

      return {
        ...base,
        airline: pickString(base.airline, row.airline),
        airlineCode: pickString(base.airlineCode ?? "", row.airlineCode),
        score: pickNumber(base.score, row.score),
        logoUrl: pickNullableString(
          (base as { logoUrl?: string }).logoUrl,
          (row as { logoUrl?: string }).logoUrl
        ) ?? undefined,
        highlights: hasItems(row.highlights as string[])
          ? (row.highlights as string[]).filter(isNonEmptyString)
          : [...base.highlights],
      };
    })
    .filter((row) => isNonEmptyString(row.airline) && isNonEmptyString(row.airlineCode));
}

function mergeFaqs(
  staticRows: StaticDestinationRecord["faqs"],
  liveRows: DeepPartial<StaticDestinationRecord["faqs"]> | undefined
): StaticDestinationRecord["faqs"] {
  if (!hasItems(liveRows as StaticDestinationRecord["faqs"])) return clone(staticRows);

  return (liveRows as Array<DeepPartial<StaticDestinationRecord["faqs"][number]>>)
    .map((row, index) => {
      const fallback = staticRows[index];
      const base = fallback ?? { q: "", a: "" };

      return {
        q: pickString(base.q, row.q),
        a: pickString(base.a, row.a),
      };
    })
    .filter((row) => isNonEmptyString(row.q) && isNonEmptyString(row.a));
}

function mergeNearbyRoutes(
  staticRows: StaticDestinationRecord["nearbyRoutes"],
  liveRows: DeepPartial<StaticDestinationRecord["nearbyRoutes"]> | undefined
): StaticDestinationRecord["nearbyRoutes"] {
  if (!hasItems(liveRows as StaticDestinationRecord["nearbyRoutes"])) return clone(staticRows);

  return (liveRows as Array<DeepPartial<StaticDestinationRecord["nearbyRoutes"][number]>>)
    .map((row, index) => {
      const fallback = staticRows[index];
      const base = fallback ?? { city: "", code: "", href: "", tag: undefined };

      return {
        city: pickString(base.city, row.city),
        code: pickString(base.code, row.code),
        href: pickString(base.href, row.href),
        tag: pickNullableString(base.tag, row.tag) ?? undefined,
      };
    })
    .filter((row) => isNonEmptyString(row.city) && isNonEmptyString(row.code) && isNonEmptyString(row.href));
}

function mergeDealsSection(
  staticDeals: StaticDestinationRecord["deals"],
  liveDeals: DeepPartial<StaticDestinationRecord["deals"]> | undefined,
  preferLive: boolean
): StaticDestinationRecord["deals"] {
  const merged = clone(staticDeals);

  for (const tab of DEAL_TABS) {
    const staticTab = staticDeals[tab] ?? [];
    const liveTab = liveDeals?.[tab];

    if (!hasItems(liveTab as typeof staticTab)) {
      merged[tab] = clone(staticTab);
      continue;
    }

    const liveMerged = (liveTab as Array<DeepPartial<typeof staticTab[number]>>)
      .map((liveDeal, index) => mergeDeal(staticTab[index], liveDeal))
      .filter((deal) => isNonEmptyString(deal.from) && isNonEmptyString(deal.to) && deal.price > 0);

    merged[tab] =
      preferLive || !hasItems(staticTab)
        ? liveMerged
        : liveMerged.length > 0
          ? liveMerged
          : clone(staticTab);
  }

  return merged;
}

function mergeFareTableSection(
  staticRows: StaticDestinationRecord["fareTable"],
  liveRows: DeepPartial<StaticDestinationRecord["fareTable"]> | undefined,
  preferLive: boolean
): StaticDestinationRecord["fareTable"] {
  if (!hasItems(liveRows as StaticDestinationRecord["fareTable"])) return clone(staticRows);

  const merged = (liveRows as Array<DeepPartial<StaticDestinationRecord["fareTable"][number]>>)
    .map((row, index) => mergeFareEntry(staticRows[index], row))
    .filter((row) => isNonEmptyString(row.from1) && isNonEmptyString(row.to1) && row.price > 0);

  if (!merged.length && !preferLive) return clone(staticRows);
  return merged.length ? merged : clone(staticRows);
}

export function mergeDestinationData(
  staticRecord: StaticDestinationRecord,
  liveRecord?: MergeableRecord,
  options: MergeDestinationDataOptions = {}
): StaticDestinationRecord {
  const preferLive = options.preferLive ?? true;

  if (!liveRecord) {
    return clone(staticRecord);
  }

  return {
    slug: staticRecord.slug,
    origin: mergeShallowObject(staticRecord.origin as unknown as Record<string, unknown>, liveRecord.origin) as unknown as typeof staticRecord.origin,
    dest: mergeShallowObject(staticRecord.dest as unknown as Record<string, unknown>, liveRecord.dest) as unknown as typeof staticRecord.dest,
    heroNote: pickString(staticRecord.heroNote ?? "", liveRecord.heroNote) || undefined,

    deals: mergeDealsSection(staticRecord.deals, liveRecord.deals, preferLive),
    fareTable: mergeFareTableSection(staticRecord.fareTable, liveRecord.fareTable, preferLive),

    airlines: mergeAirlines(staticRecord.airlines, liveRecord.airlines),
    priceMonths: mergePriceMonths(staticRecord.priceMonths, liveRecord.priceMonths),
    heatmap: mergeHeatmap(staticRecord.heatmap, liveRecord.heatmap),
    reviews: mergeReviews(staticRecord.reviews, liveRecord.reviews),
    weather: mergeWeather(staticRecord.weather, liveRecord.weather),
    faqs: mergeFaqs(staticRecord.faqs, liveRecord.faqs),
    nearbyRoutes: mergeNearbyRoutes(staticRecord.nearbyRoutes, liveRecord.nearbyRoutes),
  };
}

export default mergeDestinationData;
