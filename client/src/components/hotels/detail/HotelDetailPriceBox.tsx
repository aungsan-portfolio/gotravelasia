import { formatStayNights } from "@/lib/hotels/formatters";

interface HotelDetailPriceBoxProps {
  lowestRate: number;
  currency?: string;
  checkIn: string;
  checkOut: string;
}

function formatCurrency(value: number, currency?: string) {
  const safeCurrency = currency && /^[A-Z]{3}$/.test(currency) ? currency : "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

function getNights(checkIn: string, checkOut: string) {
  const checkInDate = new Date(`${checkIn}T00:00:00Z`);
  const checkOutDate = new Date(`${checkOut}T00:00:00Z`);
  const dayMs = 86_400_000;
  const diff = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / dayMs);
  return Number.isFinite(diff) ? Math.max(1, diff) : 1;
}

export function HotelDetailPriceBox({ lowestRate, currency, checkIn, checkOut }: HotelDetailPriceBoxProps) {
  const nights = getNights(checkIn, checkOut);
  const estimatedTotal = lowestRate * nights;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Price summary</h2>
      <p className="mt-1 text-sm text-slate-600">{formatStayNights(checkIn, checkOut)}</p>

      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>Per night</span>
          <span className="font-semibold">{formatCurrency(lowestRate, currency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated total ({nights} night{nights > 1 ? "s" : ""})</span>
          <span className="font-semibold">{formatCurrency(estimatedTotal, currency)}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">Total is an estimate based on the current nightly rate and may vary at checkout.</p>
    </section>
  );
}
