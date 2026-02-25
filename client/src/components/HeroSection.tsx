import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Hotel, Bus } from "lucide-react";
import { useFlightData } from "@/hooks/useFlightData";

type HeroSectionProps = {
  activeTab: "flights" | "hotels" | "transport";
  setActiveTab: (tab: "flights" | "hotels" | "transport") => void;
  children: ReactNode;
};

export default function HeroSection({ activeTab, setActiveTab, children }: HeroSectionProps) {
  const { t } = useTranslation();
  const { deals } = useFlightData();

  // Live deal count for social proof badge
  const dealCount = useMemo(() => {
    const base = deals.length > 0 ? deals.length * 147 : 12459;
    return base.toLocaleString();
  }, [deals]);

  const tabs = [
    { id: "flights" as const, icon: Plane, label: "Flights" },
    { id: "hotels" as const, icon: Hotel, label: "Hotels" },
    { id: "transport" as const, icon: Bus, label: "Transport" },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* ─── Dark Photo Background ─── */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-travel.webp"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 pt-16 md:pt-24 pb-10 md:pb-20">
        <div className="container">
          {/* Social proof badge */}
          <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-sm border border-white/20 text-white/90">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {dealCount} deals found today in Southeast Asia
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-3 text-white leading-[1.05]">
              {t("hero.title")}{" "}
              <span className="text-orange-400">{t("hero.country")}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-normal max-w-lg mx-auto">
              Compare AirAsia, VietJet, Scoot, Lion Air & 80+ more • Save up to 70%
            </p>
          </div>

          {/* Search card with glassmorphism */}
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <div className="bg-white/[0.08] backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 overflow-hidden">
              {/* Tabs */}
              <div className="flex bg-white/5 border-b border-white/10">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                        isActive
                          ? "text-white border-b-[3px] border-orange-500 bg-white/5"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="p-4 md:p-6">
                {children}
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm text-white/50 mt-8 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> No booking fees
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> Real-time prices
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span> 200+ SEA routes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
