"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminSites() {
  const [sites, setSites] = useState<any[]>([]);
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
        .from("heritage_sites")
        .select("*")
        .order("created_at", { ascending: false });

      setSites(data || []);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabase.from("heritage_sites").delete().eq("id", id);
    setSites((prev) => prev.filter((site) => site.id !== id));
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-xl font-bold">Manage Sites</h1>
          <Link href="/admin/dashboard">Back</Link>
        </div>
      </nav>
      <div className="container mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">All Sites</h2>
          <Link href="/admin/sites/add" className="bg-green-700 text-white px-4 py-2 rounded">
            Add New
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
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
              {sites.map((site) => (
                <tr key={site.id} className="border-t">
                  <td className="p-3">{site.name}</td>
                  <td className="p-3 capitalize">{site.category}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        site.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100"
                      }`}
                    >
                      {site.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/sites/edit/${site.id}`} className="text-blue-600 mr-3">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(site.id, site.name)} className="text-red-600">
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
