import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, ArrowRight, ExternalLink, MapPin, CheckCircle, Loader2, Wifi, Zap, Smartphone } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import TransportScheduleWidget from "@/components/TransportScheduleWidget";
import FlightWidget from "@/components/FlightWidget";
import { WEB3FORMS_KEY } from "@/lib/config";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useFlightData } from "@/hooks/useFlightData";
import type { Deal } from "@/hooks/useFlightData";
import HeroSection from "@/components/HeroSection";
import DealsCarousel from "@/components/DealsCarousel";

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


export default function Home() {
  usePageMeta({
    title: "Find Cheapest Flights & Bus Tickets to Thailand",
    description: "Compare flights, hotels, and transport from Myanmar to Thailand, Singapore, and Vietnam. Instant price comparison and direct booking with GoTravel Asia.",
  });

  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "transport">("flights");

  const { deals, meta, loading, error } = useFlightData();

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
    { nameKey: "destinations.chiangMai", descKey: "destinations.chiangMaiDesc", image: "/images/chiang-mai.webp", link: "/thailand/chiang-mai", agodaCityId: 18296 },
    { nameKey: "destinations.bangkok", descKey: "destinations.bangkokDesc", image: "/images/bangkok.webp", link: "/thailand/bangkok", agodaCityId: 15932 },
    { nameKey: "destinations.phuket", descKey: "destinations.phuketDesc", image: "/images/phuket.webp", link: "/thailand/phuket", agodaCityId: 16639 },
  ];

  return (
    <Layout>
      <HeroSection activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === "flights" && <FlightWidget />}
        {activeTab === "hotels" && <HotelsSearchForm />}
        {activeTab === "transport" && (
          <div
            className="w-full overflow-y-auto max-h-[550px] md:max-h-none relative z-10"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <TransportScheduleWidget />
          </div>
        )}
      </HeroSection>

      <DealsCarousel deals={deals} buildRouteUrl={buildRouteUrl} />

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
            <Link href="/blog">
              <Button variant="outline" className="hidden md:flex gap-2 group">
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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

      {/* ═══════════ AIRALO eSIM BANNER ═══════════ */}
      <section className="py-12 bg-white">
        <div className="container max-w-5xl">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-white/20">
                  <Wifi className="w-4 h-4" /> Recommended
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Stay Connected in Thailand
                </h2>
                <p className="text-blue-100 text-lg max-w-lg">
                  Skip the airport queues and high roaming fees. Get an Airalo eSIM delivered instantly. Keep your WhatsApp number and enjoy 5G speeds everywhere.
                </p>

                <ul className="space-y-3 font-medium text-blue-50">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    Instant delivery via Email/App
                  </li>
                  <li className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-green-300" />
                    No physical SIM card swapping
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-green-300" />
                    Data packages starting from $4.50
                  </li>
                </ul>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <a
                    href="https://airalo.tpx.gr/rLWEywcV"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-lg font-bold px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                      Get Thailand eSIM <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                  <span className="text-sm text-blue-200/80 font-mono">Powered by Airalo</span>
                </div>
              </div>

              <div className="hidden md:block w-1/3 perspective-1000">
                <div className="relative transform rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-500">
                  <div className="absolute inset-0 bg-blue-400 rounded-3xl blur-2xl opacity-40"></div>
                  <img
                    src="/images/hero-travel.webp"
                    alt="Thailand Travel"
                    className="relative rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10"
                    style={{ aspectRatio: '4/5', objectFit: 'cover' }}
                  />
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/20 animate-pulse">
                    <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">5G Coverage</div>
                    <div className="font-mono text-gray-800 font-bold">Dtac Network</div>
                  </div>
                </div>
              </div>
            </div>
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
                href={`https://12go.asia/en/travel/${link.slug}?referer=14566451&z=14566451&sub_id=homepage_quicklink`}
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
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "📬 Newsletter Subscriber — GoTravelAsia",
          from_name: "GoTravel Newsletter",
          email,
          message: `Homepage newsletter subscriber: ${email}`,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      localStorage.setItem("gt_user_email", email);
      localStorage.setItem("gt_subscribed", "true");
      setStatus("done");
    } catch {
      setStatus("error");
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
          <>
            {status === "error" && (
              <p className="text-red-200 text-sm mb-4 font-medium">Something went wrong. Please try again.</p>
            )}
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
          </>
        )}
        <p className="text-xs text-primary-foreground/60 mt-4 font-mono">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
