import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AFFILIATE, buildAviasalesUrl, buildAgodaPartnerUrl } from "@/lib/config";

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const toggleVisibility = () => {
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

  if (location.includes("flights")) {
    ctaText = "Find Cheap Flights";
    ctaLink = buildAviasalesUrl("RGN", "BKK");
    ctaSubtext = "Save up to 40%";
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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-50 md:hidden animate-in slide-in-from-bottom-full duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{ctaSubtext}</p>
        </div>
        <Button className="font-bold uppercase tracking-wider shadow-lg" asChild>
          <a href={ctaLink} target={ctaLink.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer">
            {ctaText}
          </a>
        </Button>
      </div>
    </div>
  );
}
