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
    image: "/images/cars/small.webp",
  },
  {
    id: "medium",
    label: "Medium",
    example: "e.g. Toyota Camry",
    image: "/images/cars/medium.webp",
  },
  {
    id: "large",
    label: "Large",
    example: "e.g. Toyota Fortuner",
    image: "/images/cars/large.webp",
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

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CAR_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={buildCarUrl(props, cat.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100 p-2">
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="px-4 py-3 text-center">
                <div className="text-sm font-bold text-neutral-950">{cat.label}</div>
                <div className="mt-0.5 text-xs text-neutral-400">{cat.example}</div>
                <div className="mt-2 text-xs font-semibold text-yellow-600">Search →</div>
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
