// client/src/pages/DestinationLandingPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet-async";

import type { DestinationPageVM } from "@/types/destination";
import { getDestinationBySlug, generateDynamicDestination, getDestinationsByCountrySlug } from "@/data/destinationRegistry";
import { DestinationLandingApiEnvelopeSchema } from "@/data/destinationSchemas";
import { normalizeLiveData } from "@/lib/destination/normalizeLiveData";
import { mergeDestinationData } from "@/lib/destination/mergeDestinationData";
import { buildDestinationPageVM } from "@/lib/destination/buildDestinationPageVM";
import { trpc } from "@/lib/trpc";


import Navbar from "@/components/flights/destination/Navbar";
import DestinationHero from "@/components/destination/DestinationHero";
import HeroSearch from "@/components/flights/destination/HeroSearch";
import FlightDeals from "@/components/flights/destination/FlightDeals";
import FareFinder from "@/components/flights/destination/FareFinder";
import Insights from "@/components/flights/destination/Insights";
import AirlinesWeather from "@/components/flights/destination/AirlinesWeather";
import AirlineReviews from "@/components/flights/destination/AirlineReviews";
import TrustBenchmarks from "@/components/flights/destination/TrustBenchmarks";
import FooterSections from "@/components/flights/destination/FooterSections";
import CountryNavigator from "@/components/destination/CountryNavigator";

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

function normalizeOriginCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

