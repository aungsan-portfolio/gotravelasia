import { Clock3, ShieldAlert } from "lucide-react";
import type { HackerFareCombination } from "@shared/flights/hackerFare";
import { B } from "./flightWidget.data";

interface HackerFareCardProps {
  flight: HackerFareCombination;
  index: number;
}

export function HackerFareCard({ flight, index }: HackerFareCardProps) {
  const totalStops = (flight.outbound.totalStops ?? 0) + (flight.inbound.totalStops ?? 0);
  const outboundLabel = formatSplitRouteLabel(
    flight.outbound.outbound.segments[0]?.departure.airport.iataCode,
    flight.outbound.outbound.segments[flight.outbound.outbound.segments.length - 1]?.arrival.airport.iataCode,
  );
  const inboundLabel = formatSplitRouteLabel(
    flight.inbound.outbound.segments[0]?.departure.airport.iataCode,
    flight.inbound.outbound.segments[flight.inbound.outbound.segments.length - 1]?.arrival.airport.iataCode,
  );

  return (
    <div
      className="p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-white/5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: B.gold, color: B.purpleDeep }}>
            {index === 0 ? "🥇 SmartMix #1" : `#${index + 1}`}
          </span>
          <span className="text-white/80 text-sm font-medium">Source: hacker fare</span>
          <span className="text-white text-sm">| Stops: {totalStops}</span>
        </div>

        <div className="text-sm font-semibold text-white truncate">
          {outboundLabel}
          <span className="text-white/70"> • {inboundLabel}</span>
        </div>

        <div className="text-xs text-white/60 flex items-center gap-1">
          <Clock3 className="w-3.5 h-3.5" />
          {formatDuration(flight.airTravelMinutes)} • Stay {formatDuration(flight.destinationStayMinutes)}
        </div>

        <div className="text-xs text-white/50 font-mono w-48 truncate" title={flight.id}>
          ID: {flight.id}
        </div>
      </div>

      <div className="flex flex-col md:items-end text-left md:text-right">
        <div className="text-xl font-black" style={{ color: "#a0f0b0" }}>
          {flight.totalPrice} USD
        </div>
        <div className="text-xs font-bold flex items-center gap-1" style={{ color: B.gold }}>
          <ShieldAlert className="w-3.5 h-3.5" />
          Risk: {flight.riskLevel}
        </div>
      </div>
    </div>
  );
}

function formatSplitRouteLabel(from?: string, to?: string): string {
  return `${from ?? "---"} → ${to ?? "---"}`;
}

function formatDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "N/A";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}
