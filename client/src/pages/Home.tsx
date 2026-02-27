import React, { useState, useCallback, useEffect, Suspense } from "react";
import Layout from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import HeroSection from "@/components/HeroSection";
import FlightWidget from "@/components/FlightWidget";
import CheapDealsCards from "@/components/CheapDealsCards";
import PopularDestinations from "@/components/PopularDestinations";

import {
  buildAviasalesUrl as buildAviasalesLink,
} from "@/lib/config";

// ─── Lazy-loaded tabs (Upgrade 4: code splitting) ───
const HotelsSearchForm = React.lazy(() => import("@/components/HotelsSearchForm"));
const TransportScheduleWidget = React.lazy(() => import("@/components/TransportScheduleWidget"));

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
  usePageMeta({
    title: "Compare Cheap Flights, Hotels & Transport in Southeast Asia",
    description: "Compare cheap flights, buses, trains and hotels across Southeast Asia. Book from anywhere with instant price comparison on GoTravel Asia.",
    path: "/",
    keywords: "travel asia, southeast asia travel, cheap flights asia, bangkok flights, singapore hotels, bali deals, asia transport, asia travel comparison",
  });

  const [activeTab, setActiveTab] = useState<"flights" | "hotels" | "transport">("flights");

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
      <HeroSection activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === "flights" && <FlightWidget />}

        {/* Upgrade 4: Lazy-loaded tabs — Hotels & Transport only download when clicked */}
        <Suspense fallback={<TabSkeleton />}>
          {activeTab === "hotels" && <HotelsSearchForm />}
          {activeTab === "transport" && (
            <div
              className="w-full overflow-y-auto max-h-[550px] md:max-h-none relative z-10"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <TransportScheduleWidget />
            </div>
          )}
        </Suspense>
      </HeroSection>

      <CheapDealsCards />

      <PopularDestinations />
    </Layout>
  );
}
