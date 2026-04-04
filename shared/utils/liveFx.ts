import { FX_RATES, FxQuote } from "../config/fx.js";
import { getStore } from "./store.js";

type CacheEntry = {
  rate: number;
  expiresAt: number;
  asOf: string;
};

// L1: Global in-memory cache (process-local)
const fxCache = new Map<string, CacheEntry>();
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;

// Keeps track of ongoing requests to deduplicate concurrent calls
const pendingRequests = new Map<string, Promise<number>>();

/**
 * Fetch live exchange rate from USD to THB using a public no-key API.
 * Uses a strict timeout.
 */
async function fetchLiveRate(base: string, quote: string): Promise<number> {
  const url = `https://open.er-api.com/v6/latest/${base.toUpperCase()}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout for fast serverless cold starts
  
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`FX API responded with status ${res.status}`);
    }
    
    const data = await res.json();
    if (data.result !== "success" || typeof data.rates !== "object") {
      throw new Error("Invalid FX API response format");
    }
    
    const rate = data.rates[quote.toUpperCase()];
    if (typeof rate !== "number" || rate <= 0) {
      throw new Error(`Invalid rate received for ${quote}`);
    }
    
    return rate;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Get the current exchange rate, prioritizing live fetch, then shared store, then local cache, then static fallback.
 */
export async function getLiveFxRate(
  baseCurrency: string = "USD",
  quoteCurrency: string = "THB"
): Promise<FxQuote> {
  const base = baseCurrency.toUpperCase();
  const quote = quoteCurrency.toUpperCase();
  const storeKey = `cache:fx:${base}-${quote}`;
  const localKey = `${base}-${quote}`;
  
  const staticFallbackRate = FX_RATES[base]?.[quote] ?? 34; // standard fallback
  
  // If base and quote are same, no logic needed
  if (base === quote) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: 1,
      source: "fallback_static",
      asOf: new Date().toISOString()
    };
  }

  const now = Date.now();

  // 1. Check L1 Cache (Process-local)
  const l1Cached = fxCache.get(localKey);
  if (l1Cached && l1Cached.expiresAt > now) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: l1Cached.rate,
      source: "live",
      asOf: l1Cached.asOf,
    };
  }

  // 2. Check L2 Cache (Shared Store)
  const store = getStore();
  try {
    const l2Cached = await store.get<CacheEntry>(storeKey);
    if (l2Cached && l2Cached.expiresAt > now) {
      // Backfill L1
      fxCache.set(localKey, l2Cached);
      return {
        baseCurrency: base,
        quoteCurrency: quote,
        rate: l2Cached.rate,
        source: "live",
        asOf: l2Cached.asOf,
      };
    }
  } catch (err) {
    console.warn(`[LiveFx] Shared store read failed for ${storeKey}`, err);
  }

  // 3. Fetch Live
  try {
    // Deduplicate concurrent requests
    let fetchPromise = pendingRequests.get(localKey);
    if (!fetchPromise) {
      fetchPromise = fetchLiveRate(base, quote).finally(() => {
        pendingRequests.delete(localKey);
      });
      pendingRequests.set(localKey, fetchPromise);
    }
    
    const liveRate = await fetchPromise;
    const isoNow = new Date().toISOString();
    const entry: CacheEntry = {
      rate: liveRate,
      expiresAt: now + CACHE_TTL_MS,
      asOf: isoNow,
    };
    
    // Update L1
    fxCache.set(localKey, entry);
    // Update L2 (Background, soft-fail)
    store.set(storeKey, entry, CACHE_TTL_SECONDS).catch(err => {
        console.warn(`[LiveFx] Shared store write failed for ${storeKey}`, err);
    });
    
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: liveRate,
      source: "live",
      asOf: isoNow,
    };
  } catch (error) {
    console.warn(`[LiveFx] Failed to fetch live rate for ${localKey}, falling back`, error);
    
    // 4. Stale cache fallback (L1)
    if (l1Cached) {
      return {
        baseCurrency: base,
        quoteCurrency: quote,
        rate: l1Cached.rate,
        source: "stale_cache",
        asOf: l1Cached.asOf,
      };
    }
    
    // 5. Static fallback
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: staticFallbackRate,
      source: "fallback_static",
      asOf: null,
    };
  }
}
