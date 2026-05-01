"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Dynamic import for MapPicker
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-2">Loading map...</p>
      </div>
    </div>
  ),
});

export default function EditSite() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchSite = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/login");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userData?.role !== "admin") {
        await supabase.auth.signOut();
        router.push("/admin/login");
        return;
      }

      const { data } = await supabase.from("heritage_sites").select("*").eq("id", params.id).single();
      if (data) setFormData(data);
      setLoading(false);
    };

    if (params.id) checkAuthAndFetchSite();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("heritage_sites")
      .update({
        name: formData.name,
        category: formData.category,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        short_description: formData.short_description,
        long_description: formData.long_description,
        operating_hours: formData.operating_hours,
        entrance_fee: formData.entrance_fee,
        status: formData.status,
      })
      .eq("id", params.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert("Updated");
      router.push("/admin/sites");
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete permanently?")) return;
    await supabase.from("heritage_sites").delete().eq("id", params.id);
    router.push("/admin/sites");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Edit Heritage Site</h1>
          <Link href="/admin/sites" className="text-white hover:text-green-200">
          ← Back to Sites
          </Link>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block font-semibold">Name</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Category</label>
            <select
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="archaeological">Archaeological</option>
              <option value="religious">Religious</option>
              <option value="museum">Museum</option>
              <option value="natural">Natural</option>
              <option value="educational">Educational</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">🗺️ Click on map to set location</label>
            <MapPicker
              onLocationSelect={(lat, lng) => {
                setFormData({ ...formData, latitude: lat.toString(), longitude: lng.toString() });
              }}
              initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
              initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-1">Latitude</label>
              <input type="text" name="latitude" value={formData.latitude || ""} readOnly className="w-full p-2 border rounded bg-gray-50" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Longitude</label>
              <input type="text" name="longitude" value={formData.longitude || ""} readOnly className="w-full p-2 border rounded bg-gray-50" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Short Description</label>
            <textarea
              value={formData.short_description || ""}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Long Description</label>
            <textarea
              value={formData.long_description || ""}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows={6}
              className="w-full p-2 border rounded"
              placeholder="Detailed description of the heritage site..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Operating Hours</label>
              <input
                type="text"
                value={formData.operating_hours || ""}
                onChange={(e) => setFormData({ ...formData, operating_hours: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold">Entrance Fee</label>
              <input
                type="text"
                value={formData.entrance_fee || ""}
                onChange={(e) => setFormData({ ...formData, entrance_fee: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block font-semibold">Status</label>
            <select
              value={formData.status || "draft"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 bg-green-700 text-white p-3 rounded">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-6 rounded">
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
