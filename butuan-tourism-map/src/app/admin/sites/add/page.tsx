"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-2 text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function AddSite() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "archaeological",
    latitude: "",
    longitude: "",
    short_description: "",
    operating_hours: "",
    entrance_fee: "",
    status: "published",
  });

  const handleLocationSelect = useCallback((lat: number, lng: number, _address: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.latitude || !formData.longitude) {
      setError("Please select a location on the map");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("heritage_sites").insert({
      name: formData.name,
      slug: formData.slug,
      category: formData.category,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      short_description: formData.short_description,
      operating_hours: formData.operating_hours,
      entrance_fee: formData.entrance_fee,
      status: formData.status,
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Site added successfully!");
      router.push("/admin/sites");
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto">
          <Link href="/admin/sites" className="text-white hover:text-green-200">
            ← Back to Sites
          </Link>
          <h1 className="text-xl font-bold inline ml-4">Add New Heritage Site</h1>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Site Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from name</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="archaeological">🏛️ Archaeological</option>
                  <option value="religious">⛪ Religious</option>
                  <option value="museum">🏛️ Museum</option>
                  <option value="natural">🌿 Natural</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Short Description</label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Brief description of the heritage site..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    name="operating_hours"
                    value={formData.operating_hours}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Entrance Fee</label>
                  <input
                    type="text"
                    name="entrance_fee"
                    value={formData.entrance_fee}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="e.g., Free, ₱20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="published">✅ Published (visible on map)</option>
                  <option value="draft">📝 Draft (hidden)</option>
                </select>
              </div>
            </div>

            <div className="lg:col-span-1">
              <label className="block font-semibold text-gray-700 mb-2">
                🗺️ Click on map to set location
              </label>
              <div style={{ minHeight: "450px" }}>
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                  initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                />
              </div>

              {formData.latitude && formData.longitude && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg text-center">
                  <p className="text-xs text-green-700">
                    ✓ Location selected: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white p-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50 transition"
            >
              {loading ? "Adding..." : "➕ Add Heritage Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

