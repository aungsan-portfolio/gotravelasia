import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { getDb } from "../server/db.ts";
import { flightPriceAlerts, emailQueue } from "../drizzle/schema.ts";

async function showStats() {
  try {
    const db = await getDb();
    if (!db) {
      console.log("Database not available.");
      return;
    }

    const alerts = await db.select().from(flightPriceAlerts);
    console.log("--- FLIGHT PRICE ALERTS ---");
    console.log(JSON.stringify(alerts, null, 2));

    const queue = await db.select().from(emailQueue);
    console.log("\n--- EMAIL QUEUE Status ---");
    console.log(JSON.stringify(queue.map(q => ({
      id: q.id,
      to: q.toEmail,
      status: q.status,
      subject: q.subject,
      attempts: q.attempts
    })), null, 2));

  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    process.exit(0);
  }
}

showStats();
