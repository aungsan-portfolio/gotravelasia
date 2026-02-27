import { useState, useEffect, useMemo } from "react";

type Deal = {
  origin: string;
  destination: string;
  date: string;
  price: number;
  airline: string;
  flight_num?: string;
  transfers?: number;
  airline_code?: string;
  currency?: string;
  found_at?: string;
};

type Meta = {
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

export function usePriceHint(origin: string, destination: string, hasReturn: boolean) {
  const { deals } = useFlightData();

  if (hasReturn) return null;

  const route = deals.find((r) => r.origin === origin && r.destination === destination);
  return route?.price ?? null;
}

export type { Deal, Meta };

// ─── Cheap Deals hook (Upgrade 1: real TP API data) ───
export function useCheapDeals(origin = "RGN") {
  const { deals: botDeals } = useFlightData();
  const [cheapDeals, setCheapDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cheap-prices?origin=${origin}&currency=usd`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (cancelled || !json?.data) return;
        // Transform TP response → Deal[] format
        const deals: Deal[] = [];
        for (const [dest, routes] of Object.entries(json.data as Record<string, Record<string, any>>)) {
          for (const info of Object.values(routes)) {
            deals.push({
              origin,
              destination: dest,
              date: info.departure_at?.split("T")[0] || "",
              price: info.price || 0,
              airline: info.airline || "",
              transfers: info.number_of_changes ?? 0,
            });
          }
        }
        setCheapDeals(deals.sort((a, b) => a.price - b.price));
      })
      .catch(() => { /* fallback below */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [origin]);

  // Fallback: use bot data if API returned nothing
  const finalDeals = cheapDeals.length > 0 ? cheapDeals : botDeals;
  return { deals: finalDeals, loading };
}
