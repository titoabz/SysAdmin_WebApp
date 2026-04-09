"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
          .from("itineraries")
          .select("*")
          .eq("status", "published");

        if (error) throw error;

        if (isMounted) {
          setItineraries(data || []);
        }
      } catch (error) {
        console.error("Error fetching itineraries:", error);
        if (isMounted) {
          setItineraries([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchItineraries();

    return () => {
      isMounted = false;
    };
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

  if (itineraries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Itineraries Found</h1>
        <p className="text-gray-600 mb-6">Please check back later for tour packages.</p>
        <Link href="/" className="bg-green-700 text-white px-6 py-2 rounded">
          Explore Map
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-bold text-center mb-4">Heritage Itineraries</h1>
      <p className="text-xl text-center text-gray-600 mb-12">
        Choose from curated tours to explore Butuan's rich cultural heritage
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {itineraries.map((itinerary) => (
          <div key={itinerary.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-green-700 h-2" />
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{itinerary.name}</h2>
              <p className="text-gray-500 text-sm mb-4">⏱️ {itinerary.duration}</p>
              <p className="text-gray-600 mb-4 line-clamp-3">{itinerary.description}</p>
              <button
                onClick={() => setSelected(itinerary)}
                className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 transition"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-700 p-4 sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-white text-2xl hover:text-gray-200">
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="font-bold">Duration:</span> {selected.duration}
              </div>
              <div className="mb-4">
                <h3 className="font-bold">About This Tour</h3>
                <p>{selected.description}</p>
              </div>
              <div className="mb-4">
                <h3 className="font-bold">Highlights</h3>
                <ul className="list-disc pl-5">
                  {selected.highlights && selected.highlights.length > 0 && selected.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="font-bold">Sites</h3>
                <ul className="list-disc pl-5">
                  {selected.sites && selected.sites.length > 0 && selected.sites.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="font-bold">What to Bring</h3>
                <ul className="list-disc pl-5">
                  {selected.what_to_bring && selected.what_to_bring.length > 0 && selected.what_to_bring.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <span className="font-bold">Meeting Point:</span> {selected.meeting_point}
              </div>
              <div className="mb-4 p-3 bg-green-50 rounded">
                <span className="font-bold">Price:</span> {selected.price}
              </div>
              <Link href="/" className="block w-full bg-green-700 text-white text-center py-2 rounded">
                Explore Map
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
