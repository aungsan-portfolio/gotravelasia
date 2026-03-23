import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";

const ALLOWED_ORIGINS = [
    "https://gotravelasia.com",
    "https://www.gotravelasia.com",
    "https://gotravel-asia.vercel.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean);

function setCors(req: any, res: any) {
    const origin = req.headers.origin || "";
    if (ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
export default async function handler(
    req: any,
    res: any
) {
    setCors(req, res);
    if (req.method === "OPTIONS") return res.status(200).end();
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

        // Subscriber DB မှာ သိမ်းခြင်း
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl) {
            let dbConn: mysql.Connection | null = null;
            try {
                const url = new URL(dbUrl);
                dbConn = await mysql.createConnection({
                    host: url.hostname,
                    port: parseInt(url.port) || 3306,
                    user: decodeURIComponent(url.username),
                    password: decodeURIComponent(url.password),
                    database: url.pathname.slice(1),
                    ssl: { rejectUnauthorized: false },
                    connectTimeout: 10000,
                });

                // Table မရှိသေးရင် ဖန်တီးပါ
                await dbConn.execute(`
                    CREATE TABLE IF NOT EXISTS newsletterSubscribers (
                        id        INT AUTO_INCREMENT PRIMARY KEY,
                        email     VARCHAR(320) NOT NULL UNIQUE,
                        createdAt TIMESTAMP NOT NULL DEFAULT NOW()
                    )
                `);

                // Subscriber ထည့်ပါ (duplicate ဆိုရင် skip)
                await dbConn.execute(
                    `INSERT IGNORE INTO newsletterSubscribers (email) VALUES (?)`,
                    [email]
                );

                console.log(`[Newsletter] Subscriber saved: ${email}`);
            } catch (dbErr) {
                console.error("[Newsletter] DB save failed:", dbErr);
                // DB fail ဖြစ်ရင်လည်း email ပို့တာ ဆက်သွားမယ်
            } finally {
                if (dbConn) await dbConn.end().catch(() => { });
            }
        }

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        if (emailUser && emailPass) {
            try {
                const transporter = nodemailer.createTransport({
                    host: "smtp-mail.outlook.com",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: emailUser,
                        pass: emailPass,
                    },
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || `GoTravel Asia <${emailUser}>`,
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
