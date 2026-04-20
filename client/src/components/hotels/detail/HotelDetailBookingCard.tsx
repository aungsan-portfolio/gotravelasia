import type { HotelResult } from "@shared/hotels/types";

interface HotelDetailBookingCardProps {
  hotel: HotelResult;
}

export function HotelDetailBookingCard({ hotel }: HotelDetailBookingCardProps) {
  const agodaUrl = hotel.outboundLinks?.agoda;

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Ready to book?</h2>
      <p className="mt-1 text-sm text-slate-600">You&apos;ll complete your booking on Agoda.</p>

      {agodaUrl ? (
        <a
          href={agodaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Book on Agoda
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center rounded-md bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
        >
          Agoda link unavailable
        </button>
      )}
    </aside>
  );
}
