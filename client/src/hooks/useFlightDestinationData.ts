import { useFlightData, useLivePriceMap } from "./useFlightData";
import { useMemo } from "react";
import { adaptFlightDataset, DestinationPageData } from "@/lib/flightAdapters";

export function useFlightDestinationData(originCode: string, destinationCode: string) {
    // 1. We still fetch the data using the site's default data hook
    const { deals, loading } = useFlightData();

    // 2. Fetch live price fallback just in case
    const livePrices = useLivePriceMap([{ origin: originCode, destination: destinationCode }]);

    const pageData = useMemo<DestinationPageData | null>(() => {
        if (loading) return null;

        // 3. Pass the RAW structure of the Deals array into the robust adapter
        // We know `deals` is fetched from `flight_data.json` so if the bot changes 
        // the json structure, `adaptFlightDataset` handles the normalization safely.
        const normalizedData = adaptFlightDataset(deals, originCode, destinationCode);

        // 4. Overwrite edge case where live cache is smaller than cheapest static price
        if (normalizedData) {
            const livePrice = livePrices[`${normalizedData.originCode}-${normalizedData.destinationCode}`];
            if (livePrice && livePrice < normalizedData.cheapestPrice) {
                normalizedData.cheapestPrice = livePrice;
            }
        }

        return normalizedData;
    }, [deals, loading, originCode, destinationCode, livePrices]);

    return { pageData, loading };
}
