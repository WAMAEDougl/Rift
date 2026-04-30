import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position") ?? "hero";

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("banners")
      .select("id, title, subtitle, description, image_url, mobile_image_url, link_url, link_text, position, sort_order, title_color, subtitle_color, description_color")
      .eq("position", position)
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { banners: data ?? [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ banners: [] });
  }
}
