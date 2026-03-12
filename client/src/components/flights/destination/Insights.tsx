// client/src/components/flights/destination/Insights.tsx
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
    })),
  );
}

function buildAdvanceBookingRows(data: DestinationPageVM["insights"]["advanceBooking"]) {
  return data.map((row) => ({
    ...row,
    priceLabel: formatMoney(row.avgPrice),
    daysLabel: `${row.days}d`,
  }));
}

function buildTimeOfDayRows(data: DestinationPageVM["insights"]["timeOfDay"]) {
  const values = data.map((row) => row.avgPrice);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  return data.map((row) => ({
    ...row,
    priceLabel: formatMoney(row.avgPrice),
    fill:
      row.avgPrice === minValue
        ? BAR_COLORS.cheapest
        : row.avgPrice === maxValue
          ? BAR_COLORS.priciest
          : BAR_COLORS.normal,
  }));
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
    <div className="rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 shadow-lg">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{priceLabel}</p>
    </div>
  );
}

export default function Insights({ data }: InsightsProps) {
  const { insights, route } = data;

  const priceChartRows = useMemo(
    () => buildChartRows(insights.priceMonths),
    [insights.priceMonths],
  );

  const heatmapCells = useMemo(
    () => flattenHeatmap(insights.heatmap),
    [insights.heatmap],
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

  const advanceBookingRows = useMemo(
    () => buildAdvanceBookingRows(insights.advanceBooking),
    [insights.advanceBooking],
  );

  const timeOfDayRows = useMemo(
    () => buildTimeOfDayRows(insights.timeOfDay),
    [insights.timeOfDay],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.10),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-6 shadow-2xl shadow-slate-950/30 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.30em] text-fuchsia-300/80">
              Insights
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {insights.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {insights.subtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Cheapest month</p>
              <p className="mt-2 text-xl font-semibold text-amber-300">
                {insights.summary.cheapestMonth}
              </p>
              <p className="mt-1 text-sm text-white/55">
                {insights.summary.cheapestMonthLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Priciest month</p>
              <p className="mt-2 text-xl font-semibold text-fuchsia-300">
                {insights.summary.priciestMonth}
              </p>
              <p className="mt-1 text-sm text-white/55">
                {insights.summary.priciestMonthLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Lowest demand cell</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {insights.summary.lowestHeatmapCell}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Highest demand cell</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {insights.summary.highestHeatmapCell}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Monthly fare trend</h3>
              <p className="mt-1 text-sm text-white/50">
                {route.origin.city} to {route.destination.city} seasonality view.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceChartRows}>
                  <defs>
                    <linearGradient id="monthlyFareFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
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
                    fill="url(#monthlyFareFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Days before departure</h3>
              <p className="mt-1 text-sm text-white/50">
                Lower points suggest better booking windows before takeoff.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={advanceBookingRows}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="daysLabel"
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
                  <Line
                    type="monotone"
                    dataKey="avgPrice"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#fbbf24", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#fde68a", stroke: "#fbbf24", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Booking heatmap</h3>
              <p className="mt-1 text-sm text-white/50">
                Lower colors suggest cheaper timing windows.
              </p>
            </div>

            <div className="space-y-4">
              {heatmapGroups.map((group) => (
                <div key={group.group}>
                  <p className="mb-3 text-xs uppercase tracking-[0.24em] text-white/40">
                    {group.group}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {group.cells.map((cell) => (
                      <div
                        key={cell.key}
                        className={[
                          "rounded-2xl border p-3",
                          LEVEL_STYLES[cell.level],
                        ].join(" ")}
                      >
                        <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                          {cell.day}
                        </p>
                        <p className="mt-2 text-lg font-semibold">{cell.priceLabel}</p>
                        <p className="mt-1 text-xs opacity-80">
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

            <div className="mt-5 flex items-center gap-4 text-xs text-white/45">
              <span>Low</span>
              <span>Mid</span>
              <span>High</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">Time of day</h3>
              <p className="mt-1 text-sm text-white/50">
                Compare average fares by departure period.
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeOfDayRows} layout="vertical" margin={{ left: 8, right: 8 }}>
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
                    dataKey="slot"
                    tick={{ fill: "rgba(255,255,255,0.70)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                    width={84}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="avgPrice" radius={[0, 10, 10, 0]}>
                    {timeOfDayRows.map((row) => (
                      <Cell key={row.slot} fill={row.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
