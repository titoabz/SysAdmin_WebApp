import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      count: reviews?.length || 0,
      reviews: reviews || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
