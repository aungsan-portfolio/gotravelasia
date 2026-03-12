// client/src/components/flights/destination/Insights.tsx

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DestinationPageVM } from "@/types/destination";

type InsightsProps = {
  data: DestinationPageVM;
};

type HeatmapCellVM = {
  key: string;
  group: string;
  day: string;
  price: number;
  priceLabel: string;
  level: "low" | "mid" | "high";
};

const LEVEL_STYLES: Record<HeatmapCellVM["level"], string> = {
  low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  mid: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  high: "border-rose-400/30 bg-rose-400/10 text-rose-100",
};

const BAR_COLORS = {
  normal: "#c084fc",
  cheapest: "#fbbf24",
  priciest: "#f472b6",
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildChartRows(data: DestinationPageVM["insights"]["priceMonths"]) {
  const values = data.map((row) => row.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return data.map((row) => ({
    ...row,
    priceLabel: formatMoney(row.value),
    fill:
      row.value === minValue
        ? BAR_COLORS.cheapest
        : row.value === maxValue
          ? BAR_COLORS.priciest
          : BAR_COLORS.normal,
  }));
}

function flattenHeatmap(data: DestinationPageVM["insights"]["heatmap"]): HeatmapCellVM[] {
  return data.flatMap((group) =>
    group.values.map((cell) => ({
      key: `${group.month}-${cell.day}`,
      group: group.month,
      day: cell.day,
      price: cell.price,
      priceLabel: formatMoney(cell.price),
      level: cell.level,
    }))
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { priceLabel?: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const priceLabel = payload[0]?.payload?.priceLabel ?? "—";

  return (
    <div className="rounded-xl border border-white/10 bg-[#120d25]/95 px-3 py-2 text-xs text-white shadow-xl">
      <div className="font-medium text-white">{label}</div>
      <div className="mt-1 text-white/65">{priceLabel}</div>
    </div>
  );
}

export default function Insights({ data }: InsightsProps) {
  const { insights, route } = data;

  const priceChartRows = useMemo(
    () => buildChartRows(insights.priceMonths),
    [insights.priceMonths]
  );

  const heatmapCells = useMemo(
    () => flattenHeatmap(insights.heatmap),
    [insights.heatmap]
  );

  const heatmapGroups = useMemo(() => {
    const map = new Map<string, HeatmapCellVM[]>();

    for (const cell of heatmapCells) {
      const current = map.get(cell.group) ?? [];
      current.push(cell);
      map.set(cell.group, current);
    }

    return Array.from(map.entries()).map(([group, cells]) => ({
      group,
      cells,
    }));
  }, [heatmapCells]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
            Insights
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {insights.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            {insights.subtitle}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Cheapest month
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {insights.summary.cheapestMonth}
            </p>
            <p className="mt-1 text-xs text-white/55">
              {insights.summary.cheapestMonthLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Priciest month
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {insights.summary.priciestMonth}
            </p>
            <p className="mt-1 text-xs text-white/55">
              {insights.summary.priciestMonthLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Lowest demand cell
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {insights.summary.lowestHeatmapCell}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
              Highest demand cell
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {insights.summary.highestHeatmapCell}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Monthly fare trend</p>
              <p className="mt-1 text-xs text-white/55">
                {route.origin.city} to {route.destination.city} seasonality view
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#100b21] px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                Route
              </p>
              <p className="text-sm font-medium text-white">{route.routeLabel}</p>
            </div>
          </div>

          <div className="mt-5 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceChartRows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                  width={42}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#c084fc"
                  strokeWidth={2.5}
                  fill="url(#priceAreaFill)"
                  activeDot={{ r: 5, fill: "#fbbf24", stroke: "#0b0719", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceChartRows} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  hide
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priceChartRows.map((row) => (
                    <Cell key={row.month} fill={row.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Booking heatmap</p>
              <p className="mt-1 text-xs text-white/55">
                Lower colors suggest cheaper timing windows.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#100b21] px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">
                Cheapest pattern
              </p>
              <p className="text-sm font-medium text-white">
                {insights.summary.lowestHeatmapCell}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {heatmapGroups.map((group) => (
              <div key={group.group}>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                  {group.group}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {group.cells.map((cell) => (
                    <div
                      key={cell.key}
                      className={`rounded-2xl border p-3 ${LEVEL_STYLES[cell.level]}`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.12em] opacity-75">
                        {cell.day}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {cell.priceLabel}
                      </p>
                      <p className="mt-1 text-[11px] opacity-75">
                        {cell.level === "low"
                          ? "Lower fare window"
                          : cell.level === "mid"
                            ? "Mid-range timing"
                            : "Higher fare window"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
              Low
            </span>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
              Mid
            </span>
            <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs text-rose-100">
              High
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
