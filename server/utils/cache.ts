type CacheEntry = { data: any; expiresAt: number };
const priceCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000;

export function getCached(key: string): any | null {
  const entry = priceCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  priceCache.delete(key);
  return null;
}

export function setCache(key: string, data: any): void {
  priceCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}
