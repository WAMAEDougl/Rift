"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShoppingCart, Plus, Minus, Check, Heart, Share2,
  Truck, ShieldCheck, Beaker, Clock, ChefHat, Package,
} from "lucide-react";
import { getProductBySlug, getCategoryBySlug, formatPrice, products as fallbackProducts, categories as fallbackCategories } from "@/lib/products";
import type { Product, Category as FallbackCategory } from "@/lib/products";
import { nutritionData } from "@/lib/nutrition";
import { recipes } from "@/lib/recipes";
import { useCart } from "@/lib/cart-context";
import { getWhatsAppOrderLink } from "@/lib/constants";
import NutritionFacts from "@/components/products/NutritionFacts";
import RelatedProducts from "@/components/products/RelatedProducts";
import VideoEmbed from "@/components/recipes/VideoEmbed";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const fallbackProduct = getProductBySlug(slug);

  const [product, setProduct] = useState<Product | undefined>(fallbackProduct);
  const [loading, setLoading] = useState(!fallbackProduct);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "nutrition" | "preparation">("details");
  const { addItem } = useCart();

  useEffect(() => {
    if (fallbackProduct) return; // Already have it from hardcoded data
    setLoading(true);
    fetch("/api/products")
      .then(async (r) => {
        const json = await r.json();
        const dbProducts = json.data?.products ?? [];
        const found = dbProducts.find((p: any) => p.slug === slug);
        if (found) {
          return {
            id: String(found.legacy_id || found.id),
            name: found.name,
            slug: found.slug,
            category: found.category?.name ?? "",
            categorySlug: found.category?.slug ?? "",
            description: found.description ?? "",
            longDescription: found.long_description ?? "",
            price: found.price,
            size: found.size ?? "",
            image: found.image_url ?? "/images/products/placeholder.jpg",
            features: found.features ?? [],
            ingredients: found.ingredients ?? "",
            nutritionHighlights: found.nutrition_highlights ?? [],
            badge: found.badge ?? undefined,
            inStock: found.in_stock ?? true,
          };
        }
        return null;
      })
      .then((p) => {
        setProduct(p ?? undefined);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, fallbackProduct]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-muted-foreground/60 text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h1 className="text-3xl font-bold text-earth mb-4">Product Not Found</h1>
        <Link href="/products" className="text-primary font-semibold hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const fallbackCategory = getCategoryBySlug(product.categorySlug);
  const category = fallbackCategory;
  const nutrition = nutritionData[slug];
  const relatedRecipe = recipes.find((r) => r.relatedProduct === slug);

  const categoryIcons: Record<string, string> = {
    meals: "🍽️", beverages: "🥤", packaged: "🌾", breakfast: "🍳",
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => { setAdded(false); setQuantity(1); }, 2000);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-24 pb-2 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/products" className="hover:text-primary transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Products
            </Link>
            <span>/</span>
            <span className="text-muted-foreground/60">{category?.name}</span>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="pb-12 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 pt-6">
            {/* Left: Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className={`aspect-square rounded-3xl bg-gradient-to-br ${category?.color || "from-amber-200 to-orange-300"} overflow-hidden relative`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-card/90 backdrop-blur-sm text-sm font-bold px-4 py-1.5 rounded-full text-foreground shadow-sm">
                    {product.badge}
                  </span>
                )}
                {product.categorySlug === "packaged" && (
                  <span className="bg-green-600/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-white inline-flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Ships Countrywide
                  </span>
                )}
              </div>
            </motion.div>

            {/* Right: Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              {/* Category */}
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                {category?.name}
              </span>

              {/* Name */}
              <h1 className="text-3xl sm:text-4xl font-bold text-earth mt-2 mb-3">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted-foreground/60">{product.size}</span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.longDescription || product.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.features.map((f) => (
                  <span key={f} className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                    {f}
                  </span>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 mb-6 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Beaker className="w-4 h-4 text-primary" /> Food Scientist Formulated
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-600" /> 100% Natural
                </span>
                {product.categorySlug === "packaged" && (
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blue-600" /> Free Delivery over KES 2,000
                  </span>
                )}
              </div>

              {/* Add to Cart */}
              {product.price > 0 ? (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-muted transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 text-lg font-semibold min-w-[48px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={added}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${
                      added
                        ? "bg-green-500 text-white"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    {added ? (
                      <><Check className="w-5 h-5" /> Added to Cart!</>
                    ) : (
                      <><ShoppingCart className="w-5 h-5" /> Add to Cart — {formatPrice(product.price * quantity)}</>
                    )}
                  </button>
                </div>
              ) : (
                <a
                  href={getWhatsAppOrderLink(`Hi, I'm interested in ${product.name}. Can you tell me more?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors mb-6"
                >
                  <ChefHat className="w-5 h-5" /> Inquire on WhatsApp
                </a>
              )}

              {/* Secondary actions */}
              <div className="flex gap-3 mb-8">
                <a
                  href={getWhatsAppOrderLink(`Hi, I have a question about ${product.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <Heart className="w-4 h-4" /> Ask a Question
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: product.name, url: window.location.href });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {/* Nutrition Facts (if available) */}
              {nutrition && <NutritionFacts info={nutrition} />}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs: Details / Preparation / Ingredients */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab buttons */}
          <div className="flex gap-1 border-b border-border mb-8">
            {(["details", "nutrition", "preparation"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {tab === "details" ? "Details & Ingredients" : tab === "nutrition" ? "Health Benefits" : "How to Prepare"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              {activeTab === "details" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-earth mb-3">About This Product</h3>
                    <p className="text-muted-foreground leading-relaxed">{product.longDescription || product.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-earth mb-3">Ingredients</h3>
                    <p className="text-muted-foreground">{product.ingredients}</p>
                  </div>
                  {nutrition?.allergens && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-amber-800 mb-1">Allergen Information</h3>
                      <p className="text-sm text-amber-700">{nutrition.allergens.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "nutrition" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-earth mb-3">Nutrition Highlights</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {product.nutritionHighlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 bg-green-50 rounded-xl p-3">
                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="text-sm text-foreground/80">{h}</span>
                      </div>
                    ))}
                  </div>
                  {nutrition?.dietaryInfo && (
                    <div>
                      <h3 className="text-lg font-bold text-earth mb-3 mt-6">Dietary Information</h3>
                      <div className="flex flex-wrap gap-2">
                        {nutrition.dietaryInfo.map((d) => (
                          <span key={d} className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "preparation" && (
                <div className="space-y-6">
                  {nutrition?.preparation ? (
                    <div>
                      <h3 className="text-lg font-bold text-earth mb-3 inline-flex items-center gap-2">
                        <Clock className="w-5 h-5" /> How to Prepare
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{nutrition.preparation}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">This product is ready to eat. No preparation needed!</p>
                  )}
                  {nutrition?.storage && (
                    <div>
                      <h3 className="text-lg font-bold text-earth mb-3 inline-flex items-center gap-2">
                        <Package className="w-5 h-5" /> Storage
                      </h3>
                      <p className="text-muted-foreground">{nutrition.storage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar: Related Recipe */}
            <aside>
              {relatedRecipe && (
                <div className="bg-muted/50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Watch the Recipe
                  </h3>
                  <VideoEmbed
                    url={relatedRecipe.video.url}
                    platform={relatedRecipe.video.platform}
                    title={relatedRecipe.title}
                  />
                  <Link
                    href={`/recipes/${relatedRecipe.slug}`}
                    className="block mt-3 text-primary font-semibold text-sm hover:underline"
                  >
                    View Full Recipe →
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <RelatedProducts currentSlug={slug} currentCategory={product.categorySlug} />
    </>
  );
}
