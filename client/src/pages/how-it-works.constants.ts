import {
  Compass,
  Plane,
  Building2,
  Bus,
  Map,
  Search,
  CheckCircle2,
  Link2,
  LayoutGrid,
  Layers3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const PAGE_COPY = {
  hero: {
    eyebrow: "Product Overview",
    title: "How GoTravel Asia Works",
    intro:
      "GoTravel Asia helps you explore flights, hotels, transport options, and destination content in one place. This page gives a simple overview of how the experience works, what can affect prices and availability, and when you may continue on a partner page.",
    note:
      "This is a high-level product overview. It does not describe every technical detail, provider relationship, or backend process.",
  },
};

export const SECTION_NAV = [
  { id: "overview", label: "Overview" },
  { id: "what-you-can-do", label: "What you can do" },
  { id: "search-flow", label: "Search flow" },
  { id: "product-structure", label: "Product structure" },
  { id: "prices-availability", label: "Prices and availability" },
  { id: "transparency", label: "Transparency" },
] as const;

export const CAPABILITIES = [
  {
    title: "Flights",
    description:
      "Search flight routes, compare available options, and continue to booking pages when relevant.",
    icon: Plane,
  },
  {
    title: "Hotels",
    description:
      "Explore hotel options and destination-based stays with a layout designed to support planning and comparison.",
    icon: Building2,
  },
  {
    title: "Transport",
    description:
      "Check transport-related options that may help with local or regional travel planning.",
    icon: Bus,
  },
  {
    title: "Destination content",
    description:
      "Read destination and travel content to better understand places, planning ideas, and trip context.",
    icon: Map,
  },
] as const;

export const SEARCH_FLOW_STEPS = [
  {
    step: "01",
    title: "Enter trip details",
    description:
      "You enter your trip details, such as route, dates, or destination.",
    icon: Search,
  },
  {
    step: "02",
    title: "Input is checked",
    description:
      "The app checks the input and prepares the request so the next step is more consistent and easier to process.",
    icon: CheckCircle2,
  },
  {
    step: "03",
    title: "Data or booking links are requested",
    description:
      "Depending on the product area, the app may request data or booking links from external partners.",
    icon: Link2,
  },
  {
    step: "04",
    title: "Results are shown",
    description:
      "Available results are shown in a format designed to support browsing, comparison, and next-step decisions.",
    icon: LayoutGrid,
  },
  {
    step: "05",
    title: "Continue where relevant",
    description:
      "For some options, you continue on a partner page to complete booking.",
    icon: ArrowRight,
  },
] as const;

export const PRODUCT_STRUCTURE = [
  {
    title: "Pages and routes",
    description:
      "Public pages are organized by route so users can move between search, content, and informational pages in a consistent way.",
    icon: Compass,
  },
  {
    title: "Shared interface components",
    description:
      "Reusable interface components help keep layouts, cards, controls, and page sections visually consistent across the site.",
    icon: Layers3,
  },
  {
    title: "Search and page logic",
    description:
      "Search-related state and page logic help connect user input, requests, and result presentation.",
    icon: Search,
  },
  {
    title: "Search and partner connections",
    description:
      "Some parts of the experience rely on external data or partner links, depending on the feature and the information available at the time.",
    icon: Link2,
  },
  {
    title: "Quality safeguards",
    description:
      "Error boundaries, fallbacks, and basic analytics/error handling support product quality and help improve the overall experience.",
    icon: ShieldCheck,
  },
] as const;

export const PRICING_NOTES = [
  "Travel prices and availability can change over time. What you see may depend on timing, route, destination, partner response, and how recently the underlying data was updated.",
  "Because some parts of the experience depend on external providers or partner pages, final pricing, inventory, or booking terms may differ from what was shown earlier in the browsing flow.",
  "When possible, the product is designed to make this process easier to follow, but availability and final booking details are not always controlled directly by GoTravel Asia.",
] as const;

export const TRANSPARENCY_NOTES = [
  "This page is intended as a simple overview of how GoTravel Asia works from a user perspective. It is not a full technical specification, and it does not list every integration, provider, or internal implementation detail.",
  "Where external partners are involved, the final experience may depend in part on those partner pages, their availability, and their terms.",
] as const;

export const CTA_COPY = {
  title: "Ready to start exploring?",
  description:
    "Browse flights, hotels, transport options, or destination content and continue with the path that best fits your trip.",
};

export const CTA_LINKS = [
  { label: "Explore flights", href: "/flights" },
  { label: "Explore hotels", href: "/hotels" },
  { label: "Read destination guides", href: "/blog" },
] as const;
