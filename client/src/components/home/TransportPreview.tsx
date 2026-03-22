/**
 * client/src/components/home/TransportPreview.tsx
 * =================================================
 * ADD-ON: Popular destinations grid အောက်မှာ ဒါ ထည့်
 *
 * Usage in Home.tsx:
 *   import TransportPreview from '../components/home/TransportPreview';
 *
 *   // Popular destinations section အောက်မှာ ထည့်
 *   <TransportPreview />
 */

import { Link } from 'wouter';

const ROUTES = [
  { from: 'Yangon',       to: 'Bangkok',         type: 'Bus',   flag: '🇲🇲→🇹🇭' },
  { from: 'Bangkok',      to: 'Chiang Mai',       type: 'Train', flag: '🇹🇭'     },
  { from: 'Kuala Lumpur', to: 'Singapore',        type: 'Bus',   flag: '🇲🇾→🇸🇬' },
  { from: 'Tokyo',        to: 'Osaka',            type: 'Train', flag: '🇯🇵'     },
  { from: 'Phuket',       to: 'Koh Phi Phi',      type: 'Ferry', flag: '🇹🇭'     },
  { from: 'Hanoi',        to: 'Ho Chi Minh City', type: 'Train', flag: '🇻🇳'     },
] as const;

type TransportType = 'Train' | 'Bus' | 'Ferry';

const TYPE_STYLE: Record<TransportType, { color: string; bg: string }> = {
  Train: { color: '#1D9E75', bg: 'rgba(29,158,117,.12)'  },
  Bus:   { color: '#BA7517', bg: 'rgba(186,117,23,.12)'  },
  Ferry: { color: '#185FA5', bg: 'rgba(24,95,165,.12)'   },
};

export default function TransportPreview() {
  return (
    <section className="border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2
              className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              🚆 Trains · Bus · Ferry
            </h2>
            <p className="text-white/45 text-sm">
              Book transport across Asia — powered by{' '}
              <span className="text-[#00b14f] font-semibold">12Go</span>
            </p>
          </div>
          <Link
            href="/transport"
            className="flex-shrink-0 inline-flex items-center gap-2 border font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            style={{
              background:   'rgba(29,158,117,.12)',
              borderColor:  'rgba(29,158,117,.3)',
              color:        '#1D9E75',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(29,158,117,.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(29,158,117,.12)')}
          >
            Search all routes →
          </Link>
        </div>

        {/* Route cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {ROUTES.map((r, i) => {
            const s = TYPE_STYLE[r.type];
            return (
              <Link
                key={i}
                href="/transport"
                className="flex flex-col gap-2 bg-[#1a1730] border border-white/8 rounded-xl p-3.5 hover:border-[#1D9E75]/30 hover:-translate-y-0.5 transition-all"
              >
                <span className="text-xl">{r.flag}</span>
                <div className="text-[12px] font-semibold text-white leading-snug">
                  {r.from}
                  <br />
                  <span className="text-white/40 font-normal">→</span> {r.to}
                </div>
                <span
                  className="text-[10px] font-semibold self-start px-2 py-0.5 rounded-full"
                  style={{ color: s.color, background: s.bg }}
                >
                  {r.type}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Full search CTA */}
        <Link
          href="/transport"
          className="mt-5 flex items-center justify-center gap-2 w-full border rounded-xl py-3 text-sm font-semibold transition-all"
          style={{
            background:  'rgba(29,158,117,.08)',
            borderColor: 'rgba(29,158,117,.25)',
            color:       '#1D9E75',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(29,158,117,.16)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(29,158,117,.08)')}
        >
          Open full transport search — trains, buses &amp; ferries →
        </Link>
      </div>
    </section>
  );
}
