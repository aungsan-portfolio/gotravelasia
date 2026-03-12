// client/src/components/flights/destination/AirlinesWeather.tsx

import {
  Bar,
  BarChart,
  CartesianGrid,
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
    <div className="rounded-xl border border-white/10 bg-[#120d25]/95 px-3 py-2 text-xs text-white shadow-xl">
      <div className="font-medium text-white">{label}</div>
      <div className="mt-2 space-y-1">
        {payload.map((item, index) => (
          <div key={`${item.name}-${index}`} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color ?? "#fff" }}
            />
            <span className="text-white/65">{item.name}</span>
            <span className="ml-auto text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AirlinesWeather({ data }: AirlinesWeatherProps) {
  const { airlinesWeather, route } = data;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
            Airlines and weather
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {airlinesWeather.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            {airlinesWeather.subtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Airlines tracked
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {airlinesWeather.summary.airlineCount}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Top carrier
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {airlinesWeather.summary.topCarrier}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Warmest month
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {airlinesWeather.summary.warmestMonth}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Wettest month
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {airlinesWeather.summary.wettestMonth}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Airline snapshot</p>
              <p className="mt-1 text-xs text-white/55">
                Common carriers on {route.routeLabel}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#100b21] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                Route
              </p>
              <p className="text-sm font-medium text-white">{route.destination.city}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {airlinesWeather.airlines.map((airline) => (
              <article
                key={airline.code}
                className="rounded-2xl border border-white/10 bg-[#100b21] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {airline.logoUrl && (
                        <img
                          src={airline.logoUrl}
                          alt={airline.name}
                          className="h-5 w-5 rounded object-contain bg-white/10"
                        />
                      )}
                      <h3 className="truncate text-base font-semibold text-white">
                        {airline.name}
                      </h3>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/60">
                        {airline.code}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {airline.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2.5 py-1 text-xs text-fuchsia-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                      Deal count
                    </p>
                    <p className="text-lg font-semibold text-amber-200">
                      {airline.dealCount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStopClass(
                      airline.commonStops ?? 0
                    )}`}
                  >
                    {airline.commonStops === 0
                      ? "Usually direct"
                      : `${airline.commonStops} common stop${
                          airline.commonStops === 1 ? "" : "s"
                        }`}
                  </span>

                  {airline.confidenceLabel ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/65">
                      {airline.confidenceLabel}
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Temperature trend</p>
                <p className="mt-1 text-xs text-white/55">
                  Average monthly temperature for {route.destination.city}
                </p>
              </div>
            </div>

            <div className="mt-5 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={airlinesWeather.weather} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={38}
                  />
                  <Tooltip content={<WeatherTooltip />} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="avgTempC"
                    name="Temp °C"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#f59e0b" }}
                    activeDot={{ r: 5, fill: "#fde68a", stroke: "#0b0719", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Rainfall trend</p>
                <p className="mt-1 text-xs text-white/55">
                  Monthly rainfall pattern for trip planning
                </p>
              </div>
            </div>

            <div className="mt-5 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={airlinesWeather.weather} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={46}
                  />
                  <Tooltip content={<WeatherTooltip />} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }} />
                  <Bar
                    dataKey="rainfallMm"
                    name="Rainfall mm"
                    fill="#60a5fa"
                    radius={[8, 8, 0, 0]}
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
