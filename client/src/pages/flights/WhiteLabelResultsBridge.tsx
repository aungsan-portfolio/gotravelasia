// pages/flights/WhiteLabelResultsBridge.tsx
//
// Replaces FlightResults.tsx's inline toolbar with CompactFlightToolbar.
// Travelpayouts widget only handles the RESULTS section.
// Custom toolbar handles search input + redirect.
// Added:
//   - StaysSection
//   - CarsSection
// mounted after TP results and before popular destinations.

import { useEffect, useMemo, useState } from "react";
import SEO from "@/seo/SEO";
import { CompactFlightToolbar } from "@/components/flights/search/CompactFlightToolbar";
import { StaysSection } from "@/components/flights/StaysSectionComponent";
import { CarsSection } from "@/components/flights/CarsSectionComponent";
import type { AirportOption } from "@/features/flights/search/flightSearch.types";

// ── Types ────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    TPWL_CONFIGURATION?: any;
    TPWL_EXTRA?: any;
  }
}

// ── Travelpayouts config ──────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeParam(v: string | null, fallback = "") {
  return v ? decodeURIComponent(v) : fallback;
}

function normalizeCode(v: string | null, fallback = "") {
  return safeParam(v, fallback).trim().toUpperCase();
}

function safeIsoDate(v: string | null): string | null {
  const raw = safeParam(v).trim();
  if (!raw) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

/**
 * Parses Travelpayouts compact search format into individual fields.
 * Format: {ORIGIN:3}{DD:2}{MM:2}{DEST:3}{PAX:1}
 */
function parseFlightSearch(raw: string): {
  origin: string;
  destination: string;
  departDate: string | null;
  returnDate: string | null;
} {
  const EMPTY = { origin: "", destination: "", departDate: null, returnDate: null };
  if (!raw) return EMPTY;

  // Each segment: 3-letter IATA + 4-digit DDMM
  const segments = [...raw.matchAll(/([A-Z]{3})(\d{2})(\d{2})/g)];
  if (segments.length < 1) return EMPTY;

  const year = new Date().getFullYear();

  function toIso(dd: string, mm: string): string {
    const d = parseInt(dd, 10);
    const m = parseInt(mm, 10);
    if (d < 1 || d > 31 || m < 1 || m > 12) return "";
    return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  const origin = segments[0][1];
  const departDate = toIso(segments[0][2], segments[0][3]);

  // Destination: the 3-letter code right after the first 4 digits
  const destMatch = raw.match(/^[A-Z]{3}\d{4}([A-Z]{3})/);
  const destination = destMatch?.[1] ?? "";

  // Return date: second segment's date (if present)
  const returnDate = segments.length >= 2 ? toIso(segments[1][2], segments[1][3]) : null;

  return { origin, destination, departDate, returnDate };
}

function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, (month ?? 1) - 1, day ?? 1);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function codeToCityName(code: string): string {
  const map: Record<string, string> = {
    SIN: "Singapore",
    BKK: "Bangkok",
    DMK: "Bangkok",
    KUL: "Kuala Lumpur",
    HAN: "Hanoi",
    SGN: "Ho Chi Minh City",
    DPS: "Bali",
    HKT: "Phuket",
    CNX: "Chiang Mai",
    PNH: "Phnom Penh",
    RGN: "Yangon",
    MDL: "Mandalay",
    REP: "Siem Reap",
    VTE: "Vientiane",
    SEL: "Seoul",
    ICN: "Seoul",
    GMP: "Seoul",
    TYO: "Tokyo",
    HND: "Tokyo",
    NRT: "Tokyo",
    KIX: "Osaka",
    HKG: "Hong Kong",
    TPE: "Taipei",
    SYD: "Sydney",
    MEL: "Melbourne",
    LHR: "London",
    CDG: "Paris",
    DXB: "Dubai",
    IST: "Istanbul",
    CJU: "Jeju",
    PUS: "Busan",
    MNL: "Manila",
    CGK: "Jakarta",
    PEN: "Penang",
    DAD: "Da Nang",
    CEB: "Cebu",
    KNO: "Medan",
    SUB: "Surabaya",
    USM: "Koh Samui",
  };
  return map[code] ?? code;
}

function getRouteLabel(search: URLSearchParams): string {
  const o = safeParam(search.get("origin"));
  const d = safeParam(search.get("destination"));
  if (o && d) return `${o.toUpperCase()} → ${d.toUpperCase()}`;
  const m = safeParam(search.get("flightSearch")).match(/^([A-Z]{3})\d{4}([A-Z]{3})/);
  if (m) return `${m[1]} → ${m[2]}`;
  return "";
}

function buildInitFromQuery(search: URLSearchParams) {
  // Try plain params first; fall back to compact format
  let origin = safeParam(search.get("origin"));
  let destination = safeParam(search.get("destination"));
  let departDate = safeParam(search.get("depart"));
  let returnDate = safeParam(search.get("return"));

  if (!origin || !destination) {
    const parsed = parseFlightSearch(safeParam(search.get("flightSearch")));
    if (!origin) origin = parsed.origin;
    if (!destination) destination = parsed.destination;
    if (!departDate) departDate = parsed.departDate ?? "";
    if (!returnDate) returnDate = parsed.returnDate ?? "";
  }

  const tripType = safeParam(search.get("tripType"), "roundtrip");
  const adults = Number(search.get("adults") || 1);
  const children = Number(search.get("children") || 0);
  const infants = Number(search.get("infants") || 0);

  const init: Record<string, unknown> = {};
  if (origin) init.origin = { iata: origin.toUpperCase(), name: origin.toUpperCase() };
  if (destination)
    init.destination = { iata: destination.toUpperCase(), name: destination.toUpperCase() };
  if (departDate) init.departDate = departDate;
  if (tripType === "one-way" || !returnDate) {
    init.oneWay = true;
  } else if (returnDate) {
    init.returnDate = returnDate;
  }
  init.passengers = {
    adults: adults > 0 ? adults : 1,
    children: children > 0 ? children : 0,
    infants: infants > 0 ? infants : 0,
  };
  return init;
}

function parseAirport(code: string | null): AirportOption | null {
  if (!code) return null;
  const c = code.toUpperCase();
  return { code: c, city: c, name: c, country: "" };
}

function hasRenderedWeedles(container: HTMLElement | null): boolean {
  if (!container) return false;
  const weedles = Array.from(container.querySelectorAll<HTMLElement>(".tpwl-widget-weedle"));
  if (!weedles.length) return false;
  return weedles.some(
    (w) =>
      Array.from(w.children).some(
        (c) => !(c instanceof HTMLScriptElement) && c.textContent?.trim() !== "",
      ) || w.querySelector("iframe,a,img,[class*='tpwl'],[data-tpwl-rendered='true']") !== null,
  );
}

function buildFallbackUrl(origin: string, dest: string) {
  return `/flights/results?${new URLSearchParams({ origin, destination: dest })}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WhiteLabelResultsBridge() {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const routeLabel = useMemo(() => getRouteLabel(search), [search]);
  const [widgetState, setWidgetState] = useState<WidgetState>("loading");

  const fallbackOrigin = useMemo(
    () => safeParam(search.get("origin"), "BKK").toUpperCase() || "BKK",
    [search],
  );

  // Pre-fill toolbar from URL params
  const toolbarInitial = useMemo(
    () => ({
      origin: parseAirport(search.get("origin")),
      destination: parseAirport(search.get("destination")),
      departDate: search.get("depart") ?? null,
      returnDate: search.get("return") ?? null,
      tripType: (search.get("tripType") === "one-way" ? "oneway" : "roundtrip") as "roundtrip" | "oneway",
      travellers: {
        adults: Number(search.get("adults") || 1),
        children: Number(search.get("children") || 0),
        infants: Number(search.get("infants") || 0),
      },
    }),
    [search],
  );

  // Cross-sell derived params
  const tripType = useMemo(
    () => safeParam(search.get("tripType"), "roundtrip").toLowerCase(),
    [search],
  );

  // Robust parsing: Priority 1 (individual params) then Priority 2 (flightSearch compact)
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
    return rawReturnDate || (departDate ? addDays(departDate, 3) : null);
  }, [tripType, departDate, rawReturnDate]);

  const adults = useMemo(() => {
    const raw = Number(search.get("adults") || 1);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  }, [search]);

  const cityName = useMemo(() => {
    const explicit =
      safeParam(search.get("cityName")) ||
      safeParam(search.get("destinationCity")) ||
      safeParam(search.get("city"));

    if (explicit) return explicit;
    if (destinationCode) return codeToCityName(destinationCode);
    return "";
  }, [search, destinationCode]);

  useEffect(() => {
    console.debug("[GTA] parsed →", { destinationCode, cityName, departDate, rawReturnDate });
    // Cleanup
    document.getElementById(SCRIPT_ID)?.remove();
    document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
    document.getElementById("tpwl-search")?.replaceChildren();
    document.getElementById("tpwl-tickets")?.replaceChildren();
    document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    setWidgetState("loading");

    // TP config — widget handles RESULTS only, search is our custom toolbar
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

    // Load TP widget — type="module" required
    const mainScript = document.createElement("script");
    mainScript.id = SCRIPT_ID;
    mainScript.async = true;
    mainScript.type = "module";
    mainScript.src = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(WL_ID)}`;
    document.body.appendChild(mainScript);

    // Hide TP secondary rows via JS (class names are hashed per build)
    const HIDE_PHRASES = ["powered by", "travelpayouts", "multi-city", "show hotels"];
    let attempts = 0;
    const hideTimer = window.setInterval(() => {
      if (++attempts > 25) {
        window.clearInterval(hideTimer);
        return;
      }
      const root = document.getElementById("tpwl-search");
      if (!root) return;
      root.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const text = el.textContent?.trim().toLowerCase() ?? "";
        if (!text || el.children.length > 0) return;
        if (HIDE_PHRASES.some((p) => text.includes(p))) {
          let target: HTMLElement = el;
          while (
            target.parentElement &&
            target.parentElement !== root &&
            target.parentElement.clientHeight < 60
          ) {
            target = target.parentElement;
          }
          target.style.setProperty("display", "none", "important");
        }
      });
    }, 200);

    // Weedle widgets
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
      window.clearInterval(hideTimer);
      document.getElementById(SCRIPT_ID)?.remove();
      document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
      document.getElementById("tpwl-search")?.replaceChildren();
      document.getElementById("tpwl-tickets")?.replaceChildren();
      document.getElementById("tpwl-widget-weedles")?.replaceChildren();
    };
  }, [search]);

  return (
    <>
      <SEO
        title={`Cheap Flights${routeLabel ? ` ${routeLabel}` : ""} | GoTravelAsia`}
        description="Compare hundreds of airlines to find the cheapest flights across Southeast Asia."
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --gold:        #F5A623;
          --gold-dark:   #D4881A;
          --purple:      #5B0FA8;
          --purple-dark: #3D0870;
          --navy:        #00162b;
          --gray-50:     #f5f7fa;
          --gray-200:    #dde2ec;
          --white:       #ffffff;
          --tpwl-font-family:              "Plus Jakarta Sans", system-ui, sans-serif;
          --tpwl-main-text:                #00162b;
          --tpwl-search-result-background: #f5f7fa;
          --tpwl-search-form-background:   #3D0870;
          --tpwl-headline-text:            #ffffff;
          --tpwl-links:                    #F5A623;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: var(--tpwl-font-family), sans-serif;
          color: var(--navy);
          background: var(--gray-50);
          -webkit-font-smoothing: antialiased;
        }
        body a { color: var(--gold); text-decoration: none; }
        body a:hover { color: var(--gold-dark); text-decoration: underline; }

        /* Hide TP elements we don't need */
        .tpwl-logo-header   { display: none !important; }
        .tpwl-search-header { display: none !important; }
        a[href*="travelpayouts"]:not(.gta-logo),
        [class*="powered-by"], [class*="poweredBy"],
        [class*="powered_by"], [class*="Powered"] { display: none !important; }

        /* Results area */
        .tpwl-main { background: var(--gray-50) !important; min-height: 60vh; }
        .tpwl-tickets__wrapper {
          display: block !important;
          max-width: 1280px !important;
          margin: 0 auto !important;
          padding: 16px 24px 0 !important;
        }
        .tpwl__content { max-width: 1280px; min-width: 976px; }

        /* CTA buttons → gold */
        [class*="buy"], [class*="Buy"],
        [class*="book"], [class*="Book"],
        [class*="select"], [class*="Select"],
        [class*="BuyButton"] {
          background: var(--gold) !important;
          color: var(--navy) !important;
          font-weight: 800 !important;
          border: none !important;
        }
        [class*="buy"]:hover, [class*="select"]:hover {
          background: var(--gold-dark) !important;
        }

        /* Popular destinations */
        .tpwl-widgets__wrapper { display: none !important; }

        .gta-explore { max-width: 1280px; margin: 0 auto; padding: 40px 24px 56px; }
        .gta-explore__header {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 18px;
        }
        .gta-explore__title { font-size: 18px; font-weight: 800; color: var(--navy); }
        .gta-explore__link { font-size: 13px; font-weight: 600; color: var(--purple); }
        .gta-explore__link:hover { text-decoration: underline; color: var(--purple); }

        .gta-dest-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
        .gta-dest-card {
          background: var(--white); border: 1.5px solid var(--gray-200);
          border-radius: 10px; padding: 14px;
          display: flex; flex-direction: column; justify-content: space-between;
          min-height: 110px; text-decoration: none; color: inherit;
          transition: border-color .15s, box-shadow .15s, transform .15s;
        }
        .gta-dest-card:hover {
          border-color: var(--purple);
          box-shadow: 0 6px 20px rgba(91,15,168,.12);
          transform: translateY(-2px);
          text-decoration: none; color: inherit;
        }
        .gta-dest-card__iata { font-size: 10px; font-weight: 800; color: var(--purple); text-transform: uppercase; letter-spacing: .1em; }
        .gta-dest-card__city { font-size: 14px; font-weight: 700; color: var(--navy); margin-top: 3px; }
        .gta-dest-card__country { font-size: 11px; color: #8f9bb3; margin-top: 1px; }
        .gta-dest-card__cta { font-size: 11px; font-weight: 700; color: var(--gold-dark); margin-top: 10px; }

        #tpwl-widget-weedles { display: grid; grid-template-columns: repeat(6,1fr); gap: 10px; }
        .tpwl-widget-weedle { display: flex; justify-content: center; min-height: 110px; }

        .gta-skel {
          background: var(--white); border: 1.5px solid var(--gray-200);
          border-radius: 10px; min-height: 110px;
          animation: skel 1.4s ease-in-out infinite;
        }
        @keyframes skel { 0%,100%{opacity:1} 50%{opacity:.4} }

        .tpwl-footer__wrapper {
          background: var(--purple-dark) !important;
          color: rgba(255,255,255,.4) !important;
          padding: 32px 24px !important; font-size: 13px !important;
        }
        .tpwl-footer__links a { color: rgba(255,255,255,.35) !important; }
        .tpwl-footer__links a:hover { color: var(--gold) !important; text-decoration: none !important; }

        @media (max-width: 1024px) {
          .tpwl__content { max-width: unset; min-width: unset; }
          .gta-dest-grid, #tpwl-widget-weedles { grid-template-columns: repeat(3,1fr); }
        }
        @media (max-width: 768px) {
          .tpwl-tickets__wrapper { padding: 12px 16px 0 !important; }
          .gta-explore { padding: 24px 16px 40px; }
          .gta-dest-grid, #tpwl-widget-weedles { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="tpwl-page">
        {/* ── Custom compact toolbar ───────────────────── */}
        <CompactFlightToolbar initialState={toolbarInitial} />

        {/* ── TP results widget ────────────────────────── */}
        <main className="tpwl-main">
          <div className="tpwl-tickets__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-tickets" />
            </div>
          </div>

          {/* ── Stays section ─────────────────────────── */}
          <StaysSection
            cityName={cityName}
            destinationCode={destinationCode}
            checkIn={departDate}
            checkOut={crossSellReturnDate}
            adults={adults}
          />

          {/* ── Cars section ──────────────────────────── */}
          <CarsSection
            cityName={cityName}
            airportCode={destinationCode}
            pickupDate={departDate}
            returnDate={crossSellReturnDate}
          />

          {/* Popular destinations */}
          <section aria-labelledby="gta-explore-heading">
            <div className="gta-explore">
              <div className="gta-explore__header">
                <h2 id="gta-explore-heading" className="gta-explore__title">
                  Popular destinations
                </h2>
                <a href="/flights" className="gta-explore__link">See all →</a>
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
                    <a key={d.code} href={buildFallbackUrl(fallbackOrigin, d.code)} className="gta-dest-card">
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
              <a href="/terms" target="_blank" rel="noreferrer">Terms</a>
              <a href="/privacy" target="_blank" rel="noreferrer">Privacy</a>
              <a href="/cookies" target="_blank" rel="noreferrer">Cookies</a>
            </div>
          </div>
        </footer>

        <div id="tpwl-cookie-banner" className="tpwl-cookie-banner" />
      </div>
    </>
  );
}
