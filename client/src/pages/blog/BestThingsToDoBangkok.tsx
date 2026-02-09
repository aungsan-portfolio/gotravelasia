import MoneyPage, { MoneyPageData } from "@/components/MoneyPage";

const data: MoneyPageData = {
  title: "10 Best Things to Do in Bangkok (2026 Guide)",
  subtitle: "From ancient temples to rooftop bars, here are the absolute must-do experiences in Thailand's capital.",
  author: "GoTravel Team",
  updatedDate: "January 2026",
  intro: "Bangkok is a city that never sleeps. It's a chaotic, colorful, and captivating mix of old and new. Whether you're a culture vulture, a foodie, or a party animal, there's something here for you. We've curated the top experiences you simply can't miss.",
  products: [
    {
      name: "Grand Palace & Wat Phra Kaew",
      rating: 5.0,
      bestFor: "Culture & History",
      description: "The Grand Palace is the spiritual heart of Thailand. It's a dazzling complex of golden spires and intricate mosaics. Within its walls lies Wat Phra Kaew, the Temple of the Emerald Buddha, the most sacred site in the country.",
      pros: ["Incredible architecture", "Deep cultural significance", "Must-see for first-timers"],
      cons: ["Very crowded", "Strict dress code", "Expensive entry fee"],
      ctaText: "Book Guided Tour",
      affiliateLink: "https://www.klook.com/activity/123-grand-palace-tour/",
      price: "$45 USD"
    },
    {
      name: "Chao Phraya Dinner Cruise",
      rating: 4.5,
      bestFor: "Romance & Views",
      description: "See Bangkok's landmarks illuminated at night while enjoying a buffet dinner on the River of Kings. It's a magical way to see Wat Arun and the Grand Palace from a different perspective.",
      pros: ["Relaxing atmosphere", "Great views of lit-up temples", "Includes dinner"],
      cons: ["Food quality varies by boat", "Can be touristy"],
      ctaText: "Check Prices",
      affiliateLink: "https://www.klook.com/activity/456-dinner-cruise/",
      price: "$35 USD"
    },
    {
      name: "Floating Markets Tour",
      rating: 4.0,
      bestFor: "Photo Ops",
      description: "Damnoen Saduak is the most famous floating market. It's a bit of a drive from the city, but seeing vendors paddling boats piled high with fruit and souvenirs is an iconic Thai image.",
      pros: ["Unique experience", "Great for photography", "Try local snacks"],
      cons: ["Far from city center", "Very commercialized"],
      ctaText: "Book Day Trip",
      affiliateLink: "https://www.klook.com/activity/789-floating-market/",
      price: "$25 USD"
    },
    {
      name: "Mahanakhon SkyWalk",
      rating: 4.8,
      bestFor: "Thrills & Views",
      description: "Walk on a glass tray 314 meters above the city. The Mahanakhon SkyWalk offers the best 360-degree views of Bangkok's sprawling skyline. Sunset is the best time to go.",
      pros: ["Best view in Bangkok", "Glass floor thrill", "Rooftop bar"],
      cons: ["Not for those afraid of heights", "Lines can be long"],
      ctaText: "Get Tickets",
      affiliateLink: "https://www.klook.com/activity/101-mahanakhon-skywalk/",
      price: "$28 USD"
    }
  ],
  conclusion: "If you only have time for one thing, make it the Grand Palace. It's the most iconic site in the city. For a relaxing evening, the Dinner Cruise is hard to beat. And if you want the best photo for your Instagram, head to the Mahanakhon SkyWalk."
};

export default function BestThingsToDoBangkok() {
  return <MoneyPage data={data} />;
}
