import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AFFILIATE, buildAviasalesUrl, buildAgodaPartnerUrl } from "@/lib/config";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { usePriceHint } from "@/hooks/useFlightData";
import { formatTHB } from "@/const";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [location] = useLocation();
  const ctx = useFlightSearch();

  // ── Dynamic Price Data ───────────────────────────────────────────────
  const lowestPrice = usePriceHint(
    ctx.origin?.code || "",
    ctx.destination?.code || "",
    ctx.tripType === "return"
  );

  useEffect(() => {
    const toggleVisibility = () => {
      // Toggle visibility based on scroll depth
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (location === "/") return null;

  let ctaText = "Plan Your Trip";
  let ctaLink = "/";
  let ctaSubtext = "Best prices guaranteed";

  if (location.includes("flights") || location.includes("results")) {
    ctaText = "Find Cheap Flights";
    ctaLink = ctx.origin && ctx.destination ? ctx.buildSearchURL()?.travelpayouts || "#" : buildAviasalesUrl("RGN", "BKK");

    if (lowestPrice) {
      ctaSubtext = `Cheapest from $${lowestPrice} (${formatTHB(lowestPrice)})`;
    } else {
      ctaSubtext = "Save up to 40% on flights";
    }
  } else if (location.includes("hotels") || location.includes("stay")) {
    ctaText = "Check Hotel Rates";
    ctaLink = buildAgodaPartnerUrl(15932);
    ctaSubtext = "Free cancellation available";
  } else if (location.includes("insurance")) {
    ctaText = "Get Insured Now";
    ctaLink = "https://ekta.insure/";
    ctaSubtext = "Coverage starts at $3/day";
  } else if (location.includes("esim")) {
    ctaText = "Get eSIM Data";
    ctaLink = AFFILIATE.AIRALO_URL;
    ctaSubtext = "Instant activation";
  } else if (location.includes("thailand")) {
    ctaText = "Book Your Trip";
    ctaLink = "#flights";
    ctaSubtext = "Start planning today";
  }

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 p-3 pt-4 bg-background/90 backdrop-blur-xl border-t border-border z-50 md:hidden animate-in slide-in-from-bottom-full duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Live Deal</p>
          <p className="text-sm font-extrabold text-[#5B0EA6] truncate">{ctaSubtext}</p>
        </div>
        <Button className="font-black shadow-md bg-[#F5C518] text-[#2D0558] hover:bg-[#E5B508] rounded-xl px-5 h-11 shrink-0" asChild>
          <a href={ctaLink} target={ctaLink.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer">
            {ctaText}
          </a>
        </Button>
      </div>
    </div>
  );
}
