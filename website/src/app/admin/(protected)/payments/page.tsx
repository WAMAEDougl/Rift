"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters"

interface PaymentRow {
  order_id: string
  order_number: string
  customer_name: string
  customer_phone: string
  total: number
  payment_method: string
  payment_status: string
  mpesa_receipt_number: string | null
  created_at: string
}

interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

interface PaymentsResponse {
  data: {
    items: PaymentRow[]
    pagination: Pagination
  }
  error: string | null
}

function MethodBadge({ method }: { method: string }) {
  const label = method === "mpesa" ? "M-Pesa" : "Cash on Delivery"
  const color =
    method === "mpesa" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  )
}

const FILTER_INPUT_CLASS =
  "border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [method, setMethod] = useState("")
  const [status, setStatus] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (method) params.set("payment_method", method)
      if (status) params.set("payment_status", status)
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      params.set("page", String(page))
      params.set("per_page", "20")

      const res = await fetch(`/api/admin/payments?${params.toString()}`)
      const json: PaymentsResponse = await res.json()
      if (json.data) {
        setPayments(json.data.items)
        setPagination(json.data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }, [search, method, status, from, to, page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const resetPage = () => setPage(1)

  const pageNumbers = pagination
    ? Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
        {pagination && (
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total payments</p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search order #, receipt..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage() }}
          className={FILTER_INPUT_CLASS + " min-w-[200px]"}
        />
        <select
          value={method}
          onChange={(e) => { setMethod(e.target.value); resetPage() }}
          className={FILTER_INPUT_CLASS}
        >
          <option value="">All methods</option>
          <option value="mpesa">M-Pesa</option>
          <option value="cash_on_delivery">Cash on Delivery</option>
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); resetPage() }}
          className={FILTER_INPUT_CLASS}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); resetPage() }}
          className={FILTER_INPUT_CLASS}
          title="From date"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); resetPage() }}
          className={FILTER_INPUT_CLASS}
          title="To date"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                : payments.map((p) => (
                    <tr key={`${p.order_id}-${p.mpesa_receipt_number}`} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${p.order_id}`}
                          className="font-mono text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          {p.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{p.customer_name}</div>
                        <div className="text-gray-500 text-xs">{p.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatKES(p.total)}
                      </td>
                      <td className="px-6 py-4">
                        <MethodBadge method={p.payment_method} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.payment_status} type="payment" />
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                        {p.mpesa_receipt_number ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        <span title={formatDate(p.created_at)}>
                          {formatRelativeTime(p.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && payments.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-900 font-medium">No payments found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="gap-1"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
              className={
                p === page ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" : ""
              }
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            disabled={page >= pagination.total_pages}
            className="gap-1"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
