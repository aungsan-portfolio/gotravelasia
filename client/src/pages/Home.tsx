import { useEffect, useMemo, useState } from "react";
import FlightWidget from "@/components/FlightWidget";
import { Link } from "wouter";
import { Plane, Bus, Map as MapIcon, Calendar } from "lucide-react";

type Deal = {
  origin: string;
  destination: string;
  price: number;
  currency?: string;
  airline?: string;
  flight_num?: string | null;
  date: string;
};

type Meta = {
  updated?: string;
  updated_at?: string;
  overall_cheapest?: Deal;
};

export default function Home() {
  const [bgImage, setBgImage] = useState("");

  // --- REAL-TIME DATA STATES ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [meta, setMeta] = useState<Meta>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBgImage(
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
    );

    // ✅ FIX: correct Vite public path
    fetch("/data/flight_data.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load flight data");
        return res.json();
      })
      .then((data) => {
        setDeals(Array.isArray(data.routes) ? data.routes : []);
        setMeta(data.meta || {});
      })
      .catch((err) => {
        console.error("Flight data load error:", err);
        setDeals([]);
        setMeta({});
      })
      .finally(() => setLoading(false));
  }, []);

  // --- HELPER MAPS ---
  const originMap: Record<string, string> = { RGN: "Yangon", MDL: "Mandalay" };
  const destMap: Record<string, string> = { BKK: "Bangkok", DMK: "Bangkok", CNX: "Chiang Mai", SIN: "Singapore", KUL: "Kuala Lumpur", SGN: "Ho Chi Minh" };

  // ✅ FIX: cheapest via O(n) reduce, memoized
  const cheapestBangkok = useMemo(() => {
    const candidates = deals.filter((d) => d.destination === "BKK" || d.destination === "DMK");
    return candidates.reduce<Deal | undefined>((best, cur) => {
      if (!best) return cur;
      return cur.price < best.price ? cur : best;
    }, undefined);
  }, [deals]);

  const cheapestChiangMai = useMemo(() => {
    const candidates = deals.filter((d) => d.destination === "CNX");
    return candidates.reduce<Deal | undefined>((best, cur) => {
      if (!best) return cur;
      return cur.price < best.price ? cur : best;
    }, undefined);
  }, [deals]);

  // ✅ FIX: updated string fallback
  const updatedText = meta.updated_at || meta.updated || "";

  const scrollToFlightSearch = () => {
    const widget = document.querySelector("#flight-search-section");
    widget?.scrollIntoView({ behavior: "smooth" });
  };

  // Affiliate link builder for deal cards
  const handleDealClick = (deal: Deal) => {
    const dateStr = deal.date.replace(/-/g, "");
    const link = `https://www.aviasales.com/search/${deal.origin}${dateStr}${deal.destination}1?marker=697202`;
    window.open(link, "_blank");
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* --- HERO SECTION --- */}
      <section
        className="relative w-full h-[600px] flex items-center justify-center bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

        <div className="container relative z-10 text-center px-4">
          <div className="animate-in slide-in-from-top-8 duration-700">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              GoTravel<span className="text-emerald-400">Asia</span>
              <span className="block text-lg md:text-2xl font-medium text-white/80 mt-2 tracking-normal">Cheap Flights from Myanmar</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto mb-8 drop-shadow-md">
              The easiest way to find cheap flights &amp; buses from Myanmar to Asia.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            <Link href="/flights">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition cursor-pointer flex flex-col items-center gap-2 group">
                <Plane className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition" />
                <span className="text-white font-semibold">Flights</span>
              </div>
            </Link>
            <Link href="/buses">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition cursor-pointer flex flex-col items-center gap-2 group">
                <Bus className="w-8 h-8 text-amber-400 group-hover:scale-110 transition" />
                <span className="text-white font-semibold">Buses</span>
              </div>
            </Link>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition cursor-pointer flex flex-col items-center gap-2 group">
              <MapIcon className="w-8 h-8 text-blue-400 group-hover:scale-110 transition" />
              <span className="text-white font-semibold">Destinations</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition cursor-pointer flex flex-col items-center gap-2 group">
              <Calendar className="w-8 h-8 text-rose-400 group-hover:scale-110 transition" />
              <span className="text-white font-semibold">Plan Trip</span>
            </div>
          </div>

          {/* --- TRUSTED PARTNERS --- */}
          <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <p className="text-center text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              Official Partners &amp; Payment Methods
            </p>

            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/10 shadow-xl max-w-4xl mx-auto">
              {/* Booking Partners */}
              <img src="https://cdn6.agoda.net/images/b2c-default/logo-agoda-backend.svg" alt="Agoda" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white/10 rounded px-1" />
              <img src="https://pages.trip.com/images/home/trip_logo_2020.svg" alt="Trip.com" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white/10 rounded px-1" />
              <img src="https://12go.asia/static/img/logo.svg" alt="12Go" className="h-5 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />

              {/* Divider */}
              <div className="w-px h-8 bg-white/20 mx-2 hidden md:block"></div>

              {/* Airlines */}
              <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Myanmar_Airways_International_logo.svg/1200px-Myanmar_Airways_International_logo.svg.png" alt="MAI" className="h-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/f5/AirAsia_New_Logo.svg" alt="AirAsia" className="h-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white rounded-full p-1" />

              {/* Divider */}
              <div className="w-px h-8 bg-white/20 mx-2 hidden md:block"></div>

              {/* Payments */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white rounded px-1" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
          </div>
          {/* --- END PARTNERS --- */}

        </div>
      </section>

      {/* --- FLIGHT SEARCH SECTION --- */}
      <section id="flight-search-section" className="py-16 px-4 max-w-5xl mx-auto -mt-10 relative z-20">
        <div className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
          <div className="bg-primary/5 p-4 text-center border-b border-border/50">
            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Search Best Flights
            </h2>
          </div>
          <div className="p-6">
            <FlightWidget />
          </div>
        </div>
      </section>

      {/* --- POPULAR DESTINATIONS --- */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer" onClick={scrollToFlightSearch}>
            <img
              src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1000&auto=format&fit=crop"
              alt="Bangkok"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Bangkok</h3>
                <p className="text-white/80 text-sm">
                  Flights from{" "}
                  {loading ? "..." : cheapestBangkok ? `$${cheapestBangkok.price}` : "Check now"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer" onClick={scrollToFlightSearch}>
            <img
              src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000&auto=format&fit=crop"
              alt="Singapore"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Singapore</h3>
                <p className="text-white/80 text-sm">Flights from $85</p>
              </div>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer" onClick={scrollToFlightSearch}>
            <img
              src="https://images.unsplash.com/photo-1598935898639-5a711099a27e?q=80&w=1000&auto=format&fit=crop"
              alt="Chiang Mai"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Chiang Mai</h3>
                <p className="text-white/80 text-sm">
                  Flights from{" "}
                  {loading ? "..." : cheapestChiangMai ? `$${cheapestChiangMai.price}` : "Check now"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LIVE CHEAPEST DEALS --- */}
      <section className="py-16 container mx-auto px-4 bg-muted/50 mb-10 rounded-3xl">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Live Cheapest Flights {updatedText ? `(Updated ${updatedText})` : ""}
        </h2>

        {meta.overall_cheapest && (
          <div className="text-center mb-8 bg-primary/10 py-4 rounded-xl max-w-2xl mx-auto border border-primary/20">
            <p className="text-xl font-bold text-primary">
              🔥 Overall Cheapest: {originMap[meta.overall_cheapest.origin] || meta.overall_cheapest.origin} →{" "}
              {destMap[meta.overall_cheapest.destination] || meta.overall_cheapest.destination} – ${meta.overall_cheapest.price}{" "}
              <span className="text-sm font-normal text-muted-foreground block md:inline mt-1 md:mt-0">
                ({meta.overall_cheapest.airline} on {meta.overall_cheapest.date})
              </span>
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground animate-pulse">Loading latest deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-center text-muted-foreground">No deals available right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div
                key={`${deal.origin}-${deal.destination}-${deal.date}`}
                className="bg-card p-6 rounded-2xl shadow-lg border border-border/50 hover:shadow-xl transition cursor-pointer hover:-translate-y-1"
                onClick={() => handleDealClick(deal)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-card-foreground">
                    {originMap[deal.origin] || deal.origin} ✈️ {destMap[deal.destination] || deal.destination}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                    SAVE
                  </span>
                </div>

                <div className="my-4">
                  <p className="text-3xl font-black text-primary">${deal.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">One-way / per person</p>
                </div>

                <div className="pt-4 border-t border-border/50 flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Plane className="w-4 h-4 text-muted-foreground" /> {deal.airline} {deal.flight_num || ""}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {deal.date}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDealClick(deal); }}
                  className="mt-4 w-full py-2 text-sm bg-primary/5 text-primary font-bold rounded-lg hover:bg-primary/10 transition"
                >
                  Book This Deal →
                </button>
                <a
                  href={`https://www.trip.com/flights/${deal.origin}-to-${deal.destination}/tickets-${deal.origin.toLowerCase()}-${deal.destination.toLowerCase()}/?locale=en-us`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 block text-center text-[11px] text-muted-foreground hover:text-primary transition"
                >
                  Or book with Trip.com (hotel bundle) →
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
