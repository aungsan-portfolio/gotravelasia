import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type HeroSectionProps = {
  activeTab: "flights" | "hotels" | "transport";
  setActiveTab: (tab: "flights" | "hotels" | "transport") => void;
  children: ReactNode;
};

export default function HeroSection({ activeTab, setActiveTab, children }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="relative pt-6 md:pt-10 pb-8 md:pb-16 overflow-hidden bg-[#f0f2f5]">
      <div className="container relative z-10">
        <div className="text-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-5xl lg:text-[56px] font-extrabold tracking-tighter mb-2 md:mb-3 text-gray-900 leading-[1.1]">
            {t("hero.title")} <span className="text-primary">{t("hero.country")}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-500 font-medium max-w-xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          {children}
        </div>
      </div>
    </section>
  );
}

