"use client";

import Link from "next/link";
import Image from "next/image";
import { products, formatPrice } from "@/lib/products";
import { ArrowRight } from "lucide-react";

export default function RelatedProducts({
  currentSlug,
  currentCategory,
}: {
  currentSlug: string;
  currentCategory: string;
}) {
  const related = products
    .filter((p) => p.categorySlug === currentCategory && p.slug !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) return null;

  const categoryIcons: Record<string, string> = {
    meals: "🍽️",
    beverages: "🥤",
    packaged: "🌾",
    breakfast: "🍳",
  };

  return (
    <section className="py-12 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-earth mb-6">
          You Might Also Like
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden relative shrink-0">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {p.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold">
                      {formatPrice(p.price)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
