"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VisitButton({ siteId }: { siteId: number }) {
  const [user, setUser] = useState<any>(null);
  const [hasVisited, setHasVisited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkVisit = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("user_visits")
          .select("id")
          .eq("user_id", user.id)
          .eq("site_id", siteId)
          .maybeSingle();

        if (data) setHasVisited(true);
      }
    };

    checkVisit();
  }, [siteId]);

  const toggleVisit = async () => {
    if (!user) {
      alert("Please sign in to track visits");
      return;
    }

    setLoading(true);

    if (hasVisited) {
      await supabase.from("user_visits").delete().eq("user_id", user.id).eq("site_id", siteId);
      setHasVisited(false);
    } else {
      await supabase.from("user_visits").insert({ user_id: user.id, site_id: siteId });
      setHasVisited(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleVisit}
      disabled={loading}
      className={`px-4 py-2 rounded ${hasVisited ? "bg-gray-500" : "bg-green-700"} text-white`}
    >
      {loading ? "Updating..." : hasVisited ? "Visited" : "Mark as Visited"}
    </button>
  );
}
