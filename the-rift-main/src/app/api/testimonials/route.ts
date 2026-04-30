import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("testimonials")
      .select("name, role, location, quote, rating, product")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(6);

    if (error) throw error;

    return NextResponse.json(
      { testimonials: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240" } }
    );
  } catch {
    return NextResponse.json({ testimonials: [] });
  }
}
