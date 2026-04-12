import { Router } from "express";
import { Resend } from "resend";
import {
  createPriceAlert,
  saveSubscriber,
  enqueueEmail,
  ensureEmailQueueTable,
} from "../db.js";
import { buildWelcomeEmailHtml } from "../utils/email.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IATA_RE = /^[A-Z]{3}$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type SubscribeBody = {
  email?: string;
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string | null;
  currentPrice?: number | string | null;
  currency?: string;
  source?: string;
};

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

function isIsoDate(value: string): boolean {
  return ISO_DATE_RE.test(value);
}

function normalizeIata(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function parseTargetPrice(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed);
}

function buildPriceAlertConfirmationHtml(params: {
  email: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  targetPrice?: number;
  currency: string;
}) {
  const siteUrl = process.env.VITE_SITE_URL || "https://gotravel-asia.vercel.app";
  const routeLabel = `${params.origin} → ${params.destination}`;
  const priceLine =
    params.targetPrice && params.targetPrice > 0
      ? `<p style="margin:0 0 12px;color:#475569;font-size:14px;">
           We’ll monitor this route starting from
           <strong>${params.currency} ${params.targetPrice.toLocaleString()}</strong>.
         </p>`
      : `<p style="margin:0 0 12px;color:#475569;font-size:14px;">
           We’ll monitor this route and notify you when deals appear.
         </p>`;

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Price Alert Created</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#180840 0%,#2D0558 55%,#5B0EA6 100%);padding:36px 32px;">
                <div style="font-size:30px;margin-bottom:8px;">🔔</div>
                <h1 style="margin:0;color:#F5C518;font-size:26px;font-weight:900;">Price Alert Created</h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                  GoTravel Asia is now tracking your route.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 12px;">
                <p style="margin:0 0 12px;color:#0f172a;font-size:18px;font-weight:800;">
                  ${routeLabel}
                </p>
                <p style="margin:0 0 8px;color:#475569;font-size:14px;">
                  Departure: <strong>${params.departDate}</strong>
                </p>
                ${
                  params.returnDate
                    ? `<p style="margin:0 0 8px;color:#475569;font-size:14px;">
                         Return: <strong>${params.returnDate}</strong>
                       </p>`
                    : ""
                }
                ${priceLine}
                <p style="margin:0;color:#475569;font-size:14px;">
                  Alerts will be sent to <strong>${params.email}</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 32px 28px;">
                <a
                  href="${siteUrl}"
                  style="display:inline-block;background:linear-gradient(135deg,#F5C518 0%,#F59E0B 100%);color:#2D0558;text-decoration:none;font-weight:800;font-size:15px;padding:14px 28px;border-radius:12px;"
                >
                  Search Flights →
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
                  You’re receiving this because you created a price alert on GoTravel Asia.
                  Future deal emails will arrive automatically when qualifying price drops are detected.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendPriceAlertConfirmationEmail(params: {
  email: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  targetPrice?: number;
  currency: string;
}): Promise<{ sent: boolean; queued: boolean; error?: string }> {
  const subject = `🔔 Price alert created: ${params.origin} → ${params.destination}`;
  const html = buildPriceAlertConfirmationHtml(params);

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.ALERT_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "GoTravel Asia <onboarding@resend.dev>";

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: fromEmail,
        to: params.email,
        subject,
        html,
      });
      return { sent: true, queued: false };
    } catch (error) {
      console.warn("[price-alerts] Resend confirmation failed:", error);
    }
  }

  try {
    await ensureEmailQueueTable();
    const queued = await enqueueEmail({
      toEmail: params.email,
      subject,
      htmlContent: html,
    });

    if (queued) {
      return { sent: false, queued: true };
    }
  } catch (error) {
    console.warn("[price-alerts] Queue confirmation failed:", error);
  }

  return { sent: false, queued: false, error: "email_not_configured_or_failed" };
}

