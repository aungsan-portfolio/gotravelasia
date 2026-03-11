import type {
  DestinationLandingApiResponse,
  DestinationPageVM,
  StaticDestinationRecord,
} from "@/types/destination";
import { mergeDestinationData } from "./mergeDestinationData";
import { normalizeLiveData } from "./normalizeLiveData";

export function buildDestinationPageVM(args: {
  staticData: StaticDestinationRecord;
  liveData?: DestinationLandingApiResponse | null;
  isLiveRefreshing?: boolean;
  liveFailed?: boolean;
}): DestinationPageVM {
  const normalizedLive = normalizeLiveData(args.liveData);
  const merged = mergeDestinationData(args.staticData, normalizedLive);

  const allDeals = [
    ...merged.deals.cheapest,
    ...merged.deals.fastest,
    ...merged.deals.bestValue,
    ...merged.deals.weekend,
    ...merged.deals.premium,
  ];

  const lowestFare = allDeals.length
    ? Math.min(
        ...allDeals.map((d) => d.price).filter((n) => Number.isFinite(n)),
      )
    : undefined;

  const directAvailability = merged.fareTable.some((row) => row.s1 === 0)
    ? "Some direct options"
    : "Mostly 1-stop";

  return {
    slug: merged.slug,
    origin: merged.origin,
    dest: merged.dest,
    currency: normalizedLive?.meta.currency ?? "thb",
    heroNote:
      merged.heroNote ??
      `Live fares and booking options for ${merged.dest.city}.`,
    updatedAt: normalizedLive?.meta.updatedAt,
    deals: merged.deals,
    fareTable: merged.fareTable,
    airlines: merged.airlines,
    priceMonths: merged.priceMonths,
    heatmap: merged.heatmap,
    reviews: merged.reviews,
    weather: merged.weather,
    faqs: merged.faqs,
    nearbyRoutes: merged.nearbyRoutes,
    lowestFare,
    typicalDuration: merged.fareTable[0]?.dur1 ?? undefined,
    directAvailability,
    isLiveRefreshing: Boolean(args.isLiveRefreshing),
    liveFailed: Boolean(args.liveFailed),
  };
}
