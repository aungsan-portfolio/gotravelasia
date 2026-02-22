import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, ArrowRight, ExternalLink, MapPin, CheckCircle, Wifi, Zap, Smartphone, Shield, Star } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import TransportScheduleWidget from "@/components/TransportScheduleWidget";
import FlightWidget from "@/components/FlightWidget";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useFlightData } from "@/hooks/useFlightData";
import type { Deal } from "@/hooks/useFlightData";
import HeroSection from "@/components/HeroSection";
import DealsCarousel from "@/components/DealsCarousel";
import TrustReviews from "@/components/TrustReviews";
import { FAQJsonLd } from "@/components/JsonLd";

import {
  AFFILIATE,
  buildAviasalesUrl as buildAviasalesLink,
  buildAgodaPartnerUrl,
  buildKlookUrl,
  buildTripComUrl as buildTripComLink,
  build12GoUrl,
} from "@/lib/config";

const AGODA_CID = AFFILIATE.AGODA_CID;

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

    const url = `https://www.agoda.com/city/${citySlug}.html?cid=${AGODA_CID}&checkIn=${checkInDate}&checkout=${checkOutDate}&utm_source=gotravelasia&utm_medium=affiliate`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Destination
          </label>
          <select
            name="city"
            defaultValue="bangkok-th"
            className="w-full px-4 py-3.5 md:py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm min-h-[48px]"
          >
            {HOTEL_CITIES.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Check-in
          </label>
          <input
            type="date"
            name="checkIn"
            defaultValue={today}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="w-full px-4 py-3.5 md:py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm min-h-[48px]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Check-out
          </label>
          <input
            type="date"
            name="checkOut"
            min={minCheckOut}
            required
            className="w-full px-4 py-3.5 md:py-3 bg-white text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm min-h-[48px]"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full md:w-auto md:self-end bg-[#FECD00] hover:bg-[#E5B800] text-gray-900 font-extrabold transition-colors h-12 px-10 rounded-xl text-base"
      >
        Search Hotels on Agoda
      </Button>
    </form>
  );
}


