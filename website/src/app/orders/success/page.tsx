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

    const receiptHTML = `
      <html>
        <head>
          <title>Receipt - Order #${order.order_number}</title>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
              padding: 40px 20px;
              color: #1e293b;
              line-height: 1.6;
            }
            
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            
            .receipt-header {
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              padding: 40px;
              text-align: center;
              color: white;
              position: relative;
              overflow: hidden;
            }
            
            .receipt-header::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            }
            
            .company-logo {
              font-size: 36px;
              font-weight: 800;
              letter-spacing: -0.5px;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            
            .company-tagline {
              font-size: 14px;
              opacity: 0.95;
              font-weight: 500;
              position: relative;
              z-index: 1;
            }
            
            .receipt-badge {
              display: inline-block;
              background: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(10px);
              padding: 8px 20px;
              border-radius: 50px;
              margin-top: 16px;
              font-size: 13px;
              font-weight: 600;
              position: relative;
              z-index: 1;
            }
            
            .receipt-body {
              padding: 40px;
            }
            
            .order-info-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 32px;
              padding-bottom: 24px;
              border-bottom: 2px solid #f1f5f9;
            }
            
            .order-number-section h2 {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            
            .order-date {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
            }
            
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
              color: #166534;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 32px;
            }
            
            .info-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            }
            
            .info-label {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #64748b;
              margin-bottom: 8px;
            }
            
            .info-value {
              font-size: 15px;
              font-weight: 600;
              color: #0f172a;
            }
            
            .address-section {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 32px;
              border: 1px solid #fbbf24;
            }
            
            .section-title {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #92400e;
              margin-bottom: 8px;
            }
            
            .address-text {
              font-size: 15px;
              font-weight: 600;
              color: #78350f;
            }
            
            .items-section {
              margin-bottom: 32px;
            }
            
            .items-header {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 2px solid #e2e8f0;
            }
            
            .item-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            
            .item-details {
              flex: 1;
            }
            
            .item-name {
              font-size: 15px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 4px;
            }
            
            .item-quantity {
              font-size: 13px;
              color: #64748b;
              font-weight: 500;
            }
            
            .item-price {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
            }
            
            .totals-section {
              background: #f8fafc;
              padding: 24px;
              border-radius: 12px;
              margin-bottom: 32px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              font-size: 15px;
            }
            
            .total-label {
              color: #64748b;
              font-weight: 500;
            }
            
            .total-value {
              color: #1e293b;
              font-weight: 600;
            }
            
            .grand-total {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 2px solid #e2e8f0;
            }
            
            .grand-total .total-label {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
            }
            
            .grand-total .total-value {
              font-size: 24px;
              font-weight: 800;
              color: #22c55e;
            }
            
            .receipt-footer {
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              padding: 32px;
              text-align: center;
              color: white;
            }
            
            .footer-content {
              margin-bottom: 16px;
            }
            
            .footer-title {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            
            .footer-text {
              font-size: 14px;
              opacity: 0.9;
              margin-bottom: 4px;
            }
            
            .footer-divider {
              width: 60px;
              height: 3px;
              background: #22c55e;
              margin: 20px auto;
              border-radius: 2px;
            }
            
            .footer-note {
              font-size: 12px;
              opacity: 0.7;
              font-style: italic;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .receipt-container {
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="company-logo">AYOLA FOODS</div>
              <div class="company-tagline">Premium Quality, Delivered Fresh</div>
              <div class="receipt-badge">Official Receipt</div>
            </div>
            
            <div class="receipt-body">
              <div class="order-info-header">
                <div class="order-number-section">
                  <h2>Order #${order.order_number}</h2>
                  <div class="order-date">${formatDate(order.created_at)}</div>
                </div>
                <div>
                  <div class="status-badge">${order.status}</div>
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-card">
                  <div class="info-label">Customer Name</div>
                  <div class="info-value">${order.customer_name}</div>
                </div>
                <div class="info-card">
                  <div class="info-label">Phone Number</div>
                  <div class="info-value">${order.customer_phone}</div>
                </div>
                <div class="info-card">
                  <div class="info-label">Payment Method</div>
                  <div class="info-value">${paymentMethodLabel}</div>
                </div>
                <div class="info-card">
                  <div class="info-label">Delivery Type</div>
                  <div class="info-value">${order.delivery_type === 'pickup' ? 'Pickup' : 'Delivery'}</div>
                </div>
              </div>
              
              ${order.delivery_type !== 'pickup' ? `
                <div class="address-section">
                  <div class="section-title">Delivery Address</div>
                  <div class="address-text">${order.delivery_address}, ${order.delivery_city}</div>
                </div>
              ` : ''}
              
              <div class="items-section">
                <div class="items-header">Order Items</div>
                ${order.order_items.map(item => `
                  <div class="item-row">
                    <div class="item-details">
                      <div class="item-name">${item.product_name}</div>
                      <div class="item-quantity">Quantity: ${item.quantity} × ${formatPrice(item.product_price)}</div>
                    </div>
                    <div class="item-price">${formatPrice(item.line_total)}</div>
                  </div>
                `).join('')}
              </div>
              
              <div class="totals-section">
                <div class="total-row">
                  <div class="total-label">Subtotal</div>
                  <div class="total-value">${formatPrice(order.subtotal)}</div>
                </div>
                <div class="total-row">
                  <div class="total-label">Delivery Fee</div>
                  <div class="total-value">${formatPrice(order.delivery_fee)}</div>
                </div>
                <div class="total-row grand-total">
                  <div class="total-label">Total Amount</div>
                  <div class="total-value">${formatPrice(order.total)}</div>
                </div>
              </div>
            </div>
            
            <div class="receipt-footer">
              <div class="footer-content">
                <div class="footer-title">Thank You for Your Order!</div>
                <div class="footer-text">Ayola Foods KE</div>
                <div class="footer-text">www.ayolafoods.com</div>
              </div>
              <div class="footer-divider"></div>
              <div class="footer-note">This is an official receipt for your order. Please keep it for your records.</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
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
