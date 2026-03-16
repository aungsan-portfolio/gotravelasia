import type { VercelRequest, VercelResponse } from "@vercel/node";
import mysql from "mysql2/promise";

const ALLOWED_ORIGINS = [
  "https://gotravelasia.com",
  "https://www.gotravelasia.com",
  "https://gotravel-asia.vercel.app",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean);

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── One-time schema migration (runs once per cold-start) ────────────────────
let schemaReady: Promise<void> | null = null;

function createConnection() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not configured");

  const url = new URL(dbUrl);

  return mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || "3306", 10),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
    connectTimeout: 10000,
  });
}

async function runMigrations() {
  const conn = await createConnection();

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS flightPriceAlerts (
        id                INT AUTO_INCREMENT PRIMARY KEY,
        email             VARCHAR(320) NOT NULL,
        origin            VARCHAR(3)   NULL,
        destination       VARCHAR(3)   NULL,
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

    const COLUMN_MIGRATIONS = [
      `ALTER TABLE flightPriceAlerts ADD COLUMN routeId VARCHAR(20)`,
      `ALTER TABLE flightPriceAlerts ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'track_button'`,
      `ALTER TABLE flightPriceAlerts ADD COLUMN returnDate VARCHAR(10)`,
      `ALTER TABLE flightPriceAlerts ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD'`,
      `ALTER TABLE flightPriceAlerts ADD COLUMN lastNotifiedPrice INT`,
    ];

    for (const sql of COLUMN_MIGRATIONS) {
      try {
        await conn.execute(sql);
      } catch (e: any) {
        if (!(e.code === "ER_DUP_FIELDNAME" || e.errno === 1060)) {
          throw e; // Bubble up unexpected errors
        }
      }
    }

    // Allow email-only subscriptions for routeId="other"
    try {
      await conn.execute(`ALTER TABLE flightPriceAlerts MODIFY origin VARCHAR(3) NULL`);
    } catch (e: any) {
      console.warn("[migration] MODIFY origin nullable:", e?.code, e?.message);
    }

    try {
      await conn.execute(`ALTER TABLE flightPriceAlerts MODIFY destination VARCHAR(3) NULL`);
    } catch (e: any) {
      console.warn("[migration] MODIFY destination nullable:", e?.code, e?.message);
    }

    try {
      await conn.execute(`ALTER TABLE flightPriceAlerts MODIFY departDate VARCHAR(10) NULL`);
    } catch (e: any) {
      console.warn("[migration] MODIFY departDate nullable:", e?.code, e?.message);
    }
  } finally {
    await conn.end().catch(() => {});
  }
}

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = runMigrations().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }

  return schemaReady;
}

// ── Request handler ──────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const reqOrigin = req.headers.origin || "";

  if (ALLOWED_ORIGINS.some((o) => reqOrigin.startsWith(o))) {
    res.setHeader("Access-Control-Allow-Origin", reqOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let connection: mysql.Connection | null = null;

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(500).json({ error: "Service temporarily unavailable" });
    }

    await ensureSchema();

    let body: any = {};
    if (req.body && typeof req.body === "object") {
      body = req.body;
    } else if (typeof req.body === "string" && req.body.trim()) {
      body = JSON.parse(req.body);
    }

    // honeypot
    if (body.hp) {
      return res.status(200).json({ success: true });
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const originRaw = String(body.origin ?? "").trim().toUpperCase();
    const destinationRaw = String(body.destination ?? "").trim().toUpperCase();
    const departDate = String(body.departDate ?? "").trim() || null;
    const returnDate = body.returnDate ? String(body.returnDate).trim() : null;
    const currentPrice = Number(body.currentPrice) || 0;
    const currency = String(body.currency ?? "USD").trim().toUpperCase();
    const routeId = String(body.routeId ?? "").trim() || null;
    const source = String(body.source ?? "track_button").trim();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const isOtherDestinationModal = source === "modal" && routeId === "other";

    const origin = originRaw || null;
    const destination = destinationRaw || null;

    if (!isOtherDestinationModal && (!origin || !destination)) {
      return res.status(400).json({ error: "Missing origin or destination" });
    }

    if (source === "track_button" && !departDate) {
      return res.status(400).json({ error: "Missing departDate" });
    }

    connection = await createConnection();

    // duplicate check
    let existingRows: mysql.RowDataPacket[] = [];

    if (isOtherDestinationModal) {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT id FROM flightPriceAlerts
         WHERE email=? AND routeId=? AND source=? AND isActive=1
         LIMIT 1`,
        [email, routeId, source]
      );
      existingRows = rows;
    } else {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT id FROM flightPriceAlerts
         WHERE email=? AND origin=? AND destination=? AND departDate <=> ? AND isActive=1
         LIMIT 1`,
        [email, origin, destination, departDate]
      );
      existingRows = rows;
    }

    if (existingRows.length > 0) {
      return res.status(200).json({ success: true, alreadyExists: true });
    }

    await connection.execute(
      `INSERT INTO flightPriceAlerts
        (email, origin, destination, departDate, returnDate, targetPrice, currency, routeId, source, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        email,
        origin,
        destination,
        departDate,
        returnDate,
        currentPrice,
        currency,
        routeId,
        source,
      ]
    );

    console.info("[price-alerts] subscribed", {
      email,
      origin,
      destination,
      departDate,
      routeId,
      source,
      emailOnly: isOtherDestinationModal,
    });

    return res.status(200).json({
      success: true,
      alreadyExists: false,
      emailOnly: isOtherDestinationModal,
    });
  } catch (error: any) {
    console.error("[price-alerts] error", error?.code, error?.message, error);
    return res.status(500).json({ 
      error: "Subscription failed", 
      message: error?.message || "Internal server error",
      code: error?.code
    });
  } finally {
    if (connection) {
      await connection.end().catch(() => {});
    }
  }
}
