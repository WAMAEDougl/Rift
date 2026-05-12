import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("delivery_zones")
      .select("id, name, areas, fee, free_above, estimated_days")
      .eq("is_active", true)
      .order("fee", { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { zones: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json({ zones: [] });
  }
}
