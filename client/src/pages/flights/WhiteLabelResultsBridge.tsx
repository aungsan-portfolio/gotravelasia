// pages/flights/WhiteLabelResultsBridge.tsx
//
// Replaces FlightResults.tsx's inline toolbar with CompactFlightToolbar.
// Travelpayouts widget only handles the RESULTS section.
// Custom toolbar handles search input + redirect.

import { useEffect, useMemo, useState } from "react";
import SEO from "@/seo/SEO";
import { MobileSummaryPill } from "@/components/flights/results/MobileSummaryPill";
import { FlightIntelligenceStrip } from "@/components/flights/results/FlightIntelligenceStrip";
import { CompactFlightToolbar } from "@/components/flights/search/CompactFlightToolbar";
import { getCityName } from "@/lib/cities";
import {
  buildFallbackUrl,
  buildInitFromQuery,
  hasRenderedWeedles,
  parseFlightSearch,
  safeParam,
} from "@/lib/flights/whiteLabelBridge";
import type { AirportOption } from "@/features/flights/search/flightSearch.types";
import "@/styles/white-label-results.css";

declare global {
  interface Window {
    TPWL_CONFIGURATION?: any;
    TPWL_EXTRA?: any;
  }
}

const WL_ID = "12942";
const TP_MARKER = "697202";
const SCRIPT_ID = "tpwl-main-script";
const WEEDLE_SCRIPT_CLASS = "tpwl-weedle-script";
const WEEDLE_POLL_INTERVAL_MS = 300;
const WEEDLE_TIMEOUT_MS = 6000;

type WidgetState = "loading" | "ready" | "fallback";
type PopularDestination = { code: string; city: string; country: string };

const POPULAR_DESTINATIONS: PopularDestination[] = [
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "HAN", city: "Hanoi", country: "Vietnam" },
  { code: "DPS", city: "Bali", country: "Indonesia" },
  { code: "HKT", city: "Phuket", country: "Thailand" },
];

function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, (month ?? 1) - 1, day ?? 1);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getRouteLabel(search: URLSearchParams): string {
  const o = safeParam(search.get("origin"));
  const d = safeParam(search.get("destination"));
  if (o && d) return `${o.toUpperCase()} → ${d.toUpperCase()}`;
  const m = safeParam(search.get("flightSearch")).match(/^([A-Z]{3})\d{4}([A-Z]{3})/);
  if (m) return `${m[1]} → ${m[2]}`;
  return "";
}

function parseAirport(code: string | null): AirportOption | null {
  if (!code) return null;
  const c = code.toUpperCase();
  return { code: c, city: c, name: c, country: "" };
}

