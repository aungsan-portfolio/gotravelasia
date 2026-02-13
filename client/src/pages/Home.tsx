import { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Ticket, Car, Wifi, ShieldCheck, ArrowRight, ExternalLink, MapPin, CheckCircle, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import TransportScheduleWidget from "@/components/TransportScheduleWidget";
import FlightWidget from "@/components/FlightWidget";

/* ─── Types & Constants ─── */
type Deal = {
  origin: string;
  destination: string;
  date: string;
  price: number;
  airline: string;
  flight_num?: string;
};

type Meta = {
  updated?: string;
  updated_at?: string;
  overall_cheapest?: Deal;
};

const AFFILIATE_MARKER = "697202";
const TRIP_COM_BASE = "https://www.trip.com/flights";

export default function Home() {
  const { t } = useTranslation();

  /* ─── Live Deal State ─── */
  const [deals, setDeals] = useState<Deal[]>([]);
  const [meta, setMeta] = useState<Meta>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/flight_data.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load flight_data.json");
        return res.json();
      })
      .then((data) => {
        setDeals((data.routes || []) as Deal[]);
        setMeta((data.meta || {}) as Meta);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const originMap: Record<string, string> = { RGN: "Yangon", MDL: "Mandalay" };
  const destMap: Record<string, string> = { BKK: "Bangkok", DMK: "Bangkok", CNX: "Chiang Mai", SIN: "Singapore", KUL: "Kuala Lumpur", SGN: "Ho Chi Minh" };

  const buildAviasalesUrl = useCallback((d: Deal) => {
    // Build Aviasales international URL: /search/{ORIGIN}{DEST}{DDMM}1
    const dp = new Date(d.date);
    const dd = String(dp.getDate()).padStart(2, "0");
    const mm = String(dp.getMonth() + 1).padStart(2, "0");
    const searchPath = `${d.origin}${d.destination}${dd}${mm}1`;
    return `https://www.aviasales.com/search/${searchPath}?marker=${AFFILIATE_MARKER}&locale=en`;
  }, []);

  const buildTripComUrl = useCallback((d: Deal) => {
    const params = new URLSearchParams({
      locale: "en_US", dcity: d.origin, acity: d.destination, ddate: d.date, class: "Y", quantity: "1", searchBoxArg: "t",
    });
    return `${TRIP_COM_BASE}?${params.toString()}`;
  }, []);

  const track = useCallback((event: "deal_click_aviasales" | "deal_click_tripcom", payload?: Record<string, unknown>) => {
    const key = `gt_${event}_${new Date().toISOString().slice(0, 10)}`;
    const current = Number(localStorage.getItem(key) || "0");
    localStorage.setItem(key, String(current + 1));
    console.log("[TRACK]", event, { count: current + 1, payload });
  }, []);

  const openNewTab = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const updatedText = meta.updated_at || meta.updated || "";

  /* ─── Original Category Data ─── */
  const categories = [
    { icon: Plane, labelKey: "categories.findFlights", link: "https://www.kiwi.com/en/search/results/yangon-myanmar/bangkok-thailand", color: "text-blue-500" },
    { icon: Hotel, labelKey: "categories.agodaHotels", link: "https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=YOUR_AGODA_CID&city=15932", color: "text-indigo-500" },
    { icon: Ticket, labelKey: "categories.thingsToDo", link: "https://www.klook.com/en-US/country/4-thailand-things-to-do/", color: "text-pink-500" },
    { icon: Car, labelKey: "categories.transfers", link: "https://www.welcomepickups.com/", color: "text-orange-500" },
    { icon: Wifi, labelKey: "categories.esim", link: "https://www.airalo.com/thailand-esim", color: "text-green-500" },
    { icon: ShieldCheck, labelKey: "categories.insurance", link: "https://ektatraveling.com/", color: "text-red-500" },
  ];

  const featuredDestinations = [
    { nameKey: "destinations.chiangMai", descKey: "destinations.chiangMaiDesc", image: "/images/chiang-mai.jpg", link: "/thailand/chiang-mai" },
    { nameKey: "destinations.bangkok", descKey: "destinations.bangkokDesc", image: "/images/bangkok.jpg", link: "/thailand/bangkok" },
    { nameKey: "destinations.phuket", descKey: "destinations.phuketDesc", image: "/images/phuket.jpg", link: "/thailand/phuket" },
  ];

  return (
    <Layout>
      {/* ═══════════ HERO SECTION (ORIGINAL) ═══════════ */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-travel.jpg"
            alt="Thailand Temple"
            className="w-full h-full object-cover grayscale contrast-125 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
        </div>

        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {t("hero.title")}<br />
            <span className="text-primary">{t("hero.country")}</span>
          </h1>
          <p className="text-lg md:text-xl text-secondary font-mono uppercase tracking-[0.2em] mb-4 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
            {t("hero.slogan")}
          </p>
          {/* SEO Keyword Subtitle */}
          <p className="text-sm text-white/60 font-mono uppercase tracking-widest mb-8">Cheap Flights from Myanmar to Thailand</p>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 font-light tracking-wide animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            {t("hero.subtitle")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            {categories.map((cat, index) => (
              <a
                key={index}
                href={cat.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full"
              >
                <div className="bg-background/10 backdrop-blur-md border border-white/20 p-6 flex flex-col items-center justify-center gap-3 hover:bg-primary hover:border-primary transition-all duration-300 h-full">
                  <cat.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white tracking-wide uppercase">{t(cat.labelKey)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FLIGHT SEARCH WIDGET (NEW) ═══════════ */}
      <section id="flight-search-section" className="py-20 bg-muted/20 border-b border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex-1 space-y-4 md:pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Plane className="w-3 h-3" /> Search &amp; Compare
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Find Cheap Flights from Myanmar</h2>
              <p className="text-muted-foreground text-lg">
                Compare prices from Yangon (RGN) or Mandalay (MDL) to Bangkok, Chiang Mai, Singapore &amp; more. Powered by Aviasales.
              </p>
            </div>
            <div className="flex-1 w-full">
              <FlightWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ LIVE CHEAPEST DEALS (NEW) ═══════════ */}
      <section className="py-20 bg-background border-b border-border">
        <div className="container">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-bold tracking-tighter mb-2">Live Flight Deals</h2>
              <p className="text-muted-foreground font-mono uppercase text-sm tracking-wider">
                {updatedText ? `Updated ${updatedText}` : "Real-time prices from airlines"}
              </p>
            </div>
          </div>

          {meta.overall_cheapest && (
            <div className="mb-8 bg-green-50 border border-green-200 p-4 flex items-center justify-between rounded-none">
              <p className="font-bold text-green-800">
                🔥 Best Deal: {originMap[meta.overall_cheapest.origin] || meta.overall_cheapest.origin} → {destMap[meta.overall_cheapest.destination] || meta.overall_cheapest.destination} — ${meta.overall_cheapest.price}
                <span className="text-sm font-normal text-green-600 ml-2">({meta.overall_cheapest.airline} on {meta.overall_cheapest.date})</span>
              </p>
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700 font-mono uppercase text-xs"
                onClick={() => { track("deal_click_aviasales", meta.overall_cheapest as unknown as Record<string, unknown>); openNewTab(buildAviasalesUrl(meta.overall_cheapest!)); }}
              >
                Book Now <ExternalLink className="ml-1 w-3 h-3" />
              </Button>
            </div>
          )}

          {loading ? (
            <p className="text-center text-muted-foreground animate-pulse py-16 font-mono">Loading latest deals...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-16 font-mono">Failed to load deals. Please refresh.</p>
          ) : deals.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 font-mono">No deals right now. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => {
                const aviaUrl = buildAviasalesUrl(deal);
                const tripUrl = buildTripComUrl(deal);
                return (
                  <div
                    key={`${deal.origin}-${deal.destination}-${deal.date}`}
                    className="bg-card border border-border p-6 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => { track("deal_click_aviasales", deal as unknown as Record<string, unknown>); openNewTab(aviaUrl); }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{originMap[deal.origin] || deal.origin} → {destMap[deal.destination] || deal.destination}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{deal.airline} {deal.flight_num || ""} • {deal.date}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">Deal</span>
                    </div>

                    <p className="text-3xl font-bold text-primary mb-4">${deal.price}</p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary text-primary-foreground font-mono uppercase text-xs hover:bg-primary/90"
                        onClick={(e) => { e.stopPropagation(); track("deal_click_aviasales", deal as unknown as Record<string, unknown>); openNewTab(aviaUrl); }}
                      >
                        Book on Aviasales <ExternalLink className="ml-1 w-3 h-3" />
                      </Button>
                    </div>
                    <a
                      href={tripUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-xs text-muted-foreground hover:text-primary mt-3 font-mono"
                      onClick={(e) => { e.stopPropagation(); track("deal_click_tripcom", deal as unknown as Record<string, unknown>); }}
                    >
                      Or book with Trip.com (hotel bundle) →
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ TRANSPORT WIDGET (ORIGINAL) ═══════════ */}
      <section className="py-16 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Book Your Transport</h2>
          <p className="text-muted-foreground mb-8 text-lg">Search for buses, trains, and minibuses between Thai cities. Compare prices and book directly.</p>
          <TransportScheduleWidget />
        </div>
      </section>

      {/* ═══════════ FEATURED DESTINATIONS (ORIGINAL) ═══════════ */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tighter mb-2">Explore Thailand</h2>
              <p className="text-muted-foreground font-mono uppercase text-sm tracking-wider">Curated guides for the Land of Smiles</p>
            </div>
            <Button variant="outline" className="hidden md:flex gap-2 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((dest, index) => (
              <div key={index} className="group block bg-card border border-border flex flex-col h-full">
                <Link href={dest.link} className="relative aspect-[4/5] overflow-hidden bg-muted block">
                  <img
                    src={dest.image}
                    alt={t(dest.nameKey)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{t(dest.nameKey)}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                      {t(dest.descKey)}
                    </p>
                  </div>
                </Link>
                <div className="p-6 grid grid-cols-2 gap-3 mt-auto bg-card">
                  <a href="https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=YOUR_AGODA_CID&city=15932" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full text-xs font-mono uppercase">Agoda Hotels</Button>
                  </a>
                  <a href="https://www.klook.com/en-US/country/4-thailand-things-to-do/" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full text-xs font-mono uppercase">View Tours</Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TRIP EXAMPLE BOX (ORIGINAL) ═══════════ */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight">
                Your Thailand<br />
                <span className="text-primary">Travel Expert.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We simplify your journey by connecting you with the most trusted travel partners in Southeast Asia. Plan, book, and go—all in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                {[
                  { icon: Plane, title: "Flights", desc: "Best connections via Aviasales", link: `https://www.aviasales.com/search/RGN?marker=${AFFILIATE_MARKER}&locale=en` },
                  { icon: Hotel, title: "Agoda Stays", desc: "Best hotel deals on Agoda", link: "https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=YOUR_AGODA_CID&city=15932" },
                  { icon: Ticket, title: "Experiences", desc: "Adventures by Klook", link: "https://www.klook.com/en-US/country/4-thailand-things-to-do/" },
                  { icon: Car, title: "Transfers", desc: "Reliable rides via Welcome Pickups", link: "https://www.welcomepickups.com/" },
                ].map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="group block space-y-2 hover:bg-background/50 p-4 -mx-4 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded-none mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5 text-primary group-hover:text-white" />
                    </div>
                    <h4 className="font-bold flex items-center gap-2">{item.title} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-2xl" />
              <div className="relative bg-background border border-border p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                  <span className="font-mono text-sm text-muted-foreground">TRIP_EXAMPLE: #TH8829</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">Estimated Cost</span>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm">Flight to Chiang Mai</h5>
                      <p className="text-xs text-muted-foreground font-mono mt-1">BKK → CNX • 1h 15m</p>
                    </div>
                    <a href={`https://www.aviasales.com/search/BKKCNX1?marker=${AFFILIATE_MARKER}&locale=en`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-xs font-mono uppercase text-primary hover:text-primary hover:bg-primary/10">Check Price</Button>
                    </a>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600">
                      <Hotel className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm">Boutique Hotel</h5>
                      <p className="text-xs text-muted-foreground font-mono mt-1">3 Nights • Nimman</p>
                    </div>
                    <a href="https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=YOUR_AGODA_CID&city=18296" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-xs font-mono uppercase text-primary hover:text-primary hover:bg-primary/10">Agoda Check</Button>
                    </a>
                  </div>

                  <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 text-pink-600">
                      <Ticket className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-sm">Doi Inthanon Tour</h5>
                      <p className="text-xs text-muted-foreground font-mono mt-1">Full Day • Guided</p>
                    </div>
                    <a href="https://www.klook.com/en-US/city/4-chiang-mai-things-to-do/" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="text-xs font-mono uppercase text-primary hover:text-primary hover:bg-primary/10">View Tours</Button>
                    </a>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-bold text-sm text-muted-foreground">Total Estimate</span>
                    <span className="font-mono text-lg font-bold text-foreground">~฿7,200</span>
                  </div>
                </div>

                <div className="mt-8">
                  <a href={`https://www.aviasales.com/search/RGNCNX1?marker=${AFFILIATE_MARKER}&locale=en`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full font-mono uppercase tracking-wider bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors h-12">
                      Book This Trip Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER (ORIGINAL) ═══════════ */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Don't Miss the Next Deal</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Join thousands of travelers getting the best Thailand travel tips and deals.
          </p>
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 h-12 px-4 bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-white hover:text-primary font-bold px-8">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-primary-foreground/60 mt-4 font-mono">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </Layout>
  );
}
