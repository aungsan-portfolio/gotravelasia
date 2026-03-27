import { Router } from "express";
import nodemailer from "nodemailer";
import {
  claimEmailQueueItem,
  enqueueEmail,
  ensureEmailQueueTable,
  getActivePriceAlerts,
  getDueEmailQueueItems,
  markEmailQueueAttemptFailed,
  markEmailQueueSent,
  updateAlertPrice,
} from "../db.js";

const router = Router();

router.get("/check-price-alerts", async (req: any, res: any) => {
  try {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" }); return;
    }

    const activeAlerts = await getActivePriceAlerts();
    if (activeAlerts.length === 0) { res.json({ message: "No active alerts to check." }); return; }

    const tpToken      = process.env.TRAVELPAYOUTS_TOKEN;
    if (!tpToken) {
      res.status(500).json({ error: "TRAVELPAYOUTS_TOKEN not configured" }); return;
    }

    await ensureEmailQueueTable();
    const results: any[] = [];

    for (const alert of activeAlerts) {
      const tpRes = await fetch(
        `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?token=${tpToken}&origin=${alert.origin}&destination=${alert.destination}&departure_at=${alert.departDate}&currency=${alert.currency}&one_way=${!alert.returnDate}`
      ).catch(() => null);
      if (!tpRes?.ok) continue;

      const tpData = await tpRes.json();
      if (!tpData?.data?.length) continue;

      const minPrice       = Math.min(...tpData.data.map((d: any) => d.price));
      const referencePrice = alert.lastNotifiedPrice || alert.targetPrice;
      const threshold      = referencePrice * 0.95;

      if (minPrice <= threshold) {
        const percent = Math.round(((referencePrice - minPrice) / referencePrice) * 100);

        await enqueueEmail({
          toEmail: alert.email,
          subject: `🔥 Price Drop Alert: ${alert.origin} to ${alert.destination} (-${percent}%)`,
          htmlContent: `
              <div style="font-family:sans-serif;color:#1e293b;padding:20px;">
                <h2 style="color:#5B0EA6;">Good news! Your flight price dropped.</h2>
                <p>Route <strong>${alert.origin} → ${alert.destination}</strong> on <strong>${alert.departDate}</strong>
                dropped from ${alert.currency} ${referencePrice} to <strong>${alert.currency} ${minPrice}</strong>.</p>
                <p><a href="https://gotravel-asia.vercel.app/flights/results"
                   style="background:#F5C518;color:#2D0558;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:8px;">
                   View Deals
                </a></p>
                <hr style="margin-top:40px;border:none;border-top:1px solid #e2e8f0;"/>
                <p style="font-size:11px;color:#94a3b8;">You subscribed to price alerts at GoTravel Asia.</p>
              </div>`,
        });

        await updateAlertPrice(alert.id, minPrice);
        results.push({ id: alert.id, old: referencePrice, new: minPrice, queued: true });
      }
    }

    res.json({ message: "Cron finished", processedCount: results.length, results });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ error: "Failed to process cron job" });
  }
});

router.get("/send-alerts", async (req: any, res: any) => {
  try {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" }); return;
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      res.status(500).json({ error: "EMAIL_USER or EMAIL_PASS not configured" }); return;
    }

    const fromEmail = process.env.ALERT_FROM_EMAIL || `GoTravel Asia <${emailUser}>`;
    const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 50);
    const maxAttempts = Number(process.env.EMAIL_MAX_ATTEMPTS || 3);
    const retryDelayMinutes = Number(process.env.EMAIL_RETRY_DELAY_MINUTES || 15);

    await ensureEmailQueueTable();
    const dueItems = await getDueEmailQueueItems(batchSize, maxAttempts);
    if (dueItems.length === 0) {
      res.status(200).json({ message: "No pending emails." }); return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
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

    res.status(200).json({
      message: "Send alerts cron finished",
      attempted: dueItems.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (err) {
    console.error("Cron send-alerts error:", err);
    res.status(500).json({ error: "Failed to process send-alerts" });
  }
});

export default router;
