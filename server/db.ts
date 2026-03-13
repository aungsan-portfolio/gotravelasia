import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, flightPriceAlerts, InsertFlightPriceAlert, subscribers, destinations } from "../drizzle/schema";
import { or } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

export async function createPriceAlert(alert: InsertFlightPriceAlert): Promise<{ success: boolean; alreadyExists: boolean }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create alert: database not available");
    return { success: false, alreadyExists: false };
  }

  try {
    // Check if exactly same active alert exists
    const existing = await db.select().from(flightPriceAlerts).where(
      and(
        eq(flightPriceAlerts.email, alert.email),
        eq(flightPriceAlerts.origin, alert.origin),
        eq(flightPriceAlerts.destination, alert.destination),
        eq(flightPriceAlerts.departDate, alert.departDate),
        eq(flightPriceAlerts.isActive, true)
      )
    ).limit(1);

    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }

    await db.insert(flightPriceAlerts).values({
      ...alert,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, alreadyExists: false };
  } catch (error) {
    console.error("[Database] Failed to create price alert:", error);
    throw error;
  }
}

export async function getActivePriceAlerts() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(flightPriceAlerts).where(eq(flightPriceAlerts.isActive, true));
  } catch (err) {
    console.error("[Database] Failed to get active alerts:", err);
    return [];
  }
}

export async function updateAlertPrice(id: number, latestPrice: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(flightPriceAlerts)
      .set({ lastNotifiedPrice: latestPrice, updatedAt: new Date() })
      .where(eq(flightPriceAlerts.id, id));
  } catch (err) {
    console.error("[Database] Failed to update alert price:", err);
  }
}

/**
 * Save a subscriber email for the (ခ) Two-Flow.
 * Used when user signs up from a page with no search context.
 * Upserts to avoid duplicate entries.
 */
export async function saveSubscriber(
  email: string,
  source: string = "popup"
): Promise<{ success: boolean; alreadyExists: boolean }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save subscriber: database not available");
    return { success: false, alreadyExists: false };
  }

  try {
    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }

    await db.insert(subscribers).values({
      email,
      source,
      isActive: true,
      createdAt: new Date(),
    });

    return { success: true, alreadyExists: false };
  } catch (error) {
    console.error("[Database] Failed to save subscriber:", error);
    throw error;
  }
}

export async function getDestinationBySlugOrCode(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const results = await db.select().from(destinations)
      .where(
        or(
          eq(destinations.slug, key.toLowerCase()),
          eq(destinations.iataCode, key.toUpperCase())
        )
      )
      .limit(1);
    return results.length > 0 ? results[0] : undefined;
  } catch (err) {
    console.error(`[Database] Failed to get destination for ${key}:`, err);
    return undefined;
  }
}
