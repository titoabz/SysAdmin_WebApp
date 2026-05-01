"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Site {
  id: number;
  name: string;
  category: string;
  short_description: string;
  slug: string;
}

const MapWrapper = dynamic(() => import("../components/MapWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-xl shadow-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-2 text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [sites, setSites] = useState<Site[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch all sites
  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase
        .from("heritage_sites")
        .select("id, name, category, slug, short_description")
        .eq("status", "published");
      setSites(data || []);
    };
    fetchSites();
  }, []);

  // Filter sites based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSites([]);
      setShowResults(false);
    } else {
      const filtered = sites.filter(
        (site) =>
          site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSites(filtered);
      setShowResults(true);
    }
  }, [searchTerm, sites]);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Butuan Tourism Map</h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto mb-8">
            Discover the rich history and cultural heritage of Butuan City, the "Home of the Balangays"
          </p>

          <div className="max-w-lg mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search for heritage sites... (e.g., Balangay, Museum)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pr-14 rounded-xl text-gray-800 placeholder-gray-500 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
              />
              <svg
                className="absolute right-5 top-4 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {showResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl max-h-96 overflow-y-auto z-20 mx-auto max-w-lg">
                {filteredSites.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No results found for "{searchTerm}"
                  </div>
                ) : (
                  filteredSites.map((site) => (
                    <Link
                      key={site.id}
                      href={`/sites/${site.slug}`}
                      className="block p-4 hover:bg-gray-50 border-b last:border-b-0 transition"
                    >
                      <div className="font-semibold text-green-800 text-lg">{site.name}</div>
                      <div className="text-sm text-gray-500 capitalize mt-1">{site.category}</div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {site.short_description}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Explore Heritage Sites</h2>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow">
              {sites.length} heritage sites
            </span>
          </div>
          <MapWrapper />
        </div>
      </section>

      {/* Admin Link */}
      <div className="text-center text-xs text-gray-400 py-4">
        <Link href="/admin/login" className="hover:text-gray-600">
          Admin Access
        </Link>
      </div>
    </main>
  );
}