export default function Home() {
  usePageMeta({
    title: "Compare Cheap Flights, Hotels & Transport in Southeast Asia",
    description: "Travel Asia on a budget. Compare cheap flights, hotels, buses, and trains across Thailand, Singapore, and Vietnam. Book from Myanmar with instant price comparison on GoTravel Asia.",
    path: "/",
    keywords: "travel asia, southeast asia travel, cheap flights thailand, bangkok flights, chiang mai hotels, phuket deals, thailand transport, myanmar to thailand flights, asia travel comparison",
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
    return buildAviasalesLink(d.origin, d.destination, d.date);
  }, []);

  const buildTripComUrl = useCallback((d: Deal) => {
    return buildTripComLink(d.origin, d.destination, d.date);
  }, []);

  const buildRouteUrl = useCallback((origin: string, dest: string, dealDate?: string) => {
    return buildAviasalesLink(origin, dest, dealDate);
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
    { nameKey: "destinations.chiangMai", descKey: "destinations.chiangMaiDesc", image: "/images/chiang-mai.webp", link: "/thailand/chiang-mai", agodaCityId: 18296, hotelFrom: 12, rating: 4.8, reviews: 3200 },
    { nameKey: "destinations.bangkok", descKey: "destinations.bangkokDesc", image: "/images/bangkok.webp", link: "/thailand/bangkok", agodaCityId: 15932, hotelFrom: 15, rating: 4.7, reviews: 5400 },
    { nameKey: "destinations.phuket", descKey: "destinations.phuketDesc", image: "/images/phuket.webp", link: "/thailand/phuket", agodaCityId: 16639, hotelFrom: 18, rating: 4.9, reviews: 4100 },
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
              <div key={index} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
                <Link href={dest.link} className="relative aspect-[4/5] overflow-hidden bg-gray-100 block">
                  <img
                    src={dest.image}
                    alt={t(dest.nameKey)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-extrabold shadow-lg">
                    Hotels from ${dest.hotelFrom}/night
                  </div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{t(dest.nameKey)}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-3">{t(dest.descKey)}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(dest.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-400 text-gray-400"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-white">{dest.rating}</span>
                      <span className="text-xs text-gray-300">({dest.reviews.toLocaleString()} reviews)</span>
                    </div>
                  </div>
                </Link>
                <div className="p-5 grid grid-cols-2 gap-3 mt-auto">
                  <a
                    href={buildAgodaPartnerUrl(dest.agodaCityId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-lg min-h-[40px]">
                      🏨 Agoda Hotels
                    </Button>
                  </a>
                  <a
                    href={buildKlookUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-lg min-h-[40px]">
                      🎫 View Tours
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
                    href={AFFILIATE.AIRALO_URL}
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
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Why travelers trust <span className="text-primary">GoTravelAsia</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We compare real-time prices from multiple providers so you always get the best deal. No markup, no hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Plane, title: "500+ Flight Routes", desc: "Real-time prices from Aviasales & Trip.com across Southeast Asia", stat: "Updated every 6 hours", color: "bg-blue-50 text-blue-600" },
              { icon: Hotel, title: "Lowest Hotel Rates", desc: "Direct access to Agoda's inventory for 8 cities in Thailand & Asia", stat: "Free cancellation available", color: "bg-amber-50 text-amber-600" },
              { icon: Shield, title: "6 Trusted Partners", desc: "Book directly on Aviasales, Agoda, Trip.com, 12Go, Klook & Airalo", stat: "No middleman markup", color: "bg-emerald-50 text-emerald-600" },
              { icon: MapPin, title: "Built for Myanmar", desc: "Specialized routes from Yangon & Mandalay with Burmese language support", stat: "Myanmar Kyat display", color: "bg-purple-50 text-purple-600" },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:shadow-lg hover:border-gray-200 transition-all group">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{item.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  {item.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustReviews />

      {/* ═══════════ POPULAR ROUTES ═══════════ */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Popular Routes</h2>
            <p className="text-gray-500">Search and compare prices for the most popular flight and transport routes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">Flights from Myanmar</h3>
                  <p className="text-xs text-gray-500">Compare on Aviasales & Trip.com</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { text: "Yangon to Bangkok", origin: "RGN", dest: "BKK" },
                  { text: "Yangon to Singapore", origin: "RGN", dest: "SIN" },
                  { text: "Yangon to Chiang Mai", origin: "RGN", dest: "CNX" },
                  { text: "Yangon to Phuket", origin: "RGN", dest: "HKT" },
                  { text: "Yangon to Kuala Lumpur", origin: "RGN", dest: "KUL" },
                  { text: "Mandalay to Bangkok", origin: "MDL", dest: "BKK" },
                  { text: "Yangon to Hanoi", origin: "RGN", dest: "HAN" },
                  { text: "Yangon to Ho Chi Minh", origin: "RGN", dest: "SGN" },
                  { text: "Yangon to Phnom Penh", origin: "RGN", dest: "PNH" },
                  { text: "Mandalay to Chiang Mai", origin: "MDL", dest: "CNX" },
                ].map((link) => (
                  <a
                    key={`${link.origin}-${link.dest}`}
                    href={buildRouteUrl(link.origin, link.dest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group min-h-[44px]"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    <span className="font-medium">{link.text}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">Transport in Thailand</h3>
                  <p className="text-xs text-gray-500">Buses, trains & ferries via 12Go</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { text: "Bangkok to Chiang Mai", slug: "bangkok/chiang-mai" },
                  { text: "Bangkok to Phuket", slug: "bangkok/phuket" },
                  { text: "Bangkok to Pattaya", slug: "bangkok/pattaya" },
                  { text: "Bangkok to Koh Samui", slug: "bangkok/koh-samui" },
                  { text: "Chiang Mai to Pai", slug: "chiang-mai/pai" },
                  { text: "Phuket to Krabi", slug: "phuket/krabi" },
                  { text: "Bangkok to Hua Hin", slug: "bangkok/hua-hin" },
                  { text: "Bangkok to Koh Phangan", slug: "bangkok/koh-phangan" },
                  { text: "Chiang Mai to Chiang Rai", slug: "chiang-mai/chiang-rai" },
                  { text: "Bangkok to Koh Tao", slug: "bangkok/koh-tao" },
                ].map((link) => (
                  <a
                    key={link.slug}
                    href={build12GoUrl(link.slug, "homepage_quicklink")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors group min-h-[44px]"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                    <span className="font-medium">{link.text}</span>
                  </a>
                ))}
              </div>
            </div>
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
          <FAQJsonLd faqs={[
            { question: "How do I find cheap flights from Myanmar?", answer: "Use our flight search to compare prices from airlines like Myanmar Airways International (MAI), Thai AirAsia, and Thai Lion Air. We scan multiple booking platforms including Aviasales and Trip.com to find the lowest fares for routes from Yangon and Mandalay." },
            { question: "Is GoTravelAsia free to use?", answer: "Yes! GoTravelAsia is completely free. We earn a small commission from our travel partners when you book through our links, but this never affects the price you pay." },
            { question: "What transport options are available in Thailand?", answer: "Thailand has excellent transport options including VIP buses, sleeper trains, ferries, minivans, and domestic flights. We compare prices from providers like Nakhonchai Air, State Railway of Thailand, Lomprayah, and Bangkok Airways via 12Go.asia." },
            { question: "How often are prices updated?", answer: "Flight prices are automatically updated every 6 hours using real-time data from the Travelpayouts API. Transport prices are also refreshed every 6 hours. Hotel prices are shown in real-time when you search." },
            { question: "Can I use the AI Trip Planner?", answer: "Yes! Our AI Trip Planner is powered by Google Gemini and can help you plan your perfect Thailand itinerary. Just tell it your budget, interests, and travel dates, and it'll create a personalized plan." },
          ]} />
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

    </Layout>
  );
}

