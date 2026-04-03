"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import ProductCard from "@/components/ProductCard";
import TextGenerateEffect from "@/components/aceternity/TextGenerateEffect";
import { products as fallbackProducts, categories as fallbackCategories, formatPrice } from "@/lib/products";
import type { Product } from "@/lib/products";
import { Leaf, ShoppingBag } from "lucide-react";

interface Category {
  slug: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Fetch products and categories from DB
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/products").then(async (r) => {
        const json = await r.json();
        return json.products ?? [];
      }).catch(() => []),
      fetch("/api/categories").then(async (r) => {
        const json = await r.json();
        return json.categories ?? fallbackCategories;
      }).catch(() => fallbackCategories),
    ]).then(([dbProducts, dbCats]) => {
      if (dbProducts && dbProducts.length > 0) {
        const mapped = dbProducts.map((p: any) => ({
          id: String(p.legacy_id || p.id),
          name: p.name,
          slug: p.slug,
          category: p.category?.name ?? "",
          categorySlug: p.category?.slug ?? "",
          description: p.description ?? "",
          longDescription: p.long_description ?? "",
          price: p.price,
          size: p.size ?? "",
          image: p.image_url ?? "/images/products/placeholder.jpg",
          features: p.features ?? [],
          ingredients: p.ingredients ?? "",
          nutritionHighlights: p.nutrition_highlights ?? [],
          badge: p.badge ?? undefined,
          inStock: p.in_stock ?? true,
        }));
        setProducts(mapped);
      }
      if (dbCats && dbCats.length > 0) {
        setCategories(dbCats.map((c: Category) => ({
          slug: c.slug,
          name: c.name,
          icon: c.icon ?? "🍽️",
          color: c.color ?? fallbackCategories[0]?.color,
          bgColor: c.bgColor ?? "bg-gray-50",
        })));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categorySlug === activeCategory);

  const getCategoryMeta = (slug: string) =>
    categories.find((c) => c.slug === slug);

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-muted-foreground/60 text-lg">Loading products...</p>
      </div>
    );
  }

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

