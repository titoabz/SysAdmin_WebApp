"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface Review {
  id: number;
  site_id: number;
  rating: number;
  comment: string;
  status: string;
  reviewer_name: string;
  reviewer_email: string;
  created_at: string;
  site_name?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadReviews();
  }, [filter]);

  const checkAuthAndLoadReviews = async () => {
    setLoading(true);
    setError("");

    try {
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

      let query = supabase
        .from("reviews")
        .select(
          `
          *,
          site:heritage_sites (
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error: reviewsError } = await query;

      if (reviewsError) {
        console.error("Reviews error:", reviewsError);
        setError(reviewsError.message);
        setReviews([]);
        setLoading(false);
        return;
      }

      const formattedReviews = (data || []).map((review: any) => ({
        ...review,
        site_name: review.site?.name || `Site ID: ${review.site_id}`,
      }));

      setReviews(formattedReviews);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: number, status: "approved" | "rejected") => {
    try {
      const { error } = await supabaseAdmin
        .from("reviews")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setSuccess(`Review ${status}!`);
      setTimeout(() => setSuccess(""), 2000);
      checkAuthAndLoadReviews();
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    try {
      const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);
      if (error) throw error;
      setSuccess("Review deleted!");
      setTimeout(() => setSuccess(""), 2000);
      checkAuthAndLoadReviews();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStars = (rating: number) => "⭐".repeat(rating) + "☆".repeat(5 - rating);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const stats = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    total: reviews.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Manage Reviews</h1>
          <Link href="/admin/dashboard" className="hover:text-green-200">
            ← Back
          </Link>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>}
        {success && <div className="mb-4 bg-green-100 text-green-700 p-3 rounded">{success}</div>}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-gray-500">Total</p></div>
          <div className="bg-white p-4 rounded-lg shadow text-center"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p><p className="text-sm text-gray-500">Pending</p></div>
          <div className="bg-white p-4 rounded-lg shadow text-center"><p className="text-2xl font-bold text-green-600">{stats.approved}</p><p className="text-sm text-gray-500">Approved</p></div>
          <div className="bg-white p-4 rounded-lg shadow text-center"><p className="text-2xl font-bold text-red-600">{stats.rejected}</p><p className="text-sm text-gray-500">Rejected</p></div>
        </div>

        <div className="flex gap-2 mb-6 border-b">
          {["all", "pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-medium transition capitalize ${
                filter === tab ? "text-green-700 border-b-2 border-green-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab} ({stats[tab as keyof typeof stats] || 0})
            </button>
          ))}
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No reviews found.
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} className="ml-2 text-green-600 underline">
                View all reviews
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{review.reviewer_name || "Anonymous"}</span>
                      <span className="text-sm">{getStars(review.rating)}</span>
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">📍 {review.site_name}</div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleString()}</span>
                </div>
                <p className="text-gray-700 mb-4">{review.comment}</p>
                <div className="flex gap-3">
                  {review.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleModerate(review.id, "approved")}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleModerate(review.id, "rejected")}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {review.status === "approved" && (
                    <button
                      onClick={() => handleModerate(review.id, "rejected")}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Move to Rejected
                    </button>
                  )}
                  {review.status === "rejected" && (
                    <button
                      onClick={() => handleModerate(review.id, "approved")}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Move to Approved
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
