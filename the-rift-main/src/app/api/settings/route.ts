// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Public endpoint — returns safe store settings for the user-facing site
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) throw new Error("Settings not found");

    // Only expose safe public fields — never expose API keys
    const publicSettings = {
      store_name: data.store_name ?? "Rift & Root",
      tagline: data.tagline ?? "Earth-First African Nourishment",
      support_phone: data.support_phone ?? null,
      support_email: data.support_email ?? null,
      whatsapp_number: data.whatsapp_number ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      country: data.country ?? "Kenya",
      default_delivery_fee: data.default_delivery_fee ?? 200,
      free_shipping_threshold: data.free_shipping_threshold ?? 2000,
      delivery_cities: data.delivery_cities ?? ["Nairobi"],
      currency: data.currency ?? "KES",
      logo_url: data.logo_url ?? null,
      primary_color: data.primary_color ?? null,
      secondary_color: data.secondary_color ?? null,
      accent_color: data.accent_color ?? null,
      // Social
      facebook_url: data.facebook_url ?? null,
      instagram_url: data.instagram_url ?? null,
      tiktok_url: data.tiktok_url ?? null,
      youtube_url: data.youtube_url ?? null,
      // Hours
      opening_hours: data.opening_hours ?? null,
      // Hero content
      hero_headline: data.hero_headline ?? null,
      hero_subheadline: data.hero_subheadline ?? null,
      hero_description: data.hero_description ?? null,
      hero_cta_text: data.hero_cta_text ?? null,
      hero_cta_url: data.hero_cta_url ?? null,
      // Stats
      stats: data.stats ?? null,
    };

    return NextResponse.json(
      { settings: publicSettings },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch {
    // Return safe defaults if DB unavailable
    return NextResponse.json({
      settings: {
        store_name: "Rift & Root",
        tagline: "Earth-First African Nourishment",
        default_delivery_fee: 200,
        free_shipping_threshold: 2000,
        delivery_cities: ["Nairobi"],
        currency: "KES",
      },
    });
  }
}
