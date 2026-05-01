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
    const fetchItineraries = async () => {
      const { data } = await supabase
        .from('itineraries')
        .select('*')
        .eq('status', 'published');
      setItineraries(data || []);
      setLoading(false);
    };
    fetchItineraries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading itineraries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Heritage Itineraries</h1>
          <p className="text-green-100 max-w-2xl mx-auto">
            Curated tours of Butuan's cultural treasures
          </p>
        </div>
      </div>

      {/* Itineraries Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itineraries.map((itinerary) => (
            <div 
              key={itinerary.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col h-full"
            >
              {/* Header Color Bar */}
              <div className="h-2 bg-gradient-to-r from-green-600 to-green-500" />
              
              {/* Content - grows to fill space */}
              <div className="p-6 flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                  {itinerary.name}
                </h2>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {itinerary.duration}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                    {itinerary.difficulty}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {itinerary.description}
                </p>
                
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Sites Included:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.sites?.slice(0, 2).map((site, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        📍 {site}
                      </span>
                    ))}
                    {itinerary.sites?.length > 2 && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        +{itinerary.sites.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Button - pinned to bottom */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelected(itinerary)}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  View Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-700 to-green-600 p-4 sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl md:text-2xl font-bold text-white pr-4">{selected.name}</h2>
                <button 
                  onClick={() => setSelected(null)} 
                  className="text-white text-2xl hover:text-gray-200 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-500"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-3">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  ⏱️ {selected.duration}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  🎯 {selected.difficulty}
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  🌅 {selected.best_time}
                </span>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">About This Tour</h3>
                <p className="text-gray-600 leading-relaxed">{selected.description}</p>
              </div>
              
              {selected.highlights && selected.highlights.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">✨ Highlights</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {selected.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}
              
              {selected.sites && selected.sites.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">📍 Sites to Visit</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {selected.sites.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              
              {selected.what_to_bring && selected.what_to_bring.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">🎒 What to Bring</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {selected.what_to_bring.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
              
              {selected.meeting_point && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-bold text-gray-800 mb-1">📍 Meeting Point</p>
                  <p className="text-gray-600">{selected.meeting_point}</p>
                </div>
              )}
              
              {selected.price && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-bold text-green-800 mb-1">💰 Price</p>
                  <p className="text-green-700 font-medium">{selected.price}</p>
                </div>
              )}
              
              <Link 
                href="/" 
                onClick={() => setSelected(null)}
                className="block w-full bg-green-700 text-white text-center py-3 rounded-lg font-medium hover:bg-green-800 transition"
              >
                Explore Map
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
