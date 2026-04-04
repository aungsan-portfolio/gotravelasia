import { getStore } from "../../shared/utils/store.js";

const l1Cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes
const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;

/**
 * Shared cache utility for Vercel functions.
 * Uses SharedStore (Redis/KV) as L2 with process-local L1 fallback.
 */
export async function getCached(key: string): Promise<any | null> {
  const now = Date.now();

  // 1. Check L1 (Process-local)
  const entry = l1Cache.get(key);
  if (entry && entry.expiresAt > now) {
    console.log(`[Cache:L1:HIT] ${key}`);
    return entry.data;
  }

  // 2. Check L2 (Shared Store)
  try {
    const store = getStore();
    const sharedValue = await store.get<any>(key);
    if (sharedValue) {
      console.log(`[Cache:L2:HIT] ${key}`);
      // Backfill L1
      l1Cache.set(key, { data: sharedValue, expiresAt: now + CACHE_TTL_MS });
      return sharedValue;
    }
    console.log(`[Cache:L2:MISS] ${key}`);
  } catch (err) {
    console.error(`[API:Cache] L2 read failed for ${key}:`, err);
  }

  return null;
}

export async function setCache(key: string, data: any): Promise<void> {
  const expiresAt = Date.now() + CACHE_TTL_MS;

  // Update L1
  l1Cache.set(key, { data, expiresAt });

  // Update L2 (Background)
  try {
    const store = getStore();
    await store.set(key, data, CACHE_TTL_SECONDS);
  } catch (err) {
    console.error(`[API:Cache] L2 write failed for ${key}:`, err);
  }
}
