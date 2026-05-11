"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import { getWhatsAppOrderLink } from "@/lib/constants";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/utils/storage";
import type { SavedCustomer } from "@/types/api";
import {
  ShieldCheck,
  Truck,
  Beaker,
  Check,
  Loader2,
  AlertCircle,
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

type Step = "form" | "confirmed";

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [step, setStep] = useState<Step>("form");

  const [orderResult, setOrderResult] = useState<{
    order_number: string;
    order_id: string;
    total: number;
  } | null>(null);

  const MIN_ORDER_KES = 500;

  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  useEffect(() => {
    const saved = getItem<SavedCustomer>(STORAGE_KEYS.CUSTOMER);
    if (saved) {
      setForm((prev) => ({ ...prev, name: saved.name, phone: saved.phone }));
    }
  }, []);

  const buildWhatsAppMessage = () =>
    `Hi Rift & Root! I'd like to order:\n\n${items
      .map((i) => `• ${i.quantity}x ${i.product.name} — KES ${(i.product.price * i.quantity).toLocaleString()}`)
      .join("\n")}\n\nSubtotal: KES ${totalPrice.toLocaleString()}\n\nWe'll discuss delivery and payment on WhatsApp.`;

  if (items.length === 0 && step === "form") {
    return (
      <div className="pt-32 pb-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-medium text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some delicious Rift &amp; Root products first!</p>
        <Link href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  if (step === "confirmed" && orderResult) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-2">
            Your order has been received. Please check your WhatsApp for further instructions and payment details.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-6">
            We&apos;ll discuss delivery and send you a payment request via WhatsApp.
          </p>
          <div className="bg-card rounded-2xl p-6 text-left mb-6 space-y-3 border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-bold text-foreground font-mono">{orderResult.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-primary">{formatPrice(orderResult.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="text-muted-foreground text-sm">To be confirmed on WhatsApp</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(orderResult.order_number);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-muted">
              Copy Order Number
            </button>
            <Link href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters)");
      return;
    }
    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) {
      setError("Invalid phone number format. Please use a valid Kenyan number e.g. 0712 345 678");
      return;
    }
    if (totalPrice < MIN_ORDER_KES) {
      setError(`Minimum order is KES ${MIN_ORDER_KES.toLocaleString()}. Add more items to continue.`);
      return;
    }

    setLoading(true);
    setError("");
    setItem(STORAGE_KEYS.CUSTOMER, { name: form.name, phone: form.phone, address: "", city: "" });

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || null,
          delivery_address: null,
          delivery_city: null,
          delivery_type: "delivery",
          order_notes: form.notes || null,
          payment_method: "whatsapp",
          items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Order failed. Please try again."); setLoading(false); return; }

      setOrderResult({
        order_number: data.order.order_number,
        order_id: data.order.id,
        total: data.order.total,
      });
      localStorage.setItem("last_order", JSON.stringify({
        order_number: data.order.order_number,
        order_id: data.order.id,
        phone: form.phone,
        timestamp: new Date().toISOString(),
      }));
      clearCart();
      setStep("confirmed");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm placeholder:text-muted-foreground/50";

  return (
    <div className="pt-28 pb-20 bg-muted/30 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-medium text-foreground mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">

            {/* Quick WhatsApp */}
            <a href={getWhatsAppOrderLink(buildWhatsAppMessage())} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full p-4 rounded-2xl border-2 border-secondary/30 bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-secondary-foreground fill-current" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-secondary text-sm">Quick Order via WhatsApp</p>
                <p className="text-secondary/70 text-xs">Tap to send your order directly — we&apos;ll reply in minutes</p>
              </div>
            </a>

            <div className="flex items-center gap-3 text-muted-foreground/50 text-xs">
              <div className="flex-1 h-px bg-border" />
              <span>or fill in below for a tracked order</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Your Info */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="font-display text-lg font-medium text-foreground mb-1">Your Info</h2>
              <p className="text-xs text-muted-foreground mb-4">
                We&apos;ll contact you on WhatsApp to confirm delivery details and send your payment request.
              </p>
              <div className="space-y-3">
                <input type="text" placeholder="Your name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls} />
                <div>
                  <input type="tel" placeholder="WhatsApp number (e.g. 0712 345 678)" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputCls} />
                  <p className="text-xs text-muted-foreground/60 mt-1.5 ml-1">
                    We&apos;ll send your order confirmation and payment request to this number.
                  </p>
                </div>
                <div>
                  <input type="email" placeholder="Email address (optional — for order confirmation)" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputCls} />
                  <p className="text-xs text-muted-foreground/60 mt-1.5 ml-1">
                    We&apos;ll send you an order confirmation email if provided.
                  </p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
              <h2 className="font-display text-base font-medium text-foreground">How it works</h2>
              <div className="space-y-3">
                {[
                  { n: "1", text: "Place your order — we'll receive it instantly" },
                  { n: "2", text: "We'll WhatsApp you to confirm delivery details and fee" },
                  { n: "3", text: "Once agreed, we'll send you an M-Pesa payment request" },
                  { n: "4", text: "Pay via M-Pesa and your order is on its way!" },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <button onClick={() => setShowNotes(!showNotes)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {showNotes ? "− Hide" : "+ Add"} order notes
            </button>
            {showNotes && (
              <textarea placeholder="Special instructions, allergies, preferred delivery time, etc."
                rows={3} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputCls} />
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Place Order */}
            <button onClick={handlePlaceOrder} disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-soft">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                : <>Place Order — {formatPrice(totalPrice)}</>}
            </button>

            <p className="text-xs text-muted-foreground/60 text-center">
              No payment now. We&apos;ll send you an M-Pesa request after confirming delivery details on WhatsApp.
            </p>

            <div className="flex items-center justify-center gap-5 text-[11px] text-muted-foreground/50 pt-1">
              <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Secure</span>
              <span className="inline-flex items-center gap-1"><Beaker className="w-3.5 h-3.5" /> Food Scientist Made</span>
              <span className="inline-flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Fast Delivery</span>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-5 border border-border sticky top-28">
              <h3 className="font-display text-lg font-medium text-foreground mb-4">
                Your Order ({totalItems})
              </h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center text-lg shrink-0">
                      {item.product.categorySlug === "meals" ? "🍽️"
                        : item.product.categorySlug === "beverages" ? "🥤"
                        : item.product.categorySlug === "packaged" ? "🌾" : "🍳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        aria-label="Decrease quantity">
                        {item.quantity === 1
                          ? <Trash2 className="w-3 h-3 text-destructive" />
                          : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        aria-label="Increase quantity">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold w-16 text-right text-foreground">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span className="text-muted-foreground text-xs italic">Confirmed on WhatsApp</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <Link href="/products"
                className="block text-center text-sm text-primary font-medium mt-4 hover:underline">
                + Add more items
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
