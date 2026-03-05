import type { VercelRequest, VercelResponse } from "@vercel/node";
import type mysql from "mysql2/promise";
import { createDbConnection } from "../../lib/db";
import { runMigrations } from "../../lib/migrations";
import { isValidEmail, ALLOWED_ORIGINS } from "../../lib/validators";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    const reqOrigin = req.headers.origin || "";
    if (ALLOWED_ORIGINS.some((o) => reqOrigin.startsWith(o))) {
        res.setHeader("Access-Control-Allow-Origin", reqOrigin);
        res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    let connection: Awaited<ReturnType<typeof createDbConnection>> | null = null;

    try {
        // Parse body
        let body: any = {};
        if (req.body && typeof req.body === "object") body = req.body;
        else if (typeof req.body === "string" && req.body.trim()) body = JSON.parse(req.body);

        if (body.hp) return res.status(200).json({ success: true }); // Honeypot

        // Normalize
        const email = String(body.email ?? "").trim().toLowerCase();
        const origin = String(body.origin ?? "").trim().toUpperCase();
        const destination = String(body.destination ?? "").trim().toUpperCase();
        const departDate = String(body.departDate ?? "").trim() || null;
        const returnDate = body.returnDate ? String(body.returnDate).trim() : null;
        const currentPrice = Number(body.currentPrice) || 0;
        const currency = String(body.currency ?? "USD").trim().toUpperCase();
        const routeId = String(body.routeId ?? "").trim() || null;
        const source = String(body.source ?? "track_button").trim();

        // Validate
        if (!email || !isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });
        if (!origin || !destination) return res.status(400).json({ error: "Missing origin or destination" });
        if (source === "track_button" && !departDate) return res.status(400).json({ error: "Missing departDate" });

        // DB
        connection = await createDbConnection();
        await runMigrations(connection);

        // Duplicate check
        const [rows] = await connection.execute<any[]>(
            `SELECT id FROM flightPriceAlerts
             WHERE email=? AND origin=? AND destination=? AND departDate=? AND isActive=1 LIMIT 1`,
            [email, origin, destination, departDate]
        );
        if (rows.length > 0) return res.status(200).json({ success: true, alreadyExists: true });

        // Insert
        await connection.execute(
            `INSERT INTO flightPriceAlerts
                (email, origin, destination, departDate, returnDate, targetPrice, currency, routeId, source, isActive)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [email, origin, destination, departDate, returnDate, currentPrice, currency, routeId, source]
        );

        console.info("[price-alerts] subscribed", { email, origin, destination, departDate });
        return res.status(200).json({ success: true, alreadyExists: false });

    } catch (error: any) {
        console.error("[price-alerts] error", error?.code, error?.message);
        return res.status(500).json({
            error: "Something went wrong. Please try again.",
            _debug: error?.message,
            _code: error?.code,
        });
    } finally {
        if (connection) await connection.end().catch(() => { });
    }
}
