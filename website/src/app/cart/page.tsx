"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import {
  ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck, ShieldCheck, Leaf,
} from "lucide-react";
import GlowingButton from "@/components/aceternity/GlowingButton";

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity } = useCart();

  const deliveryFee = totalPrice >= 2000 ? 0 : 200;
  const grandTotal = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-4">You haven&apos;t added any items yet.</p>
        <p className="text-sm text-muted-foreground/60 mb-6">
          Not sure what to try? Our <strong className="text-primary">Pilau Spiced Up Edition</strong> and{" "}
          <strong className="text-primary">Plantain Probiotic Kvass</strong> are customer favorites.
        </p>
        <GlowingButton href="/products"><Leaf className="w-5 h-5" /> Browse Products</GlowingButton>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Your Meal is Waiting ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, i) => (
              <motion.div key={item.product.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-2xl shrink-0">
                  {item.product.categorySlug === "meals" ? "🍽️" : item.product.categorySlug === "beverages" ? "🥤" : item.product.categorySlug === "packaged" ? "🌾" : "🍳"}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="font-bold text-foreground hover:text-primary transition-colors text-sm">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.product.size} &bull; {formatPrice(item.product.price)} each</p>
                </div>
                <div className="flex items-center gap-1 border border-border rounded-xl">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-l-xl transition-colors">
                    {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-400" /> : <Minus className="w-3.5 h-3.5" />}
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted rounded-r-xl transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-base font-bold text-primary w-20 text-right">{formatPrice(item.product.price * item.quantity)}</span>
              </motion.div>
            ))}
            <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-2">
              <Plus className="w-4 h-4" /> Add more items
            </Link>
          </div>

          <aside>
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <h2 className="font-bold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-secondary font-bold" : "font-medium text-foreground"}>
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {totalPrice >= 2000 ? (
                  <p className="text-xs text-secondary font-medium bg-secondary/5 px-3 py-1.5 rounded-lg">You&apos;re saving KES 200 on delivery!</p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
                    Add {formatPrice(2000 - totalPrice)} more to unlock free delivery
                  </p>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Link href="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold mt-6 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> 100% natural — zero preservatives
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-primary" /> Fresh daily delivery
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
