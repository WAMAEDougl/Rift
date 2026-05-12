import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import { getProductsFromDB, getCategoriesFromDB } from "@/lib/products";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Our Products — Rift & Root",
  description:
    "Every product is crafted with indigenous Kenyan ingredients, modern nutrition science, and deep respect for Africa's culinary traditions.",
  openGraph: {
    title: "Our Products — Rift & Root",
    description:
      "Heritage African meals, beverages and pantry goods. Hand-crafted in small batches in Nairobi.",
  },
};

export default async function ProductsPage() {
  const [products, cats] = await Promise.all([
    getProductsFromDB(),
    getCategoriesFromDB(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden ink-gradient">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-accent text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
            <Leaf className="w-4 h-4" /> Our Products
          </span>
          <h1 className="text-4xl sm:text-6xl font-display font-medium mt-3 mb-4 text-background">
            Taste the Heritage
          </h1>
          <p className="text-background/60 max-w-2xl mx-auto text-base md:text-lg">
            Every product is crafted with indigenous Kenyan ingredients, modern nutrition science,
            and deep respect for Africa&apos;s culinary traditions.
          </p>
        </div>
      </section>

      <ProductsClient initialProducts={products} categories={cats} />
    </>
  );
}
