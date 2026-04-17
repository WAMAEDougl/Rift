"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Download, ArrowRight, RefreshCw } from "lucide-react";

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
  delivery_address: string;
  delivery_city: string;
  delivery_type: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  mpesa_receipt_number: string | null;
  order_items: OrderItem[];
  created_at: string;
}

function formatPrice(price: number) {
  return `KES ${price.toLocaleString("en-KE")}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(false);

  async function fetchOrder(silent = false) {
    if (!orderId) { setError("No order ID provided"); setLoading(false); return; }
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        setError("Order not found");
      } else {
        setOrder(json.order);
        setError("");
      }
    } catch {
      setError("Failed to load order");
    }
    if (!silent) setLoading(false);
  }

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handleDownload = () => {
    if (!order) return;
    const paymentMethodLabel = order.payment_method === "mpesa" ? "M-Pesa" : "Cash on Delivery";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Receipt — Order #${order.order_number} — Ayola Foods</title>
  <meta charset="utf-8" />
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',system-ui,sans-serif; color:#1a1a2e; background:#fff; padding:48px 40px; max-width:600px; margin:0 auto; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:24px; border-bottom:2px solid #f1f5f9; margin-bottom:28px; }
    .brand-name { font-size:22px; font-weight:800; color:#78350f; }
    .brand-tagline { font-size:11px; color:#94a3b8; margin-top:3px; text-transform:uppercase; letter-spacing:.08em; }
    .receipt-label { text-align:right; }
    .receipt-label h2 { font-size:18px; font-weight:700; }
    .receipt-label p { font-size:12px; color:#64748b; margin-top:3px; }
    .section { margin-bottom:24px; }
    .section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:#94a3b8; margin-bottom:10px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .info-item { background:#f8fafc; border-radius:8px; padding:10px 14px; }
    .info-label { font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em; }
    .info-value { font-size:13px; font-weight:600; color:#1a1a2e; margin-top:3px; }
    .receipt-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#dcfce7; color:#16a34a; }
    table { width:100%; border-collapse:collapse; }
    thead tr { border-bottom:2px solid #e2e8f0; }
    th { text-align:left; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#94a3b8; padding:8px 0; }
    th:last-child { text-align:right; }
    td { padding:10px 0; font-size:13px; color:#1a1a2e; border-bottom:1px solid #f1f5f9; }
    td:last-child { text-align:right; font-weight:600; }
    .totals { margin-top:16px; }
    .totals-row { display:flex; justify-content:space-between; font-size:13px; color:#64748b; padding:5px 0; }
    .totals-row.grand { margin-top:10px; padding:14px 16px; background:#78350f; color:#fff; border-radius:10px; font-size:15px; font-weight:700; }
    .footer { margin-top:36px; padding-top:20px; border-top:1px solid #f1f5f9; text-align:center; font-size:11px; color:#94a3b8; line-height:1.8; }
    .footer strong { color:#78350f; }
    @media print { body { padding:24px; } @page { margin:1cm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">🌿 Ayola Foods</div>
      <div class="brand-tagline">Eat Healthy · Live Well</div>
    </div>
    <div class="receipt-label">
      <h2>Receipt</h2>
      <p>Order #${order.order_number}</p>
      <p>${formatDate(order.created_at)}</p>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Order Details</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Customer</div><div class="info-value">${order.customer_name}</div></div>
      <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${order.customer_phone}</div></div>
      <div class="info-item"><div class="info-label">Payment</div><div class="info-value">${paymentMethodLabel}</div></div>
      <div class="info-item"><div class="info-label">Status</div><div class="info-value"><span class="receipt-badge">${order.status}</span></div></div>
      ${order.mpesa_receipt_number ? `<div class="info-item" style="grid-column:span 2"><div class="info-label">M-Pesa Receipt No.</div><div class="info-value" style="color:#16a34a;font-family:monospace">${order.mpesa_receipt_number}</div></div>` : ""}
      <div class="info-item"><div class="info-label">Delivery</div><div class="info-value" style="text-transform:capitalize">${order.delivery_type}</div></div>
      <div class="info-item"><div class="info-label">Region</div><div class="info-value">${order.delivery_city}</div></div>
      ${order.delivery_type !== "pickup" ? `<div class="info-item" style="grid-column:span 2"><div class="info-label">Delivery Address</div><div class="info-value">${order.delivery_address}</div></div>` : ""}
    </div>
  </div>
  <div class="section">
    <div class="section-title">Items Ordered</div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th>Total</th></tr></thead>
      <tbody>
        ${order.order_items.map((item) => `<tr><td>${item.product_name}</td><td style="text-align:center;color:#64748b">${item.quantity}</td><td style="text-align:right;color:#64748b">${formatPrice(item.product_price)}</td><td>${formatPrice(item.line_total)}</td></tr>`).join("")}
      </tbody>
    </table>
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
      <div class="totals-row"><span>Delivery Fee</span><span>${order.delivery_fee === 0 ? "TBD" : formatPrice(order.delivery_fee)}</span></div>
      <div class="totals-row grand"><span>Total Paid</span><span>${formatPrice(order.total)}</span></div>
    </div>
  </div>
  <div class="footer">
    <p><strong>Ayola Foods Kenya</strong></p>
    <p>Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari, Nairobi</p>
    <p>📞 0713 280 550 &nbsp;|&nbsp; ayola.foods.kenya@gmail.com</p>
    <p style="margin-top:10px">Thank you for choosing Ayola Foods — Eat Healthy, Live Well! 🌿</p>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Order not found"}</p>
          <Link href="/products" className="text-primary hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const paymentMethodLabel = order.payment_method === "mpesa" ? "M-Pesa" : "Cash on Delivery";
  const isPaid = order.payment_status === "completed";

  return (
    <div className="pt-28 pb-20 bg-muted/30 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPaid ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
            <Check className={`w-10 h-10 ${isPaid ? "text-green-600" : "text-amber-600"}`} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isPaid ? "Payment Confirmed!" : "Order Received!"}
          </h1>
          <p className="text-muted-foreground">
            {isPaid
              ? "Your payment was successful. A receipt has been sent to your WhatsApp."
              : "We've received your order. We'll contact you on WhatsApp to confirm the delivery fee."}
          </p>
        </div>

        {/* Receipt card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">

          {/* Order header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-border bg-muted/30">
            <div>
              <h2 className="text-lg font-bold text-foreground">Order #{order.order_number}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.created_at)}</p>
            </div>
            <div className="text-right space-y-1">
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* M-Pesa receipt number — prominent when paid */}
          {order.mpesa_receipt_number && (
            <div className="px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-400 font-medium uppercase tracking-wider mb-1">M-Pesa Receipt Number</p>
              <p className="text-xl font-bold font-mono text-green-800 dark:text-green-300">{order.mpesa_receipt_number}</p>
            </div>
          )}

          {/* Customer + payment info */}
          <div className="grid grid-cols-2 gap-4 px-6 py-5 border-b border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Customer</p>
              <p className="font-semibold text-foreground">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Payment</p>
              <p className="font-semibold text-foreground">{paymentMethodLabel}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Delivery</p>
              <p className="font-semibold text-foreground capitalize">{order.delivery_type}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Region</p>
              <p className="font-semibold text-foreground">{order.delivery_city}</p>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-5 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.quantity}× {item.product_name}</span>
                  <span className="font-semibold text-foreground">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="px-6 py-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className={order.delivery_fee === 0 ? "text-amber-600 font-medium" : "text-foreground"}>
                {order.delivery_fee === 0 ? "TBD via WhatsApp" : formatPrice(order.delivery_fee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-border">
              <span className="text-foreground">Total {isPaid ? "Paid" : ""}</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <button
            onClick={() => { setPolling(true); fetchOrder().finally(() => setPolling(false)); }}
            disabled={polling}
            className="flex items-center gap-2 bg-muted text-muted-foreground px-5 py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${polling ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link href="/products" className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-colors">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!isPaid && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Waiting for payment confirmation? Click Refresh after paying.
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <OrderSuccessPage />
    </Suspense>
  );
}
