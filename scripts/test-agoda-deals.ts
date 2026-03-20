import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const ENDPOINTS = [
  "https://affiliateapi7643.agoda.com/api/v1/ProductDeals"
];

async function testDeals() {
  const fullKey = process.env.AGODA_API_KEY || ""; 
  
  if (!fullKey) {
    console.error("Missing AGODA_API_KEY in .env.local");
    return;
  }

  const [siteId, apiKey] = fullKey.split(":");

  // ProductDeals payload
  const payload = {
    siteId,
    apiKey,
    cityId: 3940, // Bangkok
    currency: "USD",
    language: "en-us",
    rows: 10
  };

  for (const url of ENDPOINTS) {
    console.log(`\n--- Testing ProductDeals: ${url} ---`);
    try {
      const res = await axios.post(url, payload, {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": fullKey 
        },
        timeout: 5000
      });
      console.log("✅ Success!", JSON.stringify(res.data).substring(0, 1000));
    } catch (err: any) {
      console.log(`❌ Fail: ${err.response?.status || err.message}`);
      if (err.response?.data) {
        console.log("Error details:", JSON.stringify(err.response.data).substring(0, 500));
      }
    }
  }
}

testDeals();
