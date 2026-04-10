import type { PriceCalendarRequest } from "../../../shared/flights/priceCalendar.types.js";
import { searchCheapestDates } from "../amadeusService.js";

export type SourceName = "travelpayouts" | "amadeus" | "bot_json";

export interface RawPriceRecord {
  date: string;
  amount: number;
  currency: string;
  source: SourceName;
  estimated?: boolean;
}

export interface SourceFetchResult {
  source: SourceName;
  ok: boolean;
  records: RawPriceRecord[];
  error?: string;
  timedOut?: boolean;
}

const inflight = new Map<string, Promise<SourceFetchResult[]>>();

async function fetchWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<{ ok: true; data: T } | { ok: false; timedOut: boolean; error: string }> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
    });
    const data = await Promise.race([fn(), timeoutPromise]);
    return { ok: true, data: data as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return { ok: false, timedOut: message === "TIMEOUT", error: message };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchAmadeusRecords(input: PriceCalendarRequest): Promise<SourceFetchResult> {
  const response = await fetchWithTimeout(
    () => searchCheapestDates(input.origin, input.destination),
    4_000,
  );
  if (!response.ok || !response.data) {
    return { source: "amadeus", ok: false, records: [], error: response.ok ? "no_data" : response.error, timedOut: response.ok ? false : response.timedOut };
  }

  const records: RawPriceRecord[] = [];
  for (const item of response.data) {
    const amount = Number.parseFloat(item.price?.total ?? "0");
    if (!Number.isFinite(amount) || amount <= 0) continue;
    records.push({
      date: item.departureDate,
      amount,
      currency: input.currency ?? "USD",
      source: "amadeus",
    });
  }

  return { source: "amadeus", ok: true, records };
}

async function fetchTravelPayoutsRecords(input: PriceCalendarRequest): Promise<SourceFetchResult> {
  const qs = new URLSearchParams({
    origin: input.origin,
    destination: input.destination,
    month: input.departStartDate.slice(0, 7),
    currency: (input.currency ?? "USD").toLowerCase(),
  });

  const response = await fetchWithTimeout(
    async () => {
      const res = await fetch(`${process.env.INTERNAL_BASE_URL ?? ""}/api/calendar-prices?${qs.toString()}`);
      if (!res.ok) throw new Error(`travelpayouts_proxy_${res.status}`);
      return res.json();
    },
    4_500,
  );

  if (!response.ok || !response.data?.data) {
    return { source: "travelpayouts", ok: false, records: [], error: response.ok ? "no_data" : response.error, timedOut: response.ok ? false : response.timedOut };
  }

  const records: RawPriceRecord[] = [];
  for (const [date, entry] of Object.entries(response.data.data as Record<string, { price?: number; currency?: string }>)) {
    const amount = entry.price ?? 0;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    records.push({
      date,
      amount,
      currency: (entry.currency ?? input.currency ?? "USD").toUpperCase(),
      source: "travelpayouts",
    });
  }

  return { source: "travelpayouts", ok: true, records };
}

export async function fetchCalendarSources(input: PriceCalendarRequest, dedupKey: string): Promise<SourceFetchResult[]> {
  if (inflight.has(dedupKey)) return inflight.get(dedupKey)!;

  const promise = (async () => {
    const [tp, amadeus] = await Promise.all([
      fetchTravelPayoutsRecords(input),
      fetchAmadeusRecords(input),
    ]);
    return [tp, amadeus];
  })();

  inflight.set(dedupKey, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(dedupKey);
  }
}
