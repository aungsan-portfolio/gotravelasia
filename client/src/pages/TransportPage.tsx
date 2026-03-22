/**
 * client/src/pages/TransportPage.tsx
 * Step 3 — Transport Integration
 */
import { useState }      from 'react';
import { Link }          from 'wouter';
import TwelveGoWidget    from '../components/TwelveGoWidget';
import { dateOffset }    from '../lib/twelveGo';
import { FeaturedTrainCard } from '../components/FeaturedTrainCard';

type TransportType = 'all' | 'train' | 'bus' | 'ferry' | 'flight';

const TABS: { id: TransportType; label: string; icon: string }[] = [
  { id:'all',    label:'All',               icon:'🗺️' },
  { id:'train',  label:'Train',             icon:'🚆' },
  { id:'bus',    label:'Bus',               icon:'🚌' },
  { id:'ferry',  label:'Ferry',             icon:'⛴️' },
  { id:'flight', label:'Regional Flights',  icon:'✈️' },
];

// Popular routes removed due to data inaccuracy
export default function TransportPage() {
  const today   = new Date().toISOString().split('T')[0];
  const defDate = dateOffset(7);

  const [tab,    setTab]    = useState<TransportType>('all');
  const [from,   setFrom]   = useState('');
  const [to,     setTo]     = useState('');
  const [date,   setDate]   = useState('');
  const [wKey,   setWKey]   = useState(0);
  const [wFrom,  setWFrom]  = useState('');
  const [wTo,    setWTo]    = useState('');
  const [wDate,  setWDate]  = useState('');
  const [wType,  setWType]  = useState<TransportType>('all');

  const fire = (f: string, t: string, d: string, ty: TransportType) => {
    setWFrom(f); setWTo(t); setWDate(d || defDate); setWType(ty);
    setWKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative bg-navy py-14 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background:'radial-gradient(ellipse 50% 45% at 5% 70%,rgba(29,158,117,.14) 0%,transparent 70%),radial-gradient(ellipse 40% 35% at 90% 20%,rgba(245,200,66,.06) 0%,transparent 70%)'
        }} />
        <div className="relative max-w-6xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 text-[#1D9E75] text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full mb-5 border"
            style={{ background:'rgba(29,158,117,.1)', borderColor:'rgba(29,158,117,.3)' }}>
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
            50,000+ ROUTES · TRAINS · BUS · FERRY
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-white mb-3">
            Trains, Bus &amp; Ferry<br />
            <span className="text-gold">across Asia</span>
          </h1>
          <p className="text-white/65 text-base mb-7">
            Powered by 12Go · Myanmar cross-border, Thailand, Japan &amp; SEA
          </p>

          {/* Transport tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all cursor-pointer
                  ${tab === t.id
                    ? 'bg-gold/10 border-gold text-gold'
                    : 'bg-white/5 border-white/10 text-white/65 hover:border-gold/30 hover:text-white'
                  }`}>
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Quick search */}
          <form onSubmit={e => { e.preventDefault(); fire(from, to, date, tab); }}
            className="flex flex-wrap justify-center items-center gap-2 max-w-3xl mx-auto">
            <input className="field-dark flex-1 min-w-[140px]" placeholder="From (e.g. Bangkok)"
              value={from} onChange={e => setFrom(e.target.value)} />
            <button type="button" onClick={() => { setFrom(to); setTo(from); }}
              className="w-10 h-10 rounded-full bg-white/8 border border-white/15 text-gold text-lg flex items-center justify-center hover:bg-gold/15 transition-all cursor-pointer flex-shrink-0">
              ⇄
            </button>
            <input className="field-dark flex-1 min-w-[140px]" placeholder="To (e.g. Chiang Mai)"
              value={to} onChange={e => setTo(e.target.value)} />
            <input type="date" className="field-dark" value={date} min={today}
              onChange={e => setDate(e.target.value)} />
            <button type="submit"
              className="bg-orange-brand hover:bg-orange-brand-hover text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── 12Go Widget ───────────────────────────────── */}
      <section className="px-6 pt-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/40">
            Powered by <span className="text-[#00b14f] font-bold">12Go</span>
          </span>
          <a href="https://gotravelasia.12go.asia" target="_blank" rel="noopener noreferrer"
            className="text-xs text-gold/70 border border-gold/20 px-3 py-1 rounded-lg hover:bg-gold/8 transition-all">
            Open full site →
          </a>
        </div>
        <TwelveGoWidget key={wKey} from={wFrom} to={wTo}
          date={wDate || defDate} transport={wType === 'all' ? '' : wType} minHeight={680} />
      </section>


      {/* ── Featured Journey ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10 border-t border-white/5">
        <h2 className="text-xl font-bold font-display text-white mb-5">Featured Route</h2>
        <FeaturedTrainCard from="Bangkok" to="Chiang Mai" />
      </section>

      {/* ── SEO + cross-links ──────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16 pt-6 border-t border-white/5">
        <p className="text-sm text-white/40 leading-relaxed max-w-2xl mb-5">
          GoTravel Asia partners with 12Go to bring you trains, buses, ferries and regional flights
          across Southeast Asia. Book Yangon to Bangkok bus, Bangkok to Chiang Mai train,
          Tokyo to Osaka Shinkansen, or Phuket to Koh Phi Phi ferry — all in one place.
        </p>
        <div className="flex flex-wrap gap-2">
          {[['Hotels', '/hotels'], ['Flights', '/flights'], ['Activities', '/activities']].map(([l, h]) => (
            <Link key={l} href={h}
              className="text-xs text-gold/70 border border-gold/20 px-4 py-1.5 rounded-full hover:bg-gold/8 transition-all">
              Also see: {l} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
