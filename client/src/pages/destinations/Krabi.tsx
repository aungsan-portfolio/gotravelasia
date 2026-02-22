import DestinationPage from "@/components/DestinationPage";
import { buildAviasalesUrl, buildAgodaPartnerUrl, buildKlookUrl, AFFILIATE } from "@/lib/config";

export default function Krabi() {
  return (
    <DestinationPage
      name="Krabi"
      heroImage="/images/krabi.webp"
      description="Home to limestone cliffs, clear emerald waters, and the famous Railay Beach."
      bestTime="November to April"
      currency="Thai Baht (THB)"
      language="Thai"
      sections={[
        {
          title: "Where to Stay",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Ao Nang:</strong> The main tourist hub, convenient for boat trips.</li>
              <li><strong>Railay Beach:</strong> Accessible only by boat, stunning scenery, rock climbing.</li>
              <li><strong>Krabi Town:</strong> Authentic local vibe, night markets, budget-friendly.</li>
            </ul>
          `
        },
        {
          title: "Things to Do",
          content: `
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Railay Beach:</strong> Rock climbing and sunset views.</li>
              <li><strong>Tiger Cave Temple:</strong> Climb 1,237 steps for a 360-degree view.</li>
              <li><strong>Emerald Pool & Hot Springs:</strong> Natural jungle pools.</li>
              <li><strong>4 Island Tour:</strong> Visit Koh Poda, Chicken Island, Tup Island, and Phra Nang Cave.</li>
            </ul>
          `
        },
        {
          title: "Getting There",
          content: `
            <p>Fly directly into Krabi International Airport (KBV). From Ao Nang, you can take longtail boats to Railay and nearby islands.</p>
          `
        }
      ]}
      affiliateLinks={{
        klook: buildKlookUrl("/en-US/city/7-krabi-things-to-do/"),
        kiwi: buildAviasalesUrl("RGN", "KBV"),
        traveloka: buildAgodaPartnerUrl(17071),
        welcomePickups: "https://www.welcomepickups.com/krabi/",
        insurance: "https://ektatraveling.com/",
        esim: AFFILIATE.AIRALO_URL
      }}
    />
  );
}
