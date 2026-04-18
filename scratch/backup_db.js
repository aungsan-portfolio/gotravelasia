import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

async function backup() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }

  const connection = await mysql.createConnection(url);

  const exportDir = path.join(process.cwd(), ".backup", "db_export");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  try {
    // Export destinations
    console.log("Exporting destinations...");
    const [destRows] = await connection.query("SELECT * FROM destinations");
    fs.writeFileSync(
      path.join(exportDir, "destinations.json"),
      JSON.stringify(destRows, null, 2)
    );
    console.log(`Exported ${Array.isArray(destRows) ? destRows.length : 0} rows from destinations.`);

    // Export flightPriceAlerts
    console.log("Exporting flightPriceAlerts...");
    const [alertRows] = await connection.query("SELECT * FROM flightPriceAlerts");
    fs.writeFileSync(
      path.join(exportDir, "flightPriceAlerts.json"),
      JSON.stringify(alertRows, null, 2)
    );
    console.log(`Exported ${Array.isArray(alertRows) ? alertRows.length : 0} rows from flightPriceAlerts.`);

  } catch (err) {
    console.error("Backup failed:", err);
  } finally {
    await connection.end();
  }
}

backup();
