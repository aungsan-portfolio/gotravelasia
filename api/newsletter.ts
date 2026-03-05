import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Safe parsing of req.body to prevent TypeError if undefined
        let email: string | undefined;

        if (typeof req.body === "string") {
            try {
                email = JSON.parse(req.body).email;
            } catch {
                email = undefined;
            }
        } else if (req.body && typeof req.body === "object") {
            email = req.body.email;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        console.log(`[Newsletter] New subscriber: ${email}`);

        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
            try {
                const resend = new Resend(resendKey);
                await resend.emails.send({
                    from: "GoTravel Asia <onboarding@resend.dev>",
                    to: email,
                    subject: "Welcome to GoTravel Asia! ✈️",
                    html: `
            <h2>Welcome aboard! 🎉</h2>
            <p>Thanks for subscribing to GoTravel Asia flight deals.</p>
            <p>We'll send you the best flight deals across Southeast Asia 
            — no spam, just savings.</p>
            <p>— The GoTravel Team</p>
          `,
                });
            } catch (emailErr) {
                console.error("[Newsletter] Email send failed:", emailErr);
            }
        }

        // ✅ Express က res.json({ ok: true }) — Vercel လည်း တူတူပဲ
        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error("[Newsletter] Error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
