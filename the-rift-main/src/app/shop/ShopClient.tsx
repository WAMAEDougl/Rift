"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, ArrowRight, X } from "lucide-react";
import type { Product as LibProduct } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import HeroSlideshow from "@/components/HeroSlideshow";

const CATEGORIES = ["All", "Meals", "Beverages", "Breakfast", "Seasonal"] as const;
type Category = (typeof CATEGORIES)[number];

interface ShopClientProps {
  products: LibProduct[];
}

export default function ShopClient({ products }: ShopClientProps) {
  const [active, setActive] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const visible = useMemo(() => {
    return products.filter((p) => {
      const matchCat = active === "All" || p.category === active;
      const matchQ =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [active, query, products]);

  return (
    <>
      {/* ── HERO HEADER ── */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        {/* Shared global slideshow — continues from wherever it left off */}
        <HeroSlideshow gradient="top" showControls={false} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
          <span className="eyebrow text-accent/80">Our Catalogue</span>
          <h1 className="mt-5 font-display text-5xl font-medium leading-tight text-white md:text-7xl max-w-2xl">
            Artisanal
            <em className="font-normal italic text-accent"> nourishment.</em>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
            A living collection of heritage meals and pantry goods — each shaped by the
            season and the hands that make it.
          </p>

          {/* Search bar */}
          <div className="mt-10 flex max-w-lg items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search meals, beverages, pantry…"
                className="w-full rounded-full border border-white/20 bg-white/10 backdrop-blur-sm py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/50 focus:border-accent focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY FILTER BAR ── */}
      <section className="sticky top-[73px] z-30 border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          {/* Result count */}
          <span className="shrink-0 text-xs text-muted-foreground hidden sm:block">
            {visible.length} {visible.length === 1 ? "item" : "items"}
          </span>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`shrink-0 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all ${
                  active === c
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT GRID ── */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="font-display text-2xl font-medium text-foreground mb-2">
              No results found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try a different search term or browse all categories.
            </p>
            <button
              onClick={() => { setQuery(""); setActive("All"); }}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── BOTTOM CTA ── */}
      {visible.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col items-center text-center gap-6 md:flex-row md:text-left md:justify-between">
            <div>
              <h3 className="font-display text-2xl font-medium">
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                Message us on WhatsApp — we take custom orders and can advise on the right products for your needs.
              </p>
            </div>
            <a
              href="https://wa.me/254713280550?text=Hi!%20I%20need%20help%20choosing%20a%20product"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-primary"
            >
              Ask Us <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}
    </>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────

function ProductCard({ product }: { product: LibProduct }) {
  const { addItem } = useCart();

  return (
    <article className="group flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.slug ?? product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          <img
            src={product.image || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop"}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            width={600}
            height={750}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badge */}
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-widest text-foreground">
              {product.badge}
            </span>
          )}

          {/* Quick view on hover */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            <span className="rounded-full bg-background/90 backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-widest text-foreground">
              View Details
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/products/${product.slug ?? product.id}`}>
              <h3 className="font-display text-xl font-medium leading-tight hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            {product.tagline && (
              <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {product.tagline}
              </p>
            )}
          </div>
          <span className="font-display text-lg text-primary shrink-0">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => addItem(product)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-background transition hover:bg-primary"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to basket
          </button>
          <Link
            href={`/products/${product.slug ?? product.id}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground"
            aria-label="View product details"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
