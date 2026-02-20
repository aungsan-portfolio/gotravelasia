import DestinationPage from "@/components/DestinationPage";

export default function ChiangRai() {
  return (
    <DestinationPage
      name="Chiang Rai"
      heroImage="/images/chiang-rai.jpg"
      description="Home to the famous White Temple, Blue Temple, and the Golden Triangle."
      bestTime="November to February"
      currency="Thai Baht (THB)"
      language="Thai"
      sections={[
        {
          title: "Must-See Temples",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>White Temple (Wat Rong Khun):</strong> A surreal, modern artistic masterpiece.</li>
              <li><strong>Blue Temple (Wat Rong Suea Ten):</strong> Stunning vibrant blue interior.</li>
              <li><strong>Black House (Baan Dam):</strong> A museum of dark art and traditional architecture.</li>
            </ul>
          `
        },
        {
          title: "Other Sights",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Golden Triangle:</strong> Where Thailand, Laos, and Myanmar meet.</li>
              <li><strong>Singha Park:</strong> Tea plantations and scenic gardens.</li>
              <li><strong>Clock Tower:</strong> Light show every evening at 7, 8, and 9 PM.</li>
            </ul>
          `
        },
        {
          title: "Transport",
          content: `
            <p>Chiang Rai has its own international airport (CEI). It's also a 3-hour bus ride from Chiang Mai.</p>
          `
        }
      ]}
      affiliateLinks={{
        klook: "https://www.klook.com/en-US/city/9-chiang-rai-things-to-do/?aid=111750",
        kiwi: "https://www.kiwi.com/en/search/results/yangon-myanmar/chiang-rai-thailand",
        traveloka: "https://www.traveloka.com/en-th/hotel/thailand/province/chiang-rai-10000002",
        welcomePickups: "https://www.welcomepickups.com/",
        insurance: "https://ektatraveling.com/",
        esim: "https://airalo.tpx.gr/rLWEywcV"
      }}
    />
  );
}
