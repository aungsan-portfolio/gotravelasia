import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { int, mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";
import { Resend } from "resend";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    let connection: mysql.Connection | null = null;

    try {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return res.status(500).json({ error: "DATABASE_URL not configured" });
        }

        connection = await mysql.createConnection(dbUrl);
        const db = drizzle(connection);

        const activeAlerts = await db.select().from(flightPriceAlerts).where(eq(flightPriceAlerts.isActive, true));
        if (activeAlerts.length === 0) {
            return res.status(200).json({ message: "No active alerts to check." });
        }

        const resendApiKey = process.env.RESEND_API_KEY;
        const resendClient = resendApiKey ? new Resend(resendApiKey) : null;
        const tpToken = process.env.TRAVELPAYOUTS_TOKEN;

        const results = [];

        for (const alert of activeAlerts) {
            if (!tpToken) break;

            const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?token=${tpToken}&origin=${alert.origin}&destination=${alert.destination}&departure_at=${alert.departDate}&currency=${alert.currency}&one_way=${!alert.returnDate}`;
            const tpRes = await fetch(url).catch(() => null);
            if (!tpRes?.ok) continue;

            const tpData = await tpRes.json();
            if (!tpData?.data || tpData.data.length === 0) continue;

            const minPrice = Math.min(...tpData.data.map((d: any) => d.price));
            const referencePrice = alert.lastNotifiedPrice || alert.targetPrice;
            const threshold = referencePrice * 0.95;

            if (minPrice <= threshold) {
                if (resendClient) {
                    const dropAmount = referencePrice - minPrice;
                    const percent = Math.round((dropAmount / referencePrice) * 100);

                    await resendClient.emails.send({
                        from: "GoTravel Asia <onboarding@resend.dev>",
                        to: alert.email,
                        subject: `🔥 Price Drop Alert: ${alert.origin} to ${alert.destination} (-${percent}%)`,
                        html: `
                            <div style="font-family: sans-serif; color: #1e293b; padding: 20px;">
                                <h2 style="color: #5B0EA6;">Good news! Your flight price dropped.</h2>
                                <p>Route: <strong>${alert.origin}</strong> → <strong>${alert.destination}</strong> on <strong>${alert.departDate}</strong></p>
                                <p>Price dropped from ${alert.currency} ${referencePrice} to <strong>${alert.currency} ${minPrice}</strong>.</p>
                                <p style="margin-top: 20px;">
                                    <a href="https://gotravel-asia.vercel.app/flights/results" style="background: #F5C518; color: #2D0558; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">View Deals</a>
                                </p>
                            </div>
                        `
                    }).catch(console.error);
                }

                await db.update(flightPriceAlerts)
                    .set({ lastNotifiedPrice: minPrice, updatedAt: new Date() })
                    .where(eq(flightPriceAlerts.id, alert.id));

                results.push({ id: alert.id, old: referencePrice, new: minPrice });
            }
        }

        return res.status(200).json({ message: "Cron finished processing", processedCount: results.length, results });
    } catch (err: any) {
        console.error("Cron error:", err?.message || err);
        return res.status(500).json({ error: "Failed to process cron job", detail: err?.message });
    } finally {
        if (connection) await connection.end().catch(() => { });
    }
}
