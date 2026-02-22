import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Partners from "./Partners";
import TrustBar from "./TrustBar";

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
      <section className="relative pt-6 md:pt-10 pb-8 md:pb-16 overflow-hidden bg-[#f0f2f5]">
        <div className="container relative z-10">
          <div className="text-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl md:text-5xl lg:text-[56px] font-extrabold tracking-tighter mb-2 md:mb-3 text-gray-900 leading-[1.1]">
              {t("hero.title")} <span className="text-primary">{t("hero.country")}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 font-medium max-w-xl mx-auto">
              Compare flights, hotels & transport from Myanmar across 6 trusted partners
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <div className="flex border-b border-gray-100 bg-gray-50/50 rounded-t-2xl overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3.5 md:py-5 flex items-center justify-center gap-2 transition-all font-bold text-sm md:text-base ${activeTab === tab.id
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

          <div className="mt-6 md:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="hidden lg:grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
              <img src="/images/bangkok.webp" alt="Bangkok" className="rounded-xl object-cover h-[180px] w-full shadow-md" loading="lazy" decoding="async" />
              <img src="/images/chiang-mai.webp" alt="Chiang Mai" className="rounded-xl object-cover h-[180px] w-full shadow-md" loading="lazy" decoding="async" />
              <img src="/images/phuket.webp" alt="Phuket" className="rounded-xl object-cover h-[180px] w-full shadow-md" loading="lazy" decoding="async" />
            </div>
            <div className="hidden lg:block animate-in fade-in slide-in-from-right-8 duration-700 delay-400">
              <TrustBar />
            </div>
          </div>
        </div>
      </section>

      <div className="lg:hidden">
        <TrustBar />
      </div>

      <Partners />
    </>
  );
}
