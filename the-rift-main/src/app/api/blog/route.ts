// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, category, cover_image, author, read_time, tags, is_featured, published_at")
      .eq("is_active", true)
      .order("published_at", { ascending: false });

    if (category && category !== "all") query = query.eq("category", category);
    if (featured === "true") query = query.eq("is_featured", true);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      { posts: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240" } }
    );
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
