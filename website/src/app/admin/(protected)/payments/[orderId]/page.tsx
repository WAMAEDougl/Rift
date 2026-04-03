import { notFound } from "next/navigation"
import Link from "next/link"
import { getAdminClient } from "@/lib/admin/supabase"
import { formatKES, formatDate } from "@/lib/admin/formatters"
import StatusBadge from "@/components/admin/StatusBadge"
import type { Json } from "@/lib/supabase/types"

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function PaymentLogPage({ params }: Props) {
  const { orderId } = await params
  const admin = getAdminClient()

  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, customer_name, total, payment_status, payment_method")
    .eq("id", orderId)
    .single()

  if (!order) notFound()

  const { data: logs } = await admin
    .from("payment_logs")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })

  const logList = logs ?? []

  const methodLabel =
    order.payment_method === "mpesa" ? "M-Pesa" : "Cash on Delivery"

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/admin/orders/${orderId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        ← Back to Order #{order.order_number}
      </Link>

      <h1 className="text-xl font-semibold text-gray-900">
        Payment Log — #{order.order_number}
      </h1>

      {/* Order summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-500">Customer: </span>
            <span className="font-medium text-gray-900">{order.customer_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Total: </span>
            <span className="font-medium text-gray-900">{formatKES(order.total)}</span>
          </div>
          <div>
            <span className="text-gray-500">Method: </span>
            <span className="font-medium text-gray-900">{methodLabel}</span>
          </div>
          <div>
            <span className="text-gray-500">Status: </span>
            <StatusBadge status={order.payment_status} type="payment" />
          </div>
        </div>
      </div>

      {/* Payment logs table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Payment Logs</h2>
        </div>

        {logList.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No payment logs found for this order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raw Payload
                  </th>
                </tr>
              </thead>
              <tbody>
                {logList.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 capitalize">{log.provider}</td>
                    <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                      {log.event_type}
                    </td>
                    <td className="px-6 py-4">
                      <PayloadCell payload={log.raw_payload} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PayloadCell({ payload }: { payload: Json | null }) {
  if (payload === null || payload === undefined) {
    return <span className="text-gray-400 text-xs">—</span>
  }
  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-blue-600 hover:underline">View payload</summary>
      <pre className="mt-2 bg-gray-50 rounded p-3 overflow-auto max-h-64 text-gray-700">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </details>
  )
}
