"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product, Category } from "@/lib/products";

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts =
    activeCategory === "all"
      ? initialProducts
      : initialProducts.filter((p) => p.categorySlug === activeCategory);

  const getCategoryMeta = (slug: string) => categories.find((c) => c.slug === slug);

  return (
    <>
      {/* Filter Bar */}
      <section className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <ShoppingBag className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              All ({initialProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const catMeta = getCategoryMeta(product.categorySlug);
              return (
                <ProductCard
                  key={product.slug}
                  product={product}
                  categoryColor={catMeta?.color || "from-amber-200 to-orange-300"}
                  categoryIcon={catMeta?.icon || "🍽️"}
                />
              );
            })}
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground/60 text-lg">No products in this category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
