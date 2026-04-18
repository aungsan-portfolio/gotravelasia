const MS_PER_DAY = 86_400_000;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIsoLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function addDays(baseDate: Date, days: number): Date {
  return new Date(baseDate.getTime() + days * MS_PER_DAY);
}

export function defaultHotelFrontDoorDates(baseDate = new Date()) {
  return {
    checkIn: formatLocalDate(addDays(baseDate, 1)),
    checkOut: formatLocalDate(addDays(baseDate, 4)),
  };
}

export function isAfterIsoDate(left: string, right: string) {
  return left > right;
}
