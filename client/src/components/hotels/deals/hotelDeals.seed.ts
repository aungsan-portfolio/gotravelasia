export interface HotelDealSeed {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  cityName: string;
  badge: string;
  priceHint: string;
  imageEmoji: string;
}

/**
 * Curated hotel deal seeds focusing on popular Thailand destinations.
 */
export const HOTEL_DEAL_SEEDS: HotelDealSeed[] = [
  {
    id: "bangkok-city",
    title: "Bangkok city stays",
    subtitle: "Hotels near shopping, food, and BTS areas",
    city: "bangkok",
    cityName: "Bangkok",
    badge: "Popular",
    priceHint: "From budget to luxury",
    imageEmoji: "🏙️",
  },
  {
    id: "phuket-beach",
    title: "Phuket beach hotels",
    subtitle: "Beach resorts and weekend escapes",
    city: "phuket",
    cityName: "Phuket",
    badge: "Beach",
    priceHint: "Great for couples",
    imageEmoji: "🏖️",
  },
  {
    id: "chiang-mai-budget",
    title: "Chiang Mai budget stays",
    subtitle: "Old city guesthouses and boutique hotels",
    city: "chiang-mai",
    cityName: "Chiang Mai",
    badge: "Budget",
    priceHint: "Good value stays",
    imageEmoji: "⛰️",
  },
  {
    id: "pattaya-weekend",
    title: "Pattaya weekend deals",
    subtitle: "Quick beach trips from Bangkok",
    city: "pattaya",
    cityName: "Pattaya",
    badge: "Weekend",
    priceHint: "Short stay picks",
    imageEmoji: "🌊",
  },
  {
    id: "krabi-resorts",
    title: "Krabi resort deals",
    subtitle: "Island access and scenic resort stays",
    city: "krabi",
    cityName: "Krabi",
    badge: "Resort",
    priceHint: "Scenic stays",
    imageEmoji: "🏝️",
  },
];
