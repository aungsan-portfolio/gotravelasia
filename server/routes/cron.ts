import { Router } from "express";
import { Resend }  from "resend";
import { getActivePriceAlerts, updateAlertPrice } from "../db";

const router = Router();

router.get("/check-price-alerts", async (req, res) => {
  try {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" }); return;
    }

    const activeAlerts = await getActivePriceAlerts();
    if (activeAlerts.length === 0) { res.json({ message: "No active alerts to check." }); return; }

    const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    const tpToken      = process.env.TRAVELPAYOUTS_TOKEN;
    const results: any[] = [];

    for (const alert of activeAlerts) {
      if (!tpToken) break;

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

        if (resendClient) {
          await resendClient.emails.send({
            from:    "GoTravel Asia <onboarding@resend.dev>",
            to:      alert.email,
            subject: `🔥 Price Drop Alert: ${alert.origin} to ${alert.destination} (-${percent}%)`,
            html: `
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
          }).catch(console.error);
        }

        await updateAlertPrice(alert.id, minPrice);
        results.push({ id: alert.id, old: referencePrice, new: minPrice });
      }
    }

    res.json({ message: "Cron finished", processedCount: results.length, results });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ error: "Failed to process cron job" });
  }
});

export default router;
