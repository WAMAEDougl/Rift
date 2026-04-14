"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Download, Search, Smartphone, Banknote, CreditCard, RotateCcw, CreditCard as CardIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatKES, formatRelativeTime } from "@/lib/admin/formatters"
import { toast } from "sonner"

interface PaymentRow {
  id: any
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

/* ── Method Badge ── */
function MethodBadge({ method }: { method: string }) {
  if (method === "mpesa") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
        <Smartphone size={12} /> M-Pesa
      </span>
    )
  }
  if (method === "cash_on_delivery") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
        <Banknote size={12} /> Cash
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 capitalize">
      <CreditCard size={12} /> {method.replace(/_/g, " ")}
    </span>
  )
}

/* ── Payment Status Badge ── */
function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-50 text-green-700 border-green-100",
    pending:    "bg-gray-100 text-gray-600 border-gray-200",
    processing: "bg-amber-50 text-amber-700 border-amber-100",
    failed:     "bg-red-50 text-red-600 border-red-100",
    cancelled:  "bg-red-50 text-red-600 border-red-100",
    refunded:   "bg-gray-100 text-gray-400 border-gray-200",
  }
  const cls = styles[status] ?? "bg-gray-100 text-gray-600 border-gray-200"
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${cls}`}>
      {status}
    </span>
  )
}

/* ── Page Component ── */
export default function PaymentsPage() {
  const [payments, setPayments]     = useState<PaymentRow[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState("")
  const [method, setMethod]         = useState("")
  const [status, setStatus]         = useState("")
  const [from, setFrom]             = useState("")
  const [to, setTo]                 = useState("")
  const [page, setPage]             = useState(1)
  const [downloading, setDownloading] = useState(false)

  async function downloadReport() {
    setDownloading(true)
    try {
      // Fetch all payments matching current filters (up to 1000)
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (method) params.set("payment_method", method)
      if (status) params.set("payment_status", status)
      if (from)   params.set("from", from)
      if (to)     params.set("to", to)
      params.set("page", "1")
      params.set("per_page", "1000")

      const res = await fetch(`/api/admin/payments?${params.toString()}`)
      const json: PaymentsResponse = await res.json()
      const rows = json.data?.items ?? []

      if (rows.length === 0) {
        toast.error("No payments to export")
        return
      }

      const headers = ["Order #", "Customer Name", "Phone", "Amount (KES)", "Payment Method", "Status", "M-Pesa Receipt", "Date"]
      const csvRows = [
        headers,
        ...rows.map((p) => [
          p.order_number,
          p.customer_name,
          p.customer_phone,
          String(p.total),
          p.payment_method === "cash_on_delivery" ? "Cash on Delivery" : "M-Pesa",
          p.payment_status,
          p.mpesa_receipt_number ?? "",
          new Date(p.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" }),
        ]),
      ]

      const csv = csvRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payments-report-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded ${rows.length} payment records`)
    } catch {
      toast.error("Failed to download report")
    } finally {
      setDownloading(false)
    }
  }

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (method) params.set("payment_method", method)
      if (status) params.set("payment_status", status)
      if (from)   params.set("from", from)
      if (to)     params.set("to", to)
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

  const clearFilters = () => {
    setSearch(""); setMethod(""); setStatus(""); setFrom(""); setTo("")
    resetPage()
  }

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return []
    const { total_pages } = pagination
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1)
    if (page <= 3)                   return [1, 2, 3, "...", total_pages]
    if (page >= total_pages - 2)     return [1, "...", total_pages - 2, total_pages - 1, total_pages]
    return [1, "...", page, "...", total_pages]
  }

  const showingFrom = pagination ? (pagination.page - 1) * pagination.per_page + 1       : 0
  const showingTo   = pagination ? Math.min(pagination.page * pagination.per_page, pagination.total) : 0

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Payments
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {pagination?.total.toLocaleString() ?? "0"} transactions &middot; Monitor and manage all customer payments
          </p>
        </div>
        <button
          onClick={downloadReport}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {downloading ? "Downloading…" : "Download Report"}
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-300 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
            placeholder="Order # or receipt ID..."
            className="flex-1 bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 placeholder:text-gray-300 outline-none"
          />
        </div>
        <select
          value={method}
          onChange={(e) => { setMethod(e.target.value); resetPage() }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
        >
          <option value="">All Methods</option>
          <option value="mpesa">M-Pesa</option>
          <option value="cash_on_delivery">Cash</option>
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); resetPage() }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); resetPage() }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); resetPage() }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
        />
        <button
          onClick={clearFilters}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
          title="Clear filters"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Method</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-36 rounded" />
                          <Skeleton className="h-3 w-24 rounded opacity-50" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 ml-auto rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28 rounded opacity-40" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto rounded opacity-40" /></td>
                    </tr>
                  ))
                : payments.map((p, i) => (
                    <tr
                      key={p.order_id ?? i}
                      className="hover:bg-amber-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${p.id}`}
                          className="text-sm font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                        >
                          {p.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800 text-sm">{p.customer_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.customer_phone}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-800 text-sm">
                        {formatKES(p.total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <MethodBadge method={p.payment_method} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <PaymentStatusBadge status={p.payment_status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-400 select-all">
                          {p.mpesa_receipt_number ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400">
                        {formatRelativeTime(p.created_at)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && payments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CardIcon size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No payments found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Showing <span className="text-gray-700 font-medium">{showingFrom}–{showingTo}</span> of{" "}
              <span className="text-gray-700 font-medium">{pagination.total.toLocaleString()}</span> transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-amber-700 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
