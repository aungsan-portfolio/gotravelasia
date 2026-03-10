import { useMemo } from "react";
import { useParams } from "wouter";
import Layout from "@/components/Layout";
import DestinationHero from "@/components/destination/DestinationHero";
import SummaryCards from "@/components/destination/SummaryCards";
import DealsGrid from "@/components/destination/DealsGrid";
import DestinationFAQ from "@/components/destination/DestinationFAQ";
import RelatedRoutes from "@/components/destination/RelatedRoutes";
import LoadingState from "@/components/destination/LoadingState";
import EmptyState from "@/components/destination/EmptyState";
import { useFlightDestinationData } from "@/hooks/useFlightDestinationData";
import { buildSummaryCards } from "@/lib/flightTransforms";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FlightDestinationPage() {
    const params = useParams<{ originCode: string; destinationCode: string }>();
    const originCode = params?.originCode || "BKK";
    const destinationCode = params?.destinationCode || "SIN";

    const { data, isLoading, error } = useFlightDestinationData(originCode, destinationCode);

    const summaryCards = useMemo(() => {
        if (!data) return [];
        return buildSummaryCards(data.deals, data.currency);
    }, [data]);

    usePageMeta({
        title: `Cheap flights from ${originCode.toUpperCase()} to ${destinationCode.toUpperCase()} - GoTravel Asia`,
        description: `Compare cheap flights from ${originCode.toUpperCase()} to ${destinationCode.toUpperCase()}. See real-time lowest prices and find the best deals for your next trip.`,
        path: `/flights/${originCode.toLowerCase()}/${destinationCode.toLowerCase()}`,
        keywords: `flights from ${originCode} to ${destinationCode}, cheap flights ${destinationCode}, travel ${destinationCode}, asia travel`,
    });

    if (isLoading || data === undefined) {
        return <LoadingState />;
    }

    if (error || !data || !data.deals?.length) {
        return (
            <EmptyState
                originCode={originCode.toUpperCase()}
                destinationCode={destinationCode.toUpperCase()}
            />
        );
    }

    return (
        <Layout>
            <DestinationHero
                originCity={data.originCity}
                originCode={data.originCode}
                destinationCity={data.destinationCity}
                destinationCode={data.destinationCode}
                cheapestPrice={data.cheapestPrice}
                currency={data.currency}
                updatedAt={data.updatedAt}
                dealsCount={data.deals.length}
            />

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
                <SummaryCards cards={summaryCards} />
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 w-full">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Cheap flight deals
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Showing real, current deals from our latest bot search.
                        </p>
                    </div>
                </div>

                <DealsGrid deals={data.deals} currency={data.currency} />
            </section>

            <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8 w-full">
                <div className="lg:col-span-2">
                    <DestinationFAQ
                        originCity={data.originCity}
                        destinationCity={data.destinationCity}
                        destinationCode={data.destinationCode}
                    />
                </div>

                <div className="lg:col-span-1">
                    <RelatedRoutes
                        originCode={data.originCode}
                        destinationCode={data.destinationCode}
                    />
                </div>
            </section>
        </Layout>
    );
}
