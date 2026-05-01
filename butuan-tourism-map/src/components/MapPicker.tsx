"use client";

import { useEffect, useRef, useState } from "react";

let L: any;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPicker({ onLocationSelect, initialLat, initialLng }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(initialLat || null);
  const [selectedLng, setSelectedLng] = useState<number | null>(initialLng || null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && !mapInstance.current) {
        console.log("Map loading timeout - forcing ready");
        setMapLoaded(true);
      }
    }, 5000);

    const initMap = async () => {
      try {
        console.log("Loading Leaflet for MapPicker...");
        const leaflet = await import("leaflet");
        L = leaflet.default;
        await import("leaflet/dist/leaflet.css");

        console.log("Leaflet loaded, creating map...");

        // Fix marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        // Create map
        const map = L.map(mapRef.current).setView(
          initialLat && initialLng ? [initialLat, initialLng] : [8.9475, 125.5406],
          13
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapInstance.current = map;
        if (isMounted) {
          setMapLoaded(true);
          clearTimeout(timeoutId);
        }


                setTimeout(() => {
                  if (mapInstance.current) {
                    mapInstance.current.invalidateSize();
                  }
                }, 100);

        const attachDragHandler = () => {
          if (!markerRef.current) return;
          markerRef.current.on("dragend", async (dragEvent: any) => {
            const pos = dragEvent.target.getLatLng();
            setSelectedLat(pos.lat);
            setSelectedLng(pos.lng);
            onLocationSelect(pos.lat, pos.lng, `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
          });
        };

        const reverseGeocode = async (lat: number, lng: number) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
            );
            const data = await response.json();
            const locationAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            onLocationSelect(lat, lng, locationAddress);
          } catch (err) {
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        };

        // Add click handler
        map.on("click", async (e: any) => {
          const { lat, lng } = e.latlng;
          setSelectedLat(lat);
          setSelectedLng(lng);

          // Update or create marker
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
            attachDragHandler();
          }

          // Reverse geocoding
          await reverseGeocode(lat, lng);
        });

        // Add initial marker if coordinates exist
        if (initialLat && initialLng) {
          markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
          attachDragHandler();
          setSelectedLat(initialLat);
          setSelectedLng(initialLng);
          await reverseGeocode(initialLat, initialLng);
        }

        console.log("MapPicker map created successfully");
      } catch (err) {
        console.error("Map error:", err);
        if (isMounted) {
          setMapLoaded(true);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative" style={{ height: "450px", width: "100%" }}>
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: "100%", width: "100%" }} className="rounded-lg shadow-lg bg-gray-100" />
      </div>

      {selectedLat && selectedLng && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-green-800">📍 Selected Location:</p>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Lat: {selectedLat.toFixed(6)}, Lng: {selectedLng.toFixed(6)}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        💡 Click anywhere on the map to select a location
      </p>
    </div>
  );
}
