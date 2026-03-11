import { useCallback } from "react";
import { useFlightSearch } from "@/contexts/FlightSearchContext";
import { AFFILIATE } from "@/lib/config";
import { useNewsletter } from "./hooks/useNewsletter";
import BottomBar from "./sections/BottomBar";
import BrandBlock from "./sections/BrandBlock";
import CompanyColumn from "./sections/CompanyColumn";
import ExploreColumn from "./sections/ExploreColumn";
import FlightsColumn from "./sections/FlightsColumn";
import NewsletterBanner from "./sections/NewsletterBanner";
import PartnerBar from "./sections/PartnerBar";
import SeoDestinations from "./sections/SeoDestinations";

export default function Footer() {
    const { setCabinClass } = useFlightSearch();
    const newsletter = useNewsletter();

    const goToFlights = useCallback(() => {
        if (typeof window !== "undefined") {
            window.location.href = "/#flights";
        }
    }, []);

    const handleBusinessClass = useCallback(() => {
        setCabinClass?.("C");
        goToFlights();
    }, [setCabinClass, goToFlights]);

    return (
        <footer
            className="relative overflow-hidden"
            style={{
                background: "#2a0050",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
            }}
        >
            {/* Glow orb */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: 600,
                    height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(120,40,200,0.18) 0%, transparent 70%)",
                    top: -200,
                    left: -150,
                }}
            />

            <NewsletterBanner {...newsletter} />

            <div className="container max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12 px-6 sm:px-12 relative z-10">
                <BrandBlock />
                <FlightsColumn
                    goToFlights={goToFlights}
                    onBusinessClass={handleBusinessClass}
                />
                <ExploreColumn />
                <CompanyColumn airaloUrl={AFFILIATE?.AIRALO_URL ?? "https://airalo.com"} />
            </div>

            <SeoDestinations />
            <PartnerBar />
            <BottomBar />
        </footer>
    );
}
