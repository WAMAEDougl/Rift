"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, MessageCircle, Printer, Download, ArrowRight, Package, MapPin, Phone, Mail } from "lucide-react";

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
  order_items: OrderItem[];
  created_at: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(price);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/public-orders/${orderId}`);
        const json = await res.json();
        
        if (!res.ok || json.error) {
          console.error("Order fetch error:", json.error);
          setError("Order not found");
        } else {
          setOrder(json.order);
        }
      } catch (err) {
        console.error("Network error:", err);
        setError("Failed to load order");
      }
      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!order) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const paymentMethodLabel = order.payment_method === "mpesa" ? "M-Pesa" : "Cash on Delivery";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt — Order #${order.order_number} — Ayola Foods</title>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              color: #1a1a2e;
              background: #fff;
              padding: 48px 40px;
              max-width: 600px;
              margin: 0 auto;
            }

            /* Header */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 24px;
              border-bottom: 2px solid #f1f5f9;
              margin-bottom: 28px;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 800;
              color: #78350f;
              letter-spacing: -0.5px;
            }
            .brand-tagline {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 3px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .receipt-label {
              text-align: right;
            }
            .receipt-label h2 {
              font-size: 18px;
              font-weight: 700;
              color: #1a1a2e;
            }
            .receipt-label p {
              font-size: 12px;
              color: #64748b;
              margin-top: 3px;
            }

            /* Section */
            .section {
              margin-bottom: 24px;
            }
            .section-title {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #94a3b8;
              margin-bottom: 10px;
            }

            /* Info grid */
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .info-item {
              background: #f8fafc;
              border-radius: 8px;
              padding: 10px 14px;
            }
            .info-label {
              font-size: 10px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.06em;
            }
            .info-value {
              font-size: 13px;
              font-weight: 600;
              color: #1a1a2e;
              margin-top: 3px;
            }

            /* Items table */
            table {
              width: 100%;
              border-collapse: collapse;
            }
            thead tr {
              border-bottom: 2px solid #e2e8f0;
            }
            th {
              text-align: left;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #94a3b8;
              padding: 8px 0;
            }
            th:last-child { text-align: right; }
            td {
              padding: 10px 0;
              font-size: 13px;
              color: #1a1a2e;
              border-bottom: 1px solid #f1f5f9;
            }
            td:last-child { text-align: right; font-weight: 600; }
            .qty-col { color: #64748b; font-size: 12px; }

            /* Totals */
            .totals {
              margin-top: 16px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              color: #64748b;
              padding: 5px 0;
            }
            .totals-row.grand {
              margin-top: 10px;
              padding: 14px 16px;
              background: #78350f;
              color: #fff;
              border-radius: 10px;
              font-size: 15px;
              font-weight: 700;
            }

            /* Status badge */
            .badge {
              display: inline-block;
              padding: 3px 10px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              background: #dcfce7;
              color: #16a34a;
              text-transform: capitalize;
            }

            /* Footer */
            .footer {
              margin-top: 36px;
              padding-top: 20px;
              border-top: 1px solid #f1f5f9;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              line-height: 1.8;
            }
            .footer strong {
              color: #78350f;
            }

            @media print {
              body { padding: 24px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
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

          <!-- Order Info -->
          <div class="section">
            <div class="section-title">Order Details</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Customer</div>
                <div class="info-value">${order.customer_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${order.customer_phone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment</div>
                <div class="info-value">${paymentMethodLabel}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value"><span class="badge">${order.status}</span></div>
              </div>
              <div class="info-item">
                <div class="info-label">Delivery</div>
                <div class="info-value" style="text-transform:capitalize">${order.delivery_type}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Region</div>
                <div class="info-value">${order.delivery_city}</div>
              </div>
              ${order.delivery_type !== "pickup" ? `
              <div class="info-item" style="grid-column: span 2">
                <div class="info-label">Delivery Address</div>
                <div class="info-value">${order.delivery_address}</div>
              </div>` : ""}
            </div>
          </div>

          <!-- Items -->
          <div class="section">
            <div class="section-title">Items Ordered</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:center">Qty</th>
                  <th style="text-align:right">Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items.map((item) => `
                <tr>
                  <td>${item.product_name}</td>
                  <td class="qty-col" style="text-align:center">${item.quantity}</td>
                  <td style="text-align:right; color:#64748b">${formatPrice(item.product_price)}</td>
                  <td>${formatPrice(item.line_total)}</td>
                </tr>`).join("")}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>${formatPrice(order.subtotal)}</span>
              </div>
              <div class="totals-row">
                <span>Delivery Fee</span>
                <span>${order.delivery_fee === 0 ? "FREE" : formatPrice(order.delivery_fee)}</span>
              </div>
              <div class="totals-row grand">
                <span>Total Paid</span>
                <span>${formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>Ayola Foods Kenya</strong></p>
            <p>Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari</p>
            <p>📞 +254 700 000 000 &nbsp;|&nbsp; 🌐 www.ayolafoods.com</p>
            <p style="margin-top:10px">Thank you for choosing Ayola Foods — Eat Healthy, Live Well! 🌿</p>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  return (
    <div className="pt-28 pb-20 bg-muted/30 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed!</h1>
          <p className="text-muted-foreground">We&apos;re preparing your order now.</p>
        </div>

        <div className="bg-card rounded-2xl p-6 text-left mb-6 space-y-3 border border-border" id="order-details">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground">Order #{order.order_number}</h2>
              <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Status</p>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full capitalize">
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Customer</p>
              <p className="font-medium text-foreground">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Payment</p>
              <p className="font-medium text-foreground">{paymentMethodLabel}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Delivery Type</p>
              <p className="font-medium text-foreground capitalize">{order.delivery_type}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Region</p>
              <p className="font-medium text-foreground">{order.delivery_city}</p>
            </div>
          </div>

          {order.delivery_type !== "pickup" && (
            <div className="py-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Delivery Address</p>
              <p className="font-medium text-foreground">{order.delivery_address}</p>
            </div>
          )}

          <div className="py-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.quantity}x {item.product_name}
                  </span>
                  <span className="font-medium text-foreground">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="py-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-foreground">{formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="footer">
            <p>Ayola Foods KE - www.ayolafoods.com</p>
            <p>Thank you for your order!</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <Link href="/products" className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-colors">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <OrderSuccessPage />
    </Suspense>
  );
}
