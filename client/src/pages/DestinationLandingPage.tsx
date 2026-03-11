import { useEffect } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";

// Sections
import Navbar from "../components/flights/destination/Navbar";
import HeroSearch from "../components/flights/destination/HeroSearch";
import FlightDeals from "../components/flights/destination/FlightDeals";
import FareFinder from "../components/flights/destination/FareFinder";
import Insights from "../components/flights/destination/Insights";
import AirlinesWeather from "../components/flights/destination/AirlinesWeather";
import AirlineReviews from "../components/flights/destination/AirlineReviews";
import FooterSections from "../components/flights/destination/FooterSections";

// Dynamic data registry
import { getDestinationBySlug, POP_DEST, POP_CITIES } from "../data/destinationRegistry";

export default function DestinationLandingPage() {
    const [, params] = useRoute("/flights/to/:destination");
    const destinationSlug = params?.destination || "singapore";

    const bundle = getDestinationBySlug(destinationSlug);

    // Scroll to top when destination changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [destinationSlug]);

    // Fallback: if slug not found, try to show Singapore
    const data = bundle || getDestinationBySlug("singapore")!;

    return (
        <div className="bg-[#0b0719] min-h-screen text-slate-100 font-sans selection:bg-violet-500/30">
            <Helmet>
                <title>Cheap Flights to {data.dest.city} ({data.dest.code}) | GoTravel Asia</title>
                <meta name="description" content={`Find the cheapest flights to ${data.dest.city}. Compare prices from 900+ travel sites and book your flight to ${data.dest.country} today.`} />
                <style>{`
          body { background-color: #0b0719; }
          #root { background-color: #0b0719; }
          .light .bg-background { background-color: #0b0719 !important; }
        `}</style>
            </Helmet>

            {/* §0 Sticky navigation */}
            <Navbar dest={data.dest.city} destCode={data.dest.code} origin={data.origin.city} />

            {/* §1 Hero + search widget */}
            <div id="hero-search">
                <HeroSearch dest={data.dest} meta={data.meta} />
            </div>

            {/* §2 5-tab flight deal cards */}
            <div id="flight-deals">
                <FlightDeals dest={data.dest} meta={data.meta} deals={data.deals} />
            </div>

            {/* §3 + §4 Stat cards + Fare Finder table */}
            <FareFinder meta={data.meta} rows={data.fareTable} />

            {/* §5 + §6 Price trend chart + Insights grid */}
            <Insights
                dest={data.dest} meta={data.meta}
                priceMonth={data.priceMonth}
                bookLead={data.bookLead}
                weekly={data.weekly}
                durations={data.durations}
                heatmap={data.heatmap}
            />

            {/* §7 + §8 Airlines + weather charts */}
            <div id="airlines-weather">
                <AirlinesWeather
                    dest={data.dest}
                    popAirlines={data.popAirlines}
                    cheapAl={data.cheapAl}
                    rainfall={data.rainfall}
                    temperature={data.temperature}
                />
            </div>

            {/* §9 Airline reviews */}
            <AirlineReviews dest={data.dest} meta={data.meta} reviews={data.reviews} />

            {/* §10-§13 FAQ / Browse / Fly with / Footer */}
            <FooterSections
                dest={data.dest} meta={data.meta}
                faqs={data.faqs}
                popDest={POP_DEST}
                popCities={POP_CITIES}
            />
        </div>
    );
}
