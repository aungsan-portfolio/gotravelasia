import { lazy } from "react";

export interface BlogPostMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "best-things-to-do-in-bangkok",
    title: "10 Best Things to Do in Bangkok (2026 Guide)",
    excerpt: "From ancient temples to rooftop bars, here are the absolute must-do experiences in Thailand's capital.",
    category: "Activities",
    image: "/images/bangkok.webp",
    component: lazy(() => import("@/pages/blog/BestThingsToDoBangkok"))
  },
  {
    slug: "cheap-flights-to-bangkok",
    title: "How to Find Cheap Flights to Bangkok (2026 Hacks)",
    excerpt: "Stop overpaying for airfare. We've analyzed thousands of routes to find the best strategies for getting to BKK on a budget.",
    category: "Flights",
    image: "/images/hero-travel.webp",
    component: lazy(() => import("@/pages/blog/CheapFlightsBangkok"))
  },
  {
    slug: "best-airport-transfers-in-bangkok",
    title: "Best Airport Transfers in Bangkok: BKK & DMK Guide",
    excerpt: "Don't get scammed by taxi drivers. Here are the safest, most reliable ways to get from the airport to your hotel.",
    category: "Transfers",
    image: "/images/bangkok.webp",
    component: lazy(() => import("@/pages/blog/BestTransfersBangkok"))
  },
  {
    slug: "best-travel-insurance-for-thailand",
    title: "Best Travel Insurance for Thailand (2026 Review)",
    excerpt: "Medical bills in Thailand can be shocking. Here's how to protect yourself from accidents, theft, and cancellations.",
    category: "Insurance",
    image: "/images/bali.webp",
    component: lazy(() => import("@/pages/blog/BestInsuranceThailand"))
  },
  {
    slug: "best-esim-for-thailand",
    title: "Best eSIM for Thailand: Airalo vs. Local SIMs",
    excerpt: "Stay connected the moment you land. We tested the top eSIM providers to see which one offers the best speed and value.",
    category: "Tech",
    image: "/images/tokyo.webp",
    component: lazy(() => import("@/pages/blog/BestEsimThailand"))
  }
];

export function getPostBySlug(slug: string) {
  return BLOG_POSTS.find(p => p.slug === slug);
}
