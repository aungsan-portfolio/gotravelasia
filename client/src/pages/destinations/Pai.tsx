import DestinationPage from "@/components/DestinationPage";

export default function Pai() {
  return (
    <DestinationPage
      name="Pai"
      heroImage="/images/pai.webp"
      description="A bohemian mountain town known for its relaxed vibe, hot springs, and Pai Canyon."
      bestTime="November to February"
      currency="Thai Baht (THB)"
      language="Thai"
      sections={[
        {
          title: "The Vibe",
          content: `
            <p>Pai is famous for its slow pace of life. It's a favorite among backpackers and nature lovers. Expect reggae bars, organic cafes, and misty mornings.</p>
          `
        },
        {
          title: "Top Attractions",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Pai Canyon:</strong> Stunning narrow trails with sunset views.</li>
              <li><strong>Tha Pai Hot Springs:</strong> Natural thermal pools in the forest.</li>
              <li><strong>Bamboo Bridge (Kho Ku So):</strong> Walk over rice paddies to a temple.</li>
              <li><strong>Walking Street:</strong> Night market with street food and handicrafts.</li>
            </ul>
          `
        },
        {
          title: "Getting There",
          content: `
            <p>Take a minivan from Chiang Mai Arcade Bus Station (approx. 3-4 hours, 762 curves!). Motion sickness medicine recommended.</p>
          `
        }
      ]}
      affiliateLinks={{
        klook: "https://www.klook.com/en-US/city/4-chiang-mai-things-to-do/?aid=111750", // Pai activities often listed under Chiang Mai region
        kiwi: "https://www.kiwi.com/en/search/results/yangon-myanmar/chiang-mai-thailand",
        traveloka: "https://www.traveloka.com/en-th/hotel/thailand/city/pai-district-10000216",
        welcomePickups: "https://www.welcomepickups.com/",
        insurance: "https://ektatraveling.com/",
        esim: "https://airalo.tpx.gr/rLWEywcV"
      }}
    />
  );
}
