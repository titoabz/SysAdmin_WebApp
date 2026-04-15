"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Itinerary {
  id: number;
  name: string;
  duration: string;
  description: string;
  difficulty: string;
  best_time: string;
  highlights: string[];
  sites: string[];
  what_to_bring: string[];
  meeting_point: string;
  price: string;
}

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Itinerary | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchItineraries = async () => {
      try {
        const { data, error } = await supabase
          .from('itineraries')
          .select('*')
          .eq('status', 'published');

        if (error) throw error;
        if (isMounted) setItineraries(data || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItineraries();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 text-center">Heritage Itineraries</h1>
          <p className="text-sm md:text-base text-gray-600 text-center mt-2">Curated tours of Butuan's cultural treasures</p>
        </div>
      </div>

      {/* Itineraries Grid */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        {itineraries.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">No Itineraries Found</h2>
            <p className="text-gray-600 mb-6">Please check back later for tour packages.</p>
            <Link href="/" className="bg-green-700 text-white px-6 py-2 rounded inline-block">
              Explore Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                <div className="bg-gradient-to-r from-green-700 to-green-600 h-2" />
                <div className="p-5 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 line-clamp-2">{itinerary.name}</h2>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <span>⏱️</span>
                    <span>{itinerary.duration}</span>
                    <span className="mx-1">•</span>
                    <span>🎯 {itinerary.difficulty}</span>
                  </div>
                  <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">{itinerary.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {itinerary.sites?.slice(0, 2).map((site, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">📍 {site}</span>
                    ))}
                    {itinerary.sites?.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">+{itinerary.sites.length - 2}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(itinerary)}
                    className="w-full bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-800 transition active:bg-green-900"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Mobile Optimized */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="bg-green-700 p-4 sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-white pr-4">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-white text-2xl p-2 hover:bg-green-600 rounded-lg">×</button>
              </div>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">⏱️ {selected.duration}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">🎯 {selected.difficulty}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">🌅 {selected.best_time}</span>
              </div>
              <div><h3 className="font-bold text-gray-800 mb-2">About This Tour</h3><p className="text-gray-600 text-sm">{selected.description}</p></div>
              {selected.highlights?.length > 0 && (<div><h3 className="font-bold text-gray-800 mb-2">✨ Highlights</h3><ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">{selected.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul></div>)}
              {selected.sites?.length > 0 && (<div><h3 className="font-bold text-gray-800 mb-2">📍 Sites</h3><ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">{selected.sites.map((s, i) => <li key={i}>{s}</li>)}</ul></div>)}
              {selected.what_to_bring?.length > 0 && (<div><h3 className="font-bold text-gray-800 mb-2">🎒 What to Bring</h3><ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">{selected.what_to_bring.map((w, i) => <li key={i}>{w}</li>)}</ul></div>)}
              {selected.meeting_point && (<div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold">📍 Meeting Point:</span> <span className="text-gray-600">{selected.meeting_point}</span></div>)}
              {selected.price && (<div className="bg-green-50 p-3 rounded-lg"><span className="font-bold">💰 Price:</span> <span className="text-green-700 font-medium">{selected.price}</span></div>)}
              <Link href="/" onClick={() => setSelected(null)} className="block w-full bg-green-700 text-white text-center py-3 rounded-lg font-medium hover:bg-green-800">Explore Map</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
