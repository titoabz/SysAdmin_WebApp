"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminLink() {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return null;
  if (!isAdmin) return null;
  
  return (
    <Link href="/admin/dashboard" className="text-green-700 hover:text-green-800 transition px-3 py-2 inline-block font-medium">
      Admin Dashboard →
    </Link>
  );
}
