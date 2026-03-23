"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import ProductCard from "@/components/ProductCard";
import TextGenerateEffect from "@/components/aceternity/TextGenerateEffect";
import { products, categories, getProductsByCategory } from "@/lib/products";
import { Leaf, ShoppingBag } from "lucide-react";

export default function Products() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : getProductsByCategory(activeCategory);

  const getCategoryMeta = (slug: string) =>
    categories.find((c) => c.slug === slug);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-earth via-primary-dark to-earth" />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Our Products
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold mt-3 mb-4">
              <TextGenerateEffect words="Taste the Heritage" className="text-white" />
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">
              Every product is crafted with indigenous Kenyan ingredients,
              modern nutrition science, and deep respect for Africa&apos;s culinary traditions.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-30 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <ShoppingBag className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
                  activeCategory === cat.slug
                    ? "bg-primary text-white shadow-md shadow-primary/20"
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
      <section className="py-12 bg-muted/50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product) => {
              const catMeta = getCategoryMeta(product.categorySlug);
              return (
                <ProductCard
                  key={product.id}
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
