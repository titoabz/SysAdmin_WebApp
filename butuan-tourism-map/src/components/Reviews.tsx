"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface ReviewsProps {
  siteId: number;
  siteName: string;
}

export default function Reviews({ siteId, siteName }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("site_id", siteId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      setReviews(data || []);
      setLoading(false);
    };

    fetchReviews();
  }, [siteId]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSubmitError("Please sign in to leave a review");
      return;
    }
    if (!comment.trim()) {
      setSubmitError("Please enter your review");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    const { error } = await supabase.from("reviews").insert({
      site_id: siteId,
      user_id: user.id,
      rating,
      comment: comment.trim(),
      reviewer_name: user.email?.split("@")[0] || "Anonymous",
      reviewer_email: user.email,
      status: "pending",
    });

    if (error) {
      setSubmitError(error.message);
    } else {
      setSubmitSuccess("Thank you! Your review has been submitted and will appear after admin approval.");
      setComment("");
      setRating(5);
    }
    setSubmitting(false);
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={interactive ? () => setRating(star) : undefined}
            className={`text-2xl ${interactive ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}`}
          >
            {star <= currentRating ? "⭐" : "☆"}
          </button>
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Reviews</h3>

      {reviews.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-700">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">out of 5</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                {renderStars(Math.round(averageRating))}
                <span className="text-gray-600">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Write a Review for {siteName}</h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
            {renderStars(rating, true)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Share your experience at this heritage site..."
              required
            />
          </div>

          {submitError && <div className="mb-3 text-red-600 text-sm bg-red-50 p-2 rounded">{submitError}</div>}
          {submitSuccess && (
            <div className="mb-3 text-green-600 text-sm bg-green-50 p-2 rounded">{submitSuccess}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-green-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 transition"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
          <p className="text-xs text-gray-400 mt-2">Your review will appear after admin approval.</p>
        </form>
      ) : (
        <div className="mb-8 p-5 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            <Link href="/auth/login" className="text-green-700 hover:underline">
              Sign in
            </Link>{" "}
            to leave a review.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="font-semibold text-gray-800">{review.reviewer_name}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
