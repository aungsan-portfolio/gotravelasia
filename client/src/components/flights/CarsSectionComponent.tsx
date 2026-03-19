import { useEffect, useRef } from "react";

const TP_MARKER = "697202";
const ECONOMY_BOOKINGS_URL = "https://economybookings.tpx.gr/wDfimShS";

interface Props {
  cityName: string;
  airportCode: string;
  pickupDate: string | null;
  returnDate: string | null;
}

const CAR_CATEGORIES = [
  {
    id: "small",
    label: "Small",
    example: "e.g. Toyota Yaris",
    svg: (
      <svg
        viewBox="0 0 120 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-14"
        aria-hidden="true"
      >
        <ellipse cx="30" cy="52" rx="10" ry="6" fill="#d1d5db" />
        <ellipse cx="90" cy="52" rx="10" ry="6" fill="#d1d5db" />
        <ellipse cx="30" cy="52" rx="6" ry="4" fill="#6b7280" />
        <ellipse cx="90" cy="52" rx="6" ry="4" fill="#6b7280" />
        <path
          d="M8 46 C8 46 15 30 35 26 L55 22 C65 20 80 20 95 26 L112 34 L114 46 Z"
          fill="#e5e7eb"
          stroke="#d1d5db"
          strokeWidth="1"
        />
        <rect x="40" y="22" width="20" height="14" rx="2" fill="#bfdbfe" opacity="0.7" />
        <rect x="65" y="22" width="18" height="14" rx="2" fill="#bfdbfe" opacity="0.7" />
        <rect x="8" y="40" width="12" height="4" rx="1" fill="#fde68a" />
        <rect x="100" y="40" width="12" height="4" rx="1" fill="#fca5a5" />
      </svg>
    ),
  },
  {
    id: "medium",
    label: "Medium",
    example: "e.g. Toyota Camry",
    svg: (
      <svg
        viewBox="0 0 140 65"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-14"
        aria-hidden="true"
      >
        <ellipse cx="35" cy="56" rx="11" ry="6" fill="#d1d5db" />
        <ellipse cx="105" cy="56" rx="11" ry="6" fill="#d1d5db" />
        <ellipse cx="35" cy="56" rx="7" ry="4" fill="#6b7280" />
        <ellipse cx="105" cy="56" rx="7" ry="4" fill="#6b7280" />
        <path
          d="M6 48 C6 48 16 28 40 24 L60 19 C72 17 90 17 108 24 L128 34 L132 48 Z"
          fill="#e5e7eb"
          stroke="#d1d5db"
          strokeWidth="1"
        />
        <rect x="44" y="19" width="22" height="16" rx="2" fill="#bfdbfe" opacity="0.7" />
        <rect x="72" y="19" width="22" height="16" rx="2" fill="#bfdbfe" opacity="0.7" />
        <rect x="6" y="42" width="14" height="4" rx="1" fill="#fde68a" />
        <rect x="118" y="42" width="14" height="4" rx="1" fill="#fca5a5" />
      </svg>
    ),
  },
  {
    id: "large",
    label: "Large",
    example: "e.g. Toyota Fortuner",
    svg: (
      <svg
        viewBox="0 0 160 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-14"
        aria-hidden="true"
      >
        <ellipse cx="38" cy="58" rx="13" ry="8" fill="#d1d5db" />
        <ellipse cx="122" cy="58" rx="13" ry="8" fill="#d1d5db" />
        <ellipse cx="38" cy="58" rx="8" ry="5" fill="#6b7280" />
        <ellipse cx="122" cy="58" rx="8" ry="5" fill="#6b7280" />
        <path
          d="M6 50 C6 50 12 22 38 18 L70 14 C84 12 106 12 122 18 L148 30 L152 50 Z"
          fill="#e5e7eb"
          stroke="#d1d5db"
          strokeWidth="1.5"
        />
        <rect x="48" y="14" width="26" height="18" rx="2" fill="#bfdbfe" opacity="0.7" />
        <rect x="82" y="14" width="26" height="18" rx="2" fill="#bfdbfe" opacity="0.7" />
        <rect x="6" y="44" width="16" height="5" rx="1" fill="#fde68a" />
        <rect x="138" y="44" width="16" height="5" rx="1" fill="#fca5a5" />
        <rect x="52" y="12" width="56" height="3" rx="1" fill="#9ca3af" />
      </svg>
    ),
  },
] as const;

