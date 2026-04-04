import { getStore } from "../../shared/utils/store.js";

const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes

/**
 * Shared cache utility for Express server.
 * Uses SharedStore (Redis/KV).
 */
export async function getCached(key: string): Promise<any | null> {
  try {
    const store = getStore();
    const data = await store.get(key);
    if (data) {
      console.log(`[Cache:HIT] ${key}`);
      return data;
    }
    console.log(`[Cache:MISS] ${key}`);
    return null;
  } catch (err) {
    console.error(`[Cache:Error] getCached failed for ${key}:`, err);
    return null;
  }
}

export async function setCache(key: string, data: any): Promise<void> {
  try {
    const store = getStore();
    await store.set(key, data, CACHE_TTL_SECONDS);
  } catch (err) {
    console.error(`[Cache:Error] setCache failed for ${key}:`, err);
  }
}
