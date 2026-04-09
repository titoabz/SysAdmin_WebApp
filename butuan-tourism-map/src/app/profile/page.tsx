"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="mb-2">
          <strong>Email:</strong> {user?.email}
        </p>
        <p className="mb-4">
          <strong>Member since:</strong> {new Date(user?.created_at).toLocaleDateString()}
        </p>
        <Link href="/profile/visits" className="inline-block bg-green-700 text-white px-4 py-2 rounded">
          View My Visits
        </Link>
      </div>
    </div>
  );
}
