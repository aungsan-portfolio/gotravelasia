import React, { useState, useCallback, useEffect, Suspense } from "react";
import Layout from "@/components/Layout";
import SEO from "@/seo/SEO";
import HeroSection from "@/components/HeroSection";
import MockupHeroSection from '@/components/home/MockupHeroSection'; // Cheapflights-style mockup (A/B toggle)
import FlightWidget from "@/components/flights/FlightWidget";
import CheapDealsCards from "@/components/cheap-deals";
import SpecialOffers from "@/components/cheap-deals/SpecialOffers";
import PopularDestinations from "@/components/PopularDestinations";
import TransportPreview from "@/components/home/TransportPreview";
import HomeFAQSection from "@/components/HomeFAQSection";
import AboutSection from "@/components/AboutSection";

import {
  buildAviasalesUrl as buildAviasalesLink,
} from "@/lib/config";

// â”€â”€â”€ Lazy-loaded tabs (Upgrade 4: code splitting) â”€â”€â”€
const HotelSearchPreview = React.lazy(() => import("@/components/home/HotelSearchPreview"));
const TwelveGoWidget = React.lazy(() => import("@/components/TwelveGoWidget"));

// Fallback skeleton for lazy tabs
function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-white/10 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="h-14 bg-white/10 rounded-xl" />
        <div className="h-14 bg-white/10 rounded-xl" />
        <div className="h-14 bg-white/10 rounded-xl" />
      </div>
      <div className="h-12 w-48 bg-white/10 rounded-xl ml-auto" />
    </div>
  );
}


export default function Home() {
  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "transport">("flights");
  // A/B toggle: false = original HeroSection, true = Cheapflights-style mockup
  const [mockupMode, setMockupMode] = useState<boolean>(false);

  // Read URL hash to switch tabs (connected to nav links)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "flights" || hash === "hotels" || hash === "transport") {
        setActiveTab(hash);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  return (
    <Layout>
      <SEO path="/" />
            {mockupMode ? (
        <MockupHeroSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onExitMockup={() => setMockupMode(false)}
        >
        {activeTab === "flights" && <FlightWidget />}

        <Suspense fallback={<TabSkeleton />}>
          {activeTab === "hotels" && <HotelSearchPreview />}
          {activeTab === "transport" && (
            <div
              className="w-full relative z-10"
              style={{ padding: '0 8px' }}
            >
              <TwelveGoWidget minHeight={450} />
            </div>
          )}
        </Suspense>
        </MockupHeroSection>
      ) : (
        <HeroSection activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === "flights" && <FlightWidget />}

        <Suspense fallback={<TabSkeleton />}>
          {activeTab === "hotels" && <HotelSearchPreview />}
          {activeTab === "transport" && (
            <div
              className="w-full relative z-10"
              style={{ padding: '0 8px' }}
            >
              <TwelveGoWidget minHeight={450} />
            </div>
          )}
        </Suspense>
        </HeroSection>
      )}

      {!mockupMode && (
        <button
          type="button"
          onClick={() => setMockupMode(true)}
          className="mockup-entry-pill"
          aria-label="Try the new Cheapflights-style design"
        >
          Try new design
        </button>
      )}


      <SpecialOffers />

      <CheapDealsCards />

      <PopularDestinations />

      <TransportPreview />

      <HomeFAQSection />

      <AboutSection />
    </Layout>
  );
}



