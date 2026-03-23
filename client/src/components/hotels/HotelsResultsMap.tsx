import { useEffect, useMemo, useRef, useState } from "react";
import { MapView } from "@/components/Map";
import type { HotelData } from "@/components/HotelCard";
import type { City } from "@shared/hotels/cities";

interface Props {
  hotels: HotelData[];
  city: City | null;
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  onMarkerClick: (hotelId: string) => void;
  onMarkerHover: (hotelId: string | null) => void;
}

function markerClasses(isSelected: boolean, isHovered: boolean, index: number) {
  if (isSelected)
    return "scale-110 border-gold bg-gold text-navy shadow-[0_12px_30px_rgba(245,200,66,.35)]";
  if (isHovered)
    return "scale-105 border-white bg-white text-navy shadow-[0_10px_25px_rgba(255,255,255,.25)]";
  return "border-white/15 bg-navy-card/95 text-white shadow-[0_10px_25px_rgba(0,0,0,.35)]";
}

function createMarkerContent(
  hotel: HotelData,
  index: number,
  isSelected: boolean,
  isHovered: boolean
) {
  const content = document.createElement("div");
  content.className = "relative";
  const isFallback = hotel.coordinates?.isFallback;
  content.innerHTML = `
    <div class="flex min-w-[58px] -translate-y-1/2 flex-col items-center gap-1">
      <div class="rounded-full border px-3 py-1 text-xs font-bold transition-all ${markerClasses(isSelected, isHovered, index)}">
        ${hotel.lowestRate > 0 ? `$${hotel.lowestRate}` : `#${index + 1}`}
      </div>
      <div class="h-2.5 w-2.5 rotate-45 rounded-[2px] border-b border-r ${isSelected ? "border-gold bg-gold" : isHovered ? "border-white bg-white" : "border-white/15 bg-navy-card/95"}"></div>
      ${isFallback ? '<div class="rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-100">Approx</div>' : ""}
    </div>
  `;
  return content;
}

export default function HotelsResultsMap({
  hotels,
  city,
  selectedHotelId,
  hoveredHotelId,
  onMarkerClick,
  onMarkerHover,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const center = useMemo(
    () => ({
      lat: city?.lat ?? hotels[0]?.coordinates?.lat ?? 13.7563,
      lng: city?.lng ?? hotels[0]?.coordinates?.lng ?? 100.5018,
    }),
    [city, hotels]
  );

  useEffect(() => {
    if (!mapRef.current || !mapReady || !window.google) return;

    listenersRef.current.forEach(listener => listener.remove());
    listenersRef.current = [];
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    hotels.forEach((hotel, index) => {
      if (!hotel.coordinates) return;
      const position = {
        lat: hotel.coordinates.lat,
        lng: hotel.coordinates.lng,
      };
      bounds.extend(position);
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position,
        title: hotel.name,
        content: createMarkerContent(
          hotel,
          index,
          hotel.hotelId === selectedHotelId,
          hotel.hotelId === hoveredHotelId
        ),
      });

      listenersRef.current.push(
        marker.addListener("click", () => onMarkerClick(hotel.hotelId))
      );
      listenersRef.current.push(
        marker.addListener("mouseover", () => onMarkerHover(hotel.hotelId))
      );
      listenersRef.current.push(
        marker.addListener("mouseout", () => onMarkerHover(null))
      );
      markersRef.current.push(marker);
    });

    if (!hotels.length && city) {
      bounds.extend({ lat: city.lat, lng: city.lng });
    }

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, 80);
      if (hotels.length <= 1) {
        mapRef.current.setCenter(center);
        mapRef.current.setZoom(13);
      }
    } else {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(12);
    }

    return () => {
      listenersRef.current.forEach(listener => listener.remove());
      listenersRef.current = [];
      markersRef.current.forEach(marker => {
        marker.map = null;
      });
      markersRef.current = [];
    };
  }, [
    center,
    city,
    hotels,
    hoveredHotelId,
    mapReady,
    onMarkerClick,
    onMarkerHover,
    selectedHotelId,
  ]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-navy-card/90 shadow-[0_18px_60px_rgba(0,0,0,.35)] flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 shrink-0">
        <div>
          <h3 className="font-display text-lg font-bold text-white">
            Map view
          </h3>
          <p className="text-xs text-white/45">
            Compare location and price at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/55">
          <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-gold">
            Selected
          </span>
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-amber-100">
            Approx = fallback
          </span>
        </div>
      </div>

      <MapView
        className="flex-1 w-full relative"
        initialCenter={center}
        initialZoom={12}
        onMapReady={map => {
          mapRef.current = map;
          setMapReady(true);
        }}
      />
    </div>
  );
}
