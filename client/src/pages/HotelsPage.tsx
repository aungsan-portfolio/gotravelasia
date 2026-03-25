import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import CheapflightsHotelCard from "@/components/hotels/CheapflightsHotelCard";
import type {
  AffiliateLinks,
  HotelData,
} from "@/components/hotels/CheapflightsHotelCard";
import HotelsResultsMap from "@/components/hotels/HotelsResultsMap";
import { CITIES_BY_COUNTRY, type City } from "@shared/hotels/cities";
import {
  buildHotelSearchParams,
  defaultHotelDates,
  parseHotelSearchParams,
} from "@shared/hotels/searchParams";
import type {
  HotelSearchMeta,
  HotelSearchResponse,
  HotelSort,
} from "@shared/hotels/types";

const SORT_OPTIONS: Array<{ value: HotelSort; label: string }> = [
  { value: "rank", label: "Recommended" },
  { value: "review_desc", label: "Review score" },
  { value: "price_asc", label: "Lowest price" },
  { value: "price_desc", label: "Highest price" },
  { value: "stars_desc", label: "Star rating" },
];

const EMPTY_META: HotelSearchMeta = {
  source: "mock",
  checkIn: "",
  checkOut: "",
  adults: 2,
  rooms: 1,
  page: 1,
  sort: "rank",
  pageSize: 20,
  totalCount: 0,
  totalPages: 1,
  warnings: [],
};

const DESKTOP_HEADER_OFFSET = "4.5rem";

