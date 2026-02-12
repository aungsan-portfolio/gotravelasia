import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plane, Hotel, Ticket, Car, Wifi, ShieldCheck, ArrowRight, ExternalLink, MapPin, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import TransportScheduleWidget from "@/components/TransportScheduleWidget";
import FlightWidget from "@/components/FlightWidget";


export default function Home() {
  const { t } = useTranslation();

  const categories = [
    { icon: Plane, labelKey: "categories.findFlights", link: "https://www.kiwi.com/en/search/results/yangon-myanmar/bangkok-thailand", color: "text-blue-500" },
    { icon: Hotel, labelKey: "categories.agodaHotels", link: "https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=YOUR_AGODA_CID&city=15932", color: "text-indigo-500" },
    { icon: Ticket, labelKey: "categories.thingsToDo", link: "https://www.klook.com/en-US/country/4-thailand-things-to-do/", color: "text-pink-500" },
    { icon: Car, labelKey: "categories.transfers", link: "https://www.welcomepickups.com/", color: "text-orange-500" },
    { icon: Wifi, labelKey: "categories.esim", link: "https://www.airalo.com/thailand-esim", color: "text-green-500" },
    { icon: ShieldCheck, labelKey: "categories.insurance", link: "https://ektatraveling.com/", color: "text-red-500" },
  ];

  const featuredDestinations = [
    {
      nameKey: "destinations.chiangMai",
      descKey: "destinations.chiangMaiDesc",
      image: "/images/chiang-mai.jpg",
      link: "/thailand/chiang-mai"
    },
    {
      nameKey: "destinations.bangkok",
      descKey: "destinations.bangkokDesc",
      image: "/images/bangkok.jpg",
      link: "/thailand/bangkok"
    },
    {
      nameKey: "destinations.phuket",
      descKey: "destinations.phuketDesc",
      image: "/images/phuket.jpg",
      link: "/thailand/phuket"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
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
          <p className="text-lg md:text-xl text-secondary font-mono uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100">
            {t("hero.slogan")}
          </p>
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

          {/* TRUSTED PARTNERS SECTION */}
          <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <p className="text-center text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              Official Partners & Payment Methods
            </p>

            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/10 shadow-2xl">

              {/* --- Booking Partners --- */}
              <img src="https://cdn6.agoda.net/images/b2c-default/logo-agoda-backend.svg" alt="Agoda" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
              <img src="https://pages.trip.com/images/home/trip_logo_2020.svg" alt="Trip.com" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
              <img src="https://12go.asia/static/img/logo.svg" alt="12Go" className="h-5 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />

              {/* Divider */}
              <div className="w-px h-8 bg-white/20 mx-2 hidden md:block"></div>

              {/* --- Airlines --- */}
              <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Myanmar_Airways_International_logo.svg/1200px-Myanmar_Airways_International_logo.svg.png" alt="MAI" className="h-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/f5/AirAsia_New_Logo.svg" alt="AirAsia" className="h-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white rounded-full p-1" />

              {/* Divider */}
              <div className="w-px h-8 bg-white/20 mx-2 hidden md:block"></div>

              {/* --- Payments --- */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white rounded px-1" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />

            </div>
          </div>
        </div>
      </section>

      {/* Regional Flights Section */}
      <section className="py-20 bg-muted/20 border-b border-border">
        <div className="container">
          <FlightWidget />
        </div>
      </section>

      {/* Transport Widget */}
      <section className="py-16 bg-muted/30 border-b border-border">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Book Your Transport</h2>
          <p className="text-muted-foreground mb-8 text-lg">Search for buses, trains, ferries, and flights between Thai cities via 12Go Asia.</p>
          <TransportScheduleWidget />
        </div>
      </section>

      {/* Featured Destinations */}
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

      {/* Trip Example Box */}
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
                  { icon: Plane, title: "Flights", desc: "Best connections via Kiwi.com", link: "https://www.kiwi.com/en/search/results/yangon-myanmar/thailand" },
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
                    <a href="https://www.kiwi.com/en/search/results/bangkok-thailand/chiang-mai-thailand" target="_blank" rel="noopener noreferrer">
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
                  <a href="https://www.kiwi.com/en/search/results/yangon-myanmar/thailand" target="_blank" rel="noopener noreferrer">
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

      {/* Newsletter */}
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
