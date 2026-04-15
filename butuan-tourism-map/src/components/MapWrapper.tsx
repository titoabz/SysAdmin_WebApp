"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const RoutingMap = dynamic(() => import("@/components/RoutingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[600px] bg-gray-100 rounded-xl shadow-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-2 text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] md:h-[600px] bg-gray-100 rounded-xl shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return <RoutingMap />;
}
