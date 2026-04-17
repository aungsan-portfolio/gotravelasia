import { memo } from "react";
import { Building2, MapPin, Sparkles } from "lucide-react";

interface HotelResultsSummaryRowProps {
  cityName: string;
  totalFound: number;
  mappedCount: number;
}

function HotelResultsSummaryRowComponent({
  cityName,
  totalFound,
  mappedCount,
}: HotelResultsSummaryRowProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Results summary for {cityName}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Quick scan hints help surface value, popularity, and map-ready stays.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
            <Building2 className="h-3.5 w-3.5" />
            {totalFound} visible properties
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
            <MapPin className="h-3.5 w-3.5" />
            {mappedCount} with map pins
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            Lightweight badges enabled
          </span>
        </div>
      </div>
    </section>
  );
}

export const HotelResultsSummaryRow = memo(HotelResultsSummaryRowComponent);
