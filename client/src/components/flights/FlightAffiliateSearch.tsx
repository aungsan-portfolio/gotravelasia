import { useMemo, useState, useEffect } from "react";
import {
  Plane,
  ArrowLeftRight,
  CalendarDays,
  Users,
  ExternalLink,
  Search,
} from "lucide-react";
import { useFlightSearch, type Airport } from "@/contexts/FlightSearchContext";
import { AirportAutocomplete } from "@/components/AirportAutocomplete";

type Props = {
  marker: string;
  programId?: string;
  locale?: string;
  currency?: string;
  openInNewTab?: boolean;
  className?: string;
  defaultOrigin?: Airport | null;
  defaultDestination?: Airport | null;
};

const DEFAULT_PROGRAM_ID = "4114";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function buildAffiliateFlightUrl(input: {
  marker: string;
  programId?: string;
  locale?: string;
  currency?: string;
  originCode: string;
  destinationCode: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
}) {
  const {
    marker,
    programId = DEFAULT_PROGRAM_ID,
    locale = "en",
    currency = "USD",
    originCode,
    destinationCode,
    departDate,
    returnDate,
    adults,
    children,
    infants,
  } = input;

  const aviasales = new URL("https://www.aviasales.com/search");
  aviasales.searchParams.set("origin_iata", originCode.toUpperCase());
  aviasales.searchParams.set("destination_iata", destinationCode.toUpperCase());
  aviasales.searchParams.set("depart_date", departDate);
  aviasales.searchParams.set("one_way", returnDate ? "false" : "true");
  aviasales.searchParams.set("adults", String(adults));
  aviasales.searchParams.set("children", String(children));
  aviasales.searchParams.set("infants", String(infants));
  aviasales.searchParams.set("locale", locale);
  aviasales.searchParams.set("currency", currency);

  if (returnDate) {
    aviasales.searchParams.set("return_date", returnDate);
  }

  const partner = new URL("https://tp.media/r");
  partner.searchParams.set("marker", marker);
  partner.searchParams.set("p", programId);
  partner.searchParams.set("u", aviasales.toString());

  return partner.toString();
}

export default function FlightAffiliateSearch({
  marker,
  programId = DEFAULT_PROGRAM_ID,
  locale = "en",
  currency = "USD",
  openInNewTab = true,
  className,
  defaultOrigin = null,
  defaultDestination = null,
}: Props) {
  const {
    tripType,
    setTripType,
    origin,
    setOrigin,
    destination,
    setDestination,
    swapAirports,
    departDate,
    setDepartDate,
    returnDate,
    setReturnDate,
    adults,
    setAdults,
    childCount: children,
    setChildCount: setChildren,
    infants,
    setInfants,
  } = useFlightSearch();

  const [errors, setErrors] = useState<string[]>([]);
  const totalPassengers = adults + children + infants;

  // Initialize defaults if context is empty
  useEffect(() => {
    if (!origin && defaultOrigin) {
      setOrigin(defaultOrigin);
    }
    if (!destination && defaultDestination) {
      setDestination(defaultDestination);
    }
    if (!departDate) {
      setDepartDate(todayPlus(14));
    }
    if (tripType === "roundtrip" && !returnDate) {
        setReturnDate(todayPlus(21));
    }
  }, [origin, destination, departDate, returnDate, tripType, defaultOrigin, defaultDestination, setOrigin, setDestination, setDepartDate, setReturnDate]);

  const deepLink = useMemo(() => {
    if (!origin?.code || !destination?.code || !departDate) return "";
    return buildAffiliateFlightUrl({
      marker,
      programId,
      locale,
      currency,
      originCode: origin.code,
      destinationCode: destination.code,
      departDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      adults,
      children,
      infants,
    });
  }, [
    marker,
    programId,
    locale,
    currency,
    origin,
    destination,
    departDate,
    returnDate,
    tripType,
    adults,
    children,
    infants,
  ]);

  function validate() {
    const nextErrors: string[] = [];

    if (!origin) nextErrors.push("Please select an origin airport.");
    if (!destination) nextErrors.push("Please select a destination airport.");
    if (origin && destination && origin.code === destination.code) {
      nextErrors.push("Origin and destination cannot be the same.");
    }
    if (!departDate) nextErrors.push("Please select a departure date.");
    if (tripType === "roundtrip" && !returnDate) {
      nextErrors.push("Please select a return date.");
    }
    if (tripType === "roundtrip" && returnDate && departDate && returnDate < departDate) {
      nextErrors.push("Return date cannot be earlier than departure date.");
    }
    if (adults < 1) nextErrors.push("At least 1 adult is required.");
    if (infants > adults) nextErrors.push("Infants cannot be more than adults.");
    if (totalPassengers > 9) nextErrors.push("Maximum 9 passengers are allowed.");
    if (!marker) nextErrors.push("Affiliate marker is missing.");

    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    if (!deepLink) return;

    if (openInNewTab) {
      window.open(deepLink, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = deepLink;
    }
  }

  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200 bg-white shadow-xl",
        className
      )}
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-5 text-white md:px-7 rounded-t-3xl">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/15 p-2 shrink-0">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black">Search Flights</h2>
            <p className="mt-1 text-sm text-white/85">
              Compare live fares and continue to our travel partner.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-7">
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTripType("roundtrip")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition",
              tripType === "roundtrip"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Return
          </button>
          <button
            type="button"
            onClick={() => setTripType("oneway")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition",
              tripType === "oneway"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            One-way
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-sm font-bold text-rose-800">Please fix the following:</div>
            <ul className="mt-2 space-y-1 text-sm text-rose-700">
              {errors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] bg-slate-900 p-4 rounded-2xl mb-4">
          <div>
            <AirportAutocomplete
              label="From"
              value={origin}
              onChange={setOrigin}
              onClear={() => setOrigin(null)}
            />
          </div>

          <div className="flex items-center justify-center pt-5">
            <button
              type="button"
              onClick={swapAirports}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:border-white/30"
              aria-label="Swap origin and destination"
              title="Swap origin and destination"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </div>

          <div>
            <AirportAutocomplete
              label="To"
              value={destination}
              onChange={setDestination}
              onClear={() => setDestination(null)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Departure date
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={departDate}
                min={todayPlus(0)}
                onChange={(e) => setDepartDate(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {tripType === "roundtrip" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Return date
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={returnDate}
                  min={departDate || todayPlus(0)}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Adults
            </label>
            <div className="relative">
              <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 appearance-none"
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} adult{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Children
            </label>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 appearance-none"
            >
              {Array.from({ length: 9 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>
                  {n} child{n !== 1 ? "ren" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Infants
            </label>
            <select
              value={infants}
              onChange={(e) => setInfants(Number(e.target.value))}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 appearance-none"
            >
              {Array.from({ length: 9 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>
                  {n} infant{n !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between border border-slate-200">
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Redirect preview
            </div>
            <div className="mt-1 break-all text-sm text-slate-600 font-mono truncate">
              {deepLink || "Choose route and dates to generate affiliate search link."}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50"
          >
            <Search className="h-4 w-4" />
            Search Flights
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
