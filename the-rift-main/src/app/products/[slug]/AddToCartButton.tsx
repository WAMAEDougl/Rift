"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

export default function AddToCartButton({ product }: { product: Product }) {
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
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-3 hover:bg-muted transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-5 text-lg font-semibold min-w-[48px] text-center">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="p-3 hover:bg-muted transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <motion.button
        onClick={handleAdd}
        disabled={added}
        whileTap={{ scale: 0.95 }}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all ${
          added
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground hover:opacity-90 shadow-soft"
        }`}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" /> Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" /> Add to Cart —{" "}
            {formatPrice(product.price * quantity)}
          </>
        )}
      </motion.button>
    </div>
  );
}
