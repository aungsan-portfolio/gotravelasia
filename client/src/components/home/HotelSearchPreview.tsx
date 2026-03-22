import HotelsSearchForm from '@/components/hotels/HotelsSearchForm';

export default function HotelSearchPreview() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <HotelsSearchForm initialCity="yangon" />

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
        <span className="text-[10px] text-white/28">Compare prices from</span>
        {[
          ['Agoda', '#E22128'],
          ['Booking.com', '#4A90E2'],
          ['Trip.com', '#1890FF'],
          ['Expedia', '#4169E1'],
          ['Klook', '#FF5C35'],
        ].map(([name, color]) => (
          <span key={name} className="flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
