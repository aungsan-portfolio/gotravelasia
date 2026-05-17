const fetch = require('node-fetch');

async function testApi() {
  const body = {
    criteria: {
      additional: {
        currency: "USD",
        language: "en-us",
        maxResult: 5,
        occupancy: { numberOfAdult: 2, numberOfChildren: 0 },
        sortBy: "Recommended"
      },
      checkInDate: "2026-06-01",
      checkOutDate: "2026-06-04",
      cityId: 9395
    }
  };

  const headers = {
    "Content-Type": "application/json",
    "Authorization": "1959281:971b051c-d761-4d6f-ab67-6c65a4155999",
    "Accept-Encoding": "gzip,deflate"
  };

  const endpoint1 = "https://affiliateapi7643.agoda.com/api/v1/hostel/recommend";
  const endpoint2 = "http://affiliateapi7643.agoda.com/affiliateservice/lt_v1";

  console.log("Testing endpoint 1:", endpoint1);
  const res1 = await fetch(endpoint1, { method: "POST", headers, body: JSON.stringify(body) });
  console.log("Status 1:", res1.status);
  const text1 = await res1.text();
  console.log("Response 1:", text1);

  console.log("\nTesting endpoint 2:", endpoint2);
  const res2 = await fetch(endpoint2, { method: "POST", headers, body: JSON.stringify(body) });
  console.log("Status 2:", res2.status);
  const text2 = await res2.text();
  console.log("Response 2:", text2);
}

testApi();
