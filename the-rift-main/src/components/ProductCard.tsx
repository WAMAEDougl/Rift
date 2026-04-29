"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Truck,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  categoryColor: string;
  categoryIcon: string;
}

export default function ProductCard({
  product,
  categoryColor,
  categoryIcon: _categoryIcon,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
    }, 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-2xl border border-border bg-card overflow-hidden group">
        {/* Image Area */}
        <Link href={`/products/${product.slug}`}>
          <div
            className={`relative h-48 bg-gradient-to-br ${categoryColor} overflow-hidden cursor-pointer`}
          >
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40">
                🍽️
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.badge && (
                <span className="bg-card/95 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-foreground shadow-sm">
                  {product.badge}
                </span>
              )}
              {product.categorySlug === "packaged" && (
                <span className="bg-secondary text-[10px] font-bold px-2.5 py-1 rounded-full text-secondary-foreground inline-flex items-center gap-1 shadow-sm">
                  <Truck className="w-3 h-3" /> Countrywide
                </span>
              )}
            </div>

            {/* View overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <span className="text-background text-xs font-semibold bg-card/20 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> View Details
              </span>
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-5">
          {/* Name + Size */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={`/products/${product.slug}`}
              className="text-base font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Price + Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
            <div>
              <p className="text-xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                {product.size}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Quantity */}
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart */}
              <motion.button
                onClick={handleAdd}
                disabled={added}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  added
                    ? "bg-secondary text-secondary-foreground shadow-soft"
                    : "bg-primary text-primary-foreground hover:opacity-90 shadow-soft"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* View full details link */}
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-primary mt-3 transition-colors"
          >
            Nutrition info, ingredients, reviews{" "}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
