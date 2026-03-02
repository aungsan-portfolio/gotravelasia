import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { int, mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";

// Inline schema
const flightPriceAlerts = mysqlTable("flightPriceAlerts", {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    origin: varchar("origin", { length: 3 }).notNull(),
    destination: varchar("destination", { length: 3 }).notNull(),
    departDate: varchar("departDate", { length: 10 }).notNull(),
    returnDate: varchar("returnDate", { length: 10 }),
    targetPrice: int("targetPrice").notNull(),
    lastNotifiedPrice: int("lastNotifiedPrice"),
    currency: varchar("currency", { length: 3 }).default("THB").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

function createMySQLConnection(dbUrl: string) {
    try {
        const url = new URL(dbUrl);
        return mysql.createConnection({
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.slice(1),
            ssl: { rejectUnauthorized: false },
        });
    } catch (err: any) {
        throw new Error(`Failed to parse DATABASE_URL: ${err.message}`);
    }
}

const ALLOWED_ORIGINS = [
    "https://gotravelasia.com",
    "https://www.gotravelasia.com",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS — restrict to known origins
    const origin = req.headers.origin || "";
    if (ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
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

        connection = await createMySQLConnection(dbUrl);
        const db = drizzle(connection);

        const body = req.body || {};

        // Honeypot — reject bots that fill hidden fields
        if (body.hp) return res.status(200).json({ success: true });

        const email = String(body.email ?? "").trim().toLowerCase();
        const origin = String(body.origin ?? "").trim().toUpperCase();
        const destination = String(body.destination ?? "").trim().toUpperCase();
        const departDate = String(body.departDate ?? "").trim();
        const returnDate = body.returnDate ? String(body.returnDate).trim() : null;
        const currentPrice = Number(body.currentPrice) || 0;
        const currency = String(body.currency ?? "THB").trim().toUpperCase();

        if (!email || !origin || !destination || !departDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        const existing = await db.select().from(flightPriceAlerts).where(
            and(
                eq(flightPriceAlerts.email, email),
                eq(flightPriceAlerts.origin, origin),
                eq(flightPriceAlerts.destination, destination),
                eq(flightPriceAlerts.departDate, departDate),
                eq(flightPriceAlerts.isActive, true)
            )
        ).limit(1);

        if (existing.length > 0) {
            return res.status(200).json({ success: true, alreadyExists: true });
        }

        await db.insert(flightPriceAlerts).values({
            email,
            origin,
            destination,
            departDate,
            returnDate,
            targetPrice: currentPrice,
            currency,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Server-side instrumentation only
        console.info("[price-alerts] new_subscription", { email, origin, destination, departDate, createdAt: new Date().toISOString() });

        return res.status(200).json({ success: true, alreadyExists: false });
    } catch (error: any) {
        console.error("[price-alerts] error", error?.message, error?.stack);
        return res.status(500).json({ error: "Something went wrong. Please try again." });
    } finally {
        if (connection) await connection.end().catch(() => { });
    }
}
