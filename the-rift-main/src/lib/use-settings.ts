/**
 * Shared hook for fetching public store settings.
 * Used by user-facing pages to get configurable content.
 */

export interface PublicSettings {
  store_name: string;
  tagline: string;
  support_phone: string | null;
  support_email: string | null;
  whatsapp_number: string | null;
  address: string | null;
  city: string | null;
  country: string;
  default_delivery_fee: number;
  free_shipping_threshold: number;
  delivery_cities: string[];
  currency: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  opening_hours: Array<{ day: string; hours: string; is_open: boolean }> | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  hero_description: string | null;
  hero_cta_text: string | null;
  hero_cta_url: string | null;
  stats: Array<{ value: string; label: string }> | null;
}

export const DEFAULT_SETTINGS: PublicSettings = {
  store_name: "Rift & Root",
  tagline: "Earth-First African Nourishment",
  support_phone: "0713 280 550",
  support_email: "ayola.foods.kenya@gmail.com",
  whatsapp_number: "254713280550",
  address: "Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari",
  city: "Nairobi",
  country: "Kenya",
  default_delivery_fee: 200,
  free_shipping_threshold: 2000,
  delivery_cities: ["Nairobi"],
  currency: "KES",
  logo_url: null,
  primary_color: null,
  secondary_color: null,
  accent_color: null,
  facebook_url: "https://www.facebook.com/p/Ayola-Foods-Kenya-100087278121034/",
  instagram_url: "https://www.instagram.com/ayolafoods/",
  tiktok_url: "https://www.tiktok.com/@priscakiragu",
  youtube_url: null,
  opening_hours: [
    { day: "Monday - Friday", hours: "7:00 AM - 8:00 PM", is_open: true },
    { day: "Saturday", hours: "7:00 AM - 8:00 PM", is_open: true },
    { day: "Sunday", hours: "8:00 AM - 6:00 PM", is_open: true },
  ],
  hero_headline: "Where the Rift feeds the table.",
  hero_subheadline: "Earth-first · Est. 2018",
  hero_description:
    "Heritage African cooking, hand-crafted in small batches from the volcanic soils of the Rift Valley. Delivered to your door with care.",
  hero_cta_text: "Order Now",
  hero_cta_url: "/shop",
  stats: [
    { value: "100%", label: "Organic Heritage" },
    { value: "42", label: "Partner Farms" },
    { value: "6+", label: "Years Crafting" },
    { value: "47", label: "Counties Reached" },
  ],
};

/** Server-side fetch — use in Server Components */
export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) return DEFAULT_SETTINGS;

    return {
      store_name: data.store_name ?? DEFAULT_SETTINGS.store_name,
      tagline: data.tagline ?? DEFAULT_SETTINGS.tagline,
      support_phone: data.support_phone ?? DEFAULT_SETTINGS.support_phone,
      support_email: data.support_email ?? DEFAULT_SETTINGS.support_email,
      whatsapp_number: data.whatsapp_number ?? DEFAULT_SETTINGS.whatsapp_number,
      address: data.address ?? DEFAULT_SETTINGS.address,
      city: data.city ?? DEFAULT_SETTINGS.city,
      country: data.country ?? DEFAULT_SETTINGS.country,
      default_delivery_fee: data.default_delivery_fee ?? DEFAULT_SETTINGS.default_delivery_fee,
      free_shipping_threshold: data.free_shipping_threshold ?? DEFAULT_SETTINGS.free_shipping_threshold,
      delivery_cities: data.delivery_cities ?? DEFAULT_SETTINGS.delivery_cities,
      currency: data.currency ?? DEFAULT_SETTINGS.currency,
      logo_url: data.logo_url ?? null,
      primary_color: data.primary_color ?? null,
      secondary_color: data.secondary_color ?? null,
      accent_color: data.accent_color ?? null,
      facebook_url: data.facebook_url ?? DEFAULT_SETTINGS.facebook_url,
      instagram_url: data.instagram_url ?? DEFAULT_SETTINGS.instagram_url,
      tiktok_url: data.tiktok_url ?? DEFAULT_SETTINGS.tiktok_url,
      youtube_url: data.youtube_url ?? null,
      opening_hours: data.opening_hours ?? DEFAULT_SETTINGS.opening_hours,
      hero_headline: data.hero_headline ?? DEFAULT_SETTINGS.hero_headline,
      hero_subheadline: data.hero_subheadline ?? DEFAULT_SETTINGS.hero_subheadline,
      hero_description: data.hero_description ?? DEFAULT_SETTINGS.hero_description,
      hero_cta_text: data.hero_cta_text ?? DEFAULT_SETTINGS.hero_cta_text,
      hero_cta_url: data.hero_cta_url ?? DEFAULT_SETTINGS.hero_cta_url,
      stats: data.stats ?? DEFAULT_SETTINGS.stats,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Client-side fetch — use in Client Components */
export async function fetchPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return DEFAULT_SETTINGS;
    const data = await res.json();
    return { ...DEFAULT_SETTINGS, ...data.settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
