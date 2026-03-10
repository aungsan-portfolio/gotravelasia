import { useMemo } from "react";
import { useFlightData, useLivePriceMap } from "./useFlightData";
import { adaptFlightDataset } from "@/lib/flightAdapters";
import type { UseFlightDestinationDataResult, FlightDestinationPageData } from "@/types/flights";

export function useFlightDestinationData(
    originCode: string,
    destinationCode: string
): UseFlightDestinationDataResult {
    // 1. Fetch raw data async (doesn't hit bundle size)
    const { deals, loading, error } = useFlightData();

    // 2. Fetch live prices as a fallback
    const livePrices = useLivePriceMap([{ origin: originCode, destination: destinationCode }]);

    const data = useMemo<FlightDestinationPageData | null>(() => {
        if (loading || !deals) return null;

        // Use our strict adapter to safely map the raw array/object to FlightDestinationPageData
        const normalizedData = adaptFlightDataset(deals, originCode, destinationCode);

        if (normalizedData) {
            const livePrice = livePrices[`${normalizedData.originCode}-${normalizedData.destinationCode}`];
            if (livePrice && livePrice < normalizedData.cheapestPrice) {
                normalizedData.cheapestPrice = livePrice;
            }
        }

        return normalizedData;
    }, [deals, loading, originCode, destinationCode, livePrices]);

    return {
        data,
        isLoading: loading,
        error: error || null,
    };
}
