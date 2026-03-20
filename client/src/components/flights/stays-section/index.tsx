import { useEffect, useMemo, useRef, useState } from "react";
import { trackAffiliateClick } from "@/lib/tracking";

const TP_MARKER = import.meta.env.VITE_TP_MARKER ?? "697202";

interface Props {
  cityName: string;
  destinationCode: string;
  checkIn: string | null;
  checkOut: string | null;
  adults?: number;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, (month ?? 1) - 1, day ?? 1);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function buildHotelUrl({
  cityName,
  destinationCode,
  checkIn,
  checkOut,
  adults = 1,
}: Props): string {
  const url = new URL("https://hotellook.com/search");
  url.searchParams.set("destination", destinationCode || cityName);
  if (checkIn) url.searchParams.set("checkIn", checkIn);
  if (checkOut) url.searchParams.set("checkOut", checkOut);
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("marker", TP_MARKER);
  url.searchParams.set("currency", "thb");
  return url.toString();
}

function buildWidgetSrc({
  cityName,
  destinationCode,
  checkIn,
  checkOut,
}: Props): string {
  const url = new URL("https://www.travelpayouts.com/hotels_selections/widget");
  url.searchParams.set("destination", destinationCode || cityName);
  url.searchParams.set("currency", "thb");
  url.searchParams.set("marker", TP_MARKER);
  url.searchParams.set("locale", "en");
  url.searchParams.set("limit", "4");
  url.searchParams.set("powered_by", "false");
  if (checkIn) url.searchParams.set("check_in", checkIn);
  if (checkOut) url.searchParams.set("check_out", checkOut);
  return url.toString();
}

const STAY_CATEGORIES = [
  {
    id: "luxury",
    label: "5* class hotels",
    image: "luxury",
  },
  {
    id: "comfort",
    label: "3+ class hotels",
    image: "comfort",
  },
  {
    id: "rentals",
    label: "Rentals",
    image: "rentals",
  },
] as const;

export function StaysSection({
  cityName,
  destinationCode,
  checkIn,
  checkOut,
  adults = 1,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [widgetFailed, setWidgetFailed] = useState(false);

  const hotelUrl = useMemo(
    () =>
      buildHotelUrl({
        cityName,
        destinationCode,
        checkIn,
        checkOut,
        adults,
      }),
    [cityName, destinationCode, checkIn, checkOut, adults],
  );

  const widgetSrc = useMemo(
    () =>
      buildWidgetSrc({
        cityName,
        destinationCode,
        checkIn,
        checkOut,
        adults,
      }),
    [cityName, destinationCode, checkIn, checkOut, adults],
  );

  const dateRange = useMemo(() => {
    if (checkIn && checkOut) return `${fmtDate(checkIn)} – ${fmtDate(checkOut)}`;
    if (checkIn) return `From ${fmtDate(checkIn)}`;
    return "";
  }, [checkIn, checkOut]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    setWidgetFailed(false);
    mount.innerHTML = "";

    if (!cityName && !destinationCode) {
      setWidgetFailed(true);
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = widgetSrc;

    const failTimer = window.setTimeout(() => {
      setWidgetFailed(true);
    }, 6000);

    script.onload = () => {
      window.clearTimeout(failTimer);
    };

    script.onerror = () => {
      window.clearTimeout(failTimer);
      setWidgetFailed(true);
    };

    mount.appendChild(script);

    return () => {
      window.clearTimeout(failTimer);
      mount.innerHTML = "";
    };
  }, [widgetSrc, cityName, destinationCode]);

  if (!cityName && !destinationCode) return null;

  return (
    <section
      aria-labelledby="stays-heading"
      className="border-t border-neutral-100 bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="stays-heading" className="text-lg font-bold text-neutral-950 sm:text-xl">
              Stays near {cityName || destinationCode}
            </h2>
            {dateRange && <p className="mt-0.5 text-sm text-neutral-500">{dateRange}</p>}
          </div>
          <a
            href={hotelUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackAffiliateClick('travelpayouts', { 
                city: cityName, 
                destination: destinationCode,
                context: 'top_link'
              });
            }}
            className="shrink-0 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-yellow-400 hover:bg-yellow-50 hover:text-neutral-950"
          >
            Find stays →
          </a>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STAY_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={hotelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackAffiliateClick('travelpayouts', { 
                  city: cityName, 
                  destination: destinationCode,
                  category: cat.id
                });
              }}
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                <picture>
                  <source srcSet={`/images/optimized/${cat.image}.avif`} type="image/avif" />
                  <source srcSet={`/images/optimized/${cat.image}.webp`} type="image/webp" />
                  <img
                    src={`/images/stays/${cat.image}.webp`}
                    alt={cat.label}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="250"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </picture>
              </div>
              <div className="px-4 py-3">
                <div className="text-sm font-bold text-neutral-950">{cat.label}</div>
              </div>
            </a>
          ))}
        </div>

        {!widgetFailed ? (
          <div
            ref={mountRef}
            className="min-h-[200px] overflow-hidden rounded-xl"
            aria-label="Hotel deals"
          />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm text-neutral-700">Hotel preview could not load right now.</p>
            <a
              href={hotelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-md bg-yellow-400 px-4 py-2 text-sm font-bold text-neutral-950 transition hover:bg-yellow-500"
            >
              Search hotels near {cityName || destinationCode}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
