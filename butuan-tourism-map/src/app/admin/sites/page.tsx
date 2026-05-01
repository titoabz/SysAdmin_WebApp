"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminSites() {
  const [sites, setSites] = useState<any[]>([]);
  const [filteredSites, setFilteredSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
        .from("heritage_sites")
        .select("*")
        .order("created_at", { ascending: false });

      setSites(data || []);
      setFilteredSites(data || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSites(sites);
    } else {
      const filtered = sites.filter(
        (site) =>
          site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSites(filtered);
    }
  }, [searchTerm, sites]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabase.from("heritage_sites").delete().eq("id", id);
    setSites(sites.filter((s) => s.id !== id));
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Manage Sites</h1>
          <Link href="/admin/dashboard" className="text-white hover:text-green-200">
            ← Back
          </Link>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">All Sites</h2>

          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search by name, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
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

            <Link
              href="/admin/sites/add"
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            >
              + Add New
            </Link>
          </div>
        </div>

        {filteredSites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? "No matching sites found." : "No sites found. Click 'Add New' to get started."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.map((site) => (
                    <tr key={site.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{site.name}</td>
                      <td className="p-3 capitalize">{site.category}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            site.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {site.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/admin/sites/edit/${site.id}`}
                          className="text-blue-600 mr-3 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(site.id, site.name)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

