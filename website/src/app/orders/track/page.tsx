"use client";

import { useState } from "react";
import { Search, Package, Clock, Check, Truck, ArrowRight, Phone, ShoppingBag } from "lucide-react";
import { getItem, STORAGE_KEYS } from "@/lib/utils/storage";
import type { SavedCustomer } from "@/types/api";
import GlowingButton from "@/components/aceternity/GlowingButton";

interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
  delivery_type: string;
  delivery_city: string;
}

const statusIcons: Record<string, typeof Check> = {
  pending: Clock,
  confirmed: Check,
  preparing: Package,
  ready: Check,
  dispatched: Truck,
  delivered: Check,
  cancelled: Clock,
};

const statusColors: Record<string, string> = {
  pending: "text-amber-600 bg-amber-50",
  confirmed: "text-blue-600 bg-blue-50",
  preparing: "text-purple-600 bg-purple-50",
  ready: "text-green-600 bg-green-50",
  dispatched: "text-indigo-600 bg-indigo-50",
  delivered: "text-green-700 bg-green-100",
  cancelled: "text-red-600 bg-red-50",
};

export default function TrackOrderPage() {
  const saved = typeof window !== "undefined" ? getItem<SavedCustomer>(STORAGE_KEYS.CUSTOMER) : null;
  const [phone, setPhone] = useState(saved?.phone || "");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError("Enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to find orders");
        return;
      }

      setOrders(data.orders || []);
      setCustomerName(data.customer?.name || "");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-earth mb-2">Track Your Orders</h1>
          <p className="text-muted-foreground">
            Enter your phone number to see all your Ayola orders. No account needed.
          </p>
        </div>

        {/* Search */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="tel"
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "..." : <><Search className="w-4 h-4" /> Find</>}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Results */}
        {searched && !loading && (
          <>
            {customerName && (
              <p className="text-sm text-muted-foreground mb-4">
                Showing orders for <strong className="text-earth">{customerName}</strong>
              </p>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">No orders found for this number.</p>
                <p className="text-sm text-muted-foreground/60 mb-6">Place your first order today!</p>
                <GlowingButton href="/products">
                  Browse Products <ArrowRight className="w-4 h-4" />
                </GlowingButton>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Psychology: Status recognition — "This is your Xth order!" */}
                {orders.length >= 2 && (
                  <div className="bg-primary/5 text-primary text-sm font-medium px-4 py-2.5 rounded-xl text-center">
                    You&apos;re a loyal Ayola customer — this is order #{orders.length}!
                  </div>
                )}

                {orders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <div key={order.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono font-bold text-earth text-sm">{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "text-muted-foreground bg-muted/50"}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          <p>{new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                          <p className="text-xs mt-0.5">{order.delivery_type === "pickup" ? "Pickup" : `Delivery — ${order.delivery_city}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">KES {order.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {order.payment_status === "completed" ? "Paid" : "Pending"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loop back — psychology: keep them engaged */}
                <div className="text-center pt-4">
                  <GlowingButton href="/products">
                    Order Again <ArrowRight className="w-4 h-4" />
                  </GlowingButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
