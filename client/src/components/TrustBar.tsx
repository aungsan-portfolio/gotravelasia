import { Shield, Clock, Plane, TrendingDown } from "lucide-react";

const STATS = [
  {
    icon: Plane,
    value: "500+",
    label: "Flight Routes",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    value: "6",
    label: "Trusted Partners",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Clock,
    value: "6hr",
    label: "Price Updates",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: TrendingDown,
    value: "0%",
    label: "Markup Fees",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function TrustBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 py-4 md:py-0 px-4 md:px-0 bg-white lg:bg-transparent border-b border-gray-100 lg:border-0">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-white lg:bg-gray-50/80 lg:border lg:border-gray-100"
        >
          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-extrabold text-gray-900 leading-tight">{stat.value}</div>
            <div className="text-xs font-medium text-gray-500 leading-tight">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
