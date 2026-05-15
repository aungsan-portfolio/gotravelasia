import { getStore, type IStore } from "../../shared/utils/store.js";

// ─── Configuration ─────────────────────────────────────────────────

const HOTEL_CACHE_NAMESPACE = "hotel:search";
const HOTEL_DETAIL_NAMESPACE = "hotel:detail";

/** L2 TTL for hotel search results (Redis/KV) */
const L2_SEARCH_TTL_SECONDS = Number(process.env.HOTEL_CACHE_TTL_SECONDS) || 1800; // 30 min

/** Maximum random jitter added to L2 TTL to prevent cache stampede (seconds) */
const L2_TTL_JITTER_MAX_SECONDS = Number(process.env.HOTEL_CACHE_JITTER_SECONDS) || 120; // ±0-2 min

/** L1 TTL for process-local cache (shorter to allow fresher data) */
const L1_TTL_MS = Number(process.env.HOTEL_CACHE_L1_TTL_MS) || 5 * 60 * 1000; // 5 min

/** Maximum L1 entries before eviction */
const L1_MAX_SIZE = Number(process.env.HOTEL_CACHE_L1_MAX_SIZE) || 200;

/** Stale-while-revalidate window (ms) — serve stale data while refreshing */
const STALE_WHILE_REVALIDATE_MS = 60 * 1000; // 1 min grace period after L1 expires

// ─── L1 Cache (Process-Local) ──────────────────────────────────────

interface L1Entry<T = unknown> {
  data: T;
  expiresAt: number;
  staleUntil: number;
  hits: number;
  createdAt: number;
}

const l1Cache = new Map<string, L1Entry>();

// ─── Cache Stats ───────────────────────────────────────────────────

interface HotelCacheStats {
  l1Hits: number;
  l1Misses: number;
  l1StaleHits: number;
  l2Hits: number;
  l2Misses: number;
  l2Errors: number;
  sets: number;
  invalidations: number;
  evictions: number;
}

const stats: HotelCacheStats = {
  l1Hits: 0,
  l1Misses: 0,
  l1StaleHits: 0,
  l2Hits: 0,
  l2Misses: 0,
  l2Errors: 0,
  sets: 0,
  invalidations: 0,
  evictions: 0,
};

// ─── Key Builders ──────────────────────────────────────────────────

export interface HotelSearchCacheKeyParams {
  ltCityId: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  page: number;
  sort: string;
}

export function buildHotelSearchCacheKey(params: HotelSearchCacheKeyParams): string {
  return `${HOTEL_CACHE_NAMESPACE}:${params.ltCityId}:${params.checkIn}:${params.checkOut}:${params.adults}:${params.rooms}:${params.page}:${params.sort}`;
}

export function buildHotelDetailCacheKey(hotelId: string, city: string): string {
  return `${HOTEL_DETAIL_NAMESPACE}:${city}:${hotelId}`;
}

function buildCityInvalidationPattern(city: string): string {
  return `${HOTEL_CACHE_NAMESPACE}:${city}:`;
}

// ─── L1 Eviction (LRU-style) ──────────────────────────────────────

function evictL1IfNeeded(): void {
  if (l1Cache.size <= L1_MAX_SIZE) return;

  const now = Date.now();

  // First pass: remove expired entries
  for (const [key, entry] of l1Cache) {
    if (entry.staleUntil < now) {
      l1Cache.delete(key);
    }
  }

  // If still over capacity, remove least-recently-used (lowest hits + oldest)
  if (l1Cache.size > L1_MAX_SIZE) {
    const entries = Array.from(l1Cache.entries())
      .sort(([, a], [, b]) => {
        // Score: lower = more evictable
        const scoreA = a.hits * 0.3 + (a.expiresAt - now) * 0.7;
        const scoreB = b.hits * 0.3 + (b.expiresAt - now) * 0.7;
        return scoreA - scoreB;
      });

    const toRemove = entries.slice(0, l1Cache.size - L1_MAX_SIZE + 10);
    for (const [key] of toRemove) {
      l1Cache.delete(key);
      stats.evictions++;
    }
  }
}

// ─── Core Cache Operations ─────────────────────────────────────────

export interface HotelCacheGetResult<T = unknown> {
  data: T;
  source: "l1" | "l1_stale" | "l2";
  age: number; // ms since cached
}

/**
 * Get a value from the hotel cache (L1 → L2 fallback).
 * Supports stale-while-revalidate: returns stale L1 data within the grace window.
 */
export async function hotelCacheGet<T = unknown>(
  key: string,
): Promise<HotelCacheGetResult<T> | null> {
  const now = Date.now();

  // 1. Check L1 (process-local)
  const l1Entry = l1Cache.get(key) as L1Entry<T> | undefined;
  if (l1Entry) {
    if (l1Entry.expiresAt > now) {
      // Fresh hit
      l1Entry.hits++;
      stats.l1Hits++;
      return {
        data: l1Entry.data,
        source: "l1",
        age: now - l1Entry.createdAt,
      };
    }

    if (l1Entry.staleUntil > now) {
      // Stale but within revalidation window
      l1Entry.hits++;
      stats.l1StaleHits++;
      return {
        data: l1Entry.data,
        source: "l1_stale",
        age: now - l1Entry.createdAt,
      };
    }

    // Fully expired
    l1Cache.delete(key);
  }

  stats.l1Misses++;

  // 2. Check L2 (Redis/KV via shared store)
  try {
    const store = getStore();
    const l2Value = await store.get<T>(key);

    if (l2Value !== null && l2Value !== undefined) {
      stats.l2Hits++;

      // Backfill L1
      l1Cache.set(key, {
        data: l2Value,
        expiresAt: now + L1_TTL_MS,
        staleUntil: now + L1_TTL_MS + STALE_WHILE_REVALIDATE_MS,
        hits: 1,
        createdAt: now,
      });
      evictL1IfNeeded();

      return {
        data: l2Value,
        source: "l2",
        age: 0, // Unknown exact L2 age without metadata
      };
    }

    stats.l2Misses++;
  } catch (error) {
    stats.l2Errors++;
    console.error(`[HotelCache:L2:ERROR] key=${key}`, error instanceof Error ? error.message : error);
  }

  return null;
}

