import { getCityBySlug } from './cities';
import { HOTEL_SORTS, type HotelSearchParams, type HotelSort } from './types';

const DAY_MS = 86_400_000;
const DEFAULT_ADULTS = 2;
const DEFAULT_ROOMS = 1;
const DEFAULT_PAGE = 1;
const DEFAULT_SORT: HotelSort = 'rank';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function defaultHotelDates(now = new Date()) {
  const base = new Date(now);
  const checkInDate = new Date(base.getTime() + DAY_MS);
  const checkOutDate = new Date(base.getTime() + DAY_MS * 4);
  return { checkIn: formatDate(checkInDate), checkOut: formatDate(checkOutDate) };
}

function clampInt(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());
}

export function normalizeHotelSearchParams(input: Partial<Record<keyof HotelSearchParams, unknown>> & Record<string, unknown>): HotelSearchParams {
  const defaults = defaultHotelDates();
  const fallbackCity = getCityBySlug(String(input.city ?? ''))?.slug ?? 'yangon';

  const checkIn = typeof input.checkIn === 'string' && isIsoDate(input.checkIn) ? input.checkIn : defaults.checkIn;
  let checkOut = typeof input.checkOut === 'string' && isIsoDate(input.checkOut) ? input.checkOut : defaults.checkOut;
  if (new Date(`${checkOut}T00:00:00Z`).getTime() <= new Date(`${checkIn}T00:00:00Z`).getTime()) {
    checkOut = formatDate(new Date(new Date(`${checkIn}T00:00:00Z`).getTime() + DAY_MS));
  }

  const sort = (HOTEL_SORTS as readonly string[]).includes(String(input.sort)) ? (input.sort as HotelSort) : DEFAULT_SORT;

  return {
    city: fallbackCity,
    checkIn,
    checkOut,
    adults: clampInt(input.adults, DEFAULT_ADULTS, 1, 8),
    rooms: clampInt(input.rooms, DEFAULT_ROOMS, 1, 6),
    page: clampInt(input.page, DEFAULT_PAGE, 1, 999),
    sort,
  };
}

export function parseHotelSearchParams(search: string | URLSearchParams | Record<string, unknown>) {
  const record: Record<string, unknown> = {};
  if (typeof search === 'string') {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    params.forEach((value, key) => { record[key] = value; });
  } else if (search instanceof URLSearchParams) {
    search.forEach((value, key) => { record[key] = value; });
  } else {
    Object.assign(record, search);
  }
  return normalizeHotelSearchParams(record);
}

export function buildHotelSearchParams(params: Partial<HotelSearchParams>) {
  const normalized = normalizeHotelSearchParams(params as Record<string, unknown>);
  return new URLSearchParams({
    city: normalized.city,
    checkIn: normalized.checkIn,
    checkOut: normalized.checkOut,
    adults: String(normalized.adults),
    rooms: String(normalized.rooms),
    page: String(normalized.page),
    sort: normalized.sort,
  });
}

export function validateHotelSearchParams(params: HotelSearchParams) {
  const errors: string[] = [];
  if (!getCityBySlug(params.city)?.hasHotels) errors.push('Invalid hotel city.');
  if (!isIsoDate(params.checkIn)) errors.push('Check-in date must be YYYY-MM-DD.');
  if (!isIsoDate(params.checkOut)) errors.push('Check-out date must be YYYY-MM-DD.');
  if (new Date(`${params.checkOut}T00:00:00Z`).getTime() <= new Date(`${params.checkIn}T00:00:00Z`).getTime()) errors.push('Check-out must be after check-in.');
  if (params.adults < 1 || params.adults > 8) errors.push('Adults must be between 1 and 8.');
  if (params.rooms < 1 || params.rooms > 6) errors.push('Rooms must be between 1 and 6.');
  if (params.page < 1) errors.push('Page must be at least 1.');
  if (!(HOTEL_SORTS as readonly string[]).includes(params.sort)) errors.push('Unsupported sort.');
  return { valid: errors.length === 0, errors };
}
