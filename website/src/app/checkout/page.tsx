"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import { getWhatsAppOrderLink } from "@/lib/constants";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/utils/storage";
import type { SavedCustomer } from "@/types/api";
import {
  ShieldCheck, Truck, Beaker, Check, Loader2,
  AlertCircle, ShoppingBag, MessageCircle, MapPin, ChevronDown,
  Plus, Minus, Trash2, Smartphone, ArrowRight,
} from "lucide-react";

type Step = "form" | "awaiting_payment" | "confirmed" | "pending_delivery";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [step, setStep] = useState<Step>("form");

  const [orderResult, setOrderResult] = useState<{
    order_number: string;
    order_id: string;
    total: number;
    checkout_request_id?: string;
  } | null>(null);

  const [pollingMsg, setPollingMsg] = useState("Waiting for M-Pesa confirmation...");

  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "Nairobi", delivery_type: "delivery", notes: "",
    payment_method: "mpesa" as "mpesa",
  });

  useEffect(() => {
    const saved = getItem<SavedCustomer>(STORAGE_KEYS.CUSTOMER);
    if (saved) {
      setForm((prev) => ({ ...prev, name: saved.name, phone: saved.phone, address: saved.address, city: saved.city }));
    }
  }, []);

  // Poll order status for M-Pesa confirmation
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = (orderId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes at 5s intervals

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const json = await res.json();
        const order = json.order;

        if (order?.payment_status === "completed") {
          clearInterval(pollRef.current!);
          clearCart();
          router.push(`/orders/success?order_id=${orderId}`);
          return;
        }

        if (order?.payment_status === "failed") {
          clearInterval(pollRef.current!);
          // Cancel the order since payment was not completed
          await fetch(`/api/orders/${orderId}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "M-Pesa payment cancelled by user" }),
          }).catch(() => {});
          setError("M-Pesa payment was cancelled. Your cart has been kept — please try again.");
          setStep("form");
          return;
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current!);
          // Cancel the order after timeout
          await fetch(`/api/orders/${orderId}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: "Payment not confirmed after 5 minutes" }),
          }).catch(() => {});
          setError("Payment not confirmed after 5 minutes. Your cart has been kept — please try again.");
          setStep("form");
        } else if (attempts % 6 === 0) {
          setPollingMsg("Still waiting for confirmation... If you haven't received the M-Pesa prompt on your phone, check your phone or try again.");
        }
      } catch {}
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const deliveryFee = form.delivery_type === "pickup" ? 0 : null; // negotiated via WhatsApp
  const grandTotal = totalPrice; // delivery fee added later by admin

  const buildWhatsAppMessage = () =>
    `Hi Ayola Foods! I'd like to order:\n\n${items.map((i) => `• ${i.quantity}x ${i.product.name} — KES ${(i.product.price * i.quantity).toLocaleString()}`).join("\n")}\n\nSubtotal: KES ${totalPrice.toLocaleString()}`;

  // Empty cart
  if (items.length === 0 && step === "form") {
    return (
      <div className="pt-32 pb-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some delicious Ayola products first!</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  // Awaiting M-Pesa payment
  if (step === "awaiting_payment" && orderResult) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Phone</h1>
          <p className="text-muted-foreground mb-6">
            An M-Pesa prompt has been sent to <strong>{form.phone}</strong>. Enter your PIN to complete payment.
          </p>

          <div className="bg-card rounded-2xl p-6 text-left mb-6 space-y-3 border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-bold text-foreground font-mono">{orderResult.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">{formatPrice(orderResult.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-amber-600 font-medium">Awaiting payment...</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{pollingMsg}</p>

          <button
            onClick={async () => {
              if (pollRef.current) clearInterval(pollRef.current);
              if (orderResult?.order_id) {
                await fetch(`/api/orders/${orderResult.order_id}/cancel`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ reason: "Cancelled by customer" }),
                }).catch(() => {});
              }
              setError("Payment cancelled. Your cart has been kept — you can try again.");
              setStep("form");
            }}
            className="mt-4 text-sm text-muted-foreground hover:text-red-500 underline transition-colors"
          >
            Cancel payment
          </button>
        </div>
      </div>
    );
  }

  // Confirmed
  if (step === "confirmed" && orderResult) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">Your order has been confirmed. Please check your WhatsApp for further instructions and payment details.</p>
          <div className="bg-card rounded-2xl p-6 text-left mb-6 space-y-3 border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-bold text-foreground font-mono">{orderResult.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">{formatPrice(orderResult.total)}</span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link href="/products" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pending delivery confirmation — order placed, awaiting admin to negotiate fee and send STK push
  if (step === "pending_delivery" && orderResult) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Received!</h1>
          <p className="text-muted-foreground mb-2">
            We&apos;ve received your order and sent you a WhatsApp message on <strong>{form.phone}</strong>.
          </p>
          <p className="text-muted-foreground mb-6">
            Please reply with your specific location so we can calculate the delivery fee. Once agreed, we&apos;ll send you an M-Pesa payment prompt.
          </p>

          <div className="bg-card rounded-2xl p-6 text-left mb-6 space-y-3 border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order</span>
              <span className="font-bold text-foreground font-mono">{orderResult.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-foreground">{formatPrice(orderResult.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="text-amber-600 font-medium">To be confirmed via WhatsApp</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-amber-600 font-medium">Awaiting delivery confirmation</span>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-sm text-green-800 dark:text-green-300 mb-6 text-left">
            <p className="font-semibold mb-1">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 text-green-700 dark:text-green-400/80 text-xs">
              <li>Reply to our WhatsApp message with your exact location</li>
              <li>We&apos;ll confirm the delivery fee with you</li>
              <li>You&apos;ll receive an M-Pesa prompt for the total amount</li>
              <li>Enter your PIN to complete payment</li>
            </ol>
          </div>

          <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!form.name.trim()) { setError("Enter your name"); return; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 9) { setError("Enter a valid phone number"); return; }
    if (form.delivery_type !== "pickup" && !form.address.trim()) { setError("Enter a delivery address"); return; }

    setLoading(true);
    setError("");
    setItem(STORAGE_KEYS.CUSTOMER, { name: form.name, phone: form.phone, address: form.address, city: form.city });

    // Normalise to +254... format for storage and WaSender
    const digits = form.phone.replace(/\D/g, "");
    const normalizedPhone = digits.startsWith("254")
      ? `+${digits}`
      : digits.startsWith("0")
      ? `+254${digits.slice(1)}`
      : form.phone.startsWith("+")
      ? form.phone
      : `+${digits}`;

    try {
      // Create order — status will be set to pending_delivery_confirmation by the API
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name, customer_phone: normalizedPhone,
          delivery_address: form.delivery_type === "pickup" ? "Pickup — Ruhan Plaza, Kahawa Sukari" : form.address,
          delivery_city: form.city, delivery_type: form.delivery_type, order_notes: form.notes || null,
          payment_method: form.payment_method,
          items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Order failed. Please try again."); setLoading(false); return; }

      // Order created — admin will negotiate delivery fee and trigger STK push via WhatsApp
      setOrderResult({
        order_number: data.order.order_number,
        order_id: data.order.id,
        total: data.order.total,
      });
      setStep("pending_delivery");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm placeholder:text-muted-foreground/50";

  return (
    <div className="pt-28 pb-20 bg-muted/30 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">

            {/* Quick WhatsApp */}
            <a href={getWhatsAppOrderLink(buildWhatsAppMessage())} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full p-4 rounded-2xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-green-800 dark:text-green-300 text-sm">Quick Order via WhatsApp</p>
                <p className="text-green-600 dark:text-green-400/70 text-xs">Tap to send your order directly — we&apos;ll reply in minutes</p>
              </div>
            </a>

            <div className="flex items-center gap-3 text-muted-foreground/50 text-xs">
              <div className="flex-1 h-px bg-border" />
              <span>or fill in below for tracked order</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Your Info */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="font-bold text-foreground mb-4">Your Info</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Your name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                <div className="space-y-1">
                  <label htmlFor="whatsapp-phone" className="block text-sm font-medium text-foreground">
                    WhatsApp Phone Number
                  </label>
                  <input
                    id="whatsapp-phone"
                    type="tel"
                    placeholder="+254712345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    aria-label="WhatsApp Phone Number"
                    className={inputCls}
                  />
                  <p className="text-xs text-muted-foreground/60">Use international format starting with +254</p>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Delivery
              </h2>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { value: "delivery", label: "Deliver", icon: "🚚" },
                  { value: "pickup", label: "Pickup", icon: "🏪" },
                  { value: "shipping", label: "Ship", icon: "📦" },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setForm({ ...form, delivery_type: opt.value })}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      form.delivery_type === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}>
                    <span className="mr-1">{opt.icon}</span> {opt.label}
                  </button>
                ))}
              </div>

              {form.delivery_type === "pickup" ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium">Pickup at Ruhan Plaza</p>
                  <p className="text-amber-600 dark:text-amber-400/70 text-xs mt-1">Ground Floor Room 23, Kahawa Sukari, near Quickmatt</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="text" placeholder={form.delivery_type === "shipping" ? "Full shipping address" : "Delivery address (estate, building, etc.)"}
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
                  <div className="relative">
                    <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className={`${inputCls} appearance-none`}>
                      {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Other"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                  </div>
                </div>
              )}
              {deliveryFee === 0 && form.delivery_type === "pickup" && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">✓ No delivery fee — you&apos;re picking up!</p>
              )}
            </div>

            {/* Payment */}
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Payment
              </h2>
              <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">M-Pesa</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400/70 mt-2">
                ✓ After confirming your delivery fee via WhatsApp, you&apos;ll receive an M-Pesa prompt to complete payment
              </p>
            </div>

            {/* Notes */}
            <button onClick={() => setShowNotes(!showNotes)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {showNotes ? "- Hide" : "+ Add"} order notes
            </button>
            {showNotes && (
              <textarea placeholder="Special instructions, allergies, etc." rows={2} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            {/* Place Order */}
            <button onClick={handlePlaceOrder} disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
              ) : (
                <>Place Order — {formatPrice(totalPrice)} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="text-xs text-muted-foreground/60 text-center">
              We&apos;ll confirm the delivery fee via WhatsApp, then send you an M-Pesa prompt.
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
              <h3 className="font-bold text-foreground mb-4">Your Order ({totalItems})</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-lg shrink-0">
                      {item.product.categorySlug === "meals" ? "🍽️" : item.product.categorySlug === "beverages" ? "🥤" : item.product.categorySlug === "packaged" ? "🌾" : "🍳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold w-16 text-right text-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={form.delivery_type === "pickup" ? "text-green-600 dark:text-green-400 font-medium" : "text-amber-600 dark:text-amber-400 font-medium"}>
                    {form.delivery_type === "pickup" ? "FREE (Pickup)" : "Confirmed via WhatsApp"}
                  </span>
                </div>
                {form.delivery_type !== "pickup" && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">Delivery fee will be agreed with you over WhatsApp</p>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Subtotal</span>
                  <span className="text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Link href="/products" className="block text-center text-sm text-primary font-medium mt-4 hover:underline">+ Add more items</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
