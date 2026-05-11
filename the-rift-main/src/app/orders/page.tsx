import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/products";
import { Package, Clock, Check, Truck, ArrowRight, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  line_total: number;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  delivery_type: string;
  delivery_city: string;
  total: number;
  order_items: OrderItem[] | null;
};

export const metadata: Metadata = {
  title: "My Orders — Rift & Root",
  description: "View your Rift & Root order history.",
};

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

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at, delivery_type, delivery_city, total, order_items(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false }) as { data: Order[] | null };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-medium text-foreground">
            My Orders
          </h1>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            Order Again <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="font-display text-xl font-medium text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t placed any orders yet. Start exploring our menu!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-card transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-mono font-bold text-foreground">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.order_items?.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-foreground">
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="text-muted-foreground">
                            {formatPrice(item.line_total)}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      {order.delivery_type === "pickup"
                        ? "Pickup"
                        : `Delivery — ${order.delivery_city ?? "Location not specified"}`}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-primary">
                        {formatPrice(order.total)}
                      </span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
