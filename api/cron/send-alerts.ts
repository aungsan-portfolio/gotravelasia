import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { and, asc, eq, isNull, or, lte } from "drizzle-orm";
import { int, mysqlTable, text, varchar, timestamp } from "drizzle-orm/mysql-core";
import mysql from "mysql2/promise";
import { Resend } from "resend";

// Inline schema for the queue table
export const emailQueue = mysqlTable("emailQueue", {
    id: int("id").autoincrement().primaryKey(),
    toEmail: varchar("toEmail", { length: 320 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    htmlContent: text("htmlContent").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    attempts: int("attempts").default(0).notNull(),
    lastError: text("lastError"),
    scheduledAt: timestamp("scheduledAt"), // nullable = send ASAP
    sentAt: timestamp("sentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

function createMySQLConnection(dbUrl: string) {
    const url = new URL(dbUrl);
    return mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1),
        ssl: { rejectUnauthorized: false },
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    let connection: mysql.Connection | null = null;

    try {
        // 1) Cron auth check
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 2) Load env vars
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) return res.status(500).json({ error: "DATABASE_URL not configured" });

        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) return res.status(500).json({ error: "RESEND_API_KEY not configured" });

        const fromEmail = process.env.ALERT_FROM_EMAIL || "GoTravel Asia <onboarding@resend.dev>";
        const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 50);

        // 3) Connect to DB
        connection = await createMySQLConnection(dbUrl);
        const db = drizzle(connection);

        // 4) Pick pending items (scheduledAt is null OR scheduledAt <= now)
        const now = new Date();
        const pending = await db
            .select()
            .from(emailQueue)
            .where(
                and(
                    eq(emailQueue.status, "pending"),
                    or(isNull(emailQueue.scheduledAt), lte(emailQueue.scheduledAt, now))
                )
            )
            .orderBy(asc(emailQueue.id))
            .limit(batchSize);

        if (pending.length === 0) {
            return res.status(200).json({ message: "No pending emails." });
        }

        const resend = new Resend(resendApiKey);
        const results: Array<{ id: number; ok: boolean; error?: string }> = [];

        // 5) Send + mark
        for (const row of pending) {
            try {
                await resend.emails.send({
                    from: fromEmail,
                    to: row.toEmail,
                    subject: row.subject,
                    html: row.htmlContent,
                });

                await db
                    .update(emailQueue)
                    .set({ status: "sent", sentAt: new Date(), updatedAt: new Date(), lastError: null })
                    .where(eq(emailQueue.id, row.id));

                results.push({ id: row.id, ok: true });
            } catch (e: any) {
                const msg = e?.message || "send_failed";

                // If attempt reaches max retries, we could set status='failed' permanently here.
                // For now, we'll mark as failed so it can be manually reviewed or retried later.
                await db
                    .update(emailQueue)
                    .set({
                        status: row.attempts + 1 >= 3 ? "failed" : "pending_retry",
                        attempts: row.attempts + 1,
                        lastError: msg,
                        updatedAt: new Date(),
                    })
                    .where(eq(emailQueue.id, row.id));

                results.push({ id: row.id, ok: false, error: msg });
            }
        }

        return res.status(200).json({
            message: "Send alerts cron finished",
            attempted: pending.length,
            sent: results.filter((r) => r.ok).length,
            failed: results.filter((r) => !r.ok).length,
            results,
        });
    } catch (err: any) {
        console.error("Cron send-alerts error:", err);
        return res.status(500).json({ error: "Failed to process send-alerts", detail: err?.message });
    } finally {
        if (connection) await connection.end().catch(() => { });
    }
}
