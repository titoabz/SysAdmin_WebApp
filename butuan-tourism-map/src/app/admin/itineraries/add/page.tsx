"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ArrayField = "highlights" | "sites" | "what_to_bring";

export default function AddItinerary() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    duration: "",
    description: "",
    difficulty: "Easy",
    best_time: "Morning",
    highlights: [""],
    sites: [""],
    what_to_bring: [""],
    meeting_point: "",
    price: "",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "name") {
        updated.slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      return updated;
    });
  };

  const handleArrayChange = (field: ArrayField, index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: ArrayField) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (field: ArrayField, index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("itineraries").insert({
      name: formData.name,
      slug: formData.slug,
      duration: formData.duration,
      description: formData.description,
      difficulty: formData.difficulty,
      best_time: formData.best_time,
      highlights: formData.highlights.filter((h) => h.trim()),
      sites: formData.sites.filter((s) => s.trim()),
      what_to_bring: formData.what_to_bring.filter((w) => w.trim()),
      meeting_point: formData.meeting_point,
      price: formData.price,
      status: formData.status,
    });

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert("Itinerary added");
      router.push("/admin/itineraries");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <Link href="/admin/itineraries">Back</Link>
        <h1 className="text-xl font-bold inline ml-4">Add Itinerary</h1>
      </nav>
      <div className="container mx-auto p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block font-semibold">Name *</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Duration</label>
              <input type="text" name="duration" onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold">Difficulty</label>
              <select
                name="difficulty"
                onChange={handleChange}
                value={formData.difficulty}
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
                name="best_time"
                onChange={handleChange}
                value={formData.best_time}
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
              name="description"
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Highlights</label>
            {formData.highlights.map((item, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("highlights", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("highlights", i)}
                  className="px-3 bg-red-100 rounded"
                >
                  x
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("highlights")} className="text-green-600 text-sm">
              Add Highlight
            </button>
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Sites</label>
            {formData.sites.map((item, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("sites", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("sites", i)}
                  className="px-3 bg-red-100 rounded"
                >
                  x
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("sites")} className="text-green-600 text-sm">
              Add Site
            </button>
          </div>

          <div className="mb-4">
            <label className="block font-semibold">What to Bring</label>
            {formData.what_to_bring.map((item, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("what_to_bring", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("what_to_bring", i)}
                  className="px-3 bg-red-100 rounded"
                >
                  x
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("what_to_bring")}
              className="text-green-600 text-sm"
            >
              Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Meeting Point</label>
              <input
                type="text"
                name="meeting_point"
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold">Price</label>
              <input type="text" name="price" onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-semibold">Status</label>
            <select name="status" onChange={handleChange} value={formData.status} className="w-full p-2 border rounded">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white p-3 rounded">
            {loading ? "Adding..." : "Add Itinerary"}
          </button>
        </form>
      </div>
    </div>
  );
}
