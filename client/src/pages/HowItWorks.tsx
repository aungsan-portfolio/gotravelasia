import Layout from "@/components/Layout";
import SEO from "@/seo/SEO";
import { Link } from "wouter";
import {
  PAGE_COPY,
  SECTION_NAV,
  CAPABILITIES,
  SEARCH_FLOW_STEPS,
  PRODUCT_STRUCTURE,
  PRICING_NOTES,
  TRANSPARENCY_NOTES,
  CTA_COPY,
  CTA_LINKS,
} from "./how-it-works.constants";

export default function HowItWorks() {
  return (
    <Layout>
      <SEO
        path="/how-it-works"
        title={PAGE_COPY.hero.title}
        description={PAGE_COPY.hero.intro}
      />

      <section className="bg-background py-16 md:py-20" id="overview">
        <div className="container max-w-5xl space-y-10 md:space-y-14">
          <header className="space-y-4 text-balance">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              {PAGE_COPY.hero.eyebrow}
            </p>
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
              {PAGE_COPY.hero.title}
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {PAGE_COPY.hero.intro}
            </p>
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-xs italic text-muted-foreground/80 md:text-sm">
                Note: {PAGE_COPY.hero.note}
            </div>
          </header>

          <nav aria-label="How it works sections" className="sticky top-20 z-10 rounded-lg border border-border bg-background/95 p-4 backdrop-blur md:p-5">
            <ul className="flex flex-wrap gap-2 md:gap-3">
              {SECTION_NAV.map((link) => (
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

          <section id="what-you-can-do" className="scroll-mt-32 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What you can do</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {CAPABILITIES.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/20">
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

          <section id="search-flow" className="scroll-mt-32 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Search flow overview</h2>
            <div className="grid gap-3">
              {SEARCH_FLOW_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:flex-row md:items-start md:p-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Step {step.step}</div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="product-structure" className="scroll-mt-32 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Product structure overview</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {PRODUCT_STRUCTURE.map((layer) => {
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

          <section id="prices-availability" className="scroll-mt-32 space-y-4 rounded-xl border border-border bg-muted/20 p-5 md:p-6">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What affects prices and availability</h2>
            <ul className="space-y-3">
              {PRICING_NOTES.map((note, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                   <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                   {note}
                </li>
              ))}
            </ul>
          </section>

          <section id="transparency" className="scroll-mt-32 space-y-5 rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Transparency</h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {TRANSPARENCY_NOTES.map((note, i) => (
                <p key={i}>{note}</p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-primary/5 border border-primary/10 p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">{CTA_COPY.title}</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground italic">
                {CTA_COPY.description}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {CTA_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a className="inline-flex items-center justify-center rounded-full bg-background border border-border/50 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-primary hover:border-primary hover:text-white shadow-sm active:scale-95">
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}
