import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

const ENDPOINTS = [
  "https://affiliateapi7643.agoda.com/api/v1/AvailabilitySearch",
  "http://affiliateapi7643.agoda.com/affiliateservice/lt_v1"
];

async function testAll() {
  const fullKey = process.env.AGODA_API_KEY || ""; 
  
  if (!fullKey) {
    console.error("Missing AGODA_API_KEY in .env.local");
    return;
  }

  const [siteId, apiKey] = fullKey.split(":");

  // PascalCase payload as seen in some Agoda Lite API docs
  const payload = {
    Criteria: {
      SiteId: siteId,
      ApiKey: apiKey,
      CheckIn: "2026-06-10",
      CheckOut: "2026-06-12",
      Adults: 2,
      Children: 0,
      PropertyIds: [12157],
      Currency: "USD",
      Language: "en-us"
    }
  };

  for (const url of ENDPOINTS) {
    console.log(`\n--- Testing PascalCase: ${url} ---`);
    try {
      const res = await axios.post(url, payload, {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": fullKey 
        },
        timeout: 5000
      });
      console.log("✅ Success!", JSON.stringify(res.data).substring(0, 500));
    } catch (err: any) {
      console.log(`❌ Fail: ${err.response?.status || err.message}`);
      if (err.response?.data) {
        console.log("Error details:", JSON.stringify(err.response.data).substring(0, 500));
      }
    }
  }
}

testAll();
