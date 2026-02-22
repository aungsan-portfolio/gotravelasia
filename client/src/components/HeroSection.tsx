import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Partners from "./Partners";

const TABS = [
  { id: "flights" as const, icon: "✈️", label: "Flights", mobileLabel: "Flights" },
  { id: "hotels" as const, icon: "🏨", label: "Hotels", mobileLabel: "Hotels" },
  { id: "transport" as const, icon: "🚌", label: "Transport in Thailand", mobileLabel: "Transport" },
];

type TabId = "flights" | "hotels" | "transport";

type HeroSectionProps = {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  children: ReactNode;
};

export default function HeroSection({ activeTab, setActiveTab, children }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <section className="relative pt-24 pb-16 overflow-hidden bg-[#f0f2f5]">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tighter mb-4 text-gray-900 leading-[1.1]">
                {t("hero.title")}
                <br />
                <span className="text-primary">{t("hero.country")}</span>
              </h1>
              <p className="text-xl text-gray-600 font-medium mb-4 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-100 leading-relaxed">
                {t("hero.slogan")}
              </p>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-gray-300"></span> Compare Flights • Hotels • Transport from Myanmar
              </p>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <img src="/images/bangkok.webp" alt="Bangkok" className="rounded-2xl object-cover h-[320px] w-full shadow-lg" loading="lazy" />
              <div className="grid grid-rows-2 gap-4">
                <img src="/images/chiang-mai.webp" alt="Chiang Mai" className="rounded-2xl object-cover h-[152px] w-full shadow-md" loading="lazy" />
                <img src="/images/phuket.webp" alt="Phuket" className="rounded-2xl object-cover h-[152px] w-full shadow-md" loading="lazy" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="flex border-b border-gray-100 bg-gray-50/50 rounded-t-2xl overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 md:py-5 flex items-center justify-center gap-2 transition-all font-bold text-sm md:text-base ${activeTab === tab.id
                    ? "bg-white text-gray-900 border-b-2 border-primary shadow-[0_-2px_10px_rgb(0,0,0,0.02)] relative z-10"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                    }`}
                >
                  <span className="text-lg md:text-2xl">{tab.icon}</span>
                  <span className="font-bold truncate">
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.mobileLabel}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 md:p-6">
              {children}
            </div>
          </div>
        </div>
      </section>

      <Partners />
    </>
  );
}
