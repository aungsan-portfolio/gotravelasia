import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, ArrowRight, ExternalLink, MapPin, CheckCircle, Loader2 } from "lucide-react";
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
const AGODA_CID = "1959281";

/* ─── Hotel Search Form ─── */
const HOTEL_CITIES = [
  { name: "Bangkok", slug: "bangkok-th" },
  { name: "Chiang Mai", slug: "chiang-mai-th" },
  { name: "Phuket", slug: "phuket-th" },
  { name: "Krabi", slug: "krabi-th" },
  { name: "Singapore", slug: "singapore-sg" },
  { name: "Kuala Lumpur", slug: "kuala-lumpur-my" },
  { name: "Hanoi", slug: "hanoi-vn" },
  { name: "Ho Chi Minh City", slug: "ho-chi-minh-city-vn" },
];

function HotelsSearchForm() {
  const today = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);

  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split("T")[0]
    : today;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const citySlug = fd.get("city") as string;
    const checkInDate = fd.get("checkIn") as string;
    const checkOutDate = fd.get("checkOut") as string;

    if (!checkInDate || !checkOutDate || new Date(checkOutDate) <= new Date(checkInDate)) {
      alert("Please select valid check-in and check-out dates");
      return;
    }

    const url = `https://www.agoda.com/city/${citySlug}.html?cid=${AGODA_CID}&checkIn=${checkInDate}&checkout=${checkOutDate}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-secondary uppercase font-bold mb-1 block font-mono tracking-wider">
            Destination
          </label>
          <select
            name="city"
            defaultValue="bangkok-th"
            className="w-full p-4 bg-background text-foreground border border-border focus:ring-2 focus:ring-primary outline-none font-medium"
          >
            {HOTEL_CITIES.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-secondary uppercase font-bold mb-1 block font-mono tracking-wider">
            Check-in
          </label>
          <input
            type="date"
            name="checkIn"
            defaultValue={today}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full p-4 bg-background text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-secondary uppercase font-bold mb-1 block font-mono tracking-wider">
            Check-out
          </label>
          <input
            type="date"
            name="checkOut"
            min={minCheckOut}
            required
            className="w-full p-4 bg-background text-foreground border border-border focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full md:w-auto md:self-end font-mono uppercase tracking-wider bg-secondary text-secondary-foreground hover:bg-primary hover:text-white transition-colors h-12 px-10"
      >
        Search Hotels on Agoda 🏨
      </Button>
    </form>
  );
}

/* ─── Popular Routes Config (prices come from bot data) ─── */
const ROUTE_CONFIG = [
  { from: "Yangon", to: "Bangkok", origin: "RGN", dest: "BKK" },
  { from: "Yangon", to: "Singapore", origin: "RGN", dest: "SIN" },
  { from: "Yangon", to: "Chiang Mai", origin: "RGN", dest: "CNX" },
  { from: "Mandalay", to: "Bangkok", origin: "MDL", dest: "BKK" },
  { from: "Yangon", to: "KL", origin: "RGN", dest: "KUL" },
  { from: "Yangon", to: "Hanoi", origin: "RGN", dest: "HAN" },
  { from: "Yangon", to: "Phuket", origin: "RGN", dest: "HKT" },
  { from: "Mandalay", to: "Chiang Mai", origin: "MDL", dest: "CNX" },
  { from: "Yangon", to: "Ho Chi Minh", origin: "RGN", dest: "SGN" },
  { from: "Yangon", to: "Phnom Penh", origin: "RGN", dest: "PNH" },
];

/* ─── Tab Config ─── */
const TABS = [
  { id: "flights" as const, icon: "✈️", label: "Flights" },
  { id: "hotels" as const, icon: "🏨", label: "Hotels" },
  { id: "transport" as const, icon: "🚌", label: "Transport in Thailand" },
];

/* ═══════════════════════════════════════════════════════════ */

export default function Home() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "transport">("flights");

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
  const destMap: Record<string, string> = {
    BKK: "Bangkok", DMK: "Bangkok", CNX: "Chiang Mai", HKT: "Phuket",
    SIN: "Singapore", KUL: "Kuala Lumpur", SGN: "Ho Chi Minh",
    HAN: "Hanoi", PNH: "Phnom Penh",
  };

  const buildAviasalesUrl = useCallback((d: Deal) => {
    const params = new URLSearchParams({
      origin_iata: d.origin,
      destination_iata: d.destination,
      depart_date: d.date,
      one_way: "true",
      adults: "1",
      locale: "en",
      currency: "USD",
    });
    const targetUrl = `https://www.aviasales.com/search?${params.toString()}`;
    return `https://tp.media/r?marker=${AFFILIATE_MARKER}&p=4114&u=${encodeURIComponent(targetUrl)}`;
  }, []);

  const buildTripComUrl = useCallback((d: Deal) => {
    const params = new URLSearchParams({
      locale: "en_US", dcity: d.origin, acity: d.destination, ddate: d.date,
      class: "Y", quantity: "1", searchBoxArg: "t",
      Allianceid: "7796167", SID: "293794502",
    });
    return `${TRIP_COM_BASE}?${params.toString()}`;
  }, []);

  const buildRouteUrl = useCallback((origin: string, dest: string, dealDate?: string) => {
    const searchDate = dealDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    const targetUrl = `https://www.aviasales.com/search?origin_iata=${origin}&destination_iata=${dest}&depart_date=${searchDate}&one_way=true&adults=1&locale=en&currency=USD`;
    return `https://tp.media/r?marker=${AFFILIATE_MARKER}&p=4114&u=${encodeURIComponent(targetUrl)}`;
  }, []);

  const track = useCallback(
    (event: "deal_click_aviasales" | "deal_click_tripcom", payload?: Record<string, unknown>) => {
      const key = `gt_${event}_${new Date().toISOString().slice(0, 10)}`;
      const current = Number(localStorage.getItem(key) || "0");
      localStorage.setItem(key, String(current + 1));
      console.log("[TRACK]", event, { count: current + 1, payload });
    },
    [],
  );

  const openNewTab = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const updatedText = meta.updated_at || meta.updated || "";

  const featuredDestinations = [
    { nameKey: "destinations.chiangMai", descKey: "destinations.chiangMaiDesc", image: "/images/chiang-mai.jpg", link: "/thailand/chiang-mai", agodaCityId: 18296 },
    { nameKey: "destinations.bangkok", descKey: "destinations.bangkokDesc", image: "/images/bangkok.jpg", link: "/thailand/bangkok", agodaCityId: 15932 },
    { nameKey: "destinations.phuket", descKey: "destinations.phuketDesc", image: "/images/phuket.jpg", link: "/thailand/phuket", agodaCityId: 16639 },
  ];

  return (
    <Layout>
      {/* ═══════════ HERO + TABBED SEARCH ═══════════ */}
      <section className="relative min-h-[60vh] md:min-h-[65vh] flex flex-col justify-end pb-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-travel.jpg"
            alt="Southeast Asia Travel"
            className="w-full h-full object-cover grayscale contrast-125 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/30 to-transparent opacity-90" />
        </div>

        <div className="container relative z-10">
          {/* Hero Text */}
          <div className="text-center text-white mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-3">
              {t("hero.title")}
              <br />
              <span className="text-primary">{t("hero.country")}</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary font-mono uppercase tracking-[0.15em] mb-2 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
              {t("hero.slogan")}
            </p>
            <p className="text-sm text-white/50 font-mono uppercase tracking-widest">
              Compare Flights • Hotels • Transport from Myanmar
            </p>
          </div>

          {/* ── Tabbed Search Card ── */}
          <div className="bg-primary/90 supports-[backdrop-filter]:bg-primary/80 backdrop-blur-xl border border-white/15 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {/* Tab Buttons */}
            <div className="grid grid-cols-3 border-b border-white/10">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 md:py-5 flex items-center justify-center gap-2 md:gap-3 transition-all font-mono text-xs md:text-sm uppercase tracking-widest ${activeTab === tab.id
                    ? "bg-white/10 text-secondary border-b-2 border-secondary"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <span className="text-xl md:text-2xl">{tab.icon}</span>
                  <span className="font-bold">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 md:p-6">
              {activeTab === "flights" && <FlightWidget />}
              {activeTab === "hotels" && <HotelsSearchForm />}
              {activeTab === "transport" && <TransportScheduleWidget />}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PARTNER LOGOS TRUST STRIP ═══════════ */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container">
          <p className="text-center text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Compare prices from trusted travel brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {[
              { name: "Aviasales", url: "https://www.aviasales.com", logo: "/images/partners/aviasales.svg" },
              { name: "Trip.com", url: "https://www.trip.com", logo: "/images/partners/tripcom.svg" },
              { name: "Agoda", url: "https://www.agoda.com", logo: "https://cdn0.agoda.net/images/bimi/agoda-tiny-bimi-2.svg" },
              { name: "12Go", url: "https://12go.asia", logo: "/images/partners/12go.svg" },
              { name: "Klook", url: "https://www.klook.com", logo: "/images/partners/klook.svg" },
            ].map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:scale-105 hover:shadow-md transition-all rounded-md overflow-hidden"
                title={`Search on ${partner.name}`}
              >
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="h-10 md:h-12 w-auto"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ POPULAR ROUTES (Auto-updated from bot data) ═══════════ */}
      <section className="py-16 bg-background border-b border-border">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">
              Popular Routes from Myanmar
            </h2>
            <p className="text-muted-foreground font-mono uppercase text-sm tracking-wider">
              {meta.updated_at ? `Updated ${meta.updated_at}` : "Indicative starting prices"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Prices may change. Click to see current availability.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ROUTE_CONFIG.map((route) => {
              const matchedDeal = deals.find(
                (d) => d.origin === route.origin && (d.destination === route.dest || (route.dest === "BKK" && d.destination === "DMK"))
              );
              const displayDate = matchedDeal?.date
                ? new Date(matchedDeal.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : null;
              return (
                <a
                  key={`${route.origin}-${route.dest}`}
                  href={buildRouteUrl(route.origin, route.dest, matchedDeal?.date)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-card border border-border p-5 hover:bg-primary hover:border-primary transition-all hover:-translate-y-0.5 hover:shadow-lg text-center"
                >
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground group-hover:text-secondary mb-2">
                    {route.from} → {route.to}
                  </div>
                  <div className="text-2xl font-bold font-mono text-primary group-hover:text-white">
                    {matchedDeal ? `from $${Math.round(matchedDeal.price)}` : "Check Price"}
                  </div>
                  {displayDate && (
                    <div className="text-xs text-muted-foreground group-hover:text-gray-300 mt-1 font-mono">
                      on {displayDate}
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ LIVE FLIGHT DEALS ═══════════ */}
      <section className="py-12 md:py-20 bg-muted/20 border-b border-border">
        <div className="container px-4 md:px-6">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-1">Live Flight Deals</h2>
            <p className="text-muted-foreground font-mono uppercase text-xs md:text-sm tracking-wider">
              {updatedText ? `Updated ${updatedText}` : "Real-time prices from airlines"}
            </p>
          </div>

          {meta.overall_cheapest && (
            <div className="mb-6 md:mb-8 bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <p className="font-bold text-green-800 text-sm md:text-base">
                🔥 Best Deal: {originMap[meta.overall_cheapest.origin] || meta.overall_cheapest.origin} →{" "}
                {destMap[meta.overall_cheapest.destination] || meta.overall_cheapest.destination} — $
                {meta.overall_cheapest.price}
                <span className="block sm:inline text-xs sm:text-sm font-normal text-green-600 sm:ml-2 mt-1 sm:mt-0">
                  ({meta.overall_cheapest.airline} on {meta.overall_cheapest.date})
                </span>
              </p>
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700 font-mono uppercase text-xs w-full sm:w-auto min-h-[44px]"
                aria-label={`Book best deal flight to ${destMap[meta.overall_cheapest.destination] || meta.overall_cheapest.destination} for $${meta.overall_cheapest.price}`}
                onClick={() => {
                  track("deal_click_aviasales", meta.overall_cheapest as unknown as Record<string, unknown>);
                  openNewTab(buildAviasalesUrl(meta.overall_cheapest!));
                }}
              >
                Book Now <ExternalLink className="ml-1 w-3 h-3" />
              </Button>
            </div>
          )}

          {loading ? (
            <p className="text-center text-muted-foreground animate-pulse py-16 font-mono text-sm">Loading latest deals...</p>
          ) : error ? (
            <p className="text-center text-red-500 py-16 font-mono text-sm">Failed to load deals. Please refresh.</p>
          ) : deals.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 font-mono text-sm">No deals right now. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {deals.map((deal) => {
                const aviaUrl = buildAviasalesUrl(deal);
                const tripUrl = buildTripComUrl(deal);
                const flagMap: Record<string, string> = {
                  BKK: "🇹🇭", DMK: "🇹🇭", CNX: "🇹🇭", HKT: "🇹🇭",
                  SIN: "🇸🇬", KUL: "🇲🇾", SGN: "🇻🇳", HAN: "🇻🇳",
                  PNH: "🇰🇭", RGN: "🇲🇲", MDL: "🇲🇲",
                };
                const daysUntil = Math.max(0, Math.ceil(
                  (new Date(deal.date).getTime() - Date.now()) / 86400000
                ));
                const daysLabel = daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil} days`;
                const originName = originMap[deal.origin] || deal.origin;
                const destName = destMap[deal.destination] || deal.destination;

                return (
                  <div
                    key={`${deal.origin}-${deal.destination}-${deal.date}`}
                    className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-all group"
                    role="article"
                    aria-label={`Flight deal: ${originName} to ${destName} for $${deal.price}`}
                  >
                    {/* Row 1: Route + Price */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-bold truncate">
                          {flagMap[deal.origin] || ""} {originName} → {flagMap[deal.destination] || ""} {destName}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                          {deal.airline} {deal.flight_num || ""} • {deal.date}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl md:text-3xl font-bold text-primary">${deal.price}</p>
                      </div>
                    </div>

                    {/* Row 2: Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                        ✈️ Direct
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-mono rounded">
                        📅 {daysLabel}
                      </span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded">
                        Deal
                      </span>
                    </div>

                    {/* Row 3: Buttons — side by side, touch-safe */}
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary text-primary-foreground font-mono uppercase text-xs hover:bg-primary/90 min-h-[44px]"
                        aria-label={`Book ${originName} to ${destName} on Aviasales for $${deal.price}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          track("deal_click_aviasales", deal as unknown as Record<string, unknown>);
                          openNewTab(aviaUrl);
                        }}
                      >
                        Aviasales <ExternalLink className="ml-1 w-3 h-3" />
                      </Button>
                      <a
                        href={tripUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Compare ${originName} to ${destName} price on Trip.com`}
                        className="flex-1 inline-flex items-center justify-center text-xs font-mono uppercase border border-border rounded-md hover:bg-muted transition-colors min-h-[44px] px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          track("deal_click_tripcom", deal as unknown as Record<string, unknown>);
                        }}
                      >
                        Trip.com <ExternalLink className="ml-1 w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FEATURED DESTINATIONS ═══════════ */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold tracking-tighter mb-2">Explore Thailand</h2>
              <p className="text-muted-foreground font-mono uppercase text-sm tracking-wider">
                Curated guides for the Land of Smiles
              </p>
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
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">{t(dest.descKey)}</p>
                  </div>
                </Link>
                <div className="p-6 grid grid-cols-2 gap-3 mt-auto bg-card">
                  <a
                    href={`https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=${AGODA_CID}&city=${dest.agodaCityId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs font-mono uppercase">
                      Agoda Hotels
                    </Button>
                  </a>
                  <a
                    href="https://www.klook.com/en-US/country/4-thailand-things-to-do/?aid=111750"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs font-mono uppercase">
                      View Tours
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHY GOTRAVEL ═══════════ */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-10">
            Why <span className="text-primary">GoTravelAsia</span>?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Plane, title: "500+ Routes", desc: "Compare flights across Southeast Asia via Aviasales" },
              { icon: Hotel, title: "Best Hotel Deals", desc: "Direct access to Agoda's lowest rates" },
              { icon: CheckCircle, title: "Trusted Partners", desc: "Aviasales, Trip.com, Agoda, 12Go, Klook" },
              { icon: MapPin, title: "Myanmar Focused", desc: "Specialized routes from Yangon & Mandalay" },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ DESTINATION QUICK LINKS ═══════════ */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container">
          <h2 className="text-2xl font-bold tracking-tighter mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[
              { text: "Flights: Yangon → Bangkok", origin: "RGN", dest: "BKK" },
              { text: "Flights: Yangon → Singapore", origin: "RGN", dest: "SIN" },
              { text: "Flights: Yangon → Chiang Mai", origin: "RGN", dest: "CNX" },
              { text: "Flights: Yangon → Phuket", origin: "RGN", dest: "HKT" },
              { text: "Flights: Yangon → KL", origin: "RGN", dest: "KUL" },
              { text: "Flights: Mandalay → Bangkok", origin: "MDL", dest: "BKK" },
              { text: "Flights: Yangon → Hanoi", origin: "RGN", dest: "HAN" },
              { text: "Flights: Yangon → Ho Chi Minh", origin: "RGN", dest: "SGN" },
              { text: "Flights: Yangon → Phnom Penh", origin: "RGN", dest: "PNH" },
              { text: "Flights: Mandalay → Chiang Mai", origin: "MDL", dest: "CNX" },
            ].map((link) => (
              <a
                key={`${link.origin}-${link.dest}`}
                href={buildRouteUrl(link.origin, link.dest)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-primary hover:text-primary/80 hover:underline py-1 truncate"
              >
                {link.text}
              </a>
            ))}
            {[
              { text: "Transport: Bangkok → Chiang Mai", slug: "bangkok/chiang-mai" },
              { text: "Transport: Bangkok → Phuket", slug: "bangkok/phuket" },
              { text: "Transport: Bangkok → Pattaya", slug: "bangkok/pattaya" },
              { text: "Transport: Bangkok → Koh Samui", slug: "bangkok/koh-samui" },
              { text: "Transport: Chiang Mai → Pai", slug: "chiang-mai/pai" },
              { text: "Transport: Phuket → Krabi", slug: "phuket/krabi" },
              { text: "Transport: Bangkok → Hua Hin", slug: "bangkok/hua-hin" },
              { text: "Transport: Bangkok → Koh Phangan", slug: "bangkok/koh-phangan" },
              { text: "Transport: Chiang Mai → Chiang Rai", slug: "chiang-mai/chiang-rai" },
              { text: "Transport: Bangkok → Koh Tao", slug: "bangkok/koh-tao" },
            ].map((link) => (
              <a
                key={link.slug}
                href={`https://12go.asia/en/travel/${link.slug}?referer=14566451&z=14566451`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-primary hover:text-primary/80 hover:underline py-1 truncate"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS + FAQ (SEO CONTENT) ═══════════ */}
      <section className="py-16 bg-muted/20 border-b border-border">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-4">
            How <span className="text-primary">GoTravelAsia</span> Works
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            GoTravelAsia is a free travel comparison platform built for travelers from Myanmar.
            We search across multiple airlines, hotels, and transport providers to find you the best deals
            for your next trip to Thailand and Southeast Asia.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { step: "1", title: "Search", desc: "Enter your destination and travel dates. We compare real-time prices from Aviasales, Trip.com, Agoda, and 12Go." },
              { step: "2", title: "Compare", desc: "See side-by-side pricing for flights, hotels, buses, trains, and ferries. Filter by price, duration, or provider." },
              { step: "3", title: "Book", desc: "Click through to the provider with the best deal. Book directly on their platform — no markup, no hidden fees." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-10 h-10 mx-auto bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg rounded-full">
                  {item.step}
                </div>
                <h4 className="font-bold text-lg">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <h3 className="text-2xl font-bold tracking-tighter text-center mb-6">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {[
              {
                q: "How do I find cheap flights from Myanmar?",
                a: "Use our flight search to compare prices from airlines like Myanmar Airways International (MAI), Thai AirAsia, and Thai Lion Air. We scan multiple booking platforms including Aviasales and Trip.com to find the lowest fares for routes from Yangon and Mandalay."
              },
              {
                q: "Is GoTravelAsia free to use?",
                a: "Yes! GoTravelAsia is completely free. We earn a small commission from our travel partners when you book through our links, but this never affects the price you pay."
              },
              {
                q: "What transport options are available in Thailand?",
                a: "Thailand has excellent transport options including VIP buses, sleeper trains, ferries, minivans, and domestic flights. We compare prices from providers like Nakhonchai Air, State Railway of Thailand, Lomprayah, and Bangkok Airways via 12Go.asia."
              },
              {
                q: "How often are prices updated?",
                a: "Flight prices are automatically updated every 6 hours using real-time data from the Travelpayouts API. Transport prices are also refreshed every 6 hours. Hotel prices are shown in real-time when you search."
              },
              {
                q: "Can I use the AI Trip Planner?",
                a: "Yes! Our AI Trip Planner is powered by Google Gemini and can help you plan your perfect Thailand itinerary. Just tell it your budget, interests, and travel dates, and it'll create a personalized plan."
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-card border border-border rounded-lg">
                <summary className="flex items-center justify-between p-4 cursor-pointer font-medium hover:bg-muted/50 transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <NewsletterSection />
    </Layout>
  );
}

/* ── Newsletter with Web3Forms ── */
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "606d35a5-9c09-4209-8317-96fba9a21c59",
          subject: "📬 Newsletter Subscriber — GoTravelAsia",
          from_name: "GoTravel Newsletter",
          email,
          message: `Homepage newsletter subscriber: ${email}`,
        }),
      });
      localStorage.setItem("gt_user_email", email);
      localStorage.setItem("gt_subscribed", "true");
      setStatus("done");
    } catch {
      setStatus("done");
    }
  };

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container text-center max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Don't Miss the Next Deal</h2>
        <p className="text-primary-foreground/80 mb-8 text-lg">
          Join thousands of travelers getting the best Thailand travel tips and deals.
        </p>
        {status === "done" ? (
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <CheckCircle className="w-6 h-6" />
            <span>You're in! Watch your inbox for exclusive deals.</span>
          </div>
        ) : (
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 h-12 px-4 bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button
              size="lg"
              type="submit"
              disabled={status === "sending"}
              className="bg-secondary text-secondary-foreground hover:bg-white hover:text-primary font-bold px-8"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
        )}
        <p className="text-xs text-primary-foreground/60 mt-4 font-mono">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
