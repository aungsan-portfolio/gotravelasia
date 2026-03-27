import type { VercelRequest, VercelResponse } from "@vercel/node";
import { enqueueEmail, ensureEmailQueueTable, getActivePriceAlerts, updateAlertPrice } from "../../server/db.js";

function validateEnv(required: string[]) {
  const missing = required.filter((name) => !process.env[name]);
  return {
    ok: missing.length === 0,
    missing,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const env = validateEnv(["TRAVELPAYOUTS_TOKEN", "DATABASE_URL"]);
    if (!env.ok) {
      return res.status(500).json({ error: "Missing required env vars", missing: env.missing });
    }

    await ensureEmailQueueTable();

    const activeAlerts = await getActivePriceAlerts();
    if (activeAlerts.length === 0) {
      return res.status(200).json({ message: "No active alerts to check." });
    }

    const tpToken = process.env.TRAVELPAYOUTS_TOKEN as string;
    const results: Array<{ id: number; old: number; new: number; queued: boolean }> = [];

    for (const alert of activeAlerts) {
      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?token=${tpToken}&origin=${alert.origin}&destination=${alert.destination}&departure_at=${alert.departDate}&currency=${alert.currency}&one_way=${!alert.returnDate}`;
      const tpRes = await fetch(url).catch(() => null);
      if (!tpRes?.ok) continue;

      const tpData = await tpRes.json();
      if (!tpData?.data || tpData.data.length === 0) continue;

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
        results.push({ id: alert.id, old: referencePrice, new: minPrice, queued: true });
      }
    }

    return res.status(200).json({
      message: "Cron finished processing",
      processedCount: results.length,
      results,
    });
  } catch (err: any) {
    console.error("Cron error:", err);
    return res.status(500).json({ error: "Failed to process cron job", detail: err?.message });
  }
}
