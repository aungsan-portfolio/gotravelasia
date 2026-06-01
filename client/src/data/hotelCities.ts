export interface HotelCitySEOData {
  slug: string;
  cityName: string;
  country: string;
  title: string;
  description: string;
  canonicalPath: string;
  heroImage: string;
  aboutText: string;
  areasToStay: { name: string; description: string }[];
  bestTimeToVisit: string;
}

export const hotelCitiesRegistry: Record<string, HotelCitySEOData> = {
  bangkok: {
    slug: "bangkok",
    cityName: "Bangkok",
    country: "Thailand",
    title: "Bangkok Hotels: Best Places to Stay in 2026 | GoTravel Asia",
    description: "Find the best areas to stay in Bangkok, Thailand. Compare hotel options from budget stays to luxury resorts along the Chao Phraya River.",
    canonicalPath: "/hotels/bangkok",
    heroImage: "/images/bangkok.webp",
    aboutText: "Bangkok is a vibrant metropolis blending ornate shrines with modern skyscrapers. Finding the perfect hotel means deciding whether you want to be near the shopping districts, the historic riverside, or the bustling nightlife.",
    areasToStay: [
      { name: "Sukhumvit", description: "Best for shopping, dining, and nightlife with excellent BTS Skytrain access." },
      { name: "Riverside", description: "Ideal for luxury stays and stunning views of the Chao Phraya River." },
      { name: "Silom", description: "The central business district by day, transforming into a vibrant entertainment hub by night." },
      { name: "Old City (Khao San)", description: "Perfect for budget travelers and backpackers seeking historic sites and street food." }
    ],
    bestTimeToVisit: "November to February offers the most pleasant weather, with cooler temperatures and less humidity."
  },
  phuket: {
    slug: "phuket",
    cityName: "Phuket",
    country: "Thailand",
    title: "Phuket Hotels & Beach Resorts | GoTravel Asia",
    description: "Discover the best beachfront resorts, boutique hotels, and budget stays in Phuket, Thailand. Plan your perfect island getaway.",
    canonicalPath: "/hotels/phuket",
    heroImage: "/images/phuket.webp",
    aboutText: "Phuket is Thailand's largest island, famous for its spectacular beaches, vibrant nightlife, and luxury resorts. Whether you're looking for a quiet romantic retreat or a lively party scene, Phuket has a beach to match your style.",
    areasToStay: [
      { name: "Patong Beach", description: "The epicenter of nightlife, shopping, and water sports. Best for those who want to be in the middle of the action." },
      { name: "Kata & Karon", description: "Family-friendly beaches with great swimming, restaurants, and a more relaxed vibe than Patong." },
      { name: "Bang Tao", description: "Home to the luxury Laguna complex, offering upscale resorts and pristine stretches of sand." },
      { name: "Phuket Town", description: "Rich in Sino-Portuguese history, offering boutique heritage hotels and incredible local food." }
    ],
    bestTimeToVisit: "December through March provides the best beach weather with clear skies and calm seas."
  },
  "chiang-mai": {
    slug: "chiang-mai",
    cityName: "Chiang Mai",
    country: "Thailand",
    title: "Chiang Mai Hotels & Boutique Stays | GoTravel Asia",
    description: "Explore the best boutique hotels, heritage guesthouses, and luxury resorts in the cultural heart of Northern Thailand.",
    canonicalPath: "/hotels/chiang-mai",
    heroImage: "/images/chiangmai.webp",
    aboutText: "Nestled in the mountainous north, Chiang Mai is a haven of Lanna culture, ancient temples, and digital nomads. The city offers incredible value with charming boutique hotels and eco-resorts.",
    areasToStay: [
      { name: "Old City", description: "Stay inside the ancient moated city walls to be within walking distance of historic temples and Sunday walking streets." },
      { name: "Nimmanhaemin", description: "The trendy, modern district packed with cafes, boutiques, and chic modern hotels." },
      { name: "Riverside", description: "Peaceful luxury resorts along the Ping River, slightly removed from the city bustle." }
    ],
    bestTimeToVisit: "November to February for cool, comfortable weather perfect for temple hopping and night markets."
  },
  singapore: {
    slug: "singapore",
    cityName: "Singapore",
    country: "Singapore",
    title: "Singapore Hotels: Luxury & Boutique Stays | GoTravel Asia",
    description: "Find your perfect stay in Singapore. From iconic Marina Bay luxury to heritage shophouse hotels in Chinatown.",
    canonicalPath: "/hotels/singapore",
    heroImage: "/images/singapore.webp",
    aboutText: "Singapore offers world-class hospitality, blending futuristic architecture with rich heritage. While generally more expensive than its neighbors, the city-state provides exceptional quality, safety, and cleanliness.",
    areasToStay: [
      { name: "Marina Bay", description: "Home to iconic luxury hotels, stunning skyline views, and proximity to Gardens by the Bay." },
      { name: "Orchard Road", description: "The ultimate shopping district, featuring premium international hotel brands." },
      { name: "Chinatown & Keong Saik", description: "Beautifully restored heritage shophouses turned into stylish boutique hotels." },
      { name: "Sentosa Island", description: "Perfect for family vacations and resort-style getaways right in the city." }
    ],
    bestTimeToVisit: "Singapore is a year-round destination, though February to April often sees slightly less rainfall."
  },
  bali: {
    slug: "bali",
    cityName: "Bali",
    country: "Indonesia",
    title: "Bali Hotels, Villas & Resorts | GoTravel Asia",
    description: "Discover paradise in Bali. Compare private villas in Ubud, surf resorts in Canggu, and luxury beachfront hotels in Seminyak.",
    canonicalPath: "/hotels/bali",
    heroImage: "/images/bali.webp",
    aboutText: "Bali is an island of gods, offering everything from spiritual jungle retreats to vibrant beachfront clubs. Your experience will heavily depend on which region you choose to call home.",
    areasToStay: [
      { name: "Ubud", description: "The cultural heart, offering jungle villas, yoga retreats, and rice terrace views." },
      { name: "Canggu", description: "A trendy surf town popular with digital nomads, featuring stylish boutique hotels and private villas." },
      { name: "Seminyak", description: "Upscale beach resorts, fine dining, and sophisticated beach clubs." },
      { name: "Uluwatu", description: "Dramatic cliffside luxury resorts offering the best sunset views on the island." }
    ],
    bestTimeToVisit: "The dry season from April to October is ideal for beach days and exploring the island."
  }
};
