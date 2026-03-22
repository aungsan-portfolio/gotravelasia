/**
 * client/src/pages/TransportPage.tsx
 * =====================================
 * GoTravel Asia — Trains · Bus · Ferry
 * Stack: Vite + React + TypeScript + wouter
 */

import { useState } from 'react';
import { Link } from 'wouter';
import TwelveGoWidget from '../components/TwelveGoWidget';
import { dateOffset } from '../lib/twelveGo';

// ── Types ─────────────────────────────────────────────────────────
type TransportType = 'all' | 'train' | 'bus' | 'ferry' | 'flight';

interface Route {
  from:  string;
  to:    string;
  type:  Exclude<TransportType, 'all'>;
  flag:  string;
  hot:   boolean;
}

interface TypeMeta {
  label: string;
  color: string;
  bg:    string;
}

// ── Constants ─────────────────────────────────────────────────────
const TRANSPORT_TABS: { id: TransportType; label: string; icon: string }[] = [
  { id: 'all',    label: 'All',              icon: '🗺️' },
  { id: 'train',  label: 'Train',            icon: '🚆' },
  { id: 'bus',    label: 'Bus',              icon: '🚌' },
  { id: 'ferry',  label: 'Ferry',            icon: '⛴️' },
  { id: 'flight', label: 'Flights (Regional)', icon: '✈️' },
];

const POPULAR_ROUTES: Route[] = [
  // Myanmar cross-border
  { from: 'Yangon',      to: 'Bangkok',       type: 'bus',   flag: '🇲🇲→🇹🇭', hot: true  },
  { from: 'Mandalay',    to: 'Bangkok',       type: 'bus',   flag: '🇲🇲→🇹🇭', hot: true  },
  { from: 'Yangon',      to: 'Mandalay',      type: 'train', flag: '🇲🇲',     hot: true  },
  // Thailand domestic
  { from: 'Bangkok',     to: 'Chiang Mai',    type: 'train', flag: '🇹🇭',     hot: true  },
  { from: 'Bangkok',     to: 'Chiang Mai',    type: 'bus',   flag: '🇹🇭',     hot: false },
  { from: 'Bangkok',     to: 'Phuket',        type: 'bus',   flag: '🇹🇭',     hot: false },
  { from: 'Bangkok',     to: 'Krabi',         type: 'bus',   flag: '🇹🇭',     hot: false },
  // Thailand ferries
  { from: 'Phuket',      to: 'Koh Phi Phi',   type: 'ferry', flag: '🇹🇭',     hot: true  },
  { from: 'Surat Thani', to: 'Koh Samui',     type: 'ferry', flag: '🇹🇭',     hot: true  },
  { from: 'Surat Thani', to: 'Koh Tao',       type: 'ferry', flag: '🇹🇭',     hot: false },
  // Vietnam
  { from: 'Hanoi',       to: 'Ho Chi Minh City', type: 'train', flag: '🇻🇳',  hot: true  },
  { from: 'Hanoi',       to: 'Da Nang',       type: 'train', flag: '🇻🇳',     hot: false },
  // Malaysia → Singapore
  { from: 'Kuala Lumpur',to: 'Singapore',     type: 'bus',   flag: '🇲🇾→🇸🇬', hot: true  },
  // Cambodia
  { from: 'Bangkok',     to: 'Siem Reap',     type: 'bus',   flag: '🇹🇭→🇰🇭', hot: true  },
  { from: 'Bangkok',     to: 'Phnom Penh',    type: 'bus',   flag: '🇹🇭→🇰🇭', hot: false },
  // Indonesia
  { from: 'Bali',        to: 'Gili Islands',  type: 'ferry', flag: '🇮🇩',     hot: true  },
  // Japan Shinkansen
  { from: 'Tokyo',       to: 'Osaka',         type: 'train', flag: '🇯🇵',     hot: true  },
  { from: 'Tokyo',       to: 'Kyoto',         type: 'train', flag: '🇯🇵',     hot: false },
];

const TYPE_META: Record<Exclude<TransportType, 'all'>, TypeMeta> = {
  train:  { label: 'Train',  color: '#1D9E75', bg: 'rgba(29,158,117,0.12)'  },
  bus:    { label: 'Bus',    color: '#BA7517', bg: 'rgba(186,117,23,0.12)'  },
  ferry:  { label: 'Ferry',  color: '#185FA5', bg: 'rgba(24,95,165,0.12)'   },
  flight: { label: 'Flight', color: '#7c5cbf', bg: 'rgba(124,92,191,0.12)'  },
};

