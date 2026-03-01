import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { int, mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";
import { Resend } from "resend";

// Inline schema to avoid import resolution issues on Vercel
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
    try {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error("DATABASE_URL not set");
            return res.status(500).json({ error: "Database not configured" });
        }

        const db = drizzle(dbUrl);

        // Get active alerts
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
                                <p>The route from <strong>${alert.origin}</strong> to <strong>${alert.destination}</strong> on <strong>${alert.departDate}</strong> has dropped from ${alert.currency} ${referencePrice} down to <strong>${alert.currency} ${minPrice}</strong>.</p>
                                <p style="margin-top: 20px;">
                                    <a href="https://gotravel-asia.vercel.app/flights/results" style="background: #F5C518; color: #2D0558; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">View Deals</a>
                                </p>
                                <hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;"/>
                                <p style="font-size: 11px; color: #94a3b8;">
                                    You are receiving this because you subscribed to price alerts.
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
        console.error("Cron check-price-alerts error:", err?.message || err);
        return res.status(500).json({ error: "Failed to process cron job", detail: err?.message });
    }
}
