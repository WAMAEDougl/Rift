import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Clock, CheckCircle2, ChefHat, Package,
  Truck, MapPin, User, CreditCard, Phone, Mail,
  Zap, AlertTriangle, Package2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/supabase"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters"
import { OrderStatusControl } from "./OrderStatusControl"
import { CancelOrderButton } from "./CancelOrderButton"
import { WhatsAppPanel } from "./WhatsAppPanel"
import { AdminSTKPushPanel } from "./AdminSTKPushPanel"
import { AuditLogPanel } from "./AuditLogPanel"

const STEPS = [
  { key: "pending",    label: "Pending",    icon: Clock },
  { key: "confirmed",  label: "Confirmed",  icon: CheckCircle2 },
  { key: "preparing",  label: "Preparing",  icon: ChefHat },
  { key: "ready",      label: "Ready",      icon: Package },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered",  label: "Delivered",  icon: MapPin },
]

interface PageProps {
  params: Promise<{ id: string }>
}

function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
          {icon}
        </div>
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = getAdminClient()

  const [{ data: order }, { data: profile }, { data: auditLogs }, { data: inboundMessages }] = await Promise.all([
    admin.from("orders")
      .select("id, order_number, status, payment_status, customer_name, customer_phone, customer_email, customer_id, delivery_address, delivery_city, delivery_type, order_notes, subtotal, delivery_fee, total, payment_method, mpesa_receipt_number, created_at, order_items(id, product_id, product_name, product_price, quantity, line_total)")
      .eq("id", id).single(),
    admin.from("profiles").select("role").eq("id", user!.id).single(),
    admin.from("order_audit_logs").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    admin.from("notifications")
      .select("id, message, created_at")
      .eq("order_id", id)
      .eq("type", "delivery_negotiation_message")
      .order("created_at", { ascending: true }),
  ])

  if (!order) notFound()

  // Build inbound message list from delivery_negotiation_message notifications
  // (WaSenderAPI has no per-contact history endpoint, so we use stored notifications)
  const whatsappInbound: import("@/lib/wasender").WaSenderMessage[] = (inboundMessages ?? []).map((n) => ({
    id: n.id,
    from: order.customer_phone,
    to: "admin",
    body: n.message,
    timestamp: n.created_at,
    direction: "received" as const,
  }))

  const role = (profile?.role ?? "admin") as "admin" | "kitchen"
  const isCancelled = order.status === "cancelled"
  const isDelivered = order.status === "delivered"
  const isTerminal = isCancelled || isDelivered

  const stepKeys = STEPS.map((s) => s.key)
  // "pending_delivery_confirmation" is not in STEPS — treat it like pre-pending (index -1)
  const currentStepIndex = isCancelled || order.status === "pending_delivery_confirmation"
    ? -1
    : stepKeys.indexOf(order.status)
  const progressPercent = currentStepIndex <= 0 ? 0 : (currentStepIndex / (STEPS.length - 1)) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-100">
        <div>
          <Link href="/admin/orders" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-700 transition-colors mb-2">
            <ArrowLeft size={13} /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Order {order.order_number}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <StatusBadge status={order.status} type="order" />
            <StatusBadge status={order.payment_status} type="payment" />
            <span className="text-xs text-gray-400">{formatRelativeTime(order.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left Column ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Pending delivery confirmation status banner */}
          {order.status === "pending_delivery_confirmation" && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
              <p className="font-semibold">Awaiting delivery fee confirmation</p>
              <p className="text-sm mt-1">Review the WhatsApp conversation, agree on a delivery fee, then use the STK Push panel to request payment.</p>
            </div>
          )}

          {/* Status Progress */}
          <SectionCard title="Order Progress" icon={<Clock size={17} />}>
            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
                  {order.order_notes && (
                    <p className="text-xs text-red-500 mt-0.5">{order.order_notes}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative pt-2 pb-6">
                {/* Track */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 rounded-full" />
                <div
                  className="absolute top-6 left-0 h-1 bg-amber-600 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
                <div className="relative flex justify-between">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon
                    const isCompleted = idx < currentStepIndex
                    const isCurrent = idx === currentStepIndex
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-3 flex-1">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                          isCompleted ? "bg-amber-600 text-white shadow-sm"
                          : isCurrent ? "bg-gray-900 text-white ring-4 ring-gray-900/10 scale-110"
                          : "bg-white border border-gray-200 text-gray-300"
                        }`}>
                          <Icon size={18} />
                        </div>
                        <p className={`text-[10px] font-semibold uppercase tracking-wide text-center ${
                          isCompleted || isCurrent ? "text-gray-700" : "text-gray-300"
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Order Items */}
          <SectionCard title="Order Items" icon={<Package2 size={17} />}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/60">
                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.order_items.map((item: {
                    id: string; product_id: string; product_name: string;
                    product_price: number; quantity: number; line_total: number
                  }) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                            <Package2 size={14} />
                          </div>
                          <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatKES(item.product_price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">{formatKES(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatKES(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee</span>
                  <span>{formatKES(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-amber-700">{formatKES(order.total)}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Order Notes */}
          {order.order_notes && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Order Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{order.order_notes}</p>
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Customer */}
          <SectionCard title="Customer" icon={<User size={17} />}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-sm font-bold shrink-0">
                  {order.customer_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{order.customer_name}</p>
                  {order.customer_id && (
                    <Link href={`/admin/customers/${order.customer_id}`} className="text-xs text-amber-700 hover:underline">
                      View profile →
                    </Link>
                  )}
                </div>
              </div>

              {order.customer_email && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  {order.customer_email}
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400 shrink-0" />
                {order.customer_phone}
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{order.delivery_address}, {order.delivery_city}</span>
              </div>
              <div className="pt-1">
                <StatusBadge status={order.delivery_type} type="delivery" />
              </div>
            </div>
          </SectionCard>

          {/* Payment */}
          <SectionCard title="Payment" icon={<CreditCard size={17} />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Method</span>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {"M-Pesa"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Status</span>
                <StatusBadge status={order.payment_status} type="payment" />
              </div>
              {order.mpesa_receipt_number && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Receipt</span>
                  <span className="text-xs font-mono font-semibold text-green-700">{order.mpesa_receipt_number}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-xs text-gray-400">Placed</span>
                <span className="text-xs text-gray-600">{formatDate(order.created_at)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Actions */}
          {!isTerminal && (
            <SectionCard title="Update Status" icon={<Zap size={17} />}>
              <OrderStatusControl orderId={order.id} currentStatus={order.status} role={role} />
            </SectionCard>
          )}

          {/* Cancel */}
          {!isTerminal && role === "admin" && (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-red-200 flex items-center justify-center text-red-500 shrink-0">
                  <AlertTriangle size={15} />
                </div>
                <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
                  Danger Zone
                </h3>
              </div>
              <p className="text-xs text-red-700/60 leading-relaxed mb-4">
                Cancelling this order is irreversible.
              </p>
              <CancelOrderButton orderId={order.id} orderNumber={order.order_number} />
            </div>
          )}

          {/* WhatsApp Messages */}
          <WhatsAppPanel
            initialMessages={whatsappInbound}
            initialError={null}
            phone={order.customer_phone}
            orderId={order.id}
          />

          {/* Admin STK Push */}
          <AdminSTKPushPanel
            orderId={order.id}
            orderNumber={order.order_number}
            subtotal={order.subtotal}
            orderStatus={order.status}
          />

          {/* Audit Log */}
          <AuditLogPanel entries={auditLogs ?? []} />
        </div>
      </div>
    </div>
  )
}
