import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Hotel, Bus } from "lucide-react";

type HeroSectionProps = {
  activeTab: "flights" | "hotels" | "transport";
  setActiveTab: (tab: "flights" | "hotels" | "transport") => void;
  children: ReactNode;
};

export default function HeroSection({ activeTab, setActiveTab, children }: HeroSectionProps) {
  const { t } = useTranslation();

  const tabs = [
    { id: "flights" as const, icon: Plane, label: "Flights" },
    { id: "hotels" as const, icon: Hotel, label: "Hotels" },
    { id: "transport" as const, icon: Bus, label: "Transport" },
  ];

  return (
    <section className="relative pt-6 md:pt-10 pb-8 md:pb-16 overflow-hidden bg-white">
      <div className="container relative z-10">
        <div className="text-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-5xl lg:text-[56px] font-bold tracking-tight mb-2 md:mb-3 text-gray-900 leading-[1.1]">
            {t("hero.title")} <span className="text-primary">{t("hero.country")}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 font-normal max-w-xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgb(0,0,0,0.06)] border border-gray-200 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          {/* Clean Lucide icon tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors ${activeTab === tab.id
                      ? "text-gray-900 border-b-2 border-primary"
                      : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 md:p-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
