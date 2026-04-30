import { createClient } from "@supabase/supabase-js";
import FAQClient from "./FAQClient";
import { faqCategories, faqs as fallbackFaqs } from "@/lib/faq";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Rift & Root",
  description: "Frequently asked questions about our products, ordering, and delivery.",
};

async function getFAQs() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("faqs")
      .select("question, answer, category, sort_order")
      .eq("is_active", true)
      .order("category")
      .order("sort_order");

    if (error || !data || data.length === 0) throw new Error("No FAQs");
    return data;
  } catch {
    return fallbackFaqs;
  }
}

export default async function FAQPage() {
  const faqs = await getFAQs();
  return <FAQClient faqs={faqs} categories={faqCategories} />;
}
