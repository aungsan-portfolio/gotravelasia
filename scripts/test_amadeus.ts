import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { fetchAmadeusCalendarPrices } from "../server/_core/amadeus";

async function test() {
    console.log("Testing Amadeus API for BKK -> SIN in March 2026...");
    try {
        const prices = await fetchAmadeusCalendarPrices("BKK", "SIN", "2026-03");
        console.log("Amadeus API responded with data for", Object.keys(prices).length, "dates:");

        // Print the first 5 records
        const entries = Object.entries(prices).slice(0, 5);
        for (const [date, data] of entries) {
            console.log(`- ${date}: $${data.price} (${data.airline})`);
        }
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
