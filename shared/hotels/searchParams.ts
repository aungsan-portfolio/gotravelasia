import type { HotelSearchParams, HotelSort } from "./types.js";

const MS_PER_DAY = 86_400_000;
const DEFAULT_CITY = 'yangon';
const DEFAULT_ADULTS = 2;
const DEFAULT_ROOMS = 1;
const DEFAULT_PAGE = 1;
const MAX_ADULTS = 8;
const MAX_ROOMS = 5;
const MAX_PAGE = 100;
const MAX_STAY_NIGHTS = 30;

const HOTEL_SORT_VALUES: HotelSort[] = ['best', 'rank', 'price_asc', 'price_desc', 'stars_desc', 'review_desc'];

export function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function defaultHotelDates(baseDate = new Date()) {
  const checkInDate = new Date(baseDate.getTime() + MS_PER_DAY);
  const checkOutDate = new Date(baseDate.getTime() + 4 * MS_PER_DAY);

  return {
    checkIn: toIsoDate(checkInDate),
    checkOut: toIsoDate(checkOutDate),
  };
}

export function validateHotelSearchParams(params: Partial<HotelSearchParams>): string[] {
  const errors: string[] = [];

  if (!params.city) errors.push('City is required.');
  if (!params.checkIn || !isIsoDate(params.checkIn)) errors.push('Check-in date must use YYYY-MM-DD.');
  if (!params.checkOut || !isIsoDate(params.checkOut)) errors.push('Check-out date must use YYYY-MM-DD.');
  if (typeof params.adults !== 'number' || Number.isNaN(params.adults) || params.adults < 1 || params.adults > MAX_ADULTS) {
    errors.push(`Adults must be between 1 and ${MAX_ADULTS}.`);
  }
  if (typeof params.rooms !== 'number' || Number.isNaN(params.rooms) || params.rooms < 1 || params.rooms > MAX_ROOMS) {
    errors.push(`Rooms must be between 1 and ${MAX_ROOMS}.`);
  }
  if (typeof params.page !== 'number' || Number.isNaN(params.page) || params.page < 1 || params.page > MAX_PAGE) {
    errors.push(`Page must be between 1 and ${MAX_PAGE}.`);
  }
  if (params.sort && !HOTEL_SORT_VALUES.includes(params.sort)) {
    errors.push('Sort option is invalid.');
  }

  if (params.checkIn && params.checkOut && isIsoDate(params.checkIn) && isIsoDate(params.checkOut)) {
    const checkInDate = new Date(`${params.checkIn}T00:00:00Z`);
    const checkOutDate = new Date(`${params.checkOut}T00:00:00Z`);
    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / MS_PER_DAY);
    if (nights < 1) errors.push('Check-out must be after check-in.');
    if (nights > MAX_STAY_NIGHTS) errors.push(`Stay length cannot exceed ${MAX_STAY_NIGHTS} nights.`);
  }

  return errors;
}

export function normalizeHotelSearchParams(input: Partial<HotelSearchParams> & { city?: string | null }) : HotelSearchParams {
  const defaults = defaultHotelDates();
  const normalized: HotelSearchParams = {
    city: sanitizeCity(input.city) ?? DEFAULT_CITY,
    checkIn: isIsoDate(input.checkIn) ? input.checkIn : defaults.checkIn,
    checkOut: isIsoDate(input.checkOut) ? input.checkOut : defaults.checkOut,
    adults: clampInteger(input.adults, DEFAULT_ADULTS, 1, MAX_ADULTS),
    rooms: clampInteger(input.rooms, DEFAULT_ROOMS, 1, MAX_ROOMS),
    page: clampInteger(input.page, DEFAULT_PAGE, 1, MAX_PAGE),
    sort: HOTEL_SORT_VALUES.includes(input.sort as HotelSort) ? (input.sort as HotelSort) : 'best',
  };

  const dateErrors = validateHotelSearchParams({
    city: normalized.city,
    checkIn: normalized.checkIn,
    checkOut: normalized.checkOut,
    adults: normalized.adults,
    rooms: normalized.rooms,
    page: normalized.page,
    sort: normalized.sort,
  });

  if (dateErrors.includes('Check-out must be after check-in.')) {
    normalized.checkOut = toIsoDate(new Date(new Date(`${normalized.checkIn}T00:00:00Z`).getTime() + 3 * MS_PER_DAY));
  }

  return normalized;
}

export function parseHotelSearchParams(input: URLSearchParams | string | Record<string, string | string[] | undefined | null>) {
  const searchParams = toURLSearchParams(input);
  return normalizeHotelSearchParams({
    city: searchParams.get('city') ?? undefined,
    checkIn: searchParams.get('checkIn') ?? undefined,
    checkOut: searchParams.get('checkOut') ?? undefined,
    adults: parseOptionalInt(searchParams.get('adults')),
    rooms: parseOptionalInt(searchParams.get('rooms')),
    page: parseOptionalInt(searchParams.get('page')),
    sort: (searchParams.get('sort') as HotelSort | null) ?? undefined,
  });
}

export function buildHotelSearchParams(params: Partial<HotelSearchParams>) {
  const normalized = normalizeHotelSearchParams(params);
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

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'number' ? value : parseOptionalInt(String(value ?? ''));
  if (typeof parsed !== 'number' || Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function parseOptionalInt(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isIsoDate(value?: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function sanitizeCity(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim().toLowerCase();
  return trimmed || undefined;
}

function toURLSearchParams(input: URLSearchParams | string | Record<string, string | string[] | undefined | null>) {
  if (input instanceof URLSearchParams) return input;
  if (typeof input === 'string') return new URLSearchParams(input.startsWith('?') ? input.slice(1) : input);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      if (value[0] != null) params.set(key, value[0]);
    } else if (value != null) {
      params.set(key, value);
    }
  }
  return params;
}
