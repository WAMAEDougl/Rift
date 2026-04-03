import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/supabase"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters"
import { OrderStatusControl } from "./OrderStatusControl"
import { CancelOrderButton } from "./CancelOrderButton"

const STEPS = ["pending", "confirmed", "preparing", "ready", "dispatched", "delivered"]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = getAdminClient()

  const [{ data: order }, { data: profile }] = await Promise.all([
    admin
      .from("orders")
      .select(
        "*, order_items(id, product_id, product_name, product_price, quantity, line_total)"
      )
      .eq("id", id)
      .single(),
    admin
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single(),
  ])

  if (!order) notFound()

  const role = (profile?.role ?? "admin") as "admin" | "kitchen"
  const isCancelled = order.status === "cancelled"
  const isDelivered = order.status === "delivered"
  const isTerminal = isCancelled || isDelivered

  const currentStepIndex = isCancelled ? -1 : STEPS.indexOf(order.status)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-gray-900 font-mono">
              Order {order.order_number}
            </h1>
            <StatusBadge status={order.status} type="order" />
            <StatusBadge status={order.payment_status} type="payment" />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Created {formatDate(order.created_at)}
            {" · "}
            <span title={formatDate(order.created_at)}>
              {formatRelativeTime(order.created_at)}
            </span>
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">
              Status Timeline
            </h3>

            {isCancelled ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  Order Cancelled
                </span>
                {order.order_notes && (
                  <span className="text-sm text-gray-500">{order.order_notes}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-0">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex
                  const isCurrent = idx === currentStepIndex
                  const isFuture = idx > currentStepIndex

                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                            isCompleted
                              ? "bg-orange-500 border-orange-500"
                              : isCurrent
                                ? "bg-white border-orange-500"
                                : "bg-white border-gray-300"
                          }`}
                        >
                          {isCompleted && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {isCurrent && (
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          )}
                          {isFuture && (
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                          )}
                        </div>
                        <span
                          className={`text-xs capitalize whitespace-nowrap ${
                            isCompleted || isCurrent
                              ? "text-gray-900 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 -mt-5 ${
                            idx < currentStepIndex ? "bg-orange-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status control */}
          {!isTerminal && (
            <OrderStatusControl
              orderId={order.id}
              currentStatus={order.status}
              role={role}
            />
          )}

          {/* Order items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Order Items
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-left font-medium text-gray-600">Product</th>
                  <th className="pb-2 text-right font-medium text-gray-600">Unit Price</th>
                  <th className="pb-2 text-right font-medium text-gray-600">Qty</th>
                  <th className="pb-2 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.order_items.map(
                  (item: {
                    id: string
                    product_name: string
                    product_price: number
                    quantity: number
                    line_total: number
                  }) => (
                    <tr key={item.id}>
                      <td className="py-3 text-gray-900">{item.product_name}</td>
                      <td className="py-3 text-right text-gray-600">
                        {formatKES(item.product_price)}
                      </td>
                      <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        {formatKES(item.line_total)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatKES(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery fee</span>
                <span>{formatKES(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatKES(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order notes */}
          {order.order_notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Order Notes
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.order_notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Customer
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p className="text-gray-600 flex items-center gap-1.5">
                <span>📞</span>
                {order.customer_phone}
              </p>
              {order.customer_email && (
                <p className="text-gray-600 flex items-center gap-1.5">
                  <span>✉</span>
                  {order.customer_email}
                </p>
              )}
              <p className="text-gray-600 flex items-start gap-1.5">
                <span className="mt-0.5">📍</span>
                <span>
                  {order.delivery_address}
                  <br />
                  {order.delivery_city}
                </span>
              </p>
              <div className="pt-1">
                <StatusBadge status={order.delivery_type} type="delivery" />
              </div>
              {order.customer_id && (
                <div className="pt-1">
                  <Link
                    href={`/admin/customers/${order.customer_id}`}
                    className="text-orange-600 hover:text-orange-700 hover:underline text-xs"
                  >
                    View customer →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Payment card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {order.payment_method === "mpesa"
                    ? "M-Pesa"
                    : order.payment_method.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <StatusBadge status={order.payment_status} type="payment" />
              </div>
              {order.mpesa_receipt_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt</span>
                  <span className="font-mono text-gray-900 text-xs">
                    {order.mpesa_receipt_number}
                  </span>
                </div>
              )}

              {order.mpesa_checkout_request_id && (
                <details className="pt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 select-none">
                    Technical details
                  </summary>
                  <div className="mt-2 bg-gray-50 rounded p-2 text-xs text-gray-600 break-all">
                    <span className="font-medium">Checkout Request ID:</span>
                    <br />
                    {order.mpesa_checkout_request_id}
                  </div>
                </details>
              )}

              <div className="pt-1">
                <Link
                  href={`/admin/payments/${order.id}`}
                  className="text-orange-600 hover:text-orange-700 hover:underline text-xs"
                >
                  View payment log →
                </Link>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          {!isTerminal && role === "admin" && (
            <CancelOrderButton orderId={order.id} orderNumber={order.order_number} />
          )}
        </div>
      </div>
    </div>
  )
}
