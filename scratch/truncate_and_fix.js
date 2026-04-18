import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }

  const connection = await mysql.createConnection(url);

  try {
    console.log("Step 1: Truncating destinations...");
    await connection.query("TRUNCATE TABLE destinations");
    console.log("✅ destinations truncated.");

    console.log("Step 2: Truncating flightPriceAlerts...");
    await connection.query("TRUNCATE TABLE flightPriceAlerts");
    console.log("✅ flightPriceAlerts truncated.");

    console.log("\nDone! Tables are now empty. Run 'npx drizzle-kit push' again.");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await connection.end();
  }
}

run();
