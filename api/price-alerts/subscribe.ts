import type { VercelRequest, VercelResponse } from "@vercel/node";
import mysql from "mysql2/promise";

// ── CORS ───────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    "https://gotravelasia.com",
    "https://www.gotravelasia.com",
    "https://gotravel-asia.vercel.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean);

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── Handler ────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    const reqOrigin = req.headers.origin || "";
    if (ALLOWED_ORIGINS.some((o) => reqOrigin.startsWith(o))) {
        res.setHeader("Access-Control-Allow-Origin", reqOrigin);
        res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    let connection: mysql.Connection | null = null;

    try {
        // ── 1. DATABASE_URL check ──────────────────────────────
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error("[price-alerts] DATABASE_URL missing");
            return res.status(500).json({ error: "Service temporarily unavailable" });
        }

        // ── 2. Parse body safely ───────────────────────────────
        let body: any = {};
        try {
            if (typeof req.body === "string") {
                body = JSON.parse(req.body);
            } else if (req.body && typeof req.body === "object") {
                body = req.body;
            }
        } catch {
            return res.status(400).json({ error: "Invalid JSON body" });
        }

        // Honeypot
        if (body.hp) return res.status(200).json({ success: true });

        // ── 3. Normalize inputs ────────────────────────────────
        const email = String(body.email ?? "").trim().toLowerCase();
        const origin = String(body.origin ?? "").trim().toUpperCase();
        const destination = String(body.destination ?? "").trim().toUpperCase();
        const departDate = String(body.departDate ?? "").trim() || null;
        const returnDate = body.returnDate ? String(body.returnDate).trim() : null;
        const currentPrice = Number(body.currentPrice) || 0;
        const currency = String(body.currency ?? "USD").trim().toUpperCase();
        const routeId = String(body.routeId ?? "").trim() || null;
        const source = String(body.source ?? "track_button").trim();

        // ── 4. Validate ────────────────────────────────────────
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        if (!origin || !destination) {
            return res.status(400).json({ error: "Missing origin or destination" });
        }
        if (source === "track_button" && !departDate) {
            return res.status(400).json({ error: "Missing departDate" });
        }

        // ── 5. Connect ─────────────────────────────────────────
        const url = new URL(dbUrl);
        connection = await mysql.createConnection({
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.slice(1),
            ssl: { rejectUnauthorized: false },
            connectTimeout: 10000,
        });

        // ── 6. Create table if not exists ─────────────────────
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS flightPriceAlerts (
                id                INT AUTO_INCREMENT PRIMARY KEY,
                email             VARCHAR(320) NOT NULL,
                origin            VARCHAR(3)   NOT NULL,
                destination       VARCHAR(3)   NOT NULL,
                departDate        VARCHAR(10),
                returnDate        VARCHAR(10),
                targetPrice       INT          NOT NULL DEFAULT 0,
                lastNotifiedPrice INT,
                currency          VARCHAR(3)   NOT NULL DEFAULT 'USD',
                routeId           VARCHAR(20),
                source            VARCHAR(20)  NOT NULL DEFAULT 'track_button',
                isActive          TINYINT(1)   NOT NULL DEFAULT 1,
                createdAt         TIMESTAMP    NOT NULL DEFAULT NOW(),
                updatedAt         TIMESTAMP    NOT NULL DEFAULT NOW() ON UPDATE NOW()
            )
        `);

        // ── 6b. Migration — add routeId if table already existed ──
        try {
            await connection.execute(`
                ALTER TABLE flightPriceAlerts ADD COLUMN routeId VARCHAR(20)
            `);
        } catch (e: any) {
            // ER_DUP_FIELDNAME = column already exists -> ignore
            const isDup =
                e.code === "ER_DUP_FIELDNAME" ||
                e.errno === 1060 ||
                e.message?.includes("Duplicate column");
            if (!isDup) throw e;
        }

        // ── 7. Duplicate check ─────────────────────────────────
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
            `SELECT id FROM flightPriceAlerts
             WHERE email = ? AND origin = ? AND destination = ?
               AND departDate = ? AND isActive = 1
             LIMIT 1`,
            [email, origin, destination, departDate]
        );

        if (rows.length > 0) {
            return res.status(200).json({ success: true, alreadyExists: true });
        }

        // ── 8. Insert ──────────────────────────────────────────
        await connection.execute(
            `INSERT INTO flightPriceAlerts
                (email, origin, destination, departDate, returnDate,
                 targetPrice, currency, routeId, source, isActive)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [email, origin, destination, departDate, returnDate,
                currentPrice, currency, routeId, source]
        );

        console.info("[price-alerts] subscribed", { email, origin, destination, departDate });
        return res.status(200).json({ success: true, alreadyExists: false });

    } catch (error: any) {
        console.error("[price-alerts] error", error?.code, error?.message, error?.stack);
        return res.status(500).json({
            error: "Something went wrong. Please try again.",
            _debug: process.env.NODE_ENV !== "production" ? error?.message : undefined,
        });
    } finally {
        if (connection) await connection.end().catch(() => { });
    }
}