function setQueryParam(href: string, key: string, value: string): string {
  const url = new URL(href, window.location.origin);
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

function applyRequestedOriginToVm(
  vm: DestinationPageVM,
  requestedOrigin: string | null
): DestinationPageVM {
  const normalizedOrigin = normalizeOriginCode(requestedOrigin);

  if (!normalizedOrigin) {
    return vm;
  }

  const allowedOrigins = new Set(
    [
      vm.hero.searchForm.originCode,
      ...vm.fareFinder.originOptions.map((option) => option.value),
    ].map((value) => value.trim().toUpperCase())
  );

  if (!allowedOrigins.has(normalizedOrigin)) {
    return vm;
  }

  const nextOriginLabel =
    normalizedOrigin === vm.hero.searchForm.originCode
      ? vm.hero.searchForm.originLabel
      : normalizedOrigin;

  return {
    ...vm,
    hero: {
      ...vm.hero,
      originLabel: nextOriginLabel,
      searchForm: {
        ...vm.hero.searchForm,
        originCode: normalizedOrigin,
        originLabel: nextOriginLabel,
      },
    },
    route: {
      ...vm.route,
      bookingCtaHref: setQueryParam(vm.route.bookingCtaHref, "origin", normalizedOrigin),
    },
    fareFinder: {
      ...vm.fareFinder,
      defaultOrigin: normalizedOrigin,
    },
    footer: {
      ...vm.footer,
      browseLinks: vm.footer.browseLinks.map((link) => {
        const url = new URL(link.href, window.location.origin);

        if (url.pathname !== "/price-alerts") {
          return link;
        }

        url.searchParams.set("origin", normalizedOrigin);

        return {
          ...link,
          href: `${url.pathname}${url.search}`,
        };
      }),
    },
  };
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
  const locationSearch = typeof window !== "undefined" ? window.location.search : "";
  const searchParams = useMemo(() => new URLSearchParams(locationSearch), [locationSearch]);
  const slug = useMemo(() => (matched ? params?.slug?.trim().toLowerCase() ?? "" : ""), [matched, params]);

  const staticRecord = useMemo(() => {
    if (!slug) return undefined;
    
    // 1. Try city/airport slug (existing)
    const existing = getDestinationBySlug(slug);
    if (existing) return existing;

    // 2. Try country slug (new refinement)
    const countryMatches = getDestinationsByCountrySlug(slug);
    if (countryMatches?.length > 0) {
      // Pick the first featured/popular city for this country
      return countryMatches[0];
    }

    // 3. Handle dynamic AAA-BBB slugs
    const match = slug.match(/^([a-z]{3})-([a-z]{3})$/i);
    if (match) {
      return generateDynamicDestination(match[1], match[2]);
    }

    return undefined;
  }, [slug]);

  const requestedOrigin = useMemo(() => {
    const fromQuery = searchParams.get("origin")?.trim().toUpperCase() ?? null;
    if (fromQuery && /^[A-Z]{3}$/.test(fromQuery)) return fromQuery;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_home_airport")?.trim().toUpperCase() ?? null;
      if (stored && /^[A-Z]{3}$/.test(stored)) return stored;
    }

    return null;
  }, [searchParams]);

  const [state, setState] = useState<ControllerState>({
    vm: null,
    liveState: "static",
    isLoading: true,
    errorMessage: null,
  });

  const { data: dynamicRecord, isLoading: isResolving } = trpc.destination.resolveDestination.useQuery(slug, {
    enabled: !!slug && !staticRecord,
  });

  const recordToUse = staticRecord || dynamicRecord;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug || (!staticRecord && !isResolving && !dynamicRecord)) {
        if (!cancelled && !isResolving) {
          setState({
            vm: null,
            liveState: "error",
            isLoading: false,
            errorMessage: "Destination not found.",
          });
        }
        return;
      }

      if (isResolving) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: true }));
        }
        return;
      }

      const staticVm = applyRequestedOriginToVm(
        buildDestinationPageVM(recordToUse as any, {
          liveState: "static",
          sourceLabel: staticRecord ? "Static registry" : "Dynamic resolver",
        }),
        requestedOrigin
      );

      if (!cancelled) {
        setState({
          vm: staticVm,
          liveState: "static",
          isLoading: true,
          errorMessage: null,
        });
      }

      try {
        const response = await fetch(buildApiUrl((recordToUse as any).origin.code, (recordToUse as any).dest.code), {

          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const apiJson: any = await response.json();

        // ── NEW: Check if response is already a fully-built VM ──────
        if (apiJson && apiJson.hero && apiJson.status && apiJson.route) {
          if (!cancelled) {
            setState({
              vm: applyRequestedOriginToVm(apiJson as DestinationPageVM, requestedOrigin),
              liveState: apiJson.status.state as LiveState,
              isLoading: false,
              errorMessage: null,
            });
          }
          return;
        }

        // ── Legacy / Fallback: Handle raw data if API is old ───────
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

        const mergedRecord = mergeDestinationData(recordToUse as any, normalized, {
          preferLive: true,
        });

        const hasLiveDeals =
          Object.values(mergedRecord.deals).some((items) => items.length > 0) &&
          Object.values(normalized.deals ?? {}).some(
            (items) => Array.isArray(items) && items.length > 0
          );

        const liveState: LiveState = hasLiveDeals ? "live" : "partial";

        const vm = applyRequestedOriginToVm(
          buildDestinationPageVM(mergedRecord, {
            liveState,
            sourceLabel: liveState === "live" ? "Live API + fallback" : "Partial live data",
            lastUpdated:
              typeof parsedData.lastUpdated === "string" ? parsedData.lastUpdated : new Date().toISOString(),
          }),
          requestedOrigin
        );

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
  }, [slug, staticRecord, recordToUse, isResolving, requestedOrigin]);

  if (!matched) {
    return null;
  }

  if (!recordToUse && !state.isLoading && !isResolving) {

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
          <DestinationHero
              routeVm={vm.route}
              cheapestPrice={vm.deals.summary.cheapestPrice ?? 0}
              currency="THB"
              updatedAt={vm.status.lastUpdatedLabel ?? new Date().toISOString()}
              dealsCount={vm.deals.summary.totalDeals}
          />
        </div>
        
        <div id="search-form" className="relative -mt-8 sm:-mt-12 z-20">
          <HeroSearch data={vm} />
        </div>

        {state.errorMessage ? (

          <div className="mx-auto max-w-7xl px-4 pt-4">
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {state.errorMessage}
            </div>
          </div>
        ) : null}

        {vm.isCountry && vm.countryCities.length > 0 && (
          <CountryNavigator
            countryName={vm.route.destination.city}
            cities={vm.countryCities}
          />
        )}

        <div id="flight-deals">
          <FlightDeals data={vm} />
        </div>

        <FareFinder data={vm} />

        <Insights data={vm} />

        <div id="airlines-weather">
          <AirlinesWeather data={vm} />
        </div>

        <TrustBenchmarks />

        <AirlineReviews data={vm} />

        <FooterSections data={vm} />
      </div>
    </>
  );
}
