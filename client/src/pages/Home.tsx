import { useState, useEffect } from "react";
import FlightWidget from "@/components/FlightWidget";
import TransportScheduleWidget from "@/components/TransportScheduleWidget";
import { Link } from "wouter";
import { Plane, Bus, Map as MapIcon, Calendar } from "lucide-react";

export default function Home() {
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    setBgImage("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop");
  }, []);

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
      <section className="py-16 px-4 max-w-5xl mx-auto -mt-10 relative z-20">
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

      {/* --- TRANSPORT SECTION --- */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Bus &amp; Train Tickets</h2>
            <p className="text-muted-foreground">Book buses from Yangon to Mandalay, Bagan &amp; more.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <TransportScheduleWidget />
          </div>
        </div>
      </section>

      {/* --- POPULAR DESTINATIONS --- */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bangkok */}
          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1000&auto=format&fit=crop"
              alt="Bangkok"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Bangkok</h3>
                <p className="text-white/80 text-sm">Flights from $45</p>
              </div>
            </div>
          </div>

          {/* Singapore */}
          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
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

          {/* Chiang Mai */}
          <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1598935898639-5a711099a27e?q=80&w=1000&auto=format&fit=crop"
              alt="Chiang Mai"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Chiang Mai</h3>
                <p className="text-white/80 text-sm">Flights from $60</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
