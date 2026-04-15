import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // This endpoint is intended for local diagnostics from browser console.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 });
    }

    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: reviews?.length || 0, reviews: reviews || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
