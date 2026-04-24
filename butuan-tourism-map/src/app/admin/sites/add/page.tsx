"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AddSite() {
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
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
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

      setAuthChecking(false);
    };

    checkAuth();
  }, [router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      alert(`Error: ${error.message}`);
    } else {
      alert("Site added");
      router.push("/admin/sites");
    }

    setLoading(false);
  };

  if (authChecking) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <Link href="/admin/sites">Back</Link>
        <h1 className="text-xl font-bold inline ml-4">Add Site</h1>
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
          <div className="mb-4">
            <label className="block font-semibold">Category *</label>
            <select
              name="category"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              value={formData.category}
            >
              <option value="archaeological">Archaeological</option>
              <option value="religious">Religious</option>
              <option value="museum">Museum</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Latitude *</label>
              <input
                type="number"
                step="any"
                name="latitude"
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold">Longitude *</label>
              <input
                type="number"
                step="any"
                name="longitude"
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Short Description</label>
            <textarea
              name="short_description"
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Operating Hours</label>
              <input
                type="text"
                name="operating_hours"
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block font-semibold">Entrance Fee</label>
              <input
                type="text"
                name="entrance_fee"
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block font-semibold">Status</label>
            <select
              name="status"
              onChange={handleChange}
              className="w-full p-2 border rounded"
              value={formData.status}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white p-3 rounded">
            {loading ? "Adding..." : "Add Site"}
          </button>
        </form>
      </div>
    </div>
  );
}
