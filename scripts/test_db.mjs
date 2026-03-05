// Quick DB connection test — run with: DATABASE_URL="mysql://..." node scripts/test_db.mjs
import mysql from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error("Set DATABASE_URL env var first!"); process.exit(1); }

async function main() {
    const url = new URL(dbUrl);
    console.log("Parsed:", {
        host: url.hostname,
        port: url.port,
        user: url.username,
        database: url.pathname.slice(1),
    });

    const pool = mysql.createPool({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.slice(1),
        ssl: { rejectUnauthorized: false },
        connectTimeout: 10000,
        connectionLimit: 1,
        waitForConnections: true,
    });

    console.log("Pool created, getting connection...");
    const conn = await pool.getConnection();
    console.log("Got connection!");

    console.log("Running CREATE TABLE...");
    await conn.execute(`
        CREATE TABLE IF NOT EXISTS flightPriceAlerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(320) NOT NULL,
            origin VARCHAR(3) NOT NULL,
            destination VARCHAR(3) NOT NULL,
            departDate VARCHAR(10),
            targetPrice INT NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT 'THB',
            source VARCHAR(20) NOT NULL DEFAULT 'track_button',
            isActive BOOLEAN NOT NULL DEFAULT TRUE,
            createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
            updatedAt TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
        )
    `);
    console.log("Table OK!");
    conn.release();

    console.log("Running SELECT...");
    const [rows] = await pool.query("SELECT COUNT(*) AS cnt FROM flightPriceAlerts");
    console.log("Row count:", rows[0]);

    await pool.end();
    console.log("Done! DB connection works ✅");
}

main().catch((err) => {
    console.error("FAILED:", err.message);
    console.error(err.stack);
    process.exit(1);
});
