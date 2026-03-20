import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function testV2() {
  const fullKey = process.env.AGODA_API_KEY || ""; 
  const [siteId, apiKey] = fullKey.split(":");
  
  if (!siteId || !apiKey) {
    console.error("Missing keys");
    return;
  }

  const url = "https://api.agoda.com/api/v2/Search";

  const payload = {
    apiKey: apiKey,
    siteId: siteId,
    checkIn: "2026-06-10",
    checkOut: "2026-06-12",
    cityId: 3940,
    adults: 2,
    children: 0,
    rooms: 1,
    currency: "USD"
  };

  console.log(`\n--- Testing V2: ${url} ---`);
  try {
    const res = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });
    console.log("✅ Success!", JSON.stringify(res.data).substring(0, 500));
  } catch (err: any) {
    console.log(`❌ Fail: ${err.response?.status || err.message}`);
    if (err.response?.data) {
      console.log("Error details:", JSON.stringify(err.response.data).substring(0, 500));
    }
  }
}

testV2();
