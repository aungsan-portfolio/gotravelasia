import { useEffect, useMemo } from "react";
import SEO from "@/seo/SEO";

declare global {
  interface Window {
    TPWL_CONFIGURATION?: Record<string, any>;
    TPWL_EXTRA?: Record<string, any>;
  }
}

const WL_ID = "12942";      // current white-label id from your existing results page setup
const TP_MARKER = "697202"; // replace if your Travelpayouts marker is different
const SCRIPT_ID = "tpwl-main-script";
const WEEDLE_SCRIPT_CLASS = "tpwl-weedle-script";

function safeParam(value: string | null, fallback = ""): string {
  return value ? decodeURIComponent(value) : fallback;
}

function getRouteInfo(search: URLSearchParams) {
  const origin = safeParam(search.get("origin"));
  const destination = safeParam(search.get("destination"));
  const depart = safeParam(search.get("depart"));
  const ret = safeParam(search.get("return"));

  if (origin && destination) {
    return ` from ${origin.toUpperCase()} to ${destination.toUpperCase()}`;
  }

  const flightSearch = safeParam(search.get("flightSearch"));
  if (flightSearch) return "";

  return "";
}

function buildInitFromQuery(search: URLSearchParams) {
  const origin = safeParam(search.get("origin"));
  const destination = safeParam(search.get("destination"));
  const departDate = safeParam(search.get("depart"));
  const returnDate = safeParam(search.get("return"));
  const tripType = safeParam(search.get("tripType"), "return");
  const adults = Number(search.get("adults") || 1);
  const children = Number(search.get("children") || 0);
  const infants = Number(search.get("infants") || 0);

  const init: Record<string, any> = {};

  if (origin) init.origin = { iata: origin.toUpperCase(), name: origin.toUpperCase() };
  if (destination) init.destination = { iata: destination.toUpperCase(), name: destination.toUpperCase() };
  if (departDate) init.departDate = departDate;

  if (tripType === "one-way") {
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

export default function FlightResults() {
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const routeInfo = useMemo(() => getRouteInfo(search), [search]);

  useEffect(() => {
    const oldScript = document.getElementById(SCRIPT_ID);
    if (oldScript) oldScript.remove();

    document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());

    const init = buildInitFromQuery(search);

    window.TPWL_CONFIGURATION = {
      ...window.TPWL_CONFIGURATION,
      resultsURL: `${window.location.origin}/flights/results`,
      marker: TP_MARKER,
      init,
    };

    window.TPWL_EXTRA = {
      ...(window.TPWL_EXTRA || {}),
      currency: "USD",
      trs: "",
      marker: TP_MARKER,
      domain: window.location.hostname,
      locale: "en",
      link_color: "5B7CFF",
    };

    const mainScript = document.createElement("script");
    mainScript.id = SCRIPT_ID;
    mainScript.async = true;
    mainScript.src = `https://tpwidg.com/wl_web/main.js?wl_id=${encodeURIComponent(WL_ID)}`;
    document.body.appendChild(mainScript);

    const mountWeedles = () => {
      const container = document.getElementById("tpwl-widget-weedles");
      if (!container) return;

      const weedleElements = container.querySelectorAll<HTMLElement>('div[is="weedle"]');
      weedleElements.forEach((element) => {
        element.innerHTML = "";
        const destination = element.getAttribute("data-destination");
        if (!destination || !window.TPWL_EXTRA) return;

        const scriptElement = document.createElement("script");
        scriptElement.async = true;
        scriptElement.className = WEEDLE_SCRIPT_CLASS;
        scriptElement.src =
          `https://tpwidg.com/content` +
          `?currency=${String(window.TPWL_EXTRA.currency).toLowerCase()}` +
          `&trs=${window.TPWL_EXTRA.trs}` +
          `&shmarker=${window.TPWL_EXTRA.marker}` +
          `&destination=${destination}` +
          `&target_host=${window.TPWL_EXTRA.domain}` +
          `&locale=${window.TPWL_EXTRA.locale}` +
          `&limit=6` +
          `&powered_by=false` +
          `&primary=%23${window.TPWL_EXTRA.link_color}` +
          `&promo_id=4044` +
          `&campaign_id=100`;

        element.appendChild(scriptElement);
      });
    };

    const timer = window.setTimeout(mountWeedles, 1200);

    return () => {
      window.clearTimeout(timer);
      const script = document.getElementById(SCRIPT_ID);
      if (script) script.remove();
      document.querySelectorAll(`.${WEEDLE_SCRIPT_CLASS}`).forEach((el) => el.remove());
    };
  }, [search]);

  return (
    <>
      <SEO
        title={`Search Flights${routeInfo} | GoTravelAsia`}
        description="We search hundreds of travel sites at once to find the cheapest flights for you."
      />

      <style>{`
        :root {
          --tpwl-main-text: #0f172a;
          --tpwl-search-result-background: #f8fafc;
          --tpwl-search-form-background: #172554;
          --tpwl-headline-text: #ffffff;
          --tpwl-links: #4f46e5;
          --tpwl-font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          color: var(--tpwl-main-text);
          background-color: var(--tpwl-search-result-background);
          font-family: var(--tpwl-font-family), sans-serif;
        }

        body a {
          color: var(--tpwl-links);
          text-decoration: none;
          cursor: pointer;
          transition: 0.1s linear;
        }

        body a:hover,
        body a:focus {
          text-decoration: underline;
        }

        .tpwl-logo-header {
          position: relative;
          color: var(--tpwl-headline-text);
          font-weight: 600;
          background-color: var(--tpwl-search-form-background);
          padding: 32px 100px 16px;
          margin-bottom: -20px;
          z-index: 101;
          background-size: cover;
          background-repeat: no-repeat;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .tpwl-logo-header h1 {
          font-size: 48px;
          margin: 0;
        }

        .tpwl-search-header {
          padding: 24px 100px;
          background-color: var(--tpwl-search-form-background);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: all 0.3s linear;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .tpwl-logo__wrapper {
          margin-bottom: 140px;
          font-size: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tpwl-logo__logo {
          width: 40px;
          height: 40px;
          background: no-repeat url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="%23fff" fill-rule="evenodd" d="M17.026 2.117a3.483 3.483 0 0 1 5.021 4.828l-2.778 2.91a6.391 6.391 0 0 0-.219.235v.005c.011.061.03.145.068.31l1.728 7.487.015.066c.058.243.13.549.105.861a2 2 0 0 1-.222.773c-.145.278-.367.499-.545.675l-.048.048-.4.4c-.278.278-.533.533-.759.721-.232.194-.55.418-.964.491a2 2 0 0 1-1.54-.363c-.338-.251-.522-.594-.643-.871-.118-.27-.232-.612-.357-.985l-1.51-4.533-2.202 2.201a6.644 6.644 0 0 0-.2.205 6.18 6.18 0 0 0 .028.285l.184 1.654.006.059c.025.217.056.49.013.764a2 2 0 0 1-.236.672c-.137.241-.332.435-.487.59l-.042.04-.197.198-.026.026c-.214.214-.419.419-.604.574-.199.167-.458.35-.798.439a2 2 0 0 1-1.378-.137 2.04 2.04 0 0 1-.697-.587 10.212 10.212 0 0 1-.48-.68l-1.588-2.383a5.878 5.878 0 0 0-.066-.098v-.002h-.002a5.934 5.934 0 0 0-.098-.067L2.726 17.34c-.253-.168-.493-.329-.682-.48a2.041 2.041 0 0 1-.587-.696 2 2 0 0 1-.136-1.379 2.04 2.04 0 0 1 .439-.798c.155-.185.36-.389.574-.604l.223-.222.041-.042c.155-.155.349-.35.589-.487a2 2 0 0 1 .673-.236c.273-.044.546-.013.764.012l.058.007 1.654.184c.15.016.226.024.28.028h.005l.003-.003a6.33 6.33 0 0 0 .202-.197l2.201-2.202-4.533-1.51c-.373-.125-.715-.24-.984-.357-.278-.122-.62-.305-.871-.643a2 2 0 0 1-.364-1.54c.073-.415.298-.732.492-.965.188-.226.443-.48.72-.759l.03-.029.37-.37.049-.049c.176-.177.397-.4.674-.545a2 2 0 0 1 .773-.222c.313-.024.618.048.862.105l.066.016 7.459 1.72c.165.04.25.058.312.069h.005c.002 0 .003-.002.004-.003.046-.043.107-.105.225-.227l2.71-2.799Zm3.551 1.374a1.483 1.483 0 0 0-2.114.017l-2.71 2.8-.046.048c-.17.177-.384.399-.653.547a2 2 0 0 1-.824.243c-.306.022-.606-.048-.845-.104l-.065-.015-7.459-1.722a6.532 6.532 0 0 0-.317-.069h-.006a6.532 6.532 0 0 0-.237.23l-.37.37a11.529 11.529 0 0 0-.647.678l.028.012c.175.077.428.162.854.304l6.029 2.01a1 1 0 0 1 .39 1.655L8.24 13.841l-.041.042c-.154.155-.348.35-.589.487a2 2 0 0 1-.673.236c-.273.043-.546.012-.763-.013l-.06-.007-1.653-.183a6.405 6.405 0 0 0-.285-.029l-.003.003c-.041.037-.095.09-.202.198l-.198.197a9.188 9.188 0 0 0-.493.515l.014.012c.112.09.278.201.57.397l2.353 1.568.021.014c.078.052.176.117.268.195a2.003 2.003 0 0 1 .419.492l.013.02 1.569 2.353a9.253 9.253 0 0 0 .408.585l.015-.012c.11-.092.251-.233.5-.482l.198-.197c.107-.107.16-.161.197-.202l.003-.004v-.004a6.341 6.341 0 0 0-.028-.28l-.184-1.654-.006-.059c-.025-.217-.057-.49-.013-.764a2 2 0 0 1 .236-.673c.137-.24.332-.434.487-.588l.042-.042 3.345-3.345a1 1 0 0 1 1.656.39l2.01 6.03c.141.425.227.678.303.853l.013.028.024-.02c.147-.122.336-.31.653-.627l.37-.37c.123-.123.185-.185.228-.233l.003-.004v-.005a6.592 6.592 0 0 0-.07-.317l-1.728-7.488-.015-.064c-.055-.237-.125-.536-.104-.84a2 2 0 0 1 .208-.759c.138-.273.35-.494.519-.67l.045-.047 2.78-2.91a1.483 1.483 0 0 0-.025-2.073Z" clip-rule="evenodd"/></svg>');
        }

        .tpwl-search__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tpwl__content {
          flex: 1 0 auto;
          max-width: 1240px;
          min-width: 976px;
        }

        .tpwl-main {
          background-color: var(--tpwl-search-result-background);
        }

        .tpwl-tickets__wrapper #tpwl-tickets:not(:empty) {
          margin-bottom: 32px;
        }

        .tpwl-tickets__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 100px;
        }

        .tpwl-widgets__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 100px;
          margin-bottom: 32px;
        }

        .tpwl-widgets__wrapper h3 {
          text-align: center;
          font-size: 36px;
          margin: 0 0 32px;
        }

        .tpwl-widget-weedles {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        .tpwl-widget-weedle {
          display: flex;
          justify-content: center;
        }

        .tpwl-footer__wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 100px;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          background-color: var(--tpwl-search-result-background);
        }

        .tpwl-footer__copyright {
          margin-bottom: 12px;
        }

        .tpwl-footer__links {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        @media (max-width: 389px) {
          .tpwl-footer__wrapper { padding: 56px 16px; }
          .tpwl__content { max-width: unset; min-width: unset; }
          .tpwl-footer__copyright { margin-bottom: 20px; }
          .tpwl-footer__links { display: block; }
          .tpwl-footer__links a { display: block; margin-bottom: 16px; }
          .tpwl-footer__links a:last-child { margin-bottom: 0; }
        }

        @media (max-width: 1175px) {
          .tpwl-logo-header { position: static; padding: 32px 16px 6px; margin-bottom: 0; }
          .tpwl-logo-header h1 { font-size: 36px; max-width: 512px; }
          .tpwl__content { max-width: unset; min-width: unset; }
          .tpwl-search__wrapper { display: block; }
          .tpwl-search-header { padding: 24px 16px; position: static; }
          .tpwl-logo__wrapper { margin-bottom: 120px; }
          .tpwl-tickets__wrapper { padding: 0 16px; }
          .tpwl-widgets__wrapper { padding: 56px 16px; }
          .tpwl-widgets__wrapper h3 { font-size: 32px; }
          .tpwl-widgets__wrapper .tpwl__content { flex: 1 0 100%; }
          .tpwl-widget-weedles { grid-template-columns: 1fr; }
          .tpwl-footer__wrapper { padding: 56px 16px; }
          .tpwl-footer__wrapper .tpwl__content { flex: 1 1 auto; }
        }
      `}</style>

      <div className="tpwl-page">
        <header className="tpwl-logo-header">
          <div className="tpwl-logo__wrapper">
            <div className="tpwl-logo__logo" />
            Flight tickets
          </div>

          <div className="tpwl-search__wrapper">
            <div className="tpwl__content">
              <h1>Your journey begins here</h1>
            </div>
          </div>
        </header>

        <header className="tpwl-search-header">
          <div className="tpwl-search__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-search" />
            </div>
          </div>
        </header>

        <main className="tpwl-main">
          <div className="tpwl-tickets__wrapper">
            <div className="tpwl__content">
              <div id="tpwl-tickets" />
            </div>
          </div>

          <div className="tpwl-widgets__wrapper">
            <div className="tpwl__content">
              <h3>Popular destinations</h3>

              <div id="tpwl-widget-weedles" className="tpwl-widget-weedles">
                <div className="tpwl-widget-weedle" data-destination="IST" is="weedle" />
                <div className="tpwl-widget-weedle" data-destination="DXB" is="weedle" />
                <div className="tpwl-widget-weedle" data-destination="MOW" is="weedle" />
                <div className="tpwl-widget-weedle" data-destination="LAS" is="weedle" />
                <div className="tpwl-widget-weedle" data-destination="NYC" is="weedle" />
                <div className="tpwl-widget-weedle" data-destination="LON" is="weedle" />
              </div>
            </div>
          </div>
        </main>

        <footer className="tpwl-footer__wrapper">
          <div className="tpwl__content">
            <div className="tpwl-footer__copyright">
              Travelpayouts © 2008−{new Date().getFullYear()}
            </div>

            <div className="tpwl-footer__links">
              <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a>
              <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
              <a href="/cookies" target="_blank" rel="noreferrer">Cookie Policy</a>
            </div>
          </div>
        </footer>

        <div id="tpwl-cookie-banner" className="tpwl-cookie-banner" />
      </div>
    </>
  );
}
