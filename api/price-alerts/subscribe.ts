import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { flightPriceAlerts } from "../../drizzle/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return res.status(500).json({ error: "Database not configured" });
        }

        const db = drizzle(dbUrl);

        const { email, origin, destination, departDate, returnDate, currentPrice, currency } = req.body;
        if (!email || !origin || !destination || !departDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if exactly same active alert exists
        const existing = await db.select().from(flightPriceAlerts).where(
            and(
                eq(flightPriceAlerts.email, email),
                eq(flightPriceAlerts.origin, origin),
                eq(flightPriceAlerts.destination, destination),
                eq(flightPriceAlerts.departDate, departDate),
                eq(flightPriceAlerts.isActive, true)
            )
        ).limit(1);

        if (existing.length > 0) {
            return res.status(200).json({ success: true, alreadyExists: true });
        }

        await db.insert(flightPriceAlerts).values({
            email,
            origin,
            destination,
            departDate,
            returnDate: returnDate || null,
            targetPrice: Number(currentPrice) || 0,
            currency: currency || "THB",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return res.status(200).json({ success: true, alreadyExists: false });
    } catch (error) {
        console.error("Price alert subscription error:", error);
        return res.status(500).json({ error: "Failed to create price alert" });
    }
}