// ── URL builder — EconomyBookings primary ────────────────────────────────────
function buildCarUrl(p: Props, category?: string): string {
  const url = new URL(ECONOMY_BOOKINGS_URL);
  if (p.airportCode) url.searchParams.set("pickup_iata", p.airportCode);
  if (p.pickupDate) url.searchParams.set("pickup_date", p.pickupDate);
  if (p.returnDate) url.searchParams.set("return_date", p.returnDate);
  if (category) url.searchParams.set("car_class", category);
  url.searchParams.set("currency", "THB");
  url.searchParams.set("marker", TP_MARKER);
  return url.toString();
}

function buildWidgetSrc(
  airportCode: string,
  pickupDate: string | null,
  returnDate: string | null,
): string {
  const url = new URL("https://www.travelpayouts.com/car_rentals/widget");
  url.searchParams.set("destination", airportCode);
  url.searchParams.set("marker", TP_MARKER);
  url.searchParams.set("locale", "en");
  url.searchParams.set("currency", "thb");
  url.searchParams.set("powered_by", "false");
  if (pickupDate) url.searchParams.set("pickup_date", pickupDate);
  if (returnDate) url.searchParams.set("dropoff_date", returnDate);
  return url.toString();
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso + "T00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function CarsSection(props: Props) {
  const { cityName, airportCode, pickupDate, returnDate } = props;
  const mountRef = useRef<HTMLDivElement>(null);
  const scriptId = `tp-car-widget-${airportCode}`;

  useEffect(() => {
    if (!mountRef.current) return;
    document.getElementById(scriptId)?.remove();
    mountRef.current.innerHTML = "";
    const s = document.createElement("script");
    s.id = scriptId;
    s.async = true;
    s.src = buildWidgetSrc(airportCode, pickupDate, returnDate);
    mountRef.current.appendChild(s);
    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [scriptId, airportCode, pickupDate, returnDate]);

  if (!airportCode) return null;

  const dateRange =
    pickupDate && returnDate
      ? `${fmtDate(pickupDate)} – ${fmtDate(returnDate)}`
      : pickupDate
        ? `From ${fmtDate(pickupDate)}`
        : "";

  return (
    <section
      aria-labelledby="cars-section-heading"
      className="border-t border-neutral-100 bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="cars-section-heading" className="text-lg font-bold text-neutral-950 sm:text-xl">
              Drive around {cityName}
            </h2>
            {dateRange && <p className="mt-0.5 text-sm text-neutral-500">{dateRange}</p>}
          </div>
          <a
            href={buildCarUrl(props)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-yellow-400 hover:bg-yellow-50 hover:text-neutral-950"
          >
            Find cars →
          </a>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CAR_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={buildCarUrl(props, cat.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-yellow-400 hover:shadow-md"
            >
              <div className="w-full px-2 py-1">{cat.svg}</div>
              <div className="mt-3 text-center">
                <div className="text-sm font-bold text-neutral-950">{cat.label}</div>
                <div className="mt-0.5 text-xs text-neutral-400">{cat.example}</div>
              </div>
              <div className="mt-3 text-xs font-semibold text-yellow-600 group-hover:text-yellow-700">
                Search →
              </div>
            </a>
          ))}
        </div>

        <div
          ref={mountRef}
          className="min-h-[140px] overflow-hidden rounded-xl"
          aria-label={`Car rental deals near ${cityName}`}
        />
      </div>
    </section>
  );
}
