"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SimpleMapWrapper() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapInstance = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        // Fix marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current!).setView([8.9475, 125.5406], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap',
          maxZoom: 18,
        }).addTo(map);

        mapInstance.current = map;
        setMapReady(true);

        // Fetch and add markers
        const { data: sites } = await supabase
          .from("heritage_sites")
          .select("*")
          .eq("status", "published");

        const categoryColors: Record<string, string> = {
          archaeological: "#f59e0b",
          religious: "#ef4444",
          museum: "#3b82f6",
          natural: "#10b981",
          educational: "#8b5cf6",
        };

        if (sites) {
          sites.forEach((site: any) => {
            const color = categoryColors[site.category] || "#166534";
            const popup = `<div style="padding: 8px; min-width: 160px;"><div style="font-weight: bold; color: #166534;">${site.name}</div><div style="font-size: 10px; color: #666;">${site.category}</div><div style="font-size: 11px; margin: 4px 0;">${site.short_description || ""}</div><a href="/sites/${site.slug}" style="display: inline-block; margin-top: 6px; background: #166534; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px;">View</a></div>`;

            const icon = L.divIcon({
              className: "custom-marker",
              html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.08);"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });

            (L as any).marker([site.latitude, site.longitude], { icon }).bindPopup(popup).addTo(map);
          });
        }
      } catch (err) {
        console.error("Map error:", err);
      }
    };

    initMap();
  }, []);

  return (
    <div className="relative w-full h-[600px]">
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-xl shadow-lg bg-gray-100" />
    </div>
  );
}
