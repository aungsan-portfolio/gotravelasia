import { useState, useEffect } from "react";
import FlightWidget from "@/components/FlightWidget";
import { Plane } from "lucide-react";

export default function Home() {
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    // High-quality travel background
    setBgImage("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop");
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center gap-8 py-10">

        {/* Header / Logo Area */}
        <div className="text-center text-white space-y-2 animate-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg">
              GoTravel<span className="text-emerald-400">Asia</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl font-medium text-white/90 drop-shadow-md max-w-lg mx-auto leading-relaxed">
            Find the cheapest flights from Myanmar to Thailand, Singapore &amp; Vietnam.
          </p>
        </div>

        {/* The Widget */}
        <FlightWidget />

        {/* TRUSTED PARTNERS SECTION */}
        <div className="mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <p className="text-center text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Official Partners &amp; Payment Methods
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/10 shadow-2xl">

            {/* --- Booking Partners --- */}
            <img src="https://cdn6.agoda.net/images/b2c-default/logo-agoda-backend.svg" alt="Agoda" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
            <img src="https://pages.trip.com/images/home/trip_logo_2020.svg" alt="Trip.com" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
            <img src="https://12go.asia/static/img/logo.svg" alt="12Go" className="h-5 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />

            {/* Divider Line */}
            <div className="w-px h-8 bg-white/20 mx-2 hidden md:block"></div>

            {/* --- Airlines --- */}
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Myanmar_Airways_International_logo.svg/1200px-Myanmar_Airways_International_logo.svg.png" alt="MAI" className="h-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f5/AirAsia_New_Logo.svg" alt="AirAsia" className="h-8 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white rounded-full p-1" />

            {/* Divider Line */}
            <div className="w-px h-8 bg-white/20 mx-2 hidden md:block"></div>

            {/* --- Payments --- */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 bg-white rounded px-1" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300" />

          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-white/40 text-xs font-medium">
          © 2026 GoTravel Asia. automated by AI.
        </div>

      </div>
    </div>
  );
}
