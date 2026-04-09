import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import {
  claimEmailQueueItem,
  ensureEmailQueueTable,
  getDueEmailQueueItems,
  markEmailQueueAttemptFailed,
  markEmailQueueSent,
} from "../../server/db.js";

let emailQueueTableReady = false;

function validateEnv(required: string[]) {
  const missing = required.filter((name) => !process.env[name]);
  return {
    ok: missing.length === 0,
    missing,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const startedAt = Date.now();
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const env = validateEnv(["DATABASE_URL", "EMAIL_USER", "EMAIL_PASS"]);
    if (!env.ok) {
      return res.status(500).json({ error: "Missing required env vars", missing: env.missing });
    }

    const emailUser = process.env.EMAIL_USER as string;
    const emailPass = process.env.EMAIL_PASS as string;
    const fromEmail = process.env.ALERT_FROM_EMAIL || `GoTravel Asia <${emailUser}>`;
    const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 50);
    const maxAttempts = Number(process.env.EMAIL_MAX_ATTEMPTS || 3);
    const retryDelayMinutes = Number(process.env.EMAIL_RETRY_DELAY_MINUTES || 15);

    if (!emailQueueTableReady) {
      await ensureEmailQueueTable();
      emailQueueTableReady = true;
    }
    const dueItems = await getDueEmailQueueItems(batchSize, maxAttempts);

    if (dueItems.length === 0) {
      return res.status(200).json({ message: "No pending emails." });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const results: Array<{ id: number; ok: boolean; error?: string }> = [];

    for (const row of dueItems) {
      const claimed = await claimEmailQueueItem(row.id, row.attempts);
      if (!claimed) continue;

      try {
        await transporter.sendMail({
          from: fromEmail,
          to: row.toEmail,
          subject: row.subject,
          html: row.htmlContent,
        });

        await markEmailQueueSent(row.id);

        results.push({ id: row.id, ok: true });
      } catch (e: any) {
        const msg = e?.message || "send_failed";

        await markEmailQueueAttemptFailed({
          id: row.id,
          attempts: row.attempts,
          error: msg,
          maxAttempts,
          retryDelayMinutes,
        });

        results.push({ id: row.id, ok: false, error: msg });
      }
    }

    const durationMs = Date.now() - startedAt;
    console.info("[cron/send-alerts] completed", {
      durationMs,
      dueItems: dueItems.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
    });

    return res.status(200).json({
      message: "Send alerts cron finished",
      attempted: dueItems.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      durationMs,
      results,
    });
  } catch (err: any) {
    console.error("Cron send-alerts error:", err);
    return res.status(500).json({ error: "Failed to process send-alerts", detail: err?.message });
  }
}
