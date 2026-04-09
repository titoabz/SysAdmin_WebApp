"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Navigation() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Butuan Tourism Map
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-green-200">
            Map
          </Link>
          <Link href="/itineraries" className="hover:text-green-200">
            Itineraries
          </Link>
          <Link href="/about" className="hover:text-green-200">
            About
          </Link>
          {user ? (
            <div className="relative group">
              <button className="bg-white text-green-800 px-3 py-2 rounded-lg flex items-center gap-2">
                {user.email?.split("@")[0]}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block z-50">
                <Link href="/profile" className="block px-4 py-2 text-gray-700">
                  My Profile
                </Link>
                <Link href="/profile/visits" className="block px-4 py-2 text-gray-700">
                  My Visits
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="bg-white text-green-800 px-4 py-2 rounded-lg">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