export default function WhiteLabelResultsBridge() {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const routeLabel = useMemo(() => getRouteLabel(search), [search]);
  const [widgetState, setWidgetState] = useState<WidgetState>("loading");

  const fallbackOrigin = useMemo(
    () => safeParam(search.get("origin"), "BKK").toUpperCase() || "BKK",
    [search],
  );

  const toolbarInitial = useMemo(
    () => ({
      origin: parseAirport(search.get("origin")),
      destination: parseAirport(search.get("destination")),
      departDate: search.get("depart") ?? null,
      returnDate: search.get("return") ?? null,
      tripType: (search.get("tripType") === "one-way" ? "oneway" : "roundtrip") as
        | "roundtrip"
        | "oneway",
      travellers: {
        adults: Number(search.get("adults") || 1),
        children: Number(search.get("children") || 0),
        infants: Number(search.get("infants") || 0),
      },
    }),
    [search],
  );

  const tripType = useMemo(
    () => safeParam(search.get("tripType"), "roundtrip").toLowerCase(),
    [search],
  );

  const parsedSearch = useMemo(() => {
    const plainDest = safeParam(search.get("destination")).toUpperCase();
    const plainDepart = safeParam(search.get("depart")) || null;
    const plainReturn = safeParam(search.get("return")) || null;

    if (plainDest) {
      return { destination: plainDest, departDate: plainDepart, returnDate: plainReturn };
    }

    const fs = safeParam(search.get("flightSearch"));
    const parsed = parseFlightSearch(fs);
    return {
      destination: parsed.destination,
      departDate: parsed.departDate,
      returnDate: parsed.returnDate,
    };
  }, [search]);

  const destinationCode = parsedSearch.destination;
  const departDate = parsedSearch.departDate;
  const rawReturnDate = parsedSearch.returnDate;

  const crossSellReturnDate = useMemo(() => {
    if (tripType === "one-way") {
      return departDate ? addDays(departDate, 3) : null;
    }
    return rawReturnDate;
  }, [tripType, departDate, rawReturnDate]);

  const cityName = useMemo(
    () => (destinationCode ? getCityName(destinationCode) : ""),
    [destinationCode],
  );

  const staysUrl = useMemo(() => {
    const url = new URL("https://hotellook.tpwidg.com/wDfimShS");
    if (destinationCode) url.searchParams.set("location", destinationCode);
    if (departDate) url.searchParams.set("checkIn", departDate);
    if (crossSellReturnDate) url.searchParams.set("checkOut", crossSellReturnDate);
    url.searchParams.set("language", "en");
    url.searchParams.set("currency", "thb");
    url.searchParams.set("marker", TP_MARKER);
    return url.toString();
  }, [destinationCode, departDate, crossSellReturnDate]);

  const carUrl = useMemo(() => {
    const url = new URL("https://economybookings.tpx.gr/wDfimShS");
    if (destinationCode) url.searchParams.set("pickup_iata", destinationCode);
    if (departDate) url.searchParams.set("pickup_date", departDate);
    if (crossSellReturnDate) url.searchParams.set("return_date", crossSellReturnDate);
    url.searchParams.set("currency", "THB");
    url.searchParams.set("marker", TP_MARKER);
    return url.toString();
  }, [destinationCode, departDate, crossSellReturnDate]);

  const trackAffiliateClick = (type: "stays" | "cars", href: string) => {
    try {
      const payload = JSON.stringify({
        type,
        href,
        ts: Date.now(),
        route: window.location.pathname + window.location.search,
      });
      navigator.sendBeacon("/api/affiliate/click", payload);
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    console.debug("[GTA] parsed →", { destinationCode, cityName, departDate, rawReturnDate });

    document.getElementById(SCRIPT_ID)?.remove();
    document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
    document.getElementById("tpwl-tickets")?.replaceChildren();
    document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    setWidgetState("loading");

    window.TPWL_CONFIGURATION = {
      ...window.TPWL_CONFIGURATION,
      resultsURL: `${window.location.origin}/flights/results`,
      marker: TP_MARKER,
      init: buildInitFromQuery(search),
    };

    window.TPWL_EXTRA = {
      ...(window.TPWL_EXTRA || {}),
      currency: "THB",
      trs: "",
      marker: TP_MARKER,
      domain: window.location.hostname,
      locale: "en",
      link_color: "F5A623",
    };

    const mainScript = document.createElement("script");
    mainScript.id = SCRIPT_ID;
    mainScript.async = true;
    mainScript.type = "module";
    mainScript.src = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(WL_ID)}`;
    document.body.appendChild(mainScript);

    const mountWeedles = () => {
      const container = document.getElementById("tpwl-widget-weedles");
      if (!container) return;
      container.querySelectorAll<HTMLElement>("div[data-destination]").forEach((el) => {
        el.innerHTML = "";
        const destination = el.dataset.destination;
        if (!destination || !window.TPWL_EXTRA) return;
        const e = window.TPWL_EXTRA;
        const s = document.createElement("script");
        s.async = true;
        s.className = WEEDLE_SCRIPT_CLASS;
        s.src =
          `https://tpwidg.com/content` +
          `?currency=thb` +
          `&trs=${encodeURIComponent(String(e.trs ?? ""))}` +
          `&shmarker=${encodeURIComponent(String(e.marker ?? TP_MARKER))}` +
          `&destination=${encodeURIComponent(destination)}` +
          `&target_host=${encodeURIComponent(String(e.domain ?? window.location.hostname))}` +
          `&locale=en&limit=6&powered_by=false` +
          `&primary=%23F5A623&promo_id=4044&campaign_id=100`;
        el.appendChild(s);
      });
    };

    const mountTimer = window.setTimeout(mountWeedles, 1200);
    const pollStart = Date.now();
    const pollTimer = window.setInterval(() => {
      const container = document.getElementById("tpwl-widget-weedles");
      if (hasRenderedWeedles(container)) {
        setWidgetState("ready");
        window.clearInterval(pollTimer);
        return;
      }
      if (Date.now() - pollStart >= WEEDLE_TIMEOUT_MS) {
        setWidgetState("fallback");
        window.clearInterval(pollTimer);
      }
    }, WEEDLE_POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(mountTimer);
      window.clearInterval(pollTimer);
      document.getElementById(SCRIPT_ID)?.remove();
      document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
      document.getElementById("tpwl-tickets")?.replaceChildren();
      document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    };
  }, [search, destinationCode, cityName, departDate, rawReturnDate]);

  return (
    <>
      <SEO
        title={`Cheap Flights${routeLabel ? ` ${routeLabel}` : ""} | GoTravelAsia`}
        description="Compare hundreds of airlines to find the cheapest flights across Southeast Asia."
      />

      <div className="tpwl-page">
        <section id="results-toolbar" className="border-b border-white/10 bg-transparent">
          <CompactFlightToolbar initialState={toolbarInitial} />
        </section>

        <FlightIntelligenceStrip />

        <main className="tpwl-main gta-results-shell">
          <div className="tpwl-tickets__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-tickets" />
            </div>
          </div>

          <section className="gta-results-cross-sell">
            <a
              href={staysUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-find-stays"
              aria-label="Find stays"
              className="gta-results-card"
              onClick={() => trackAffiliateClick("stays", staysUrl)}
            >
              <div className="gta-results-card__eyebrow">Hotels</div>
              <h3 className="gta-results-card__title">Find stays</h3>
              <p className="gta-results-card__copy">
                Compare nearby accommodation for this route and travel window.
              </p>
            </a>

            <a
              href={carUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-small-car"
              aria-label="Small car"
              className="gta-results-card"
              onClick={() => trackAffiliateClick("cars", carUrl)}
            >
              <div className="gta-results-card__eyebrow">Car rental</div>
              <h3 className="gta-results-card__title">Small car</h3>
              <p className="gta-results-card__copy">
                Rent a vehicle for your stay in {cityName || destinationCode}.
              </p>
            </a>
          </section>

          <section aria-labelledby="gta-explore-heading">
            <div className="gta-explore">
              <div className="gta-explore__header">
                <h2 id="gta-explore-heading" className="gta-explore__title">
                   Popular destinations
                </h2>
                <a href="/flights" className="gta-explore__link">
                  See all →
                </a>
              </div>

              {widgetState === "loading" && (
                <div className="gta-dest-grid" aria-busy="true">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <div key={d.code} className="gta-skel" />
                  ))}
                </div>
              )}

              {widgetState === "fallback" && (
                <div className="gta-dest-grid">
                  {POPULAR_DESTINATIONS.map((d) => (
                    <a
                      key={d.code}
                      href={buildFallbackUrl(fallbackOrigin, d.code)}
                      className="gta-dest-card"
                    >
                      <div>
                        <div className="gta-dest-card__iata">{d.code}</div>
                        <div className="gta-dest-card__city">{d.city}</div>
                        <div className="gta-dest-card__country">{d.country}</div>
                      </div>
                      <div className="gta-dest-card__cta">Search flights →</div>
                    </a>
                  ))}
                </div>
              )}

              <div
                id="tpwl-widget-weedles"
                hidden={widgetState !== "ready"}
                aria-hidden={widgetState !== "ready"}
              >
                {POPULAR_DESTINATIONS.map((d) => (
                  <div key={d.code} className="tpwl-widget-weedle" data-destination={d.code} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="tpwl-footer__wrapper">
          <div className="tpwl__content">
            <div className="tpwl-footer__copyright">© {new Date().getFullYear()} GoTravel Asia</div>
            <div className="tpwl-footer__links">
              <a href="/terms" target="_blank" rel="noreferrer">
                Terms
              </a>
              <a href="/privacy" target="_blank" rel="noreferrer">
                Privacy
              </a>
              <a href="/cookies" target="_blank" rel="noreferrer">
                Cookies
              </a>
            </div>
          </div>
        </footer>

        <div id="tpwl-cookie-banner" className="tpwl-cookie-banner" />
        <MobileSummaryPill />
      </div>
    </>
  );
}
