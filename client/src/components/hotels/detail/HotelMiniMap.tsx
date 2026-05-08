import { memo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { HotelCoordinates } from "@shared/hotels/types";

interface HotelMiniMapProps {
  coordinates: HotelCoordinates;
  hotelName: string;
}

// 🏨 Custom Hotel Pin Icon ဖန်တီးခြင်း
function createMiniMapIcon() {
  const html = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
          <path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/>
        </svg>
      </div>
      <div class="absolute -bottom-1.5 left-1/2 w-3 h-3 -translate-x-1/2 rotate-45 border-r border-b border-white bg-indigo-600"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

function HotelMiniMapComponent({ coordinates, hotelName }: HotelMiniMapProps) {
  const icon = createMiniMapIcon();

  return (
    <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl border border-slate-200 z-0">
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker
          position={[coordinates.lat, coordinates.lng]}
          icon={icon}
          title={hotelName}
        />
      </MapContainer>
      
      {/* ⚠️ Fallback coordinate ဖြစ်နေရင် User ကို အသိပေးမယ့် Badge */}
      {coordinates.isFallback && (
        <div className="absolute bottom-2 right-2 z-[400] rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
          Approximate location
        </div>
      )}
    </div>
  );
}

export const HotelMiniMap = memo(HotelMiniMapComponent);
