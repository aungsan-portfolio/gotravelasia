import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  enqueueEmail,
  ensureEmailQueueTable,
  getActivePriceAlerts,
  touchPriceAlerts,
  updateAlertPrice,
} from "../../server/db.js";

let emailQueueTableReady = false;

const MAX_CONCURRENCY = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isAlertStale(updatedAt: Date | string | null | undefined, staleMinutes: number) {
  if (!updatedAt) return true;
  const updatedMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedMs)) return true;
  return Date.now() - updatedMs >= staleMinutes * 60_000;
}

async function runInBatches<T, R>(
  items: T[],
  workerCount: number,
  worker: (item: T) => Promise<R>,
) {
  const results: R[] = [];
  let next = 0;

  async function consume() {
    while (next < items.length) {
      const current = next;
      next += 1;
      results[current] = await worker(items[current]);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => consume()));
  return results;
}

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

    const env = validateEnv(["TRAVELPAYOUTS_TOKEN", "DATABASE_URL"]);
    if (!env.ok) {
      return res.status(500).json({ error: "Missing required env vars", missing: env.missing });
    }

    if (!emailQueueTableReady) {
      await ensureEmailQueueTable();
      emailQueueTableReady = true;
    }

    const activeAlerts = await getActivePriceAlerts();
    if (activeAlerts.length === 0) {
      return res.status(200).json({ message: "No active alerts to check." });
    }

    const staleMinutes = clamp(Number(process.env.PRICE_ALERT_STALE_MINUTES || 360), 15, 1440);
    const maxAlertsPerRun = clamp(Number(process.env.PRICE_ALERT_MAX_ALERTS_PER_RUN || 30), 1, 100);
    const workerCount = clamp(Number(process.env.PRICE_ALERT_WORKERS || 2), 1, MAX_CONCURRENCY);

    const staleAlerts = activeAlerts
      .filter((alert) => isAlertStale(alert.updatedAt, staleMinutes))
      .slice(0, maxAlertsPerRun);

    if (staleAlerts.length === 0) {
      const durationMs = Date.now() - startedAt;
      console.info("[cron/check-price-alerts] skipped run", {
        durationMs,
        activeAlerts: activeAlerts.length,
        staleAlerts: 0,
        staleMinutes,
      });
      return res.status(200).json({
        message: "No stale alerts to check.",
        activeAlerts: activeAlerts.length,
        staleAlerts: 0,
        staleMinutes,
        durationMs,
      });
    }

    const tpToken = process.env.TRAVELPAYOUTS_TOKEN as string;
    const touchedAlertIds: number[] = [];

    const results = await runInBatches(
      staleAlerts,
      workerCount,
      async (alert): Promise<{ id: number; old: number; new: number; queued: boolean } | null> => {
      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?token=${tpToken}&origin=${alert.origin}&destination=${alert.destination}&departure_at=${alert.departDate}&currency=${alert.currency}&one_way=${!alert.returnDate}`;
      const tpRes = await fetch(url).catch(() => null);
      if (!tpRes?.ok) return null;

      const tpData = await tpRes.json();
      if (!tpData?.data || tpData.data.length === 0) {
        touchedAlertIds.push(alert.id);
        return null;
      }

      const minPrice = Math.min(...tpData.data.map((d: any) => d.price));
      const referencePrice = alert.lastNotifiedPrice || alert.targetPrice;
      const threshold = referencePrice * 0.95;

      if (minPrice <= threshold) {
        const dropAmount = referencePrice - minPrice;
        const percent = Math.round((dropAmount / referencePrice) * 100);

        await enqueueEmail({
          toEmail: alert.email,
          subject: `🔥 Price Drop Alert: ${alert.origin} to ${alert.destination} (-${percent}%)`,
          htmlContent: `
            <div style="font-family: sans-serif; color: #1e293b; padding: 20px;">
              <h2 style="color: #5B0EA6;">Good news! Your flight price dropped.</h2>
              <p>Route: <strong>${alert.origin}</strong> → <strong>${alert.destination}</strong> on <strong>${alert.departDate}</strong></p>
              <p>Price dropped from ${alert.currency} ${referencePrice} to <strong>${alert.currency} ${minPrice}</strong>.</p>
              <p style="margin-top: 20px;">
                <a href="https://gotravel-asia.vercel.app/flights/results" style="background: #F5C518; color: #2D0558; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px;">View Deals</a>
              </p>
            </div>
          `,
        });

        await updateAlertPrice(alert.id, minPrice);
        return { id: alert.id, old: referencePrice, new: minPrice, queued: true };
      }
      touchedAlertIds.push(alert.id);
      return null;
    });

    await touchPriceAlerts(touchedAlertIds);

    const queuedResults = results.filter(Boolean);
    const durationMs = Date.now() - startedAt;
    console.info("[cron/check-price-alerts] completed", {
      durationMs,
      activeAlerts: activeAlerts.length,
      checkedAlerts: staleAlerts.length,
      queuedAlerts: queuedResults.length,
      staleMinutes,
      workerCount,
    });

    return res.status(200).json({
      message: "Cron finished processing",
      activeAlerts: activeAlerts.length,
      checkedAlerts: staleAlerts.length,
      processedCount: queuedResults.length,
      staleMinutes,
      workerCount,
      durationMs,
      results: queuedResults,
    });
  } catch (err: any) {
    console.error("Cron error:", err);
    return res.status(500).json({ error: "Failed to process cron job", detail: err?.message });
  }
}
