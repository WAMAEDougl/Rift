"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check,
  ArrowRight,
  Clock,
  Package,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/products";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  delivery_address: string;
  delivery_city: string;
  delivery_type: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  order_items: OrderItem[];
  created_at: string;
}

const statusConfig: Record<
  string,
  { icon: typeof Check; label: string; color: string }
> = {
  pending: { icon: Clock, label: "Pending", color: "text-accent" },
  confirmed: { icon: Check, label: "Confirmed", color: "text-secondary" },
  preparing: { icon: Package, label: "Preparing", color: "text-primary" },
  dispatched: { icon: Truck, label: "On the Way", color: "text-primary" },
  delivered: { icon: Check, label: "Delivered", color: "text-secondary" },
  cancelled: { icon: Clock, label: "Cancelled", color: "text-destructive" },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/public-orders/${id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || json.error) {
          setError("Order not found");
        } else {
          setOrder(json.order);
        }
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-destructive mb-4">{error || "Order not found"}</p>
          <Link href="/products" className="text-primary hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const paymentLabel =
    order.payment_method === "mpesa" ? "M-Pesa"
    : order.payment_method === "whatsapp" ? "WhatsApp / M-Pesa"
    : "Cash on Delivery";

  const statusHeadings: Record<string, { title: string; subtitle: string }> = {
    pending: { title: "Order Received!", subtitle: "We'll contact you on WhatsApp to confirm delivery and payment." },
    confirmed: { title: "Order Confirmed!", subtitle: "Your order is confirmed and being prepared." },
    preparing: { title: "Being Prepared", subtitle: "Your order is being freshly prepared right now." },
    dispatched: { title: "On the Way!", subtitle: "Your order has been dispatched and is heading to you." },
    delivered: { title: "Delivered!", subtitle: "Your order was delivered. Enjoy your meal!" },
    cancelled: { title: "Order Cancelled", subtitle: "This order was cancelled. Contact us if you have questions." },
  };
  const heading = statusHeadings[order.status] ?? statusHeadings.pending;

  return (
    <div className="pt-28 pb-20 bg-muted/30 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${order.status === "cancelled" ? "bg-destructive/10" : "bg-secondary/10"}`}>
            <StatusIcon className={`w-10 h-10 ${order.status === "cancelled" ? "text-destructive" : "text-secondary"}`} />
          </div>
          <h1 className="font-display text-3xl font-medium text-foreground mb-2">
            {heading.title}
          </h1>
          <p className="text-muted-foreground">
            {heading.subtitle}
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6 space-y-4">
          {/* Header row */}
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h2 className="font-display text-lg font-medium text-foreground">
                Order #{order.order_number}
              </h2>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.created_at)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted ${status.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <p className="eyebrow mb-1">Customer</p>
              <p className="font-medium text-foreground">{order.customer_name}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Payment</p>
              <p className="font-medium text-foreground">{paymentLabel}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Delivery</p>
              <p className="font-medium text-foreground capitalize">
                {order.delivery_type}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-1">Region</p>
              <p className="font-medium text-foreground">{order.delivery_city}</p>
            </div>
          </div>

          {order.delivery_type !== "pickup" && (
            <div className="py-3 border-t border-border">
              <p className="eyebrow mb-1">Delivery Address</p>
              <p className="font-medium text-foreground">
                {order.delivery_address}
              </p>
            </div>
          )}

          {/* Items */}
          <div className="py-3 border-t border-border">
            <p className="eyebrow mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatPrice(item.line_total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-3 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-foreground">
                {formatPrice(order.delivery_fee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
