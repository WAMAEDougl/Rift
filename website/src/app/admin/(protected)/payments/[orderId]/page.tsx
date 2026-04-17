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
    .select("id, order_id, provider, event_type, raw_payload, created_at")
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
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-[#1a1a2e]"
      >
        ← Back to Order #{order.order_number}
      </Link>

      <h1
        className="text-xl font-bold text-[#1a1a2e]"
        style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
      >
        Payment Log — #{order.order_number}
      </h1>

      {/* Order summary */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-medium text-slate-600 mb-3">Order Summary</h2>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-slate-500">Customer: </span>
            <span className="font-medium text-[#1a1a2e]">{order.customer_name}</span>
          </div>
          <div>
            <span className="text-slate-500">Total: </span>
            <span className="font-medium text-[#1a1a2e]">{formatKES(order.total)}</span>
          </div>
          <div>
            <span className="text-slate-500">Method: </span>
            <span className="font-medium text-[#1a1a2e]">{methodLabel}</span>
          </div>
          <div>
            <span className="text-slate-500">Status: </span>
            <StatusBadge status={order.payment_status} type="payment" />
          </div>
        </div>
      </div>

      {/* Payment logs table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2
            className="text-base font-bold text-[#1a1a2e]"
            style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
          >
            Payment Logs
          </h2>
        </div>

        {logList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No payment logs found for this order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Raw Payload
                  </th>
                </tr>
              </thead>
              <tbody>
                {logList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 capitalize">{log.provider}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
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
    return <span className="text-slate-400 text-xs">—</span>
  }
  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-blue-600 hover:underline">View payload</summary>
      <pre className="mt-2 bg-slate-50 rounded p-3 overflow-auto max-h-64 text-slate-500">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </details>
  )
}
