import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("store_settings")
      .select(
        "store_name, logo_url, tagline, hero_bg_image_url, hero_eyebrow, hero_headline, hero_headline_accent, hero_description, hero_cta_text, hero_cta_url, hero_cta2_text, hero_cta2_url, hero_stat1_value, hero_stat1_label, hero_stat1_sub, hero_stat2_value, hero_stat2_label, hero_stat2_sub, hero_stat3_value, hero_stat3_label, hero_stat3_sub"
      )
      .eq("id", 1)
      .single();

    if (error || !data) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json(
      { config: data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    return NextResponse.json({ config: null });
  }
}
