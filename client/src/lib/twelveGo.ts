/**
 * client/src/lib/twelveGo.ts
 */
export const WL_BASE = 'https://gotravelasia.12go.asia';

export interface TwelveGoParams {
  from?:       string;
  to?:         string;
  date?:       string;
  transport?:  'train' | 'bus' | 'ferry' | 'flight' | '';
  passengers?: number;
}

export function twelveGoUrl(opts: TwelveGoParams): string {
  const p = new URLSearchParams();
  if (opts.from)                      p.set('from',       opts.from);
  if (opts.to)                        p.set('to',         opts.to);
  if (opts.date)                      p.set('date',       opts.date);
  if (opts.transport)                 p.set('transport',  opts.transport);
  if (opts.passengers && opts.passengers > 1) p.set('passengers', String(opts.passengers));
  const qs = p.toString();
  return qs ? `${WL_BASE}?${qs}` : WL_BASE;
}

export const dateOffset = (days: number): string =>
  new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];
