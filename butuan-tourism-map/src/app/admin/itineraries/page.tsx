"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminItineraries() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

      const { data } = await supabase
        .from("itineraries")
        .select("*")
        .order("created_at", { ascending: false });

      setItineraries(data || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabase.from("itineraries").delete().eq("id", id);
    setItineraries((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-xl font-bold">Manage Itineraries</h1>
          <Link href="/admin/dashboard">Back</Link>
        </div>
      </nav>
      <div className="container mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">All Itineraries</h2>
          <Link href="/admin/itineraries/add" className="bg-green-700 text-white px-4 py-2 rounded">
            Add New
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left">Difficulty</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {itineraries.map((itinerary) => (
                <tr key={itinerary.id} className="border-t">
                  <td className="p-3">{itinerary.name}</td>
                  <td className="p-3">{itinerary.duration}</td>
                  <td className="p-3">{itinerary.difficulty}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        itinerary.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100"
                      }`}
                    >
                      {itinerary.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/itineraries/edit/${itinerary.id}`} className="text-blue-600 mr-3">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(itinerary.id, itinerary.name)} className="text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
