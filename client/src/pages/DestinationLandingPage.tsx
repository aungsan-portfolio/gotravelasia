import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";

import Navbar from "../components/flights/destination/Navbar";
import HeroSearch from "../components/flights/destination/HeroSearch";
import FlightDeals from "../components/flights/destination/FlightDeals";
import FareFinder from "../components/flights/destination/FareFinder";
import Insights from "../components/flights/destination/Insights";
import AirlinesWeather from "../components/flights/destination/AirlinesWeather";
import AirlineReviews from "../components/flights/destination/AirlineReviews";
import FooterSections from "../components/flights/destination/FooterSections";

import { getDestinationBySlug, POP_DEST, POP_CITIES } from "../data/destinationRegistry";
import { parseDestinationLandingResponse } from "../data/destinationSchemas";
import { buildDestinationPageVM } from "../lib/destination/buildDestinationPageVM";
import type { DestinationLandingApiResponse } from "../types/destination";

export default function DestinationLandingPage() {
    const [, params] = useRoute("/flights/to/:destination");
    const destinationSlug = params?.destination || "singapore";

    const staticData = getDestinationBySlug(destinationSlug) || getDestinationBySlug("singapore")!;
    const [liveData, setLiveData] = useState<DestinationLandingApiResponse | null>(null);
    const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);
    const [liveFailed, setLiveFailed] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [destinationSlug]);

    useEffect(() => {
        let active = true;

        async function fetchLive() {
            try {
                setIsLiveRefreshing(true);
                setLiveFailed(false);

                const res = await fetch(
                    `/api/destination-landing?origin=${staticData.origin.code}&destination=${staticData.dest.code}&currency=thb`,
                );

                if (!res.ok) {
                    throw new Error(`Live API failed with status ${res.status}`);
                }

                const json = await res.json();
                const parsed = parseDestinationLandingResponse(json);

                if (!parsed.success) {
                    throw new Error("Live API schema validation failed");
                }

                if (active) {
                    setLiveData(parsed.data);
                }
            } catch (error) {
                console.error(error);
                if (active) {
                    setLiveFailed(true);
                }
            } finally {
                if (active) {
                    setIsLiveRefreshing(false);
                }
            }
        }

        fetchLive();

        return () => {
            active = false;
        };
    }, [staticData.origin.code, staticData.dest.code]);

    const data = useMemo(
        () =>
            buildDestinationPageVM({
                staticData,
                liveData,
                isLiveRefreshing,
                liveFailed,
            }),
        [staticData, liveData, isLiveRefreshing, liveFailed],
    );

    return (
        <>
            <Helmet>
                <title>
                    Live fares to {data.dest.city} ({data.dest.code}) | GoTravel Asia
                </title>
                <meta
                    name="description"
                    content={`Compare live fares, flexible route options, and timing insights for ${data.dest.city}.`}
                />
                <link rel="canonical" href={`https://gotravel-asia.vercel.app/flights/to/${data.slug}`} />
                <style>{`
                    body { background-color: #0b0719; }
                    #root { background-color: #0b0719; }
                    .light .bg-background { background-color: #0b0719 !important; }
                `}</style>
            </Helmet>

            <div className="min-h-screen bg-[#0b0719] text-white font-sans selection:bg-violet-500/30">
                <Navbar dest={data.dest.city} destCode={data.dest.code} origin={data.origin.city} />

                <div id="hero-search">
                    <HeroSearch data={data} />
                </div>

                <div id="flight-deals">
                    <FlightDeals data={data} />
                </div>

                <FareFinder data={data} />

                <Insights data={data} />

                <div id="airlines-weather">
                    <AirlinesWeather data={data} />
                </div>

                <AirlineReviews data={data} />

                <FooterSections data={data} popDest={POP_DEST} popCities={POP_CITIES} />
            </div>
        </>
    );
}
