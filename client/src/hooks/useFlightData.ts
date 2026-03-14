import { useState, useEffect, useMemo } from "react";

export type Deal = {
  origin:         string;
  destination:    string;
  date:           string;
  price:          number;
  airline:        string;
  flight_num?:    string;
  flight_number?: string;
  transfers?:     number;
  airline_code?:  string;
  currency?:      string;
  found_at?:      string;
  fetchedAt?:     number;
  provider?:      string;
};

export type Meta = {
  updated?: string;
  updated_at?: string;
  overall_cheapest?: Deal;
};

type FlightData = {
  routes: Deal[];
  meta: Meta;
};

let cachedData: FlightData | null = null;
let fetchPromise: Promise<FlightData> | null = null;

function fetchFlightData(): Promise<FlightData> {
  if (cachedData) return Promise.resolve(cachedData);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/data/flight_data.json", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load flight_data.json");
      return res.json();
    })
    .then((data) => {
      cachedData = {
        routes: data.routes || [],
        meta: data.meta || {},
      };
      return cachedData;
    })
    .catch((err) => {
      fetchPromise = null;
      throw err;
    });

  return fetchPromise;
}

export function useFlightData() {
  const [deals, setDeals] = useState<Deal[]>(cachedData?.routes || []);
  const [meta, setMeta] = useState<Meta>(cachedData?.meta || {});
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedData) {
      setDeals(cachedData.routes);
      setMeta(cachedData.meta);
      setLoading(false);
      return;
    }

    fetchFlightData()
      .then((data) => {
        setDeals(data.routes);
        setMeta(data.meta);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return { deals, meta, loading, error };
}

export function useFlightPriceMap() {
  const { deals } = useFlightData();
  return useMemo(() => {
    const priceMap: Record<string, number> = {};
    for (const route of deals) {
      priceMap[`${route.origin}-${route.destination}`] = route.price;
    }
    return priceMap;
  }, [deals]);
}

export function usePriceHint(origin: string, destination: string, _hasReturn?: boolean) {
  const { deals } = useFlightData();
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [fetched, setFetched] = useState("");

  // Static lookup
  const staticPrice = useMemo(() => {
    const route = deals.find((r) => r.origin === origin && r.destination === destination);
    return route?.price ?? null;
  }, [deals, origin, destination]);

  // Live API fallback when static data has no price
  useEffect(() => {
    if (staticPrice !== null || !origin || !destination) return;

    const key = `${origin}-${destination}`;
    if (fetched === key) return; // already tried this pair
    setFetched(key);

    let cancelled = false;
    fetch(`/api/flights?type=cheap&origin=${origin}&currency=usd`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled || !json?.data) return;
        const destData = json.data[destination];
        if (!destData) return;
        // Find cheapest across all flight options
        let cheapest = Infinity;
        for (const flight of Object.values(destData as Record<string, any>)) {
          if (flight.price && flight.price < cheapest) cheapest = flight.price;
        }
        if (cheapest < Infinity) setLivePrice(cheapest);
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [origin, destination, staticPrice, fetched]);

  return staticPrice ?? livePrice;
}

/**
 * useLivePriceMap — fetches live prices for specific routes.
 * Now uses /api/calendar-prices for maximum route coverage (4+ aggregated sources).
 * Falls back to static flight_data.json prices via useFlightPriceMap.
 * @param routes — array of { origin, destination, month? } to look up
 */
export function useLivePriceMap(routes: { origin: string; destination: string; month?: string }[]) {
  const staticPrices = useFlightPriceMap();
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (routes.length === 0) return;

    // Deduplicate routes to avoid redundant fetches
    const uniqueRoutes = Array.from(
      new Map(routes.map(r => [`${r.origin}-${r.destination}-${r.month || ''}`, r])).values()
    );
    let cancelled = false;

    Promise.allSettled(
      uniqueRoutes.map(async route => {
        // Default to current month if none provided
        const month = route.month || new Date().toISOString().substring(0, 7);
        const url = `/api/flights?type=calendar&origin=${route.origin}&destination=${route.destination}&month=${month}&currency=usd`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("API failed");
        const json = await res.json();
        return { origin: route.origin, destination: route.destination, data: json?.data || {} };
      })
    ).then(results => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      for (const result of results) {
        if (result.status !== "fulfilled" || !result.value.data) continue;
        const { origin, destination, data } = result.value;
        const key = `${origin}-${destination}`;

        // Find the absolute cheapest date in this month's calendar data
        let cheapest = Infinity;
        for (const flight of Object.values(data as Record<string, any>)) {
          if (flight.price && flight.price < cheapest) cheapest = flight.price;
        }

        if (cheapest < Infinity) {
          // Keep the absolute cheapest if multiple months were fetched for the same route
          if (!map[key] || cheapest < map[key]) {
            map[key] = cheapest;
          }
        }
      }
      setLivePrices(map);
    });

    return () => { cancelled = true; };
  }, [JSON.stringify(routes)]);

  // Merge: live prices take priority over static
  return useMemo(() => {
    return { ...staticPrices, ...livePrices };
  }, [staticPrices, livePrices]);
}