export default function HotelsPage() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const parsedParams = useMemo(
    () => parseHotelSearchParams(search ?? ""),
    [search]
  );
  const dateDefaults = useMemo(() => defaultHotelDates(), []);

  const [citySlug, setCitySlug] = useState(parsedParams.city);
  const [checkIn, setCheckIn] = useState(parsedParams.checkIn);
  const [checkOut, setCheckOut] = useState(parsedParams.checkOut);
  const [adults, setAdults] = useState(parsedParams.adults);
  const [rooms, setRooms] = useState(parsedParams.rooms);
  const [sortBy, setSortBy] = useState<HotelSort>(parsedParams.sort);
  const [page, setPage] = useState(parsedParams.page);

  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLinks | null>(
    null
  );
  const [cityMeta, setCityMeta] = useState<City | null>(null);
  const [meta, setMeta] = useState<HotelSearchMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [minStars, setMinStars] = useState(0);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [hoveredHotelId, setHoveredHotelId] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);
  const hotelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setCitySlug(parsedParams.city);
    setCheckIn(parsedParams.checkIn);
    setCheckOut(parsedParams.checkOut);
    setAdults(parsedParams.adults);
    setRooms(parsedParams.rooms);
    setSortBy(parsedParams.sort);
    setPage(parsedParams.page);
  }, [parsedParams]);

  useEffect(() => {
    if (!parsedParams.city) return;
    hydratedRef.current = true;
    void fetchHotels(parsedParams, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    parsedParams.city,
    parsedParams.checkIn,
    parsedParams.checkOut,
    parsedParams.adults,
    parsedParams.rooms,
    parsedParams.page,
    parsedParams.sort,
  ]);

  const displayedHotels = useMemo(
    () => hotels.filter(hotel => (hotel.stars ?? 0) >= minStars),
    [hotels, minStars]
  );
  const canPaginate = meta.totalPages > 1;
  const hotelsWithCoordinates = useMemo(
    () =>
      displayedHotels.filter(
        hotel =>
          hotel.coordinates &&
          Number.isFinite(hotel.coordinates.lat) &&
          Number.isFinite(hotel.coordinates.lng)
      ),
    [displayedHotels]
  );

  useEffect(() => {
    if (!displayedHotels.length) {
      setSelectedHotelId(null);
      setHoveredHotelId(null);
      return;
    }

    setSelectedHotelId(current => {
      if (current && displayedHotels.some(hotel => hotel.hotelId === current)) {
        return current;
      }
      return displayedHotels[0]?.hotelId ?? null;
    });
  }, [displayedHotels]);

  async function fetchHotels(nextParams = parsedParams, shouldScroll = true) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/hotels/search?${buildHotelSearchParams(nextParams).toString()}`
      );
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Search failed");
      }

      const payload = (await response.json()) as HotelSearchResponse;
      setHotels(payload.hotels ?? []);
      setAffiliateLinks(payload.affiliateLinks ?? null);
      setCityMeta(payload.city ?? null);
      setMeta(payload.meta ?? EMPTY_META);
      setSearched(true);

      if (shouldScroll) {
        setTimeout(
          () =>
            resultsRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          100
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateUrl(
    overrides: Partial<{
      city: string;
      checkIn: string;
      checkOut: string;
      adults: number;
      rooms: number;
      page: number;
      sort: HotelSort;
    }>,
    shouldScroll = false
  ) {
    const params = buildHotelSearchParams({
      city: overrides.city ?? citySlug,
      checkIn: overrides.checkIn ?? checkIn,
      checkOut: overrides.checkOut ?? checkOut,
      adults: overrides.adults ?? adults,
      rooms: overrides.rooms ?? rooms,
      page: overrides.page ?? page,
      sort: overrides.sort ?? sortBy,
    });

    navigate(`/hotels?${params.toString()}`);

    if (shouldScroll && hydratedRef.current) {
      setTimeout(
        () =>
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100
      );
    }
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateUrl(
      {
        city: citySlug,
        checkIn,
        checkOut,
        adults,
        rooms,
        page: 1,
        sort: sortBy,
      },
      true
    );
  }

  function handleSortChange(nextSort: HotelSort) {
    setSortBy(nextSort);
    updateUrl({ sort: nextSort, page: 1 }, true);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    updateUrl({ page: nextPage }, true);
  }

  function scrollToHotel(hotelId: string) {
    const node = hotelRefs.current[hotelId];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setSelectedHotelId(hotelId);
    setMobileView("list");
  }

  const hasActiveResultsState = searched || loading;

  return (
    <div className="min-h-screen">
      {!hasActiveResultsState && (
        <section className="relative overflow-hidden bg-navy px-6 py-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 15% 65%,rgba(124,92,191,.16) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 88% 25%,rgba(245,200,66,.06) 0%,transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 text-[11px] font-bold tracking-widest text-gold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
              43 CITIES · HOTELS ACROSS ASIA
            </div>

            <h1 className="mb-3 font-display text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Find your perfect hotel
              <br />
              <span className="text-gold">at the lowest price</span>
            </h1>
            <p className="mb-8 text-base text-white/65">
              Compare Agoda, Booking.com, Trip.com, Expedia &amp; Klook
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="glass-card mx-auto max-w-5xl rounded-3xl p-5"
            >
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex min-w-[180px] flex-[2] flex-col gap-1">
                  <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    Destination
                  </label>
                  <select
                    value={citySlug}
                    onChange={event => setCitySlug(event.target.value)}
                    className="field-dark"
                  >
                    {Object.entries(CITIES_BY_COUNTRY).map(
                      ([country, data]) => (
                        <optgroup
                          key={country}
                          label={`${data.flag} ${country}`}
                        >
                          {data.cities
                            .filter(city => city.hasHotels)
                            .map(city => (
                              <option key={city.slug} value={city.slug}>
                                {city.flag} {city.name}
                              </option>
                            ))}
                        </optgroup>
                      )
                    )}
                  </select>
                </div>

                <div className="flex min-w-[130px] flex-1 flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="field-dark"
                    value={checkIn}
                    min={dateDefaults.checkIn}
                    onChange={event => setCheckIn(event.target.value)}
                  />
                </div>

                <div className="flex min-w-[130px] flex-1 flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="field-dark"
                    value={checkOut}
                    min={checkIn}
                    onChange={event => setCheckOut(event.target.value)}
                  />
                </div>

                <div className="flex w-20 flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    Adults
                  </label>
                  <select
                    className="field-dark"
                    value={adults}
                    onChange={event => setAdults(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex w-20 flex-col gap-1">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    Rooms
                  </label>
                  <select
                    className="field-dark"
                    value={rooms}
                    onChange={event => setRooms(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="self-end whitespace-nowrap rounded-xl bg-orange-brand px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-orange-brand-hover disabled:opacity-60"
                >
                  {loading ? "Searching…" : "Search Hotels"}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {hasActiveResultsState && (
        <section
          ref={resultsRef}
          className="md:h-[calc(100vh-var(--hotels-shell-offset))]"
          style={{
            // Keep map pane fixed under site header on desktop.
            ["--hotels-shell-offset" as string]: DESKTOP_HEADER_OFFSET,
          }}
        >
          <div className="flex h-full flex-col bg-[#151229] md:overflow-hidden">
            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#151229]/95 px-3 py-2 backdrop-blur md:px-4">
              <form
                onSubmit={handleSearchSubmit}
                className="grid grid-cols-2 gap-2 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_90px_90px_auto_auto] md:items-end"
              >
                <label className="flex min-w-0 flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Destination
                  </span>
                  <select
                    value={citySlug}
                    onChange={event => setCitySlug(event.target.value)}
                    className="h-9 rounded-lg border border-white/12 bg-white/[0.05] px-2.5 text-sm text-white outline-none focus:border-gold/50"
                  >
                    {Object.entries(CITIES_BY_COUNTRY).map(
                      ([country, data]) => (
                        <optgroup
                          key={country}
                          label={`${data.flag} ${country}`}
                        >
                          {data.cities
                            .filter(city => city.hasHotels)
                            .map(city => (
                              <option key={city.slug} value={city.slug}>
                                {city.flag} {city.name}
                              </option>
                            ))}
                        </optgroup>
                      )
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Check-in
                  </span>
                  <input
                    type="date"
                    value={checkIn}
                    min={dateDefaults.checkIn}
                    onChange={event => setCheckIn(event.target.value)}
                    className="h-9 rounded-lg border border-white/12 bg-white/[0.05] px-2.5 text-sm text-white outline-none focus:border-gold/50"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Check-out
                  </span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={event => setCheckOut(event.target.value)}
                    className="h-9 rounded-lg border border-white/12 bg-white/[0.05] px-2.5 text-sm text-white outline-none focus:border-gold/50"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Adults
                  </span>
                  <select
                    value={adults}
                    onChange={event => setAdults(Number(event.target.value))}
                    className="h-9 rounded-lg border border-white/12 bg-white/[0.05] px-2 text-sm text-white outline-none focus:border-gold/50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Rooms
                  </span>
                  <select
                    value={rooms}
                    onChange={event => setRooms(Number(event.target.value))}
                    className="h-9 rounded-lg border border-white/12 bg-white/[0.05] px-2 text-sm text-white outline-none focus:border-gold/50"
                  >
                    {[1, 2, 3, 4, 5].map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 rounded-lg bg-orange-brand px-3 text-sm font-bold text-white transition-colors hover:bg-orange-brand-hover disabled:opacity-60"
                >
                  {loading ? "Searching…" : "Search"}
                </button>

                <div className="flex items-end justify-end gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                      Sort
                    </span>
                    <select
                      value={sortBy}
                      onChange={event =>
                        handleSortChange(event.target.value as HotelSort)
                      }
                      className="h-9 rounded-lg border border-white/12 bg-white/[0.05] px-2 text-sm text-white outline-none focus:border-gold/50"
                    >
                      {SORT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMinStars(current => (current ? 0 : 4))}
                    className="h-9 rounded-lg border border-white/12 bg-white/[0.05] px-3 text-xs font-semibold text-white/80 hover:bg-white/10"
                  >
                    Filter {minStars ? `★${minStars}+` : "All"}
                  </button>
                </div>
              </form>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/65">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                  {loading
                    ? "Searching…"
                    : `${displayedHotels.length} results${cityMeta ? ` · ${cityMeta.flag} ${cityMeta.name}` : ""}`}
                </span>
                {(meta.warnings?.length ?? 0) > 0 && (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-amber-200">
                    {meta.warnings?.join(" ")}
                  </span>
                )}
                {!loading && displayedHotels.length > 0 && (
                  <div className="ml-auto inline-flex rounded-full border border-white/10 bg-white/5 p-1 md:hidden">
                    {(["list", "map"] as const).map(view => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setMobileView(view)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          mobileView === view
                            ? "bg-gold text-navy"
                            : "text-white/70"
                        }`}
                      >
                        {view === "list" ? "List" : "Map"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="border-b border-red-400/25 bg-red-400/8 px-4 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex-1 md:overflow-hidden">
              {loading ? (
                <div className="grid h-full grid-cols-1 gap-2 p-3 md:grid-cols-[410px_minmax(0,1fr)] md:p-0">
                  <div className="space-y-2 overflow-hidden rounded-xl border border-white/10 bg-[#1a1730] p-2">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border border-white/8 bg-navy-card"
                      >
                        <div className="h-[118px] animate-shimmer" />
                      </div>
                    ))}
                  </div>
                  <div className="hidden animate-shimmer rounded-none md:block" />
                </div>
              ) : (
                <div className="h-full md:grid md:grid-cols-[410px_minmax(0,1fr)]">
                  <aside
                    className={`${mobileView === "map" ? "hidden" : "flex"} h-full flex-col border-r border-white/10 bg-[#1a1730] md:flex`}
                  >
                    {!loading && affiliateLinks && (
                      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-2.5 py-2 text-[11px]">
                        {(
                          [
                            ["Agoda", affiliateLinks.agoda],
                            ["Booking", affiliateLinks.booking],
                            ["Trip", affiliateLinks.trip],
                            ["Klook", affiliateLinks.klook],
                            ["Expedia", affiliateLinks.expedia],
                          ] as [string, string | undefined][]
                        )
                          .filter(([, url]) => url)
                          .map(([name, url]) => (
                            <a
                              key={name}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/70 hover:bg-white/10"
                            >
                              {name}
                            </a>
                          ))}
                        <span className="ml-auto text-white/35">
                          {meta.source}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 space-y-2 overflow-y-auto px-2 py-2.5">
                      {displayedHotels.map((hotel, index) => {
                        const isActive =
                          hotel.hotelId === selectedHotelId ||
                          hotel.hotelId === hoveredHotelId;
                        return (
                          <div
                            key={hotel.hotelId}
                            ref={node => {
                              hotelRefs.current[hotel.hotelId] = node;
                            }}
                            onMouseEnter={() =>
                              setHoveredHotelId(hotel.hotelId)
                            }
                            onMouseLeave={() =>
                              setHoveredHotelId(current =>
                                current === hotel.hotelId ? null : current
                              )
                            }
                            onFocus={() => setHoveredHotelId(hotel.hotelId)}
                            onBlur={() =>
                              setHoveredHotelId(current =>
                                current === hotel.hotelId ? null : current
                              )
                            }
                            className={`rounded-xl transition-all ${
                              isActive
                                ? "ring-2 ring-gold/70 ring-offset-2 ring-offset-[#1a1730]"
                                : "ring-1 ring-transparent"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedHotelId(hotel.hotelId)}
                              className="w-full text-left"
                            >
                              <CheapflightsHotelCard
                                hotel={hotel}
                                city={cityMeta ?? undefined}
                                affiliateLinks={affiliateLinks ?? {}}
                                checkIn={meta.checkIn || checkIn}
                                checkOut={meta.checkOut || checkOut}
                                adults={meta.adults || adults}
                                animDelay={Math.min(index * 15, 220)}
                                dense
                                isActive={isActive}
                              />
                            </button>
                          </div>
                        );
                      })}

                      {canPaginate && (
                        <div className="sticky bottom-0 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#151229]/95 px-3 py-2 backdrop-blur">
                          <button
                            type="button"
                            disabled={meta.page <= 1}
                            onClick={() => handlePageChange(meta.page - 1)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                          >
                            Previous
                          </button>
                          <span className="text-xs text-white/70">
                            Page {meta.page} / {meta.totalPages}
                          </span>
                          <button
                            type="button"
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => handlePageChange(meta.page + 1)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </aside>

                  <div
                    className={`${mobileView === "list" ? "hidden" : "block"} h-full md:block`}
                  >
                    <HotelsResultsMap
                      hotels={hotelsWithCoordinates}
                      city={cityMeta}
                      selectedHotelId={selectedHotelId}
                      hoveredHotelId={hoveredHotelId}
                      onMarkerClick={scrollToHotel}
                      onMarkerHover={setHoveredHotelId}
                    />
                  </div>
                </div>
              )}

              {!loading &&
                searched &&
                displayedHotels.length === 0 &&
                !error && (
                  <div className="py-16 text-center text-white/65">
                    <div className="mb-4 text-5xl">🔍</div>
                    <p>No hotels found. Try different dates or filters.</p>
                    {affiliateLinks?.agoda && (
                      <a
                        href={affiliateLinks.agoda}
                        target="_blank"
                        rel="noreferrer sponsored"
                        className="mt-5 inline-block rounded-xl bg-gold px-6 py-2.5 text-sm font-bold text-navy"
                      >
                        Search on Agoda →
                      </a>
                    )}
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {!searched && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="mb-6 font-display text-xl font-bold text-white">
            Browse by destination
          </h2>
          {Object.entries(CITIES_BY_COUNTRY).map(([country, data]) => (
            <div key={country} className="mb-7">
               <h3 className="mb-3 text-sm font-semibold text-white/45">
                 {data.flag} {country}
               </h3>
               <div className="flex flex-wrap gap-2">
                 {data.cities
                   .filter(city => city.hasHotels)
                   .map(city => (
                     <button
                       key={city.slug}
                       type="button"
                       onClick={() => {
                         setCitySlug(city.slug);
                         window.scrollTo({ top: 0, behavior: "smooth" });
                       }}
                       className={`rounded-full border px-4 py-2 text-sm transition-all ${
                         citySlug === city.slug
                           ? "border-gold bg-gold/12 text-gold"
                           : "border-white/10 bg-white/5 text-white/65 hover:border-gold/35 hover:bg-gold/6 hover:text-white"
                       }`}
                     >
                       {city.flag} {city.name}
                     </button>
                   ))}
               </div>
             </div>
           ))}
         </section>
       )}

      {!hasActiveResultsState && (
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 border-t border-white/5 px-6 pb-10 pt-6">
          {[
            ["Flights", "/flights"],
            ["Transport", "/transport"],
            ["Activities", "/activities"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded-full border border-gold/20 px-4 py-1.5 text-xs text-gold/70 transition-all hover:bg-gold/8"
            >
              Also see: {label} →
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
