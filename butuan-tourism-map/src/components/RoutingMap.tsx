"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface Site {
  id: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  short_description: string;
  slug: string;
}

export default function RoutingMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const routingControl = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Fetch sites from Supabase
  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase
        .from("heritage_sites")
        .select("*")
        .eq("status", "published");
      setSites(data || []);
    };
    fetchSites();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      try {
        const mapContainer = mapRef.current;
        if (!mapContainer) return;

        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // Fix marker icons - use CDN
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const map = L.map(mapContainer).setView([8.9475, 125.5406], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap',
          maxZoom: 18,
        }).addTo(map);

        mapInstance.current = map;
        setMapReady(true);
      } catch (err) {
        console.error("Map error:", err);
      }
    };

    initMap();
  }, []);

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);

        if (mapInstance.current) {
          const L = (await import("leaflet")).default;
          mapInstance.current.setView([latitude, longitude], 14);

          // User marker
          const userIcon = L.divIcon({
            html: `<div style="width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px rgba(59,130,246,0.5);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup("<b>📍 You are here</b>")
            .addTo(mapInstance.current);
        }
      },
      () => alert("Location permission denied")
    );
  };

  // Calculate distance
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Show route
  const showRoute = async (site: Site) => {
    if (!mapInstance.current || !userLocation) {
      alert("Please get your location first");
      return;
    }

    if (routingControl.current) {
      routingControl.current.remove();
    }

    const L = (await import("leaflet")).default;
    await import("leaflet-routing-machine");

    const control = (L as any).Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(site.latitude, site.longitude),
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      lineOptions: {
        styles: [{ color: "#166534", weight: 5, opacity: 0.8 }],
      },
      addWaypoints: true,
      draggableWaypoints: true,
      fitSelectedRoutes: true,
      show: true,
    }).addTo(mapInstance.current);

    routingControl.current = control;
  };

  const clearRoute = () => {
    if (routingControl.current) {
      routingControl.current.remove();
      routingControl.current = null;
    }
  };

  // Add markers to map
  useEffect(() => {
    if (!mapInstance.current || !mapReady || sites.length === 0) return;

    const addMarkers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstance.current;

      if (markersLayer.current) {
        markersLayer.current.remove();
      }
      markersLayer.current = L.layerGroup().addTo(map);

      const iconByCategory: Record<string, string> = {
        museum: "#2563eb",
        religious: "#dc2626",
        archaeological: "#ea580c",
        natural: "#16a34a",
      };

      sites.forEach(site => {
        let distanceHtml = "";
        if (userLocation) {
          const dist = getDistance(userLocation[0], userLocation[1], site.latitude, site.longitude);
          distanceHtml = `<p class="popup-distance">📍 ${dist.toFixed(1)} km away</p>`;
        }

        const markerColor = iconByCategory[site.category] || "#166534";
        const markerIcon = L.divIcon({
          className: "site-marker",
          html: `
            <div class="site-marker-pin" style="--marker-color:${markerColor}">
              <span class="site-marker-core"></span>
            </div>
          `,
          iconSize: [34, 44],
          iconAnchor: [17, 42],
          popupAnchor: [0, -38],
        });

        const popup = `
          <div class="popup-card">
            <h3 class="popup-title">${site.name}</h3>
            <p class="popup-category">${site.category}</p>
            <p class="popup-description">${site.short_description?.substring(0, 80) || ""}</p>
            ${distanceHtml}
            <div class="popup-actions">
              <a href="/sites/${site.slug}" class="popup-btn popup-btn-details">Details</a>
              <button class="route-btn-${site.id} popup-btn popup-btn-route">Route</button>
            </div>
          </div>
        `;

        const marker = L.marker([site.latitude, site.longitude], { icon: markerIcon })
          .bindPopup(popup, { className: 'custom-popup' })
          .addTo(markersLayer.current);

        marker.on("popupopen", () => {
          setTimeout(() => {
            const btn = document.querySelector(`.route-btn-${site.id}`) as HTMLButtonElement | null;
            if (btn) {
              btn.onclick = () => showRoute(site);
            }
          }, 50);
        });
      });
    };

    addMarkers();

    return () => {
      if (markersLayer.current) {
        markersLayer.current.remove();
        markersLayer.current = null;
      }
    };
  }, [mapReady, sites, userLocation]);

  return (
    <div className="relative w-full h-[400px] md:h-[600px]">
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={getUserLocation}
          className="bg-white shadow-lg rounded-lg px-3 py-2 md:px-3 md:py-1.5 text-sm font-medium hover:bg-gray-50 active:bg-gray-100"
        >
          📍 My Location
        </button>
        {routingControl.current && (
          <button
            onClick={clearRoute}
            className="bg-white shadow-lg rounded-lg px-3 py-2 md:px-3 md:py-1.5 text-sm text-red-600 font-medium hover:bg-gray-50 active:bg-gray-100"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Location Ready Indicator */}
      {userLocation && !routingControl.current && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-green-100 border-l-4 border-green-500 text-green-700 px-3 py-2 rounded shadow text-xs">
          ✅ Location ready – tap "Route" on any marker
        </div>
      )}

      <div ref={mapRef} className="w-full h-full rounded-xl shadow-lg bg-gray-100" />
    </div>
  );
}
