import { Router } from "express";
import { Resend }  from "resend";
import { createPriceAlert, saveSubscriber } from "../db.js";
import { buildWelcomeEmailHtml }            from "../utils/email.js";

const router = Router();

router.post("/subscribe", async (req: any, res: any) => {
  try {
    const { email, origin, destination, departDate, returnDate, currentPrice, currency } = req.body;
    if (!email || !origin || !destination || !departDate) {
      res.status(400).json({ error: "Missing required fields" }); return;
    }
    const result = await createPriceAlert({
      email, origin, destination, departDate,
      returnDate: returnDate || null,
      targetPrice: Number(currentPrice) || 0,
      currency: currency || "THB", isActive: true,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create price alert" });
  }
});

router.post("/submit", async (req: any, res: any) => {
  try {
    const { email, source, origin, destination, departDate, currentPrice, currency } = req.body;
    if (!email) { res.status(400).json({ error: "Email is required" }); return; }

    if (origin && destination && departDate) {
      const result = await createPriceAlert({
        email, origin: String(origin).toUpperCase(), destination: String(destination).toUpperCase(),
        departDate: String(departDate), returnDate: null,
        targetPrice: Number(currentPrice) || 0, currency: currency || "USD", isActive: true,
      });
      res.json({ success: true, flow: "auto-saved", alreadyExists: result.alreadyExists });
      return;
    }

    const result = await saveSubscriber(email, source || "popup");
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && !result.alreadyExists) {
      new Resend(resendApiKey).emails.send({
        from: "GoTravel Asia <onboarding@resend.dev>", to: email,
        subject: "✈️ Welcome to GoTravel Asia!",
        html: buildWelcomeEmailHtml(email),
      }).catch(console.warn);
    }
    res.json({ success: true, flow: "welcome-email", alreadyExists: result.alreadyExists });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
