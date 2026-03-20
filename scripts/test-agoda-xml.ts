import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function testXml() {
  const fullKey = process.env.AGODA_API_KEY || ""; 
  const [siteId, apiKey] = fullKey.split(":");
  
  if (!siteId || !apiKey) {
    console.error("Missing keys in .env.local");
    return;
  }

  const url = "http://affiliateapi7643.agoda.com/affiliateservice/lt_v1";

  const xml = `
    <HotelSearchRequest xmlns="http://v3.hotelsearch.agoda.com">
      <Authentication siteid="${siteId}" apikey="${apiKey}" />
      <Criteria>
        <CheckIn>2026-06-10</CheckIn>
        <CheckOut>2026-06-12</CheckOut>
        <Adults>2</Adults>
        <Children>0</Children>
        <CityId>3940</CityId>
      </Criteria>
    </HotelSearchRequest>
  `.trim();

  console.log(`\n--- Testing XML to ${url} ---`);
  try {
    const res = await axios.post(url, xml, {
      headers: { 
        "Content-Type": "text/xml",
        "Authorization": fullKey 
      },
      timeout: 10000
    });
    console.log("✅ Success!", res.data.substring(0, 1000));
  } catch (err: any) {
    console.log(`❌ Fail: ${err.response?.status || err.message}`);
    if (err.response?.data) {
      console.log("Error details:", String(err.response.data).substring(0, 500));
    }
  }
}

testXml();
