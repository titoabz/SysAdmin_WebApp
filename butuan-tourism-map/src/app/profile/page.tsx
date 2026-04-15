"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/auth/login");
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      {/* Admin Dashboard Card - Only visible to admins */}
      {isAdmin && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">👑</span>
            <h2 className="text-xl font-bold text-green-800">Admin Access</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            You have administrator privileges. Manage heritage sites, itineraries, and reviews.
          </p>
          <Link 
            href="/admin/dashboard" 
            className="inline-block bg-green-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-800 transition"
          >
            Go to Admin Dashboard →
          </Link>
        </div>
      )}
      
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-green-700 font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.email}</p>
            <p className="text-sm text-gray-500">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
            {isAdmin && (
              <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Administrator
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="font-medium text-gray-800">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Account Created</label>
            <p className="font-medium text-gray-800">{new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">User ID</label>
            <p className="font-mono text-xs text-gray-500 break-all">{user?.id}</p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link 
            href="/profile/visits" 
            className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            View My Visited Sites
          </Link>
        </div>
      </div>
    </div>
  );
}
