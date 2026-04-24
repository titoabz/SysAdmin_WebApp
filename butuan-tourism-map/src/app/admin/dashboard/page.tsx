"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ sites: 0, itineraries: 0 });
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

      const { count: siteCount } = await supabase
        .from("heritage_sites")
        .select("*", { count: "exact", head: true });
      const { count: itineraryCount } = await supabase
        .from("itineraries")
        .select("*", { count: "exact", head: true });

      setStats({ sites: siteCount || 0, itineraries: itineraryCount || 0 });
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </nav>
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Total Sites</h3>
            <p className="text-3xl font-bold">{stats.sites}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500">Total Itineraries</h3>
            <p className="text-3xl font-bold">{stats.itineraries}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/sites" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold">Manage Sites</h2>
            <p className="text-gray-600">Add, edit, or delete heritage sites</p>
          </Link>
          <Link href="/admin/itineraries" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold">Manage Itineraries</h2>
            <p className="text-gray-600">Create and edit tour packages</p>
          </Link>
          <Link href="/admin/reviews" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⭐</span>
              <h2 className="text-xl font-bold">Manage Reviews</h2>
            </div>
            <p className="text-gray-600">Approve, reject, or delete user reviews</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
