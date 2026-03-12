// client/src/pages/DestinationLandingPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";

import type { DestinationPageVM } from "@/types/destination";
import { getDestinationBySlug } from "@/data/destinationRegistry";
import { DestinationLandingApiEnvelopeSchema } from "@/data/destinationSchemas";
import { normalizeLiveData } from "@/lib/destination/normalizeLiveData";
import { mergeDestinationData } from "@/lib/destination/mergeDestinationData";
import { buildDestinationPageVM } from "@/lib/destination/buildDestinationPageVM";

import Navbar from "@/components/flights/destination/Navbar";
import HeroSearch from "@/components/flights/destination/HeroSearch";
import FlightDeals from "@/components/flights/destination/FlightDeals";
import FareFinder from "@/components/flights/destination/FareFinder";
import Insights from "@/components/flights/destination/Insights";
import AirlinesWeather from "@/components/flights/destination/AirlinesWeather";
import AirlineReviews from "@/components/flights/destination/AirlineReviews";
import FooterSections from "@/components/flights/destination/FooterSections";

type LiveState = "static" | "live" | "partial" | "error";

type ControllerState = {
  vm: DestinationPageVM | null;
  liveState: LiveState;
  isLoading: boolean;
  errorMessage: string | null;
};

const ROUTE_PATTERN = "/flights/to/:slug";
const API_ENDPOINT = "/api/destination-landing";

function buildApiUrl(originCode: string, destCode: string, currency: string = "thb"): string {
  const url = new URL(API_ENDPOINT, window.location.origin);
  url.searchParams.set("origin", originCode);
  url.searchParams.set("destination", destCode);
  url.searchParams.set("currency", currency);
  return `${url.pathname}${url.search}`;
}

function getApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const maybeRecord = payload as Record<string, unknown>;
  const error =
    typeof maybeRecord.error === "string" && maybeRecord.error.trim()
      ? maybeRecord.error.trim()
      : null;
  const message =
    typeof maybeRecord.message === "string" && maybeRecord.message.trim()
      ? maybeRecord.message.trim()
      : null;

  return error ?? message ?? null;
}

export default function DestinationLandingPage() {
  const [matched, params] = useRoute<{ slug: string }>(ROUTE_PATTERN);
  const slug = useMemo(() => (matched ? params?.slug?.trim().toLowerCase() ?? "" : ""), [matched, params]);

  const staticRecord = useMemo(
    () => (slug ? getDestinationBySlug(slug) : undefined),
    [slug]
  );

  const [state, setState] = useState<ControllerState>({
    vm: null,
    liveState: "static",
    isLoading: true,
    errorMessage: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug || !staticRecord) {
        if (!cancelled) {
          setState({
            vm: null,
            liveState: "error",
            isLoading: false,
            errorMessage: "Destination not found.",
          });
        }
        return;
      }

      const staticVm = buildDestinationPageVM(staticRecord, {
        liveState: "static",
        sourceLabel: "Static registry",
      });

      if (!cancelled) {
        setState({
          vm: staticVm,
          liveState: "static",
          isLoading: true,
          errorMessage: null,
        });
      }

      try {
        const response = await fetch(buildApiUrl(staticRecord.origin.code, staticRecord.dest.code), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const apiJson: unknown = await response.json();
        const parsed = DestinationLandingApiEnvelopeSchema.safeParse(apiJson);

        if (!parsed.success) {
          if (!cancelled) {
            setState({
              vm: staticVm,
              liveState: "error",
              isLoading: false,
              errorMessage: "Live data format was invalid. Showing fallback data.",
            });
          }
          return;
        }

        const parsedData = parsed.data as Record<string, unknown>;
        const apiSuccess =
          typeof parsedData.success === "boolean" ? parsedData.success : true;

        if (!apiSuccess) {
          if (!cancelled) {
            setState({
              vm: staticVm,
              liveState: "error",
              isLoading: false,
              errorMessage:
                getApiMessage(parsedData) ?? "Live data is unavailable. Showing fallback data.",
            });
          }
          return;
        }

        const normalized = normalizeLiveData(parsed.data);

        if (!normalized) {
          if (!cancelled) {
            setState({
              vm: staticVm,
              liveState: "static",
              isLoading: false,
              errorMessage: null,
            });
          }
          return;
        }

        const mergedRecord = mergeDestinationData(staticRecord, normalized, {
          preferLive: true,
        });

        const hasLiveDeals =
          Object.values(mergedRecord.deals).some((items) => items.length > 0) &&
          Object.values(normalized.deals ?? {}).some(
            (items) => Array.isArray(items) && items.length > 0
          );

        const liveState: LiveState = hasLiveDeals ? "live" : "partial";

        const vm = buildDestinationPageVM(mergedRecord, {
          liveState,
          sourceLabel: liveState === "live" ? "Live API + fallback" : "Partial live data",
          lastUpdated:
            typeof parsedData.lastUpdated === "string" ? parsedData.lastUpdated : new Date().toISOString(),
        });

        if (!cancelled) {
          setState({
            vm,
            liveState,
            isLoading: false,
            errorMessage: liveState === "partial" ? "Some sections are using fallback data." : null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            vm: staticVm,
            liveState: "error",
            isLoading: false,
            errorMessage:
              error instanceof Error
                ? `${error.message}. Showing fallback data.`
                : "Live data failed to load. Showing fallback data.",
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [slug, staticRecord]);

  if (!matched) {
    return null;
  }

  if (!staticRecord && !state.isLoading) {
    return (
      <main className="min-h-screen bg-[#0b0719] px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-semibold">Destination not found</h1>
          <p className="mt-3 text-white/70">
            We could not find the destination page for this route.
          </p>
        </div>
      </main>
    );
  }

  if (!state.vm) {
    return (
      <main className="min-h-screen bg-[#0b0719] px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-semibold">Loading destination page…</h1>
          <p className="mt-3 text-white/70">
            Preparing route insights and fare data.
          </p>
        </div>
      </main>
    );
  }

  const { vm } = state;

  return (
    <>
      <Helmet>
        <title>{vm.seo.title} | GoTravel Asia</title>
        <meta name="description" content={vm.seo.description} />
        <link rel="canonical" href={`https://gotravel-asia.vercel.app${vm.seo.canonicalPath}`} />
        <style>{`
            body { background-color: #0b0719; }
            #root { background-color: #0b0719; }
            .light .bg-background { background-color: #0b0719 !important; }
        `}</style>
      </Helmet>

      <div className="min-h-screen bg-[#0b0719] text-white font-sans selection:bg-violet-500/30">
        <Navbar dest={vm.route.destination.city} destCode={vm.route.destination.code} origin={vm.route.origin.city} />

        <div id="hero-search">
          <HeroSearch data={vm} />
        </div>

        {state.errorMessage ? (
          <div className="mx-auto max-w-7xl px-4 pt-4">
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {state.errorMessage}
            </div>
          </div>
        ) : null}

        <div id="flight-deals">
          <FlightDeals data={vm} />
        </div>

        <FareFinder data={vm} />

        <Insights data={vm} />

        <div id="airlines-weather">
          <AirlinesWeather data={vm} />
        </div>

        <AirlineReviews data={vm} />

        <FooterSections data={vm} />
      </div>
    </>
  );
}
