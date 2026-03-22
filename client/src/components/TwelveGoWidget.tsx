/**
 * client/src/components/TwelveGoWidget.tsx
 * Step 3 — Transport Integration (12Go)
 */
import { useEffect, useRef, useState } from 'react';
import { twelveGoUrl, type TwelveGoParams } from '../lib/twelveGo';

interface Props extends TwelveGoParams {
  minHeight?: number;
  className?: string;
}

export default function TwelveGoWidget({
  from, to, date, transport, passengers = 1,
  minHeight = 660, className = '',
}: Props) {
  const iframeRef            = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded]  = useState(false);
  const [height, setHeight]  = useState(minHeight);

  // Route via local html script-wrapper to bypass White Label X-Frame-Options
  const src = `/12go-widget.html?from=${encodeURIComponent(from||'')}&to=${encodeURIComponent(to||'')}&date=${encodeURIComponent(date||'')}&height=${minHeight}`;

  // postMessage auto-resize
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!String(e.origin).includes('12go.asia')) return;
      const d = e.data as { type?: string; height?: number } | number;
      if (typeof d === 'object' && d?.type === 'resize' && d?.height)
        setHeight(h => Math.max(minHeight, d.height! + 40, h));
      if (typeof d === 'number' && d > 100)
        setHeight(h => Math.max(minHeight, d + 40, h));
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [minHeight]);

  // Fallback poll (same-origin 12go.asia subdomain)
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      try {
        const body = iframeRef.current?.contentDocument?.body;
        if (body?.scrollHeight && body.scrollHeight > 100)
          setHeight(h => Math.max(minHeight, body.scrollHeight + 40, h));
      } catch { /* cross-origin — postMessage handles it */ }
    }, 900);
    return () => clearInterval(id);
  }, [loaded, minHeight]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-navy-2 ${className}`}>
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 flex flex-col gap-5 p-6" style={{ minHeight }}>
          <div className="flex items-center gap-3 glass-card rounded-2xl px-5 py-4">
            <div className="flex-1 h-9 rounded-lg animate-shimmer" />
            <span className="text-gold text-xl flex-shrink-0">⇄</span>
            <div className="flex-1 h-9 rounded-lg animate-shimmer" />
            <div className="w-32 h-9 rounded-lg animate-shimmer" />
            <div className="w-28 h-10 rounded-xl animate-shimmer opacity-60" style={{ background: 'rgba(255,107,43,.35)' }} />
          </div>
          {[80, 60, 75, 50].map((w, i) => (
            <div key={i} className="flex items-center gap-4 border border-white/[0.06] rounded-xl px-4 py-4" style={{ background: 'rgba(255,255,255,.025)' }}>
              <div className="h-3 rounded animate-shimmer" style={{ width: `${w * 0.4}%` }} />
              <div className="flex-1 h-3 rounded animate-shimmer" />
              <div className="h-3 rounded animate-shimmer" style={{ width: `${w * 0.2}%` }} />
            </div>
          ))}
          <div className="flex items-center justify-center gap-3 mt-auto text-white/35 text-sm">
            <div className="w-5 h-5 border-2 border-white/15 border-t-gold rounded-full animate-spin" />
            Loading transport search…
          </div>
        </div>
      )}

      {/* iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        width="100%"
        height={height}
        frameBorder={0}
        scrolling="no"
        allow="payment"
        title="GoTravel Transport Search — 12Go"
        onLoad={() => setLoaded(true)}
        style={{
          display: 'block',
          border: 'none',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />
    </div>
  );
}
