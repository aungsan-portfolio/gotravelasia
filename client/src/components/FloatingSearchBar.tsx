import { useState, useEffect } from "react";
import { Plane, Search, ChevronDown } from "lucide-react";

const AFFILIATE_MARKER = "697202";

const POPULAR_ROUTES = [
  { label: "Yangon → Bangkok", origin: "RGN", dest: "BKK" },
  { label: "Yangon → Singapore", origin: "RGN", dest: "SIN" },
  { label: "Yangon → Chiang Mai", origin: "RGN", dest: "CNX" },
  { label: "Yangon → Phuket", origin: "RGN", dest: "HKT" },
  { label: "Mandalay → Bangkok", origin: "MDL", dest: "BKK" },
  { label: "Yangon → KL", origin: "RGN", dest: "KUL" },
];

export default function FloatingSearchBar() {
  const [visible, setVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = () => {
    const route = POPULAR_ROUTES[selectedRoute];
    const searchDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    const targetUrl = `https://www.aviasales.com/search?origin_iata=${route.origin}&destination_iata=${route.dest}&depart_date=${searchDate}&one_way=true&adults=1&locale=en&currency=USD`;
    const url = `https://tp.media/r?marker=${AFFILIATE_MARKER}&p=4114&u=${encodeURIComponent(targetUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!visible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="container py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary flex-shrink-0">
            <Plane className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wide hidden sm:inline">Quick Search</span>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(Number(e.target.value))}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary outline-none min-h-[40px]"
              >
                {POPULAR_ROUTES.map((r, i) => (
                  <option key={i} value={i}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors min-h-[40px] flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          <a
            href="https://www.agoda.com/city/bangkok-th.html?cid=1959281"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            🏨 Hotels
          </a>
          <a
            href="https://12go.asia/en/travel/bangkok/chiang-mai?referer=14566451&z=14566451&sub_id=floating_bar"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            🚌 Transport
          </a>
        </div>
      </div>
    </div>
  );
}
