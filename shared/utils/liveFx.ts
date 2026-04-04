import { FX_RATES, FxQuote } from "../config/fx.js";

type CacheEntry = {
  rate: number;
  expiresAt: number;
  asOf: string;
};

// Global in-memory cache
const fxCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
 * Get the current exchange rate, prioritizing live fetch, then stale cache, then static fallback.
 */
export async function getLiveFxRate(
  baseCurrency: string = "USD",
  quoteCurrency: string = "THB"
): Promise<FxQuote> {
  const base = baseCurrency.toUpperCase();
  const quote = quoteCurrency.toUpperCase();
  const cacheKey = `${base}-${quote}`;
  
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

  // 1. Check valid cache
  const cached = fxCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: cached.rate,
      source: "live", // It was live at the time of caching within valid TTL window
      asOf: cached.asOf,
    };
  }

  // 2. Fetch Live
  try {
    // Deduplicate concurrent requests
    let fetchPromise = pendingRequests.get(cacheKey);
    if (!fetchPromise) {
      fetchPromise = fetchLiveRate(base, quote).finally(() => {
        pendingRequests.delete(cacheKey);
      });
      pendingRequests.set(cacheKey, fetchPromise);
    }
    
    const liveRate = await fetchPromise;
    const isoNow = new Date().toISOString();
    
    fxCache.set(cacheKey, {
      rate: liveRate,
      expiresAt: now + CACHE_TTL_MS,
      asOf: isoNow,
    });
    
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: liveRate,
      source: "live",
      asOf: isoNow,
    };
  } catch (error) {
    console.warn(`[LiveFx] Failed to fetch live rate for ${cacheKey}, falling back`, error);
    
    // 3. Stale cache fallback
    if (cached) {
      return {
        baseCurrency: base,
        quoteCurrency: quote,
        rate: cached.rate,
        source: "stale_cache",
        asOf: cached.asOf,
      };
    }
    
    // 4. Static fallback
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: staticFallbackRate,
      source: "fallback_static",
      asOf: null,
    };
  }
}
