// client/src/components/flights/destination/AirlinesWeather.tsx

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DestinationPageVM } from "@/types/destination";

type AirlinesWeatherProps = {
  data: DestinationPageVM;
};

const STOP_TONE: Record<number, string> = {
  0: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  1: "border-amber-400/30 bg-amber-400/10 text-amber-200",
};

function getStopClass(stops: number): string {
  if (stops <= 0) return STOP_TONE[0];
  if (stops === 1) return STOP_TONE[1];
  return "border-rose-400/30 bg-rose-400/10 text-rose-200";
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

function WeatherTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 shadow-lg">
      <p className="text-xs text-white/50">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center gap-2 text-sm text-white">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-white/65">{item.name}</span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AirlinePriceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { priceLabel?: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 shadow-lg">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">
        {payload[0]?.payload?.priceLabel ?? "—"}
      </p>
    </div>
  );
}

export default function AirlinesWeather({ data }: AirlinesWeatherProps) {
  const { airlinesWeather, route } = data;

  const airlinePriceRows = useMemo(() => {
    const rows = airlinesWeather.airlines
      .filter((airline) => Number.isFinite(airline.avgPrice) && (airline.avgPrice ?? 0) > 0)
      .map((airline) => ({
        code: airline.code,
        name: airline.name,
        avgPrice: airline.avgPrice as number,
        priceLabel: formatMoney(airline.avgPrice as number),
        fill: "#c084fc",
      }));

    if (!rows.length) return rows;

    const minPrice = Math.min(...rows.map((row) => row.avgPrice));
    const maxPrice = Math.max(...rows.map((row) => row.avgPrice));

    return rows.map((row) => ({
      ...row,
      fill:
        row.avgPrice === minPrice
          ? "#fbbf24"
          : row.avgPrice === maxPrice
            ? "#f472b6"
            : "#c084fc",
    }));
  }, [airlinesWeather.airlines]);

  const weatherRows = useMemo(
    () =>
      airlinesWeather.weather.map((row) => ({
        month: row.month,
        avgTempC: row.avgTempC ?? 0,
        rainfallMm: row.rainfallMm ?? 0,
      })),
    [airlinesWeather.weather],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.10),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-slate-950/30 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.30em] text-fuchsia-300/80">
              Airlines and weather
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {airlinesWeather.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {airlinesWeather.subtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                Airlines tracked
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {airlinesWeather.summary.airlineCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                Top carrier
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {airlinesWeather.summary.topCarrier}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                Warmest month
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {airlinesWeather.summary.warmestMonth}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                Wettest month
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {airlinesWeather.summary.wettestMonth}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Average fare by airline</h3>
              <p className="mt-1 text-sm text-white/50">
                Compare typical fares for common carriers on {route.routeLabel}.
              </p>
            </div>

            {airlinePriceRows.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={airlinePriceRows} layout="vertical" margin={{ left: 12, right: 8 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                      tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip content={<AirlinePriceTooltip />} />
                    <Bar dataKey="avgPrice" radius={[0, 10, 10, 0]}>
                      {airlinePriceRows.map((row) => (
                        <Cell key={row.code} fill={row.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center">
                <div>
                  <p className="text-lg font-medium text-white">No airline price data yet.</p>
                  <p className="mt-2 text-sm text-white/55">
                    Add `avgPrice` values to airline summaries to render this chart.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Airline snapshot</h3>
              <p className="mt-1 text-sm text-white/50">
                Common carriers on {route.routeLabel}.
              </p>
            </div>

            <div className="space-y-4">
              {airlinesWeather.airlines.map((airline) => (
                <article
                  key={airline.code}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {airline.logoUrl ? (
                        <img
                          src={airline.logoUrl}
                          alt={airline.name}
                          className="h-12 w-12 rounded-xl bg-white object-contain p-1"
                        />
                      ) : null}

                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-white">
                          {airline.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/65">
                            {airline.code}
                          </span>
                          {airline.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2.5 py-1 text-xs text-fuchsia-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {typeof airline.avgPrice === "number" ? (
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                          Avg fare
                        </p>
                        <p className="mt-1 text-lg font-semibold text-amber-300">
                          {formatMoney(airline.avgPrice)}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        Deal count
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {airline.dealCount ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                        Common routing
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={[
                            "rounded-full border px-2.5 py-1 text-xs font-medium",
                            getStopClass(airline.commonStops ?? 0),
                          ].join(" ")}
                        >
                          {(airline.commonStops ?? 0) === 0
                            ? "Usually direct"
                            : `${airline.commonStops} common stop${
                                (airline.commonStops ?? 0) === 1 ? "" : "s"
                              }`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {airline.confidenceLabel ? (
                    <p className="mt-3 text-sm text-white/55">{airline.confidenceLabel}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Temperature trend</h3>
              <p className="mt-1 text-sm text-white/50">
                Average monthly temperature for {route.destination.city}.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherRows}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                    width={36}
                  />
                  <Tooltip content={<WeatherTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgTempC"
                    name="Avg temp °C"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Rainfall trend</h3>
              <p className="mt-1 text-sm text-white/50">
                Monthly rainfall pattern for trip planning.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weatherRows}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip content={<WeatherTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="rainfallMm"
                    name="Rainfall mm"
                    fill="#60a5fa"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
