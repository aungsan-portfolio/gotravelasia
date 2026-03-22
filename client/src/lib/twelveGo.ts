/**
 * client/src/lib/twelveGo.ts
 * 12Go White Label URL builder — TypeScript
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
  const params = new URLSearchParams();
  if (opts.from)                 params.set('from',       opts.from);
  if (opts.to)                   params.set('to',         opts.to);
  if (opts.date)                 params.set('date',       opts.date);
  if (opts.transport)            params.set('transport',  opts.transport);
  if (opts.passengers && opts.passengers > 1) params.set('passengers', String(opts.passengers));
  const qs = params.toString();
  return qs ? `${WL_BASE}?${qs}` : WL_BASE;
}

/** Offset date helper */
export const dateOffset = (days: number): string =>
  new Date(Date.now() + days * 86_400_000).toISOString().split('T')[0];
