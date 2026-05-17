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

  const endpoint3 = "https://affiliateapi7643.agoda.com/affiliateservice/lt_v1";

  console.log("Testing endpoint 3:", endpoint3);
  const res3 = await fetch(endpoint3, { method: "POST", headers, body: JSON.stringify(body) });
  console.log("Status 3:", res3.status);
  const text3 = await res3.text();
  console.log("Response 3:", text3.substring(0, 200));
}

testApi();
