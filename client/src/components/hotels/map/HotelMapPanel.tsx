import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { HotelResult } from "@shared/hotels/types";
import { trackHotelMarkerClick } from "@/lib/hotels/tracking";

import { generateMapMarkers, deriveBoundsFromHotels } from "@/features/hotels/mapView/markers";
import type { HotelMapMarker, MarkerBounds } from "@/features/hotels/mapView/markers.types";
import { formatPriceLabel } from "@/features/hotels/mapView/formatPriceLabel";
import { Search, RotateCcw } from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────

interface HotelMapPanelProps {
  hotels: HotelResult[];
  selectedHotelId: string | null;
  hoveredHotelId: string | null;
  bounds?: MarkerBounds | null;
  onSelectHotel: (hotelId: string) => void;
  onHoverHotel: (hotelId: string | null) => void;
  onSearchArea?: (bounds: MarkerBounds) => void;
  isSearchingArea?: boolean;
  city?: string;
  checkIn?: string;
  checkOut?: string;
}

// ─── Marker Icon Factories ─────────────────────────────────────────

function createPriceMarkerIcon(
  label: string,
  variant: "default" | "hovered" | "selected" | "deal",
): L.DivIcon {
  const colorMap: Record<typeof variant, { bg: string; text: string; border: string; shadow: string }> = {
    default: { bg: "bg-white", text: "text-slate-800", border: "border-slate-300", shadow: "shadow-sm" },
    hovered: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-400", shadow: "shadow-md" },
    selected: { bg: "bg-indigo-600", text: "text-white", border: "border-indigo-700", shadow: "shadow-lg" },
    deal: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-400", shadow: "shadow-sm" },
  };

  const colors = colorMap[variant];
  const pulseHtml = variant === "selected"
    ? `<span class="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-30"></span>`
    : "";

  return L.divIcon({
    html: `
      <div class="relative -translate-x-1/2 -translate-y-full">
        ${pulseHtml}
        <div class="relative flex items-center gap-1 rounded-full border ${colors.border} ${colors.bg} ${colors.shadow} px-2 py-1 text-xs font-semibold ${colors.text} whitespace-nowrap transition-all duration-150">
          <span>${label}</span>
        </div>
        <div class="absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r ${colors.border} ${colors.bg}"></div>
      </div>
    `,
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// ─── Map Bounds Fitter ─────────────────────────────────────────────

interface MapBoundsFitterProps {
  hotels: HotelResult[];
  selectedHotelId: string | null;
}

function MapBoundsFitter({ hotels, selectedHotelId }: MapBoundsFitterProps) {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (fittedRef.current || !hotels.length) return;

    const bounds = deriveBoundsFromHotels(hotels);
    if (!bounds) return;

    const leafletBounds = L.latLngBounds(
      [bounds.south, bounds.west],
      [bounds.north, bounds.east],
    );

    map.fitBounds(leafletBounds, { padding: [40, 40], maxZoom: 15 });
    fittedRef.current = true;
  }, [hotels, map]);

  // Fly to selected hotel
  useEffect(() => {
    if (!selectedHotelId) return;

    const hotel = hotels.find((h) => h.hotelId === selectedHotelId);
    if (!hotel?.coordinates) return;

    map.flyTo(
      [hotel.coordinates.lat, hotel.coordinates.lng],
      Math.max(map.getZoom(), 14),
      { duration: 0.5 },
    );
  }, [selectedHotelId, hotels, map]);

  return null;
}

// ─── Map Event Handler (Bounds Tracking) ───────────────────────────

interface MapEventsProps {
  onBoundsChange: (bounds: MarkerBounds) => void;
  onUserInteraction: () => void;
}

function MapEvents({ onBoundsChange, onUserInteraction }: MapEventsProps) {
  const interactedRef = useRef(false);

  useMapEvents({
    moveend(event) {
      const map = event.target;
      const leafletBounds = map.getBounds();
      onBoundsChange({
        north: leafletBounds.getNorth(),
        south: leafletBounds.getSouth(),
        east: leafletBounds.getEast(),
        west: leafletBounds.getWest(),
      });
    },
    dragend() {
      if (!interactedRef.current) {
        interactedRef.current = true;
        onUserInteraction();
      }
    },
    zoomend(event) {
      // Only trigger on user-initiated zoom (not programmatic)
      if (!interactedRef.current) {
        interactedRef.current = true;
        onUserInteraction();
      }
    },
  });

  return null;
}

// ─── Hotel Marker Component ────────────────────────────────────────

interface HotelMarkerProps {
  marker: HotelMapMarker;
  hotel?: HotelResult;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  onSelect: (hotelId: string) => void;
  onHover: (hotelId: string | null) => void;
}

const HotelMarkerComponent = memo(function HotelMarkerComponent({
  marker,
  hotel,
  city,
  checkIn,
  checkOut,
  onSelect,
  onHover,
}: HotelMarkerProps) {
  const icon = useMemo(
    () => createPriceMarkerIcon(marker.label, marker.style.variant),
    [marker.label, marker.style.variant],
  );

  const eventHandlers = useMemo(
    () => ({
      click: () => {
        trackHotelMarkerClick({
          hotelId: marker.hotelId,
          city,
          checkIn,
          checkOut,
          resultPosition: hotel?.rankingPosition,
        });
        onSelect(marker.hotelId);
      },
      mouseover: () => onHover(marker.hotelId),
      mouseout: () => onHover(null),
    }),
    [marker.hotelId, city, checkIn, checkOut, hotel?.rankingPosition, onSelect, onHover],
  );

  return (
    <Marker
      position={[marker.position.lat, marker.position.lng]}
      icon={icon}
      zIndexOffset={marker.zIndex}
      eventHandlers={eventHandlers}
    >
      {hotel && (
        <Popup
          offset={[0, -8]}
          closeButton={false}
          className="hotel-map-popup"
        >
          <div className="min-w-[200px] max-w-[260px]">
            {hotel.imageUrl && (
              <img
                src={hotel.imageUrl}
                alt={hotel.name}
                className="h-24 w-full rounded-t-lg object-cover"
                loading="lazy"
              />
            )}
            <div className="p-2">
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                {hotel.name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {hotel.stars > 0 && (
                  <span className="text-xs text-amber-500">
                    {"★".repeat(Math.min(hotel.stars, 5))}
                  </span>
                )}
                {hotel.reviewScore > 0 && (
                  <span className="rounded bg-indigo-100 px-1 py-0.5 text-[10px] font-medium text-indigo-700">
                    {hotel.reviewScore.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                {hotel.address || "Address unavailable"}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  {formatPriceLabel(hotel.lowestRate, hotel.currency)}
                </span>
                <span className="text-[10px] text-slate-500">/ night</span>
              </div>
              {(hotel.freeCancellation || hotel.breakfastIncluded) && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {hotel.freeCancellation && (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] text-emerald-700">
                      Free cancel
                    </span>
                  )}
                  {hotel.breakfastIncluded && (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700">
                      Breakfast
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Popup>
      )}
    </Marker>
  );
});

// ─── Main HotelMapPanel Component ──────────────────────────────────

function HotelMapPanelComponent({
  hotels,
  selectedHotelId,
  hoveredHotelId,
  bounds,
  onSelectHotel,
  onHoverHotel,
  onSearchArea,
  isSearchingArea = false,
  city,
  checkIn,
  checkOut,
}: HotelMapPanelProps) {
  const [currentBounds, setCurrentBounds] = useState<MarkerBounds | null>(null);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [showSearchButton, setShowSearchButton] = useState(false);

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

  const initialCenter = useMemo((): [number, number] => {
    if (!hotels.length) return [13.7563, 100.5018];

    const derived = deriveBoundsFromHotels(hotels);
    if (derived) {
      return [
        (derived.north + derived.south) / 2,
        (derived.east + derived.west) / 2,
      ];
    }

    const first = hotels.find((h) => h.coordinates);
    if (first?.coordinates) {
      return [first.coordinates.lat, first.coordinates.lng];
    }

    return [13.7563, 100.5018];
  }, [hotels]);

  const handleBoundsChange = useCallback((newBounds: MarkerBounds) => {
    setCurrentBounds(newBounds);
  }, []);

  const handleUserInteraction = useCallback(() => {
    setUserHasInteracted(true);
    setShowSearchButton(true);
  }, []);

  const handleSearchThisArea = useCallback(() => {
    if (!currentBounds || !onSearchArea) return;
    onSearchArea(currentBounds);
    setShowSearchButton(false);
  }, [currentBounds, onSearchArea]);

  // Hide the button when new results arrive (search completed)
  useEffect(() => {
    if (!isSearchingArea) {
      setShowSearchButton(false);
    }
  }, [hotels.length, isSearchingArea]);

  if (!hotels.length) {
    return (
      <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">
          No mappable hotel coordinates are available for the current result set.
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full flex-col">
        {/* Map Header */}
        <header className="z-10 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              {markers.length} hotel{markers.length !== 1 ? "s" : ""} on map
            </p>
            {selectedHotelId && (
              <button
                type="button"
                onClick={() => onSelectHotel("")}
                className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800"
              >
                Clear selection
              </button>
            )}
          </div>
        </header>

        {/* Interactive Leaflet Map */}
        <div className="relative flex-1 z-0">
          <MapContainer
            center={initialCenter}
            zoom={12}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            <MapBoundsFitter hotels={hotels} selectedHotelId={selectedHotelId} />
            <MapEvents
              onBoundsChange={handleBoundsChange}
              onUserInteraction={handleUserInteraction}
            />

            {markers.map((marker) => (
              <HotelMarkerComponent
                key={marker.hotelId}
                marker={marker}
                hotel={hotelsById.get(marker.hotelId)}
                city={city}
                checkIn={checkIn}
                checkOut={checkOut}
                onSelect={onSelectHotel}
                onHover={onHoverHotel}
              />
            ))}
          </MapContainer>

          {/* "Search this area" Button — Airbnb-style */}
          {onSearchArea && showSearchButton && userHasInteracted && (
            <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2">
              <button
                type="button"
                onClick={handleSearchThisArea}
                disabled={isSearchingArea}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl active:scale-95 disabled:cursor-wait disabled:opacity-70"
              >
                {isSearchingArea ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5" />
                    Search this area
                  </>
                )}
              </button>
            </div>
          )}

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full border border-slate-300 bg-white"></span>
                Hotel
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full border border-emerald-400 bg-emerald-50"></span>
                Deal
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export const HotelMapPanel = memo(HotelMapPanelComponent);
