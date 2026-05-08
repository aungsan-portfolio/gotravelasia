import { memo, useMemo } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { HotelCoordinates } from "@shared/hotels/types";

interface HotelMiniMapProps {
  coordinates: HotelCoordinates;
  hotelName: string;
}

function createMiniMapIcon() {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
        <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-md">🏨</div>
        <div class="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white bg-indigo-600"></div>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

function HotelMiniMapComponent({ coordinates, hotelName }: HotelMiniMapProps) {
  const icon = useMemo(() => createMiniMapIcon(), []);
  const center: [number, number] = [coordinates.lat, coordinates.lng];

  return (
    <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm z-0">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker position={center} icon={icon} title={hotelName} />
      </MapContainer>

      {coordinates.isFallback && (
        <div className="absolute bottom-2 right-2 z-[400] rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
          Approximate location
        </div>
      )}
    </div>
  );
}

export const HotelMiniMap = memo(HotelMiniMapComponent);
