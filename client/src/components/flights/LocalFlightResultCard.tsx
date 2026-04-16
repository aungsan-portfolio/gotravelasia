import { Clock3, Plane } from "lucide-react";
import type { Flight, FlightLeg } from "@shared/flights/types";
import { B } from "./flightWidget.data";

interface LocalFlightResultCardProps {
  flight: Flight;
  index: number;
}

export function LocalFlightResultCard({ flight, index }: LocalFlightResultCardProps) {
  const outboundRoute = formatRoute(flight.outbound);
  const returnRoute = flight.return ? formatRoute(flight.return) : null;
  const totalMinutes = flight.outbound.totalDurationMinutes + (flight.return?.totalDurationMinutes ?? 0);

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
          <span className="text-white/80 text-sm font-medium">Source: {flight.sourceType ?? "amadeus"}</span>
          <span className="text-white text-sm">| Stops: {flight.totalStops}</span>
        </div>

        <div className="text-sm font-semibold text-white truncate">
          {outboundRoute}
          {returnRoute ? <span className="text-white/70"> • {returnRoute}</span> : null}
        </div>

        <div className="text-xs text-white/60 flex items-center gap-1">
          <Clock3 className="w-3.5 h-3.5" />
          {formatDuration(totalMinutes)}
        </div>

        <div className="text-xs text-white/50 font-mono w-48 truncate" title={flight.id}>
          ID: {flight.id}
        </div>
      </div>

      <div className="flex flex-col md:items-end text-left md:text-right">
        <div className="text-xl font-black" style={{ color: "#a0f0b0" }}>
          {flight.price.total} {flight.price.currency}
        </div>
        <div className="text-xs font-bold flex items-center gap-1" style={{ color: B.gold }}>
          <Plane className="w-3.5 h-3.5" />
          Protected fare
        </div>
      </div>
    </div>
  );
}

function formatRoute(leg: FlightLeg): string {
  const first = leg.segments[0]?.departure.airport.iataCode ?? "---";
  const last = leg.segments[leg.segments.length - 1]?.arrival.airport.iataCode ?? "---";
  return `${first} → ${last}`;
}

function formatDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "Duration unavailable";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m total`;
}