/**
 * Set a value in both L1 and L2 caches.
 * L2 TTL includes random jitter to prevent cache stampede (thundering herd).
 */
export async function hotelCacheSet<T = unknown>(
  key: string,
  data: T,
  ttlSeconds: number = L2_SEARCH_TTL_SECONDS,
): Promise<void> {
  const now = Date.now();
  stats.sets++;

  // Apply random jitter to L2 TTL to prevent all keys expiring simultaneously
  const jitter = Math.floor(Math.random() * L2_TTL_JITTER_MAX_SECONDS);
  const effectiveL2Ttl = ttlSeconds + jitter;

  // Set L1 (no jitter needed — short-lived, process-local)
  l1Cache.set(key, {
    data,
    expiresAt: now + L1_TTL_MS,
    staleUntil: now + L1_TTL_MS + STALE_WHILE_REVALIDATE_MS,
    hits: 0,
    createdAt: now,
  });
  evictL1IfNeeded();

  // Set L2 (fire-and-forget with error handling)
  try {
    const store = getStore();
    await store.set(key, data, effectiveL2Ttl);
  } catch (error) {
    stats.l2Errors++;
    console.error(`[HotelCache:L2:SET:ERROR] key=${key}`, error instanceof Error ? error.message : error);
  }
}

/**
 * Invalidate a specific cache key from both L1 and L2.
 */
export async function hotelCacheInvalidate(key: string): Promise<void> {
  stats.invalidations++;

  l1Cache.delete(key);

  try {
    const store = getStore();
    await store.delete(key);
  } catch (error) {
    console.error(`[HotelCache:INVALIDATE:ERROR] key=${key}`, error instanceof Error ? error.message : error);
  }
}

/**
 * Invalidate all cache entries for a city (L1 only — L2 relies on TTL).
 * Useful when hotel data is known to be stale for a city.
 */
export function hotelCacheInvalidateCity(cityIdentifier: string): void {
  const prefix = buildCityInvalidationPattern(cityIdentifier);
  let count = 0;

  for (const key of l1Cache.keys()) {
    if (key.startsWith(prefix) || key.includes(`:${cityIdentifier}:`)) {
      l1Cache.delete(key);
      count++;
    }
  }

  if (count > 0) {
    stats.invalidations += count;
    console.log(`[HotelCache] Invalidated ${count} L1 entries for city="${cityIdentifier}"`);
  }
}

// ─── Cache Warming ─────────────────────────────────────────────────

export interface HotelCacheWarmParams {
  ltCityId: number;
  checkIn: string;
  checkOut: string;
  adults?: number;
  rooms?: number;
  sort?: string;
}

/**
 * Pre-warm the cache for a given search.
 * Typically called after a successful search to ensure subsequent requests are fast.
 * This is a no-op if data already exists in cache.
 */
export async function hotelCacheWarm(
  params: HotelCacheWarmParams,
  fetchFn: () => Promise<unknown>,
): Promise<void> {
  const key = buildHotelSearchCacheKey({
    ltCityId: params.ltCityId,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adults: params.adults ?? 2,
    rooms: params.rooms ?? 1,
    page: 1,
    sort: params.sort ?? "best",
  });

  const existing = await hotelCacheGet(key);
  if (existing) return; // Already cached

  try {
    const data = await fetchFn();
    await hotelCacheSet(key, data);
    console.log(`[HotelCache:WARM] Warmed key=${key}`);
  } catch (error) {
    console.error(`[HotelCache:WARM:ERROR] key=${key}`, error instanceof Error ? error.message : error);
  }
}

// ─── Cache Stats / Diagnostics ─────────────────────────────────────

export function getHotelCacheStats(): HotelCacheStats & { l1Size: number; hitRate: string } {
  const totalRequests = stats.l1Hits + stats.l1StaleHits + stats.l2Hits + stats.l2Misses;
  const totalHits = stats.l1Hits + stats.l1StaleHits + stats.l2Hits;
  const hitRate = totalRequests > 0
    ? `${((totalHits / totalRequests) * 100).toFixed(1)}%`
    : "N/A";

  return {
    ...stats,
    l1Size: l1Cache.size,
    hitRate,
  };
}

export function resetHotelCacheStats(): void {
  stats.l1Hits = 0;
  stats.l1Misses = 0;
  stats.l1StaleHits = 0;
  stats.l2Hits = 0;
  stats.l2Misses = 0;
  stats.l2Errors = 0;
  stats.sets = 0;
  stats.invalidations = 0;
  stats.evictions = 0;
}

/**
 * Clear all L1 cache entries. Useful for testing or manual cache bust.
 */
export function clearL1Cache(): void {
  l1Cache.clear();
  console.log("[HotelCache] L1 cache cleared");
}
