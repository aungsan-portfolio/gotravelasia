import { AgodaClient } from "../server/api/agoda.ts";

async function test() {
  console.log("🚀 [Agoda Test] Starting search...");
  const client = new AgodaClient();
  
  try {
    const res = await client.searchAvailability({
      propertyIds: [12157],
      checkIn: "2026-06-10",
      checkOut: "2026-06-12",
      currency: "USD"
    });
    
    console.log("✅ [Agoda Test] Results:", JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error("❌ [Agoda Test] Error:", err.response?.data || err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Headers:", err.response.headers);
    }
  }
}

test();
