"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditItinerary() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchItinerary = async () => {
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

      const { data } = await supabase.from("itineraries").select("*").eq("id", params.id).single();
      if (data) setFormData(data);
      setLoading(false);
    };

    if (params.id) checkAuthAndFetchItinerary();
  }, [params.id, router]);

  const updateArrayValue = (field: "highlights" | "sites" | "what_to_bring", index: number, value: string) => {
    const next = [...(formData[field] || [])];
    next[index] = value;
    setFormData({ ...formData, [field]: next });
  };

  const removeArrayValue = (field: "highlights" | "sites" | "what_to_bring", index: number) => {
    const next = (formData[field] || []).filter((_: string, idx: number) => idx !== index);
    setFormData({ ...formData, [field]: next });
  };

  const addArrayValue = (field: "highlights" | "sites" | "what_to_bring") => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("itineraries")
      .update({
        name: formData.name,
        duration: formData.duration,
        description: formData.description,
        difficulty: formData.difficulty,
        best_time: formData.best_time,
        highlights: formData.highlights?.filter((h: string) => h.trim()),
        sites: formData.sites?.filter((s: string) => s.trim()),
        what_to_bring: formData.what_to_bring?.filter((w: string) => w.trim()),
        meeting_point: formData.meeting_point,
        price: formData.price,
        status: formData.status,
      })
      .eq("id", params.id);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert("Updated");
      router.push("/admin/itineraries");
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete permanently?")) return;
    await supabase.from("itineraries").delete().eq("id", params.id);
    router.push("/admin/itineraries");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Edit Itineraries</h1>
          <Link href="/admin/dashboard" className="text-white hover:text-green-200">
            ← Back to Itineraries
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Duration</label>
              <input
                type="text"
                value={formData.duration || ""}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold">Difficulty</label>
              <select
                value={formData.difficulty || "Easy"}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option>Easy</option>
                <option>Moderate</option>
                <option>Challenging</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold">Best Time</label>
              <select
                value={formData.best_time || "Morning"}
                onChange={(e) => setFormData({ ...formData, best_time: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Early Morning</option>
                <option>Late Afternoon</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Highlights</label>
            {(formData.highlights || [""]).map((item: string, i: number) => (
              <div key={i} className="flex gap-2 mb-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayValue("highlights", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button type="button" onClick={() => removeArrayValue("highlights", i)} className="px-3 bg-red-100 rounded">
                  x
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayValue("highlights")} className="text-green-600 text-sm">
              Add Highlight
            </button>
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Sites</label>
            {(formData.sites || [""]).map((item: string, i: number) => (
              <div key={i} className="flex gap-2 mb-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayValue("sites", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button type="button" onClick={() => removeArrayValue("sites", i)} className="px-3 bg-red-100 rounded">
                  x
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayValue("sites")} className="text-green-600 text-sm">
              Add Site
            </button>
          </div>

          <div className="mb-4">
            <label className="block font-semibold">What to Bring</label>
            {(formData.what_to_bring || [""]).map((item: string, i: number) => (
              <div key={i} className="flex gap-2 mb-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayValue("what_to_bring", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeArrayValue("what_to_bring", i)}
                  className="px-3 bg-red-100 rounded"
                >
                  x
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayValue("what_to_bring")} className="text-green-600 text-sm">
              Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Meeting Point</label>
              <input
                type="text"
                value={formData.meeting_point || ""}
                onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold">Price</label>
              <input
                type="text"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
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
