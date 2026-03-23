"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import Link from "next/link";

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col border-l border-border">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Your Cart ({totalItems})</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Add some delicious Ayola products!</p>
                  <button onClick={() => setIsCartOpen(false)}
                    className="mt-6 text-primary font-semibold text-sm hover:underline">Continue Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div key={item.product.id} layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 bg-muted/50 rounded-xl p-3">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0">
                        <span className="text-2xl">
                          {item.product.categorySlug === "meals" ? "🍽️" : item.product.categorySlug === "beverages" ? "🥤" : item.product.categorySlug === "packaged" ? "🌾" : "🍳"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.product.size}</p>
                        <p className="text-sm font-bold text-primary mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeItem(item.product.id)}
                          className="p-1 text-muted-foreground/40 hover:text-red-500 transition-colors" aria-label="Remove item">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 border border-border rounded-lg bg-background">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-muted transition-colors rounded-l-lg"><Minus className="w-3 h-3" /></button>
                          <span className="px-2 text-xs font-medium text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-muted transition-colors rounded-r-lg"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-muted-foreground/60">Delivery fees calculated at checkout</p>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}
                  className="block w-full bg-primary text-primary-foreground text-center py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98]">
                  Checkout — {formatPrice(totalPrice)}
                </Link>
                <Link href="/cart" onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
