interface HotelDetailAmenitiesProps {
  amenities: string[];
  maxItems?: number;
}

export function HotelDetailAmenities({ amenities, maxItems = 12 }: HotelDetailAmenitiesProps) {
  if (!amenities.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
        <p className="mt-2 text-sm text-slate-600">Amenity details are not available for this property.</p>
      </section>
    );
  }

  const visibleAmenities = amenities.slice(0, maxItems);
  const hiddenCount = Math.max(0, amenities.length - visibleAmenities.length);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {visibleAmenities.map((amenity) => (
          <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {amenity}
          </span>
        ))}
      </div>
      {hiddenCount > 0 && <p className="mt-3 text-xs text-slate-500">+{hiddenCount} more amenities</p>}
    </section>
  );
}
