// scripts/bot-cheap-hotels.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load both .env and .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { agoda } from "../server/api/agoda.js";
import { getDb } from "../server/db.js";
import { hotelDeals } from "../drizzle/schema.js";
import { sql } from "drizzle-orm";
import { addDays, format } from "date-fns";

/**
 * Cheap Hotel Bot
 * Crawls Agoda for the best deals in popular SEA cities.
 */

const TARGET_CITIES = [
  { 
    name: "Bangkok", 
    iata: "BKK", 
    propertyIds: [12157, 161828, 584661, 236242, 1060563, 670185, 442658, 286591] 
  },
  { 
    name: "Chiang Mai", 
    iata: "CNX", 
    propertyIds: [63630, 161918, 590928, 235654, 485934] 
  },
  { 
    name: "Yangon", 
    iata: "RGN", 
    propertyIds: [408434, 1159152, 408453, 610086] 
  },
];

async function runBot() {
  console.log("🤖 [Cheap Hotel Bot] Starting crawl...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ [Cheap Hotel Bot] Database not available.");
    return;
  }

  // Set search dates (14 days from now)
  const checkIn = format(addDays(new Date(), 14), "yyyy-MM-dd");
  const checkOut = format(addDays(new Date(), 16), "yyyy-MM-dd");

  for (const city of TARGET_CITIES) {
    console.log(`🔍 [Cheap Hotel Bot] Searching ${city.name} (${city.iata})...`);
    
    const deals = await agoda.searchAvailability({
      propertyIds: city.propertyIds,
      checkIn,
      checkOut,
      currency: "USD",
    });

    if (deals.length === 0) {
      console.warn(`⚠️ [Cheap Hotel Bot] No deals found for ${city.name}. Check Agoda API status.`);
      continue;
    }

    console.log(`✅ [Cheap Hotel Bot] Found ${deals.length} rates for ${city.name}.`);

    // Clean up old deals for this city before inserting new ones
    // (Or we could upsert based on hotelId)
    for (const deal of deals) {
      try {
        await db.insert(hotelDeals).values({
          hotelId: String(deal.hotelId),
          hotelName: deal.hotelName,
          city: city.name,
          price: Math.round(deal.cheapestPrice),
          currency: deal.currency,
          discountPercentage: deal.discountPercentage || 0,
          imageUrl: deal.imageUrl || null,
          bookingUrl: deal.bookingUrl,
          checkIn,
          checkOut,
          isBotVerified: true,
        }).onDuplicateKeyUpdate({
          set: {
            price: Math.round(deal.cheapestPrice),
            discountPercentage: deal.discountPercentage || 0,
            imageUrl: deal.imageUrl || null,
            updatedAt: new Date(),
          }
        });
      } catch (err) {
        console.error(`❌ [Cheap Hotel Bot] Failed to save deal for ${deal.hotelName}:`, err);
      }
    }
  }

  console.log("🏁 [Cheap Hotel Bot] Finished.");
  process.exit(0);
}

runBot().catch(err => {
  console.error("💥 [Cheap Hotel Bot] Fatal Error:", err);
  process.exit(1);
});
