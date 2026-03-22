/**
 * client/src/components/TwelveGoWidget.tsx
 * ==========================================
 * 12Go White Label iframe — Vite + React + TypeScript
 */

import { useEffect, useRef, useState } from 'react';
import { twelveGoUrl, type TwelveGoParams } from '../lib/twelveGo';

interface Props extends TwelveGoParams {
  minHeight?: number;
  className?: string;
}

export default function TwelveGoWidget({
  from,
  to,
  date,
  transport,
  passengers = 1,
  minHeight  = 660,
  className  = '',
}: Props) {
  const iframeRef            = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded]  = useState(false);
  const [height, setHeight]  = useState(minHeight);

  const src = twelveGoUrl({ from, to, date, transport, passengers });

  // ── postMessage resize (12Go sends this) ──────────────
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!String(event.origin).includes('12go.asia')) return;
      
      const d = event.data;
      
      // Handle different message formats from 12Go
      if (typeof d === 'object' && d?.type === 'resize' && d?.height) {
        setHeight(Math.max(minHeight, d.height + 40));
      } else if (typeof d === 'number' && d > 100) {
        setHeight(Math.max(minHeight, d + 40));
      }
    };
    
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [minHeight]);

  // ── Fallback: poll iframe body height (only if same-origin, which it isn't, but kept for logic) ──
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      try {
        const body = iframeRef.current?.contentDocument?.body;
        if (body?.scrollHeight && body.scrollHeight > 100) {
          setHeight(h => Math.max(minHeight, body.scrollHeight + 40, h));
        }
      } catch {
        // cross-origin — rely on postMessage
      }
    }, 900);
    return () => clearInterval(id);
  }, [loaded, minHeight]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-[#13102a] ${className}`}>
      {/* ── Loading skeleton ─────────────────────────── */}
      {!loaded && (
        <div
          className="absolute inset-0 flex flex-col gap-5 p-6"
          style={{ minHeight }}
        >
          {/* Search bar skeleton */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
            <div className="flex-1 h-9 rounded-lg animate-shimmer" />
            <span className="text-yellow-400 text-lg flex-shrink-0">⇄</span>
            <div className="flex-1 h-9 rounded-lg animate-shimmer" />
            <div className="w-32 h-9 rounded-lg animate-shimmer" />
            <div className="w-28 h-10 rounded-xl bg-orange-500/40 animate-shimmer" />
          </div>
          {/* Result rows skeleton */}
          {[80, 60, 75, 55].map((w, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-4">
              <div className="h-3 rounded animate-shimmer" style={{ width: `${w * 0.4}%` }} />
              <div className="h-3 rounded animate-shimmer flex-1" />
              <div className="h-3 rounded animate-shimmer" style={{ width: `${w * 0.2}%` }} />
            </div>
          ))}
          <div className="flex items-center justify-center gap-3 mt-auto text-white/35 text-sm">
            <div className="w-5 h-5 border-2 border-white/15 border-t-yellow-400 rounded-full animate-spin" />
            Loading transport search…
          </div>
        </div>
      )}

      {/* ── 12Go iframe ──────────────────────────────── */}
      <iframe
        ref={iframeRef}
        src={src}
        width="100%"
        height={height}
        frameBorder={0}
        scrolling="no"
        allow="payment"
        title="Transport Search — GoTravel Asia (12Go)"
        onLoad={() => setLoaded(true)}
        style={{
          display:    'block',
          border:     'none',
          opacity:    loaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />
    </div>
  );
}
