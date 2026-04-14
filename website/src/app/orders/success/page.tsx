"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, MessageCircle, Printer, Download, ArrowRight, Package, MapPin, Phone, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

export default function OrderSuccessPage() {
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
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

      if (fetchError || !data) {
        setError("Order not found");
      } else {
        setOrder(data);
      }
      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printContent = document.getElementById("order-details");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order?.order_number} - Ayola Foods</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a2e; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 28px; font-weight: 800; color: #22c55e; }
            .order-number { font-size: 18px; color: #64748b; margin-top: 8px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 12px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .info-item { padding: 12px; background: #f8fafc; border-radius: 8px; }
            .info-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
            .info-value { font-size: 14px; font-weight: 600; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; padding: 12px; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .total-row { display: flex; justify-content: space-between; padding: 16px; background: #1a1a2e; color: white; border-radius: 8px; margin-top: 16px; }
            .total-label { font-size: 14px; font-weight: 600; }
            .total-value { font-size: 20px; font-weight: 800; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
