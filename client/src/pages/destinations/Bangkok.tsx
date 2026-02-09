import DestinationPage from "@/components/DestinationPage";

export default function Bangkok() {
  return (
    <DestinationPage
      name="Bangkok"
      heroImage="/images/bangkok.jpg"
      description="Bangkok is a sensory overload in the best way possible. From the golden spires of the Grand Palace to the neon-lit streets of Sukhumvit, this city blends ancient tradition with hyper-modernity. It's the world's street food capital, a shopper's paradise, and the gateway to Southeast Asia."
      bestTime="November to February"
      currency="Thai Baht (THB)"
      language="Thai"
      sections={[
        {
          title: "Where to Stay",
          content: `
            <p class="mb-4">Bangkok is huge, so choosing the right neighborhood is key. Stay near the BTS Skytrain or MRT Subway to beat the traffic.</p>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="bg-card p-4 rounded-lg border border-border">
                <h4 class="font-bold text-lg mb-1">Sukhumvit</h4>
                <p class="text-sm text-muted-foreground">The heart of modern Bangkok. Great for nightlife, shopping, and luxury hotels.</p>
              </div>
              <div class="bg-card p-4 rounded-lg border border-border">
                <h4 class="font-bold text-lg mb-1">Riverside</h4>
                <p class="text-sm text-muted-foreground">Scenic and upscale. Home to the Mandarin Oriental and Peninsula.</p>
              </div>
              <div class="bg-card p-4 rounded-lg border border-border">
                <h4 class="font-bold text-lg mb-1">Old City (Rattanakosin)</h4>
                <p class="text-sm text-muted-foreground">Close to the Grand Palace and temples. More traditional vibe.</p>
              </div>
              <div class="bg-card p-4 rounded-lg border border-border">
                <h4 class="font-bold text-lg mb-1">Siam</h4>
                <p class="text-sm text-muted-foreground">The shopping center of the city. Malls, malls, and more malls.</p>
              </div>
            </div>
          `
        },
        {
          title: "Top Things to Do",
          content: `
            <p class="mb-4">You could spend a lifetime in Bangkok and not see it all. Here are the absolute must-dos for first-timers.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Grand Palace & Wat Phra Kaew:</strong> The dazzling spiritual heart of the Thai Kingdom.</li>
              <li><strong>Wat Arun at Sunset:</strong> The Temple of Dawn is best viewed from across the river at twilight.</li>
              <li><strong>Chatuchak Weekend Market:</strong> One of the world's largest markets with over 15,000 stalls.</li>
              <li><strong>Street Food Tour in Chinatown:</strong> Yaowarat Road is famous for its incredible night eats.</li>
            </ul>
          `
        },
        {
          title: "Getting Around",
          content: `
            <p class="mb-4">Bangkok's traffic is legendary. Avoid it by using the skytrain and boats.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>BTS Skytrain & MRT:</strong> Fast, cheap, and air-conditioned. Covers most tourist areas.</li>
              <li><strong>Chao Phraya Express Boat:</strong> Scenic way to reach the Old City and temples.</li>
              <li><strong>Grab / Bolt:</strong> Essential apps for taxis. Avoid hailing cabs on the street to prevent scams.</li>
              <li><strong>Tuk-tuks:</strong> Fun for a short ride, but negotiate the price first!</li>
            </ul>
          `
        }
      ]}
      affiliateLinks={{
        klook: "https://www.klook.com/city/4-bangkok-things-to-do/",
        kiwi: "https://www.kiwi.com/en/search/results/anywhere/bangkok-thailand",
        traveloka: "https://www.traveloka.com/en-th/hotel/thailand/city/bangkok-10000045",
        welcomePickups: "https://www.welcomepickups.com/bangkok/",
        insurance: "https://ektatraveling.com/",
        esim: "https://www.airalo.com/thailand-esim"
      }}
    />
  );
}