// ─── Cheap Deals hook (Upgrade 1: real TP API data) ───
export function useMultiCheapDeals(origins: string[]) {
  const { deals: botDeals } = useFlightData();
  const [cheapDeals, setCheapDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    if (origins.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    let localErrorCount = 0;

    Promise.allSettled(
      origins.map(async (origin) => {
        const res = await fetch(`/api/flights?type=cheap&origin=${origin}&currency=usd`);
        if (!res.ok) throw new Error(`API failed for ${origin}`);
        const json = await res.json();
        return { origin, data: json?.data || {} };
      })
    ).then((results) => {
      if (cancelled) return;

      const combinedDeals: Deal[] = [];

      for (const result of results) {
        if (result.status === "rejected") {
          localErrorCount++;
          continue;
        }

        const { origin, data } = result.value;
        // Transform TP response → Deal[] format
        for (const [dest, routes] of Object.entries(data as Record<string, Record<string, any>>)) {
          for (const info of Object.values(routes)) {
            combinedDeals.push({
              origin,
              destination: dest,
              date: info.departure_at?.split("T")[0] || "",
              price: info.price || 0,
              airline: info.airline || "",
              airline_code: info.airline || "",
              transfers: info.number_of_changes ?? 0,
            });
          }
        }
      }

      setErrorCount(localErrorCount);

      // Deduplicate by origin + destination, keeping only the cheapest
      const bestDealsMap = new Map<string, Deal>();
      for (const deal of combinedDeals) {
        if (deal.price <= 0) continue;
        const key = `${deal.origin}-${deal.destination}`;
        const existing = bestDealsMap.get(key);
        if (!existing || deal.price < existing.price) {
          bestDealsMap.set(key, deal);
        }
      }

      const deduplicatedDeals = Array.from(bestDealsMap.values());

      // Sort globally by price
      deduplicatedDeals.sort((a, b) => a.price - b.price);
      setCheapDeals(deduplicatedDeals);
    })
      .catch(() => {
        // In case of complete catastrophic failure not caught by allSettled (rare)
        if (!cancelled) setErrorCount(origins.length);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [origins.join(",")]); // Rate-limit friendly: only refetches when origins array changes (tab switch)

  // Merge live API data with static Bot cache data
  const finalDeals = useMemo(() => {
    if (loading) return []; // Prefer skeleton while loading

    const mergedMap = new Map<string, Deal>();

    // 1. Add bot data as baseline (Amadeus often provides exclusive direct flights)
    for (const bot of botDeals) {
      if (bot.price <= 0 || !origins.includes(bot.origin)) continue;
      mergedMap.set(`${bot.origin}-${bot.destination}`, bot);
    }

    // 2. Add or Overwrite with Live Data
    for (const live of cheapDeals) {
      if (live.price <= 0) continue;
      const key = `${live.origin}-${live.destination}`;
      const existingBot = mergedMap.get(key);

      // Strict Priority: If the static cache found a Direct flight, and the live API
      // only returned a Layover flight, KEEP the direct flight so UI doesn't lose it.
      if (existingBot && existingBot.transfers === 0 && (live.transfers || 0) !== 0) {
        continue;
      }
      mergedMap.set(key, live);
    }

    const mergedList = Array.from(mergedMap.values());
    mergedList.sort((a, b) => a.price - b.price);
    return mergedList;
  }, [cheapDeals, botDeals, loading, origins]);

  return { deals: finalDeals, loading, errorCount };
}
