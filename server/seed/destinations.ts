// server/seed/destinations.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seed country-level destination records into the `destinations` table.
//
// Usage:
//   npx tsx server/seed/destinations.ts
// ─────────────────────────────────────────────────────────────────────────────

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { destinations } from "../../drizzle/schema";

type CountrySeed = {
  slug: string;
  type: "country";
  name: string;
  countryCode: string;
  primaryAirports: string[];
  capital: string;
  iataCode: string | null;
  cities: Array<{ name: string; code: string }>;
  climate: string;
  highlights: string;
  weatherData: Record<string, any> | null;
  priceRatio: number | null;
};

const COUNTRY_SEEDS: CountrySeed[] = [
  {
    slug: "china",
    type: "country",
    name: "China",
    countryCode: "CN",
    primaryAirports: ["PEK", "PVG", "CAN", "KMG", "CTU", "SZX"],
    capital: "beijing",
    iataCode: null,
    cities: [
      { name: "Beijing", code: "PEK" },
      { name: "Shanghai", code: "PVG" },
      { name: "Guangzhou", code: "CAN" },
      { name: "Kunming", code: "KMG" },
      { name: "Chengdu", code: "CTU" },
      { name: "Shenzhen", code: "SZX" },
    ],
    climate: "Diverse — from subtropical south to cold-temperate north. Best travel window: spring (Apr–May) or autumn (Sep–Oct).",
    highlights: "Great Wall of China, Forbidden City Beijing, West Lake Hangzhou, Li River Guilin, Giant Panda Base Chengdu",
    weatherData: null,
    priceRatio: 1.8,
  },
  {
    slug: "japan",
    type: "country",
    name: "Japan",
    countryCode: "JP",
    primaryAirports: ["NRT", "KIX", "NGO", "FUK", "CTS"],
    capital: "tokyo",
    iataCode: null,
    cities: [
      { name: "Tokyo", code: "NRT" },
      { name: "Osaka", code: "KIX" },
      { name: "Nagoya", code: "NGO" },
      { name: "Fukuoka", code: "FUK" },
      { name: "Sapporo", code: "CTS" },
    ],
    climate: "Temperate with four distinct seasons. Cherry blossom in spring (Mar–Apr) and fall foliage (Oct–Nov) are peak travel seasons.",
    highlights: "Mount Fuji, Fushimi Inari Shrine Kyoto, Shibuya Crossing Tokyo, Osaka Castle, Hiroshima Peace Memorial",
    weatherData: null,
    priceRatio: 2.2,
  },
  {
    slug: "vietnam",
    type: "country",
    name: "Vietnam",
    countryCode: "VN",
    primaryAirports: ["SGN", "HAN", "DAD"],
    capital: "hanoi",
    iataCode: null,
    cities: [
      { name: "Ho Chi Minh City", code: "SGN" },
      { name: "Hanoi", code: "HAN" },
      { name: "Da Nang", code: "DAD" },
    ],
    climate: "Tropical monsoon. South is warm year-round; north has a cool winter (Nov–Feb). Best: Nov–Apr.",
    highlights: "Ha Long Bay, Hoi An Ancient Town, Cu Chi Tunnels, Phong Nha Caves, Mekong Delta",
    weatherData: null,
    priceRatio: 0.9,
  },
  {
    slug: "indonesia",
    type: "country",
    name: "Indonesia",
    countryCode: "ID",
    primaryAirports: ["DPS", "CGK", "SUB", "UPG"],
    capital: "jakarta",
    iataCode: null,
    cities: [
      { name: "Bali (Denpasar)", code: "DPS" },
      { name: "Jakarta", code: "CGK" },
      { name: "Surabaya", code: "SUB" },
      { name: "Makassar", code: "UPG" },
    ],
    climate: "Tropical with wet (Nov–Mar) and dry (Apr–Oct) seasons. Bali is best Apr–Sep.",
    highlights: "Ubud Rice Terraces, Borobudur Temple, Komodo Island, Raja Ampat, Mount Bromo",
    weatherData: null,
    priceRatio: 1.1,
  },
  {
    slug: "cambodia",
    type: "country",
    name: "Cambodia",
    countryCode: "KH",
    primaryAirports: ["PNH", "REP"],
    capital: "phnom-penh",
    iataCode: null,
    cities: [
      { name: "Phnom Penh", code: "PNH" },
      { name: "Siem Reap", code: "REP" },
    ],
    climate: "Tropical monsoon. Dry season (Nov–Apr) is the best time to visit Angkor Wat.",
    highlights: "Angkor Wat, Royal Palace Phnom Penh, Tonle Sap Lake, Kampot Pepper Farms, Koh Rong Island",
    weatherData: null,
    priceRatio: 0.85,
  },
  {
    slug: "laos",
    type: "country",
    name: "Laos",
    countryCode: "LA",
    primaryAirports: ["VTE", "LPQ"],
    capital: "vientiane",
    iataCode: null,
    cities: [
      { name: "Vientiane", code: "VTE" },
      { name: "Luang Prabang", code: "LPQ" },
    ],
    climate: "Tropical with distinct wet (May–Oct) and dry (Nov–Apr) seasons. Best visit: Nov–Feb.",
    highlights: "Kuang Si Falls, Luang Prabang Night Market, Pak Ou Caves, Vang Vieng Blue Lagoon, That Luang Stupa",
    weatherData: null,
    priceRatio: 0.75,
  },
];

async function seedCountryDestinations() {
  console.log("🌏 Phase 8 — Seeding country-level destination records...\n");

  // Connect to DB using the same pattern as server/db.ts
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is not set.");
    console.log("   Set it in your .env file or pass it inline:");
    console.log("   DATABASE_URL=mysql://... npx tsx server/seed/destinations.ts");
    process.exit(1);
  }

  let db: ReturnType<typeof drizzle>;
  try {
    db = drizzle(process.env.DATABASE_URL);
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }

  let inserted = 0;
  let updated = 0;

  for (const seed of COUNTRY_SEEDS) {
    try {
      const values = {
        slug: seed.slug,
        type: seed.type,
        name: seed.name,
        countryCode: seed.countryCode,
        primaryAirports: seed.primaryAirports,
        capital: seed.capital,
        iataCode: seed.iataCode,
        cities: seed.cities,
        climate: seed.climate,
        highlights: seed.highlights,
        weatherData: seed.weatherData,
        priceRatio: seed.priceRatio,
      };

      await db.insert(destinations)
        .values(values)
        .onDuplicateKeyUpdate({ set: values });

      console.log(`  ✅ ${seed.name} (${seed.countryCode}) — upserted with ${seed.primaryAirports.length} airports, ${seed.cities.length} cities`);
      inserted++;
    } catch (error) {
      console.error(`  ❌ Failed to seed ${seed.slug}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${inserted} records upserted`);
  console.log("   Verify at /flights/to/china — hero should read 'China', not 'Beijing'.");
  process.exit(0);
}

seedCountryDestinations().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
