"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { Search, Check, Clock, Package, Truck, AlertCircle, ArrowRight } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  line_total: number;
}

interface TrackedOrder {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  delivery_type: string;
  delivery_city: string | null;
  total: number;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: typeof Check; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-accent bg-accent/10" },
  confirmed: { icon: Check, label: "Confirmed", color: "text-secondary bg-secondary/10" },
  preparing: { icon: Package, label: "Preparing", color: "text-primary bg-primary/10" },
  ready: { icon: Check, label: "Ready for Pickup", color: "text-secondary bg-secondary/10" },
  dispatched: { icon: Truck, label: "On the Way", color: "text-primary bg-primary/10" },
  delivered: { icon: Check, label: "Delivered", color: "text-secondary bg-secondary/10" },
  cancelled: { icon: Clock, label: "Cancelled", color: "text-destructive bg-destructive/10" },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        order_number: orderNumber.trim().toUpperCase(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Order not found. Check your order number and phone number.");
      } else {
        setOrder(json.order);
      }
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
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground mb-2">Track Your Order</h1>
          <p className="text-muted-foreground text-sm">
            Enter your order number and the phone number you used at checkout.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">Order Number</label>
              <input
                type="text"
                required
                placeholder="e.g. RR-20240101-001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className={inputCls}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1.5">WhatsApp Phone Number</label>
              <input
                type="tel"
                required
                placeholder="e.g. 0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 text-destructive px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Searching…" : <><Search className="w-4 h-4" /> Track Order</>}
            </button>
          </form>
        </div>

        {order && (() => {
          const status = statusConfig[order.status] ?? statusConfig.pending;
          const StatusIcon = status.icon;
          return (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono font-bold text-foreground text-lg">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.quantity}x {item.product_name}</span>
                    <span className="text-muted-foreground">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {order.delivery_type === "pickup"
                    ? "Pickup"
                    : `Delivery — ${order.delivery_city ?? "Location to be confirmed"}`}
                </span>
                <span className="font-bold text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          );
        })()}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </p>
      </div>
    </div>
  );
}
