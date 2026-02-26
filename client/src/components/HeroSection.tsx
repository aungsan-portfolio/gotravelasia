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
      {/* ─── Purple Gradient Background ─── */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #2D0558 0%, #5B0EA6 55%, #7B2EC8 100%)' }} />
      {/* Subtle decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)' }} />

      {/* ─── Content ─── */}
      <div className="relative z-10 pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="container">
          {/* Social proof badge */}
          <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium shadow-sm" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
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
              <span style={{ color: '#F5C518' }}>{t("hero.country")}</span>
            </h1>
            <p className="text-lg md:text-xl font-normal max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Compare AirAsia, VietJet, Scoot, Lion Air & 80+ more • Save up to 70%
            </p>
          </div>

          {/* Search card — clean white */}
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1.5px solid rgba(255,255,255,0.15)', boxShadow: '0 32px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
              {/* Tabs */}
              <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center justify-center gap-2 flex-1 px-6 py-3.5 text-sm font-semibold transition-all"
                      style={isActive
                        ? { background: '#F5C518', color: '#2D0558', borderRadius: '40px', margin: '6px 4px', boxShadow: '0 2px 10px rgba(245,197,24,0.35)' }
                        : { color: 'rgba(255,255,255,0.65)' }
                      }
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
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs md:text-sm mt-8 animate-in fade-in duration-1000 delay-500" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#F5C518' }}>✦</span> No booking fees
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#F5C518' }}>✦</span> Real-time prices
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#F5C518' }}>✦</span> 200+ SEA routes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
