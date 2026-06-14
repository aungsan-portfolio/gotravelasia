import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Hotel, Bus } from "lucide-react";

type Tab = "flights" | "hotels" | "transport";

type MockupHeroSectionProps = {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: ReactNode;
  onExitMockup: () => void;
};

/**
 * Cheapflights-style hero wrapper (mockup).
 *
 * - White/light background, no porthole photos, no animated flight paths
 * - Search box is the visual hero
 * - Subtle gold accent on hover/active (preserves GoTravel brand)
 * - Tab filter row above the search card (Cheapflights pattern)
 * - Trust row below the search card
 * - Toggle pill in top-right to switch back to original HeroSection
 *
 * IMPORTANT: Does NOT touch FlightWidget, the TPWL white label config,
 * or any flights/* files. The widget renders inside unchanged.
 */
export default function MockupHeroSection({
  activeTab,
  setActiveTab,
  children,
  onExitMockup,
}: MockupHeroSectionProps) {
  const { t } = useTranslation();

  const tabs: { id: Tab; icon: typeof Plane; labelKey: string; label: string }[] = [
    { id: "flights",   icon: Plane, labelKey: "tabs.flights",   label: "Flights" },
    { id: "hotels",    icon: Hotel, labelKey: "tabs.hotels",    label: "Hotels" },
    { id: "transport", icon: Bus,   labelKey: "tabs.transport", label: "Transport" },
  ];

  return (
    <section className="cf-hero" aria-label="Flight search">
      {/* Mockup exit pill - only visible in mockup mode */}
      <button
        type="button"
        onClick={onExitMockup}
        className="cf-exit-pill"
        aria-label="Switch back to original design"
      >
        {"<-"} Original design
      </button>

      <div className="cf-container">
        {/* Heading - left aligned, large, white-space clean */}
        <div className="cf-heading">
          <h1 className="cf-h1">
            Compare and book flights with ease
          </h1>
          <p className="cf-sub">
            Discover your next dream destination at the lowest price
          </p>
        </div>

        {/* Tab filter row - text tabs with underline active state (Cheapflights pattern) */}
        <div className="cf-tabs" role="tablist" aria-label="Search type">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`cf-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`cf-tab ${isActive ? "cf-tab--active" : ""}`}
              >
                <Icon className="cf-tab__icon" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search card - white, subtle shadow, search box is the hero */}
        <div className="cf-search-card">
          <div className="cf-search-card__widget">
            {children}
          </div>
        </div>

        {/* Trust row - single horizontal line, no boxes */}
        <div className="cf-trust" aria-label="Why GoTravel Asia">
          <span className="cf-trust__item">
            <Plane className="cf-trust__icon" aria-hidden="true" />
            100,000+ routes
          </span>
          <span className="cf-trust__divider" aria-hidden="true">{"\u2022"}</span>
          <span className="cf-trust__item">728 airlines</span>
          <span className="cf-trust__divider" aria-hidden="true">{"\u2022"}</span>
          <span className="cf-trust__item">No booking fees</span>
          <span className="cf-trust__divider" aria-hidden="true">{"\u2022"}</span>
          <span className="cf-trust__item">Real-time prices</span>
        </div>
      </div>
    </section>
  );
}


