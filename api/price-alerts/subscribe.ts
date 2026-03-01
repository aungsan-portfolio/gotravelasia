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
    // Parse the URL and add SSL for Aiven cloud databases
    const url = new URL(dbUrl);
    return mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1), // remove leading /
        ssl: { rejectUnauthorized: false }, // required for Aiven
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    let connection: mysql.Connection | null = null;

    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return res.status(500).json({ error: "DATABASE_URL not configured" });
        }

        connection = await createMySQLConnection(dbUrl);
        const db = drizzle(connection);

        const { email, origin, destination, departDate, returnDate, currentPrice, currency } = req.body || {};
        if (!email || !origin || !destination || !departDate) {
            return res.status(400).json({ error: "Missing required fields: email, origin, destination, departDate" });
        }

        // Check if same active alert exists
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
            returnDate: returnDate || null,
            targetPrice: Number(currentPrice) || 0,
            currency: currency || "THB",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return res.status(200).json({ success: true, alreadyExists: false });
    } catch (error: any) {
        console.error("Price alert error:", error);
        return res.status(500).json({ error: "Failed to create price alert", detail: error?.message });
    } finally {
        if (connection) await connection.end().catch(() => { });
    }
}
