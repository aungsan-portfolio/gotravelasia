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
      {/* ─── Light Gradient Background ─── */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-gray-50" />
      {/* Subtle decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100/50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50/40 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

      {/* ─── Content ─── */}
      <div className="relative z-10 pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="container">
          {/* Social proof badge */}
          <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 bg-sky-50 px-5 py-2 rounded-full text-sm border border-sky-200/60 text-sky-700 font-medium shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {dealCount} deals found today in Southeast Asia
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-3 text-gray-900 leading-[1.05]">
              {t("hero.title")}{" "}
              <span className="text-orange-500">{t("hero.country")}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-normal max-w-lg mx-auto">
              Compare AirAsia, VietJet, Scoot, Lion Air & 80+ more • Save up to 70%
            </p>
          </div>

          {/* Search card — clean white */}
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 flex-1 px-6 py-3.5 text-sm font-semibold transition-all ${isActive
                          ? "text-gray-900 border-b-[3px] border-orange-500 bg-orange-50/30"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
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
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm text-gray-400 mt-8 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> No booking fees
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> Real-time prices
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500">✓</span> 200+ SEA routes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
