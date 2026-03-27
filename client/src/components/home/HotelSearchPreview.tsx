import HotelSearchWidget from '@/components/hotels/HotelSearchWidget';

export default function HotelSearchPreview() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Modernized Hotel Search</h3>
        <p className="text-xs text-white/40">Find the best deals across Southeast Asia</p>
      </div>
      
      <HotelSearchWidget />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-white/5 pt-6">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">Verified Providers</span>
        {[
          ['Agoda', '#E22128'],
          ['Booking.com', '#4A90E2'],
          ['Trip.com', '#1890FF'],
          ['Expedia', '#4169E1'],
        ].map(([name, color]) => (
          <span key={name} className="flex items-center gap-2 text-[11px] font-bold text-white/70">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
