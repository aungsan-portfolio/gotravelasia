import DestinationPage from "@/components/DestinationPage";

export default function Phuket() {
  return (
    <DestinationPage
      name="Phuket"
      heroImage="/images/phuket.jpg"
      description="Thailand's largest island, famous for its stunning beaches, vibrant nightlife, and luxury resorts."
      bestTime="November to April"
      currency="Thai Baht (THB)"
      language="Thai"
      sections={[
        {
          title: "Where to Stay",
          content: `
            <p class="mb-4">Phuket is huge, so choosing the right beach is key:</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Patong:</strong> Nightlife central, busy, loud.</li>
              <li><strong>Kata & Karon:</strong> Great beaches, family-friendly, good mix of dining.</li>
              <li><strong>Old Town:</strong> Heritage architecture, cafes, local food (no beach).</li>
              <li><strong>Bang Tao / Laguna:</strong> Luxury resorts and quieter vibes.</li>
            </ul>
          `
        },
        {
          title: "Things to Do",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Island Hopping:</strong> Phi Phi Islands, James Bond Island, Similan Islands.</li>
              <li><strong>Big Buddha:</strong> Iconic 45m tall marble statue with panoramic views.</li>
              <li><strong>Old Town Walking Street:</strong> Sunday market with local food and crafts.</li>
              <li><strong>Wat Chalong:</strong> The largest and most revered temple in Phuket.</li>
            </ul>
          `
        },
        {
          title: "Transport Tips",
          content: `
            <p>Taxis and Tuk-tuks in Phuket are expensive compared to other parts of Thailand. Use <strong>Grab</strong> or <strong>Bolt</strong> apps for fair prices. Renting a car is also a good option for exploring the whole island.</p>
          `
        }
      ]}
      affiliateLinks={{
        klook: "https://www.klook.com/en-US/city/6-phuket-things-to-do/?aid=111750",
        kiwi: "https://www.kiwi.com/en/search/results/yangon-myanmar/phuket-thailand",
        traveloka: "https://www.traveloka.com/en-th/hotel/thailand/region/phuket-10000088",
        welcomePickups: "https://www.welcomepickups.com/phuket/",
        insurance: "https://ektatraveling.com/",
        esim: "https://www.airalo.com/thailand-esim"
      }}
    />
  );
}
