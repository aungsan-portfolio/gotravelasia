import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, isNull } from "drizzle-orm";
import { int, mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";

// ── Inline schema ──────────────────────────────────────────────
const flightPriceAlerts = mysqlTable("flightPriceAlerts", {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    origin: varchar("origin", { length: 3 }).notNull(),
    destination: varchar("destination", { length: 3 }).notNull(),
    departDate: varchar("departDate", { length: 10 }),             // nullable for watchlist
    returnDate: varchar("returnDate", { length: 10 }),
    targetPrice: int("targetPrice").notNull(),
    lastNotifiedPrice: int("lastNotifiedPrice"),
    currency: varchar("currency", { length: 3 }).default("THB").notNull(),
    routeId: varchar("routeId", { length: 20 }),                   // e.g. "rgn-bkk"
    source: varchar("source", { length: 20 }).notNull().default("track_button"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ── Parse DATABASE_URL ───────────────────────────────────────────
function parseMySQLUrl(dbUrl: string) {
    const url = new URL(dbUrl);
    return {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1),
        ssl: { rejectUnauthorized: false },
        connectTimeout: 10000,
    };
}

// ── MySQL connection (single — for ensureTable) ───────────────────
function createMySQLConnection(dbUrl: string) {
    return mysql.createConnection(parseMySQLUrl(dbUrl));
}

// ── MySQL pool (for Drizzle) ────────────────────────────────────
function createMySQLPool(dbUrl: string) {
    return mysql.createPool({
        ...parseMySQLUrl(dbUrl),
        waitForConnections: true,
        connectionLimit: 3,
    });
}

// ── Table auto-create ──────────────────────────────────────────
async function ensureTable(connection: mysql.Connection) {
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS flightPriceAlerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(320) NOT NULL,
            origin VARCHAR(3) NOT NULL,
            destination VARCHAR(3) NOT NULL,
            departDate VARCHAR(10),
            returnDate VARCHAR(10),
            targetPrice INT NOT NULL,
            lastNotifiedPrice INT,
            currency VARCHAR(3) NOT NULL DEFAULT 'THB',
            routeId VARCHAR(20),
            source VARCHAR(20) NOT NULL DEFAULT 'track_button',
            isActive BOOLEAN NOT NULL DEFAULT TRUE,
            createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
            updatedAt TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
        )
    `);
}

// ── CORS allowlist ─────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    "https://gotravelasia.com",
    "https://www.gotravelasia.com",
    "https://gotravel-asia.vercel.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean);

// ── Helpers ────────────────────────────────────────────────────
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── Handler ────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    const reqOrigin = req.headers.origin || "";
    if (ALLOWED_ORIGINS.some((o) => reqOrigin.startsWith(o))) {
        res.setHeader("Access-Control-Allow-Origin", reqOrigin);
        res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    let connection: mysql.Connection | null = null;

    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error("[price-alerts] DATABASE_URL not configured");
            return res.status(500).json({ error: "Service temporarily unavailable" });
        }

        // Raw connection for ensureTable (CREATE TABLE IF NOT EXISTS)
        connection = await createMySQLConnection(dbUrl);
        await ensureTable(connection);

        // Use the SSL-configured connection object directly
        const db = drizzle(connection);

        const body = req.body || {};

        // Honeypot
        if (body.hp) return res.status(200).json({ success: true });

        // ── Normalize inputs ───────────────────────────────────
        const email = String(body.email ?? "").trim().toLowerCase();
        const origin = String(body.origin ?? "").trim().toUpperCase();
        const destination = String(body.destination ?? "").trim().toUpperCase();
        const departDate = String(body.departDate ?? "").trim() || null;
        const returnDate = body.returnDate ? String(body.returnDate).trim() : null;
        const currentPrice = Number(body.currentPrice) || 0;
        const currency = String(body.currency ?? "THB").trim().toUpperCase();
        const routeId = String(body.routeId ?? "").trim() || null;
        const source = (String(body.source ?? "").trim() || "track_button") as string;

        // ── Validate ───────────────────────────────────────────
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        const hasRoutePair = Boolean(origin && destination);
        const hasRouteId = Boolean(routeId);

        if (!hasRoutePair && !hasRouteId) {
            return res.status(400).json({ error: "Missing route: provide origin+destination or routeId" });
        }

        // Track button requires departDate
        if (source === "track_button" && !departDate) {
            return res.status(400).json({ error: "Missing departDate for price tracking" });
        }

        // ── Duplicate check ────────────────────────────────────
        let existing;
        if (departDate && hasRoutePair) {
            // Dated alert (TrackPricesButton)
            existing = await db.select().from(flightPriceAlerts).where(
                and(
                    eq(flightPriceAlerts.email, email),
                    eq(flightPriceAlerts.origin, origin),
                    eq(flightPriceAlerts.destination, destination),
                    eq(flightPriceAlerts.departDate, departDate),
                    eq(flightPriceAlerts.isActive, true)
                )
            ).limit(1);
        } else if (hasRouteId) {
            // Watchlist alert (SignInModal)
            existing = await db.select().from(flightPriceAlerts).where(
                and(
                    eq(flightPriceAlerts.email, email),
                    eq(flightPriceAlerts.routeId, routeId!),
                    eq(flightPriceAlerts.isActive, true)
                )
            ).limit(1);
        } else {
            // General watchlist (origin+destination, no date)
            existing = await db.select().from(flightPriceAlerts).where(
                and(
                    eq(flightPriceAlerts.email, email),
                    eq(flightPriceAlerts.origin, origin),
                    eq(flightPriceAlerts.destination, destination),
                    isNull(flightPriceAlerts.departDate),
                    eq(flightPriceAlerts.isActive, true)
                )
            ).limit(1);
        }

        if (existing && existing.length > 0) {
            return res.status(200).json({ success: true, alreadyExists: true });
        }

        // ── Insert ─────────────────────────────────────────────
        await db.insert(flightPriceAlerts).values({
            email,
            origin: origin || "---",
            destination: destination || "---",
            departDate,
            returnDate,
            targetPrice: currentPrice,
            currency,
            routeId,
            source,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.info("[price-alerts] new_subscription", {
            email, origin, destination, departDate, routeId, source,
            createdAt: new Date().toISOString(),
        });

        return res.status(200).json({ success: true, alreadyExists: false });
    } catch (error: any) {
        console.error("[price-alerts] error", error?.message, error?.stack);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    } finally {
        if (connection) await connection.end().catch(() => { });
    }
}
