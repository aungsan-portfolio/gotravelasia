import { memo, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { HotelResult } from "@shared/hotels/types";
import { trackHotelMarkerClick } from "@/lib/hotels/tracking";
import { generateMapMarkers } from "@/features/hotels/mapView/markers";
import type { MarkerBounds, HotelMapMarker } from "@/features/hotels/mapView/markers.types";

interface HotelMapPanelProps {
  hotels: HotelResult[];
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  bounds?: MarkerBounds | null;
  onSelectHotel: (hotelId: string) => void;
  onHoverHotel: (hotelId: string | null) => void;
  city?: string;
  checkIn?: string;
  checkOut?: string;
}

// ===== Helpers =====
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPriceIcon(marker: HotelMapMarker) {
  const classes = {
    pill: "bg-white text-slate-800 border-slate-300",
    pointer: "bg-white border-slate-300",
  };
  
  let zIndexOffset = marker.zIndex;
  
  if (marker.isSelected) {
    classes.pill = "bg-indigo-600 text-white border-indigo-700";
    classes.pointer = "bg-indigo-600 border-indigo-700";
    zIndexOffset += 1000;
  } else if (marker.isHovered) {
    classes.pill = "bg-indigo-100 text-indigo-900 border-indigo-400";
    classes.pointer = "bg-indigo-100 border-indigo-400";
    zIndexOffset += 500;
  } else if (marker.style.variant === "deal") {
    classes.pill = "bg-rose-600 text-white border-rose-700";
    classes.pointer = "bg-rose-600 border-rose-700";
  }

  const safeLabel = escapeHtml(marker.label);
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="shadow-md rounded-full border px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap ${classes.pill}">
        ${safeLabel}
      </div>
      <div class="absolute -bottom-1.5 left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 border-r border-b ${classes.pointer}"></div>
    </div>
  `;

  return {
    icon: L.divIcon({
      html,
      className: "",
      iconSize: [72, 36],
      iconAnchor: [36, 36],
    }),
    zIndexOffset,
  };
}

// ===== Bounds Manager =====
function MapBoundsManager({ markers }: { markers: HotelMapMarker[] }) {
  const map = useMap();
  
  const boundsKey = useMemo(() => {
    return markers
      .map((m) => `${m.hotelId}:${m.position.lat}:${m.position.lng}`)
      .join("|");
  }, [markers]);

  useEffect(() => {
    if (!markers.length) return;
    
    const bounds = L.latLngBounds(
      markers.map((m) => [m.position.lat, m.position.lng])
    );
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, boundsKey]); // ✅ Removed redundant `markers`

  return null;
}

// ===== Main Component =====
function HotelMapPanelComponent({
  hotels,
  selectedHotelId,
  hoveredHotelId,
  bounds,
  onSelectHotel,
  onHoverHotel,
  city,
  checkIn,
  checkOut,
}: HotelMapPanelProps) {
  const markers = useMemo(
    () =>
      generateMapMarkers(hotels, {
        selectedHotelId,
        hoveredHotelId,
        bounds,
      }),
    [bounds, hotels, hoveredHotelId, selectedHotelId],
  );

  const hotelsById = useMemo(
    () => new Map(hotels.map((hotel) => [hotel.hotelId, hotel])),
    [hotels],
  );

  // ✅ Memoize icons (Issue #5 fix)
  const markersWithIcons = useMemo(() => {
    return markers.map((marker) => ({
      marker,
      ...createPriceIcon(marker),
    }));
  }, [markers]);

  // ✅ Empty state with proper layout
  if (!markers.length) {
    return (
      <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
        <header className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Map</p>
          <p className="text-xs text-slate-500">
            {hotels.length} hotels found
          </p>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500">
          No mappable hotel coordinates are available for the current result set.
        </div>
      </aside>
    );
  }

  // ✅ Safe to access markers[0] after empty check
  const center = markers[0].position;

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm flex flex-col z-0">
      <header className="border-b border-slate-200 bg-white px-4 py-3 relative z-10 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Map</p>
        <p className="text-xs text-slate-500">
          Showing {markers.length} properties
        </p>
      </header>

      {/* ✅ minHeight: 0 fixes flex children height in Firefox/Safari */}
      <div className="flex-1 w-full relative" style={{ minHeight: 0 }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapBoundsManager markers={markers} />

          {markersWithIcons.map(({ marker, icon, zIndexOffset }) => {
            const hotel = hotelsById.get(marker.hotelId);

            return (
              <Marker
                key={marker.hotelId}
                position={[marker.position.lat, marker.position.lng]}
                icon={icon}
                zIndexOffset={zIndexOffset}
                eventHandlers={{
                  click: () => {
                    trackHotelMarkerClick({
                      hotelId: marker.hotelId,
                      city,
                      checkIn,
                      checkOut,
                      resultPosition: hotel?.rankingPosition,
                    });
                    onSelectHotel(marker.hotelId);
                  },
                  mouseover: () => onHoverHotel(marker.hotelId),
                  mouseout: () => onHoverHotel(null),
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    </aside>
  );
}

export const HotelMapPanel = memo(HotelMapPanelComponent);
