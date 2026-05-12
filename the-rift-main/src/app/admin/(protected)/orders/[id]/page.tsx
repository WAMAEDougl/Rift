"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, User, Phone, MapPin, CreditCard, Clock,
  Send, Loader2, MessageCircle, AlertCircle, RefreshCw, Smartphone,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters";
import type { WaSenderMessage } from "@/lib/wasender";
import { adminFetch } from "@/lib/admin/fetch";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp / M-Pesa",
  mpesa: "M-Pesa (Direct)",
  cash: "Cash on Delivery",
};

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
  customer_phone: string;
  customer_email: string | null;
  delivery_type: string;
  delivery_address: string | null;
  delivery_city: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number | null;
  total: number;
  mpesa_receipt_number: string | null;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

// ── WhatsApp Panel ────────────────────────────────────────────────────────────

function WhatsAppPanel({ phone, messages, loadError }: {
  phone: string;
  messages: WaSenderMessage[] | null;
  loadError: string | null;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<WaSenderMessage[]>(messages ?? []);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await adminFetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: reply.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Failed to send message"); return; }
      toast.success("Message sent");
      setLocalMessages((prev) => [
        ...prev,
        {
          id: json.data?.messageId ?? Date.now().toString(),
          from: "admin",
          to: phone,
          body: reply.trim(),
          timestamp: new Date().toISOString(),
          direction: "sent",
        },
      ]);
      setReply("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col" style={{ height: 420 }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
          <MessageCircle size={15} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">WhatsApp Thread</p>
          <p className="text-xs text-muted-foreground">{phone}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <AlertCircle size={24} className="text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">Could not load WhatsApp messages. Please refresh.</p>
          </div>
        ) : localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <MessageCircle size={24} className="text-muted-foreground/20" />
            <p className="text-xs text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          localMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.direction === "sent" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.direction === "sent"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                <p className={`text-[10px] mt-1 ${msg.direction === "sent" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      <form onSubmit={handleSend} className="px-5 py-3 border-t border-border flex items-center gap-3 shrink-0">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-border rounded-xl px-4 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
        />
        <button type="submit" disabled={sending || !reply.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-40">
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  );
}

// ── Admin STK Push Panel ──────────────────────────────────────────────────────

function AdminSTKPushPanel({ orderId, subtotal, currentTotal }: {
  orderId: string;
  subtotal: number;
  currentTotal: number;
}) {
  const [deliveryFee, setDeliveryFee] = useState("");
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ checkoutRequestId: string; amount: number } | null>(null);

  const fee = parseInt(deliveryFee, 10);
  const computedTotal = !isNaN(fee) && fee >= 0 ? subtotal + fee : null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(fee) || fee < 0) { toast.error("Enter a valid delivery fee"); return; }
    setSending(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_fee: fee }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "STK Push failed"); return; }
      setLastResult({ checkoutRequestId: json.data.checkout_request_id, amount: json.data.amount });
      toast.success(`STK Push sent — KES ${json.data.amount.toLocaleString("en-KE")}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Smartphone size={15} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Send Payment Request</p>
          <p className="text-xs text-muted-foreground">Trigger M-Pesa STK Push with negotiated total</p>
        </div>
      </div>

      <div className="bg-muted/30 rounded-xl px-4 py-3 text-xs space-y-1">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">{formatKES(subtotal)}</span>
        </div>
        {computedTotal !== null && (
          <>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery fee</span>
              <span className="font-medium text-foreground">{formatKES(fee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1 mt-1">
              <span>Total to charge</span>
              <span>{formatKES(computedTotal)}</span>
            </div>
          </>
        )}
      </div>

      <form onSubmit={handleSend} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Delivery Fee (KES)</label>
          <input
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            min="0"
            step="1"
            placeholder="e.g. 200"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50"
          />
        </div>
        <button type="submit" disabled={sending || deliveryFee === "" || isNaN(fee) || fee < 0}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50">
          {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Smartphone size={14} /> Send STK Push</>}
        </button>
      </form>

      {lastResult && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-xs">
          <p className="text-green-700 dark:text-green-400 font-semibold">STK Push sent ✓</p>
          <p className="text-green-600/80 dark:text-green-400/70 mt-0.5 font-mono break-all">{lastResult.checkoutRequestId}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappMessages, setWhatsappMessages] = useState<WaSenderMessage[] | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    adminFetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setOrder(j.data);
          // Fetch WhatsApp history after order loads
          if (j.data.customer_phone) {
            adminFetch(`/api/admin/whatsapp/history?phone=${encodeURIComponent(j.data.customer_phone)}`)
              .then((r) => r.json())
              .then((wj) => {
                if (wj.data) setWhatsappMessages(wj.data);
                else setWhatsappError(wj.error?.message ?? "Failed to load");
              })
              .catch(() => setWhatsappError("Failed to load messages"));
          }
        }
        setLoading(false);
      });
  }, [id]);

  async function handleStatusChange(newStatus: string) {
    if (!order) return;
    setUpdatingStatus(true);
    const res = await adminFetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    setUpdatingStatus(false);
    if (!res.ok) { toast.error(json.error?.message ?? "Update failed"); return; }
    setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
    toast.success(`Status updated to ${newStatus}`);
  }

  const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "dispatched", "delivered", "cancelled"];

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-4">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-8 w-48 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Package size={36} className="text-muted-foreground/20 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Order not found</p>
        <Link href="/admin/orders" className="mt-4 text-primary text-sm font-medium hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-medium text-foreground">{order.order_number}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.created_at)} · {formatRelativeTime(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} type="order" />
          <StatusBadge status={order.payment_status} type="payment" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — order details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order items */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <Package size={15} className="text-muted-foreground" />
              <h2 className="font-display text-base font-medium text-foreground">Order Items</h2>
            </div>
            <div className="divide-y divide-border">
              {order.order_items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatKES(item.product_price)} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-foreground text-sm shrink-0">{formatKES(item.line_total)}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/20 space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatKES(order.subtotal)}</span>
              </div>
              {order.delivery_fee != null && order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className="font-medium text-foreground">{formatKES(order.delivery_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-foreground border-t border-border pt-1.5 mt-1.5">
                <span>Total</span>
                <span>{formatKES(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <User size={15} className="text-muted-foreground" />
              <h2 className="font-display text-base font-medium text-foreground">Customer</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-medium text-foreground">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Phone size={10} /> Phone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{order.customer_phone}</p>
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-600 text-xs font-semibold hover:bg-green-500/20 transition-colors"
                  >
                    <MessageCircle size={11} /> WhatsApp
                  </a>
                </div>
              </div>
              {order.customer_email && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{order.customer_email}</p>
                </div>
              )}
              {order.delivery_address && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin size={10} /> Delivery Address</p>
                  <p className="font-medium text-foreground">{order.delivery_address}{order.delivery_city ? `, ${order.delivery_city}` : ""}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <CreditCard size={15} className="text-muted-foreground" />
              <h2 className="font-display text-base font-medium text-foreground">Payment</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Method</p>
                <p className="font-medium text-foreground">{PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <StatusBadge status={order.payment_status} type="payment" />
              </div>
              {order.mpesa_receipt_number && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">M-Pesa Receipt</p>
                  <p className="font-mono text-sm font-medium text-foreground bg-muted/50 px-3 py-1.5 rounded-lg inline-block">{order.mpesa_receipt_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp thread */}
          <WhatsAppPanel
            phone={order.customer_phone}
            messages={whatsappMessages}
            loadError={whatsappError}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Status management */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Clock size={15} className="text-muted-foreground" />
              <h2 className="font-display text-base font-medium text-foreground">Order Status</h2>
            </div>
            <div className="space-y-2">
              {ORDER_STATUSES.map((s) => (
                <button key={s}
                  onClick={() => s === "cancelled" ? setCancelConfirmOpen(true) : handleStatusChange(s)}
                  disabled={updatingStatus || order.status === s}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    order.status === s
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : s === "cancelled"
                        ? "text-destructive hover:bg-destructive/10 border border-transparent"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  }`}>
                  <span className="capitalize">{s}</span>
                  {order.status === s && <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Cancel confirmation dialog */}
          <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
            <DialogContent className="max-w-sm rounded-2xl p-6 bg-card">
              <DialogHeader className="space-y-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto">
                  <AlertTriangle size={22} />
                </div>
                <div className="text-center space-y-1">
                  <DialogTitle className="font-display text-lg font-medium text-foreground">
                    Cancel this order?
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    This will mark order <span className="font-semibold text-foreground">{order.order_number}</span> as cancelled. This action cannot be undone.
                  </p>
                </div>
              </DialogHeader>
              <DialogFooter className="mt-6 flex-row gap-3">
                <button onClick={() => setCancelConfirmOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
                  Keep Order
                </button>
                <button
                  onClick={() => { setCancelConfirmOpen(false); handleStatusChange("cancelled"); }}
                  disabled={updatingStatus}
                  className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90">
                  Cancel Order
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* STK Push panel — only for unpaid orders */}
          {!["paid", "completed"].includes(order.payment_status) && (
            <AdminSTKPushPanel
              orderId={order.id}
              subtotal={order.subtotal}
              currentTotal={order.total}
            />
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-foreground leading-relaxed">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
