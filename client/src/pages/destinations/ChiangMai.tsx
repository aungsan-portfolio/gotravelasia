import DestinationPage from "@/components/DestinationPage";

export default function ChiangMai() {
  return (
    <DestinationPage
      name="Chiang Mai"
      heroImage="/images/chiang-mai.jpg" // You might need to update this image path or ensure the image exists
      description="The cultural heart of Northern Thailand. Explore ancient temples, misty mountains, and vibrant night markets in this laid-back city."
      bestTime="November to February (Cool Season)"
      currency="Thai Baht (THB)"
      language="Thai"
      sections={[
        {
          title: "Best Areas to Stay",
          content: `
            <div class="space-y-6">
              <div class="bg-card p-6 rounded-lg border border-border">
                <h3 class="text-xl font-bold mb-2">Old City (The Square)</h3>
                <p class="text-muted-foreground mb-4">Best for first-timers and culture lovers. Walkable to major temples like Wat Chedi Luang and Sunday Walking Street.</p>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Budget:</strong> Stamps Backpackers</li>
                  <li><strong>Mid-Range:</strong> Phor Liang Meun Terracotta Arts Hotel</li>
                  <li><strong>Luxury:</strong> Tamarind Village</li>
                </ul>
              </div>
              
              <div class="bg-card p-6 rounded-lg border border-border">
                <h3 class="text-xl font-bold mb-2">Nimmanhaemin (Nimman)</h3>
                <p class="text-muted-foreground mb-4">Trendy, modern area with digital nomad cafes, boutique shops, and vibrant nightlife.</p>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Budget:</strong> Alexa Hostel</li>
                  <li><strong>Mid-Range:</strong> Art Mai Gallery Hotel</li>
                  <li><strong>Luxury:</strong> Akyra Manor Chiang Mai</li>
                </ul>
              </div>

               <div class="bg-card p-6 rounded-lg border border-border">
                <h3 class="text-xl font-bold mb-2">Riverside</h3>
                <p class="text-muted-foreground mb-4">Relaxed atmosphere with upscale resorts and riverside dining. Perfect for couples and families.</p>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Luxury:</strong> Anantara Chiang Mai Resort</li>
                </ul>
              </div>
            </div>
          `
        },
        {
          title: "Nature & Mountain Trips",
          content: `
            <p class="mb-4">Chiang Mai is the gateway to Thailand's mountains. Don't miss these nature escapes:</p>
            <ul class="list-disc pl-5 space-y-2 mb-6">
              <li><strong>Doi Inthanon National Park:</strong> Visit the highest point in Thailand, twin pagodas, and waterfalls.</li>
              <li><strong>Doi Suthep:</strong> The iconic golden temple overlooking the city. Hike up the monk's trail for an adventure.</li>
              <li><strong>Elephant Sanctuaries:</strong> Visit ethical sanctuaries like Elephant Nature Park (observe only, no riding).</li>
              <li><strong>Mon Jam:</strong> Scenic mountain farming community with glamping options and strawberry fields.</li>
            </ul>
            <div class="bg-accent/10 p-4 rounded-md border border-accent">
              <p class="font-bold text-accent-foreground">Pro Tip: Rent a motorbike to explore the Samoeng Loop for stunning mountain views, but only if you are an experienced rider.</p>
            </div>
          `
        },
        {
          title: "Temples & Markets",
          content: `
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-bold text-lg mb-2">Must-Visit Temples</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Wat Phra That Doi Suthep</li>
                  <li>Wat Chedi Luang</li>
                  <li>Wat Phra Singh</li>
                  <li>Wat Umong (Tunnel Temple)</li>
                </ul>
              </div>
              <div>
                <h3 class="font-bold text-lg mb-2">Famous Markets</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li><strong>Sunday Walking Street:</strong> Massive market inside Old City.</li>
                  <li><strong>Saturday Walking Street:</strong> Wualai Road.</li>
                  <li><strong>Night Bazaar:</strong> Open every night, great for souvenirs.</li>
                  <li><strong>Warorot Market:</strong> Local daytime market for food and fabrics.</li>
                </ul>
              </div>
            </div>
          `
        },
        {
          title: "Transport Guide",
          content: `
            <table class="w-full text-sm text-left border-collapse">
              <thead>
                <tr class="border-b border-border">
                  <th class="py-2 font-bold">Mode</th>
                  <th class="py-2 font-bold">Best For</th>
                  <th class="py-2 font-bold">Approx Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/50">
                  <td class="py-2">Red Songthaew</td>
                  <td class="py-2">Short hops in city</td>
                  <td class="py-2">30 THB</td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="py-2">Grab / Bolt</td>
                  <td class="py-2">Convenience & comfort</td>
                  <td class="py-2">60-200 THB</td>
                </tr>
                 <tr class="border-b border-border/50">
                  <td class="py-2">Motorbike Rental</td>
                  <td class="py-2">Freedom to explore</td>
                  <td class="py-2">200-300 THB/day</td>
                </tr>
                <tr>
                  <td class="py-2">RTC City Bus</td>
                  <td class="py-2">Budget airport transfer</td>
                  <td class="py-2">30 THB</td>
                </tr>
              </tbody>
            </table>
            <p class="mt-4 text-sm text-muted-foreground"><strong>Airport Transfer:</strong> The easiest way to get to your hotel is via Airport Taxi (flat rate 150 THB to Old City) or Grab.</p>
          `
        }
      ]}
      affiliateLinks={{
        klook: "https://www.klook.com/en-US/city/4-chiang-mai-things-to-do/",
        kiwi: "https://www.kiwi.com/en/search/results/yangon-myanmar/chiang-mai-thailand",
        traveloka: "https://www.traveloka.com/en-th/hotel/thailand/city/chiang-mai-10000008",
        welcomePickups: "https://www.welcomepickups.com/chiang-mai/",
        insurance: "https://ektatraveling.com/",
        esim: "https://www.airalo.com/thailand-esim"
      }}
    />
  );
}
