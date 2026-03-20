import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function testNsf() {
  const fullKey = process.env.AGODA_API_KEY || ""; 
  const [siteId, apiKey] = fullKey.split(":");
  
  if (!siteId || !apiKey) {
    console.error("Missing keys");
    return;
  }

  const url = "https://nsf.agoda.com/api/v1/AvailabilitySearch";

  const payload = {
    criteria: {
      siteId: Number(siteId),
      apiKey: apiKey,
      checkIn: "2026-06-10",
      checkOut: "2026-06-12",
      rooms: 1,
      adults: 2,
      children: 0,
      propertyIds: [12157],
      currency: "USD",
      language: "en-us"
    }
  };

  console.log(`\n--- Testing NSF: ${url} ---`);
  try {
    const res = await axios.post(url, payload, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": fullKey // siteid:apikey
      },
      timeout: 10000
    });
    console.log("✅ Success!", JSON.stringify(res.data).substring(0, 1000));
  } catch (err: any) {
    console.log(`❌ Fail: ${err.response?.status || err.message}`);
    if (err.response?.data) {
      console.log("Error details:", JSON.stringify(err.response.data));
    }
  }
}

testNsf();