// ── Component ─────────────────────────────────────────────────────
export default function TransportPage() {
  const today   = new Date().toISOString().split('T')[0];
  const defDate = dateOffset(7);

  // form state
  const [activeTab, setActiveTab] = useState<TransportType>('all');
  const [from,      setFrom]      = useState('');
  const [to,        setTo]        = useState('');
  const [date,      setDate]      = useState('');

  // widget state
  const [wKey,   setWKey]   = useState(0);
  const [wFrom,  setWFrom]  = useState('');
  const [wTo,    setWTo]    = useState('');
  const [wDate,  setWDate]  = useState('');
  const [wType,  setWType]  = useState<TransportType>('all');

  const fireWidget = (f: string, t: string, d: string, type: TransportType) => {
    setWFrom(f); setWTo(t); setWDate(d || defDate); setWType(type);
    setWKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fireWidget(from, to, date, activeTab);
  };

  const handleRouteClick = (r: Route) => {
    setFrom(r.from); setTo(r.to);
    setActiveTab(r.type);
    fireWidget(r.from, r.to, date, r.type);
  };

  const filteredRoutes = activeTab === 'all'
    ? POPULAR_ROUTES
    : POPULAR_ROUTES.filter(r => r.type === activeTab);

  return (
    <div className="min-h-screen bg-[#0d0b1e]">
      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative py-14 px-6 overflow-hidden">
        {/* bg glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 45% at 5% 70%,rgba(29,158,117,.14) 0%,transparent 70%),radial-gradient(ellipse 40% 35% at 90% 20%,rgba(245,200,66,.06) 0%,transparent 70%)' }}
        />
        <div className="relative max-w-6xl mx-auto text-center">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-[#1D9E75]/10 border border-[#1D9E75]/30 text-[#1D9E75] text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
            50,000+ ROUTES · TRAINS · BUS · FERRY
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-white mb-3">
            Trains, Bus &amp; Ferry<br />
            <span className="text-yellow-400">across Asia</span>
          </h1>
          <p className="text-white/65 text-base mb-7">
            Powered by 12Go · Myanmar cross-border, Thailand, Japan &amp; SEA
          </p>

          {/* Transport type tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {TRANSPORT_TABS.map(t => (
              <button key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all cursor-pointer
                  ${activeTab === t.id
                    ? 'bg-yellow-400/12 border-yellow-400 text-yellow-400'
                    : 'bg-white/5 border-white/10 text-white/65 hover:border-yellow-400/30 hover:text-white'
                  }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Quick search */}
          <form onSubmit={handleSearch}
            className="flex flex-wrap justify-center items-center gap-2 max-w-3xl mx-auto">
            <input
              className="flex-1 min-w-[140px] bg-white/7 border border-white/12 rounded-xl text-white placeholder-white/35 px-4 py-2.5 text-sm outline-none focus:border-yellow-400/50"
              placeholder="From (e.g. Bangkok)"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
            <button type="button"
              onClick={() => { setFrom(to); setTo(from); }}
              className="w-10 h-10 rounded-full bg-white/8 border border-white/15 text-yellow-400 text-lg flex items-center justify-center hover:bg-yellow-400/15 transition-all cursor-pointer flex-shrink-0">
              ⇄
            </button>
            <input
              className="flex-1 min-w-[140px] bg-white/7 border border-white/12 rounded-xl text-white placeholder-white/35 px-4 py-2.5 text-sm outline-none focus:border-yellow-400/50"
              placeholder="To (e.g. Chiang Mai)"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
            <input
              type="date"
              className="bg-white/7 border border-white/12 rounded-xl text-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400/50"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
            />
            <button type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── 12Go Widget ─────────────────────────────── */}
      <section className="px-6 pt-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/40">
            Powered by <span className="text-[#00b14f] font-bold">12Go</span>
          </span>
          <a href="https://gotravelasia.12go.asia" target="_blank" rel="noopener noreferrer"
            className="text-xs text-yellow-400/70 border border-yellow-400/20 px-3 py-1 rounded-lg hover:bg-yellow-400/8 transition-all">
            Open full site →
          </a>
        </div>

        <TwelveGoWidget
          key={wKey}
          from={wFrom}
          to={wTo}
          date={wDate || defDate}
          transport={wType === 'all' ? '' : wType}
          minHeight={680}
        />
      </section>

      {/* ── Popular Routes ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10 border-t border-white/5">
        <h2 className="text-xl font-bold text-white font-display mb-5">Popular routes</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredRoutes.map((r, i) => {
            const meta = TYPE_META[r.type];
            return (
              <button key={i}
                onClick={() => handleRouteClick(r)}
                className={`relative text-left bg-[#1a1730] rounded-xl p-3.5 border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,.4)]
                  ${r.hot
                    ? 'border-[#1D9E75]/20 hover:border-yellow-400/25'
                    : 'border-white/8 hover:border-white/18'
                  }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="text-lg mb-2">{r.flag}</div>
                <div className="flex items-center gap-1 flex-wrap mb-2">
                  <span className="text-[13px] font-semibold text-white">{r.from}</span>
                  <span className="text-[11px] text-white/40">→</span>
                  <span className="text-[13px] font-semibold text-white">{r.to}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: meta.color, background: meta.bg }}>
                  {meta.label}
                </span>
                {r.hot && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold bg-[#1D9E75]/18 text-[#1D9E75] px-1.5 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── SEO text ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 border-t border-white/5 pt-10">
        <h2 className="text-lg font-bold text-white font-display mb-3">
          Book transport across Asia with GoTravel
        </h2>
        <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
          GoTravel Asia partners with 12Go to bring you trains, buses, ferries and
          regional flights across Southeast Asia. Popular routes include Bangkok to
          Chiang Mai train, Yangon to Bangkok bus, Tokyo to Osaka Shinkansen,
          Kuala Lumpur to Singapore bus, and Phuket to Koh Phi Phi ferry.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {(['Hotels', 'Flights', 'Activities'] as const).map(label => {
            const href = `/${label.toLowerCase()}`;
            return (
              <Link key={label} href={href}
                className="text-xs text-yellow-400/70 border border-yellow-400/20 px-4 py-1.5 rounded-full hover:bg-yellow-400/8 transition-all">
                Also see: {label} →
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
