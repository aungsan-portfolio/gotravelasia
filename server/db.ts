import { eq, and, asc, isNull, lte, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, flightPriceAlerts, InsertFlightPriceAlert, subscribers, destinations, emailQueue } from "../drizzle/schema.js";
import { ENV } from "./_core/env.js";

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
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    if (existing.length > 0) {
      await db.update(users)
        .set({
          name: user.name,
          email: user.email,
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        })
        .where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values({
        ...user,
        role: user.role || "user",
      });
    }
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

export async function updateAlertPrice(id: number, price: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(flightPriceAlerts)
      .set({ lastNotifiedPrice: price, updatedAt: new Date() })
      .where(eq(flightPriceAlerts.id, id));
  } catch (err) {
    console.error(`[Database] Failed to update alert price for ${id}:`, err);
  }
}

export async function touchPriceAlerts(ids: number[]) {
  if (!ids.length) return;

  const db = await getDb();
  if (!db) return;

  try {
    await db.update(flightPriceAlerts)
      .set({ updatedAt: new Date() })
      .where(inArray(flightPriceAlerts.id, ids));
  } catch (err) {
    console.error("[Database] Failed to touch price alerts:", err);
  }
}

export async function createPriceAlert(alert: InsertFlightPriceAlert): Promise<{ success: boolean; alreadyExists: boolean }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create alert: database not available");
    return { success: false, alreadyExists: false };
  }

  try {
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
    console.error("[Database] Failed to save flight price alert:", error);
    throw error;
  }
}

/**
 * Newsletter subscriber (api/newsletter.ts)
 */
export async function saveNewsletterSubscriber(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Basic check for existing
    await db.execute(sql`
      INSERT IGNORE INTO newsletterSubscribers (email, createdAt)
      VALUES (${email}, NOW())
    `);
  } catch (err) {
    console.error("[Database] Failed to save newsletter subscriber:", err);
  }
}

/**
 * Subscribers — email-only signups from PriceAlertPopup (ခ flow).
 * Returns { success: boolean, alreadyExists: boolean }
 */
export async function saveSubscriber(
  values: { email: string; source?: string }
): Promise<{ success: boolean; alreadyExists: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, values.email))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }

    await db.insert(subscribers).values({
      email: values.email,
      source: values.source || "popup",
      isActive: true,
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

export async function ensureEmailQueueTable(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS emailQueue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      toEmail VARCHAR(320) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      htmlContent TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0,
      lastError TEXT NULL,
      scheduledAt TIMESTAMP NULL,
      sentAt TIMESTAMP NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

export async function enqueueEmail(values: {
  toEmail: string;
  subject: string;
  htmlContent: string;
  scheduledAt?: Date | null;
}) {
  const db = await getDb();
  if (!db) return false;

  await db.insert(emailQueue).values({
    toEmail: values.toEmail,
    subject: values.subject,
    htmlContent: values.htmlContent,
    status: "pending",
    scheduledAt: values.scheduledAt ?? null,
    attempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return true;
}

export async function getDueEmailQueueItems(batchSize: number, maxAttempts: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db.select().from(emailQueue).where(
    and(
      or(eq(emailQueue.status, "pending"), eq(emailQueue.status, "pending_retry")),
      lte(emailQueue.attempts, maxAttempts - 1),
      or(isNull(emailQueue.scheduledAt), lte(emailQueue.scheduledAt, now))
    )
  ).orderBy(asc(emailQueue.id)).limit(batchSize);
}

export async function claimEmailQueueItem(id: number, expectedAttempts: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db.execute(sql`
    UPDATE emailQueue
    SET status = 'processing', updatedAt = NOW()
    WHERE id = ${id}
      AND status IN ('pending', 'pending_retry')
      AND attempts = ${expectedAttempts}
  `);

  const affectedRows = Number((result as any)?.[0]?.affectedRows ?? 0);
  return affectedRows > 0;
}

export async function markEmailQueueSent(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(emailQueue).set({
    status: "sent",
    sentAt: new Date(),
    lastError: null,
    updatedAt: new Date(),
  }).where(eq(emailQueue.id, id));
}

export async function markEmailQueueAttemptFailed(params: {
  id: number;
  attempts: number;
  error: string;
  maxAttempts: number;
  retryDelayMinutes: number;
}) {
  const db = await getDb();
  if (!db) return;

  const nextAttempts = params.attempts + 1;
  const hasAttemptsLeft = nextAttempts < params.maxAttempts;
  const retryAt = hasAttemptsLeft
    ? new Date(Date.now() + params.retryDelayMinutes * 60 * 1000)
    : null;

  await db.update(emailQueue).set({
    status: hasAttemptsLeft ? "pending_retry" : "failed",
    attempts: nextAttempts,
    scheduledAt: retryAt,
    lastError: params.error,
    updatedAt: new Date(),
  }).where(eq(emailQueue.id, params.id));
}
