import type {
  AirlineSummary,
  Deal,
  DestinationLandingApiResponse,
  FareTableEntry,
} from "@/types/destination";

export function normalizeDeals(deals?: Deal[]): Deal[] {
  if (!deals?.length) return [];
  return deals.map((d) => ({
    ...d,
    a1: d.a1 ?? null,
    stops: Number.isFinite(d.stops) ? d.stops : 0,
    duration: d.duration || "—",
    price: Number.isFinite(d.price) ? d.price : 0,
  }));
}

export function normalizeFareRows(rows?: FareTableEntry[]): FareTableEntry[] {
  if (!rows?.length) return [];
  return rows.map((r) => ({
    ...r,
    a1: r.a1 ?? null,
    dur1: r.dur1 ?? null,
    from2: r.from2 ?? null,
    to2: r.to2 ?? null,
    d2: r.d2 ?? null,
    a2: r.a2 ?? null,
    s2: r.s2 ?? null,
    dur2: r.dur2 ?? null,
  }));
}

export function normalizeAirlines(
  airlines?: AirlineSummary[],
): AirlineSummary[] {
  if (!airlines?.length) return [];
  return airlines.map((a) => ({
    ...a,
    tags: a.tags ?? [],
  }));
}

export function normalizeLiveData(
  data?: DestinationLandingApiResponse | null,
) {
  if (!data) return null;

  return {
    ...data,
    deals: {
      cheapest: normalizeDeals(data.deals.cheapest),
      fastest: normalizeDeals(data.deals.fastest),
      bestValue: normalizeDeals(data.deals.bestValue),
      weekend: normalizeDeals(data.deals.weekend),
      premium: normalizeDeals(data.deals.premium),
    },
    fareTable: normalizeFareRows(data.fareTable),
    airlines: normalizeAirlines(data.airlines),
  };
}
