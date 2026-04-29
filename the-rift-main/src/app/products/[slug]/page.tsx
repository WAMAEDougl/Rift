import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Beaker, Truck } from "lucide-react";
import { getProductBySlug, getCategoryBySlug, formatPrice, getProductsFromDB } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  // Try DB first, fall back to static
  const dbProducts = await getProductsFromDB();
  const dbProduct = dbProducts.find((p) => p.slug === slug);
  if (dbProduct) return dbProduct;
  return getProductBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} — AyolaFoods`,
      description: product.longDescription || product.description,
      images: product.image ? [{ url: product.image }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-24 pb-2 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/products"
              className="hover:text-primary transition-colors inline-flex items-center gap-1"
            >
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
      <section className="pb-12 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 pt-6">
            {/* Left: Product Image */}
            <div className="relative">
              <div
                className={`aspect-square rounded-3xl bg-gradient-to-br ${category?.color || "from-amber-200 to-orange-300"} overflow-hidden relative`}
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">
                    🍽️
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-card/90 backdrop-blur-sm text-sm font-bold px-4 py-1.5 rounded-full text-foreground shadow-sm">
                    {product.badge}
                  </span>
                )}
                {product.categorySlug === "packaged" && (
                  <span className="bg-secondary/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-secondary-foreground inline-flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Ships Countrywide
                  </span>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                {category?.name}
              </span>

              <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mt-2 mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-display font-medium text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-muted-foreground">{product.size}</span>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.longDescription || product.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.features.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full bg-muted text-foreground text-xs font-medium"
                  >
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
                  <ShieldCheck className="w-4 h-4 text-secondary" /> 100% Natural
                </span>
                {product.categorySlug === "packaged" && (
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-4 h-4 text-primary" /> Free Delivery over KES 2,000
                  </span>
                )}
              </div>

              {/* Add to Cart — client component */}
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* Details & Ingredients */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-medium text-foreground mb-3">
                  About This Product
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.longDescription || product.description}
                </p>
              </div>
              {product.ingredients && (
                <div>
                  <h3 className="font-display text-xl font-medium text-foreground mb-3">
                    Ingredients
                  </h3>
                  <p className="text-muted-foreground">{product.ingredients}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-display text-xl font-medium text-foreground mb-4">
                Nutrition Highlights
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {product.nutritionHighlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-center gap-2 bg-muted/50 rounded-xl p-3"
                  >
                    <Check className="w-5 h-5 text-secondary shrink-0" />
                    <span className="text-sm text-foreground/80">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
