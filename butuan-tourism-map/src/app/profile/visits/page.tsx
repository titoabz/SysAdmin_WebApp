"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadVisits = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("user_visits")
        .select("id, visited_at, rating, site:heritage_sites(id, name, slug, category)")
        .eq("user_id", user.id)
        .order("visited_at", { ascending: false });

      setVisits(data || []);
      setLoading(false);
    };

    loadVisits();
  }, [router]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (visits.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Visits Yet</h1>
        <Link href="/" className="bg-green-700 text-white px-6 py-2 rounded">
          Explore Map
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Visits</h1>
      <div className="space-y-4">
        {visits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between">
              <Link href={`/sites/${visit.site.slug}`}>
                <h2 className="text-xl font-bold text-green-800">{visit.site.name}</h2>
              </Link>
              <div>{visit.rating ? "*".repeat(visit.rating) : "Not rated"}</div>
            </div>
            <p className="text-sm text-gray-500">{new Date(visit.visited_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
