import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getProductsFromDB } from "@/lib/products";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop — Rift & Root",
  description:
    "Browse heritage African meals, beverages and pantry essentials, hand-crafted in small batches in Nairobi.",
};

interface ShopHeroConfig {
  eyebrow?: string;
  headline?: string;
  description?: string;
}

async function getShopPageConfig(): Promise<ShopHeroConfig> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("page_content")
      .select("content")
      .eq("page", "page_config_shop")
      .single();

    if (!data?.content) return {};
    const cfg = data.content as { sections?: Array<{ id: string; fields?: ShopHeroConfig }> };
    const heroSection = cfg.sections?.find((s) => s.id === "hero");
    return heroSection?.fields ?? {};
  } catch {
    return {};
  }
}

export default async function ShopPage() {
  const [products, heroConfig] = await Promise.all([
    getProductsFromDB(),
    getShopPageConfig(),
  ]);
  return <ShopClient products={products} heroConfig={heroConfig} />;
}
