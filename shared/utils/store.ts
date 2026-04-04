import { Redis } from "@upstash/redis";

export interface IStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

export class MemoryStore implements IStore {
  private cache = new Map<string, { value: any; expiresAt: number }>();
  private rateLimits = new Map<string, { count: number; resetAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Number.MAX_SAFE_INTEGER;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const now = Date.now();
    const existing = this.rateLimits.get(key);
    if (!existing || existing.resetAt <= now) {
      const entry = { count: 1, resetAt: now + windowMs };
      this.rateLimits.set(key, entry);
      return entry;
    }
    existing.count++;
    return existing;
  }
}

export class RedisStore implements IStore {
  private client: Redis;

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.client.get<T>(key);
    } catch (e) {
      console.error("[RedisStore:get] Error:", e);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, { ex: ttlSeconds });
      } else {
        await this.client.set(key, value);
      }
    } catch (e) {
      console.error("[RedisStore:set] Error:", e);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (e) {
      console.error("[RedisStore:delete] Error:", e);
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    try {
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.pexpire(key, windowMs);
      }
      const ttl = await this.client.pttl(key);
      const now = Date.now();
      return { 
        count, 
        resetAt: now + (ttl > 0 ? ttl : windowMs) 
      };
    } catch (e) {
      console.error("[RedisStore:increment] Error:", e);
      return { count: 1, resetAt: Date.now() + windowMs };
    }
  }
}

let store: IStore | null = null;
const IS_PROD = process.env.NODE_ENV === "production" || !!process.env.VERCEL_URL;

export function getStore(): IStore {
  if (store) return store;

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    if (IS_PROD) {
      console.log("[Store] Initializing SharedStore (Production KV/Redis)");
    } else {
      console.log("[Store] Initializing SharedStore (Development Shared)");
    }
    store = new RedisStore(url, token);
  } else {
    if (IS_PROD) {
      console.warn("[Store] WARNING: Shared Store configuration missing in production! Falling back to process-local MemoryStore (Non-persistent).");
    } else {
      console.log("[Store] Initializing MemoryStore (Local Development)");
    }
    store = new MemoryStore();
  }

  return store;
}