router.post("/subscribe", async (req: any, res: any) => {
  try {
    const body = (req.body || {}) as SubscribeBody;

    const email = normalizeEmail(String(body.email || ""));
    const origin = normalizeIata(String(body.origin || ""));
    const destination = normalizeIata(String(body.destination || ""));
    const departDate = String(body.departDate || "").trim();
    const returnDate =
      typeof body.returnDate === "string" && body.returnDate.trim()
        ? body.returnDate.trim()
        : null;
    const targetPrice = parseTargetPrice(body.currentPrice);
    const currency = String(body.currency || "THB").trim().toUpperCase();
    const source = String(body.source || "track_button").trim() || "track_button";

    if (!email || !isValidEmail(email)) {
      res.status(400).json({ success: false, error: "Invalid email address." });
      return;
    }

    if (!IATA_RE.test(origin)) {
      res.status(400).json({ success: false, error: "Invalid origin IATA code." });
      return;
    }

    if (!IATA_RE.test(destination)) {
      res
        .status(400)
        .json({ success: false, error: "Invalid destination IATA code." });
      return;
    }

    if (origin === destination) {
      res
        .status(400)
        .json({ success: false, error: "Origin and destination must differ." });
      return;
    }

    if (!isIsoDate(departDate)) {
      res
        .status(400)
        .json({ success: false, error: "Invalid departure date format." });
      return;
    }

    if (returnDate && !isIsoDate(returnDate)) {
      res
        .status(400)
        .json({ success: false, error: "Invalid return date format." });
      return;
    }

    const createResult = await createPriceAlert({
      email,
      origin,
      destination,
      departDate,
      returnDate,
      targetPrice,
      currency,
      source,
      isActive: true,
    });

    if (!createResult.success) {
      res.status(503).json({
        success: false,
        error: "Price alert service is temporarily unavailable.",
      });
      return;
    }

    if (createResult.alreadyExists) {
      res.status(200).json({
        success: true,
        alreadyExists: true,
        message: "This email is already tracking this route.",
      });
      return;
    }

    const emailResult = await sendPriceAlertConfirmationEmail({
      email,
      origin,
      destination,
      departDate,
      returnDate,
      targetPrice: targetPrice > 0 ? targetPrice : undefined,
      currency,
    });

    if (emailResult.sent) {
      res.status(200).json({
        success: true,
        alreadyExists: false,
        message: "Price alert created. Check your inbox for confirmation.",
        emailSent: true,
        emailQueued: false,
      });
      return;
    }

    if (emailResult.queued) {
      res.status(200).json({
        success: true,
        alreadyExists: false,
        message: "Price alert created. Confirmation email is queued.",
        emailSent: false,
        emailQueued: true,
      });
      return;
    }

    res.status(200).json({
      success: true,
      alreadyExists: false,
      message: "Price alert created successfully.",
      emailSent: false,
      emailQueued: false,
    });
  } catch (error) {
    console.error("[price-alerts] subscribe error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create price alert.",
    });
  }
});

// NOTE: /submit is for generic popup/newsletter signup.
// Route-specific "Track This Route" uses /subscribe.
router.post("/submit", async (req: any, res: any) => {
  try {
    const rawEmail = String(req.body?.email || "");
    const email = normalizeEmail(rawEmail);
    const source = String(req.body?.source || "popup");

    if (!email || !isValidEmail(email)) {
      res.status(400).json({ success: false, error: "Valid email is required." });
      return;
    }

    const origin = req.body?.origin ? normalizeIata(String(req.body.origin)) : "";
    const destination = req.body?.destination
      ? normalizeIata(String(req.body.destination))
      : "";
    const departDate = req.body?.departDate ? String(req.body.departDate) : "";
    const targetPrice = parseTargetPrice(req.body?.currentPrice);
    const currency = String(req.body?.currency || "USD").trim().toUpperCase();

    if (origin && destination && departDate) {
      if (!IATA_RE.test(origin) || !IATA_RE.test(destination) || !isIsoDate(departDate)) {
        res.status(400).json({
          success: false,
          error: "Invalid route tracking payload.",
        });
        return;
      }

      const result = await createPriceAlert({
        email,
        origin,
        destination,
        departDate,
        returnDate: null,
        targetPrice,
        currency,
        source: "popup_route_submit",
        isActive: true,
      });

      if (!result.success) {
        res.status(503).json({
          success: false,
          error: "Price alert service is temporarily unavailable.",
        });
        return;
      }

      res.json({
        success: true,
        flow: "auto-saved",
        alreadyExists: result.alreadyExists,
      });
      return;
    }

    const result = await saveSubscriber({ email, source });

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && !result.alreadyExists) {
      new Resend(resendApiKey).emails
        .send({
          from: process.env.EMAIL_FROM || "GoTravel Asia <onboarding@resend.dev>",
          to: email,
          subject: "✈️ Welcome to GoTravel Asia!",
          html: buildWelcomeEmailHtml(email),
        })
        .catch((error) => {
          console.warn("[price-alerts] welcome email failed:", error);
        });
    }

    res.json({
      success: true,
      flow: "welcome-email",
      alreadyExists: result.alreadyExists,
    });
  } catch (error) {
    console.error("[price-alerts] submit error:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
