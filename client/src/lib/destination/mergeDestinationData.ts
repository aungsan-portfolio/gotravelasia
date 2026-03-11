import type {
  DestinationLandingApiResponse,
  StaticDestinationRecord,
} from "@/types/destination";

function preferLive<T>(staticItems: T[], liveItems?: T[]) {
  return liveItems && liveItems.length > 0 ? liveItems : staticItems;
}

export function mergeDestinationData(
  staticData: StaticDestinationRecord,
  liveData?: DestinationLandingApiResponse | null,
) {
  return {
    ...staticData,
    deals: {
      cheapest: preferLive(staticData.deals.cheapest, liveData?.deals.cheapest),
      fastest: preferLive(staticData.deals.fastest, liveData?.deals.fastest),
      bestValue: preferLive(
        staticData.deals.bestValue,
        liveData?.deals.bestValue,
      ),
      weekend: preferLive(staticData.deals.weekend, liveData?.deals.weekend),
      premium: preferLive(staticData.deals.premium, liveData?.deals.premium),
    },
    fareTable: preferLive(staticData.fareTable, liveData?.fareTable),
    airlines: preferLive(staticData.airlines, liveData?.airlines),
  };
}
