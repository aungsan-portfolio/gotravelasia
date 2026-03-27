import Layout from "@/components/Layout";
import SEO from "@/seo/SEO";
import {
  BedDouble,
  Bus,
  CircleCheck,
  Compass,
  Database,
  FileText,
  Plane,
  Search,
  ShieldCheck,
} from "lucide-react";

const sectionLinks = [
  { id: "what-you-can-do", label: "What you can do" },
  { id: "search-flow", label: "Search flow" },
  { id: "product-structure", label: "Product structure" },
  { id: "pricing", label: "Pricing & availability" },
  { id: "transparency", label: "Transparency" },
];

const capabilities = [
  {
    title: "Flight search",
    description:
      "Search flight options using the website's flight routes and search tools.",
    icon: Plane,
  },
  {
    title: "Hotel discovery",
    description:
      "Browse hotel-related pages and search experiences available on GoTravel Asia.",
    icon: BedDouble,
  },
  {
    title: "Transport planning",
    description:
      "Explore transport options such as buses, ferries, trains, or transfers where available.",
    icon: Bus,
  },
  {
    title: "Destination content",
    description:
      "Read destination and travel content to help plan trips before booking.",
    icon: Compass,
  },
];

const flowSteps = [
  {
    title: "1) Enter trip details",
    description: "You choose route, dates, and traveler details from the relevant search page.",
  },
  {
    title: "2) Validate inputs",
    description: "The app checks required fields and formats before sending requests.",
  },
  {
    title: "3) Request data",
    description:
      "Depending on the product area, the app may request data or booking links from external partners.",
  },
  {
    title: "4) Show results",
    description:
      "You see available options and can compare details directly in the results experience.",
  },
  {
    title: "5) Continue to booking",
    description:
      "For some options, you continue on a partner page to complete booking.",
  },
];

const productLayers = [
  {
    title: "Pages and route structure",
    description:
      "Public pages include home, search routes, destination content, and support/legal pages.",
    icon: FileText,
  },
  {
    title: "Shared UI components",
    description:
      "Reusable components keep layout, cards, forms, and page sections visually consistent.",
    icon: CircleCheck,
  },
  {
    title: "Search state and helpers",
    description:
      "Feature-level hooks and utilities manage search state, query parameters, and formatting.",
    icon: Search,
  },
  {
    title: "Data and integration layer",
    description:
      "Client data utilities and API service modules handle partner responses and related transforms.",
    icon: Database,
  },
  {
    title: "Reliability and safeguards",
    description:
      "Error boundaries, fallbacks, and basic analytics/error handling support product quality.",
    icon: ShieldCheck,
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      <SEO
        path="/how-it-works"
        title="How GoTravel Asia Works"
        description="A high-level overview of how GoTravel Asia helps users explore flights, hotels, and transport options."
      />

      <section className="bg-background py-16 md:py-20">
        <div className="container max-w-5xl space-y-10 md:space-y-14">
          <header className="space-y-4 text-balance">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">How it works</p>
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">How GoTravel Asia Works</h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              This page explains, at a high level, how GoTravel Asia helps you search and compare travel options for flights, hotels, and transport.
              It is designed to be clear and practical rather than technical.
            </p>
          </header>

          <nav aria-label="How it works sections" className="rounded-lg border border-border bg-muted/30 p-4 md:p-5">
            <ul className="flex flex-wrap gap-2 md:gap-3">
              {sectionLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section id="what-you-can-do" className="scroll-mt-24 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What you can do</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="search-flow" className="scroll-mt-24 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Search flow overview</h2>
            <div className="grid gap-3">
              {flowSteps.map((step) => (
                <article key={step.title} className="rounded-xl border border-border bg-card p-4 md:p-5">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="product-structure" className="scroll-mt-24 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Product structure overview</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {productLayers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <article key={layer.title} className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold">{layer.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{layer.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="pricing" className="scroll-mt-24 space-y-4 rounded-xl border border-border bg-muted/20 p-5 md:p-6">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What affects prices and availability</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              <li>Prices can change quickly based on demand, dates, route, and partner updates.</li>
              <li>Availability depends on live responses from external providers and may change between searches.</li>
              <li>Final price and booking terms are shown on the partner or checkout page when you continue.</li>
            </ul>
          </section>

          <section id="transparency" className="scroll-mt-24 rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Transparency note</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              This page is a high-level overview of the user-facing product experience. It is not a full technical specification,
              and it does not describe every integration path, operational detail, or provider-specific behavior.
            </p>
          </section>
        </div>
      </section>
    </Layout>
  );
}
