"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp,
  Clock,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  FileDown,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters"

interface OrderRow {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  item_count: number
  total: number
  delivery_type: string
  status: string
  payment_status: string
  created_at: string
}

interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

interface OrdersResponse {
  data: {
    items: OrderRow[]
    pagination: Pagination
  }
  error: string | null
}

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_type: "delivery",
    delivery_address: "",
    delivery_city: "Nairobi",
    order_notes: "",
    payment_method: "cash_on_delivery",
  })

  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? ""
  const paymentStatus = searchParams.get("payment_status") ?? ""
  const deliveryType = searchParams.get("delivery_type") ?? ""
  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const page = Number(searchParams.get("page") ?? "1")

  const updateParam = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      params.set("page", "1")
      router.push(`/admin/orders?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = () => {
    router.push("/admin/orders")
  }

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`/admin/orders?${params.toString()}`)
  }

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setSelectedIds(new Set())
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (status) params.set("status", status)
      if (paymentStatus) params.set("payment_status", paymentStatus)
      if (deliveryType) params.set("delivery_type", deliveryType)
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      params.set("page", String(page))
      params.set("per_page", "20")

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const json: OrdersResponse = await res.json()
      if (json.data) {
        setOrders(json.data.items)
        setPagination(json.data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }, [q, status, paymentStatus, deliveryType, from, to, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const allSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)))
    }
  }

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBulkConfirm = async () => {
    setBulkLoading(true)
    try {
      await fetch("/api/admin/orders/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status: "confirmed" }),
      })
      await fetchOrders()
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkCancel = async () => {
    setBulkLoading(true)
    try {
      await fetch("/api/admin/orders/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: "cancelled",
          reason: cancelReason || undefined,
        }),
      })
      setShowCancelDialog(false)
      setCancelReason("")
      await fetchOrders()
    } finally {
      setBulkLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (status) params.set("status", status)
      if (paymentStatus) params.set("payment_status", paymentStatus)
      if (deliveryType) params.set("delivery_type", deliveryType)
      if (from) params.set("from", from)
      if (to) params.set("to", to)
      params.set("per_page", "1000")
      params.set("export", "true")

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch orders")

      const data = await res.json()
      const orders = data.data?.items || []

      const printContent = document.getElementById("orders-table-print")
      if (!printContent) {
        const a = window.document.createElement("a")
        a.href = URL.createObjectURL(
          new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" })
        )
        a.download = `orders-report-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        return
      }

      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      const style = `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1a1a2e; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 28px; font-weight: 800; color: #22c55e; }
        .title { font-size: 20px; font-weight: 600; margin-top: 8px; }
        .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 12px; }
        th { background: #1a1a2e; color: white; padding: 12px 8px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
        td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .total-cell { font-weight: 700; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #dbeafe; color: #1e40af; }
        .status-preparing { background: #dbeafe; color: #1e40af; }
        .status-ready { background: #dbeafe; color: #1e40af; }
        .status-dispatched { background: #dbeafe; color: #1e40af; }
        .status-delivered { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #f1f5f9; color: #64748b; }
        .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 20px; } }
      `

      const rows = orders.map((o: OrderRow) => `
        <tr>
          <td>${o.order_number}</td>
          <td>${o.customer_name}</td>
          <td>${o.customer_phone}</td>
          <td style="text-align:center">${o.item_count}</td>
          <td class="total-cell">KES ${o.total.toLocaleString()}</td>
          <td><span class="status status-${o.status}">${o.status}</span></td>
          <td style="text-align:right">${new Date(o.created_at).toLocaleDateString()}</td>
        </tr>
      `).join("")

      printWindow.document.write(`
        <html>
          <head>
            <title>Orders Report - Ayola Foods</title>
            <style>${style}</style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Ayola Foods</div>
              <div class="title">Orders Report</div>
              <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th style="text-align:center">Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style="text-align:right">Date</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <div class="footer">
              <p>Ayola Foods KE - www.ayolafoods.com</p>
              <p>Total Orders: ${orders.length}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 250)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setDownloading(false)
    }
  }

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return []
    const { total_pages } = pagination
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, "...", total_pages]
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages]
    return [1, "...", page, "...", total_pages]
  }

  const handleCreateOrder = async () => {
    if (!createForm.customer_name.trim() || !createForm.customer_phone.trim() || !createForm.delivery_address.trim()) {
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      if (res.ok) {
        setShowCreateDialog(false)
        setCreateForm({
          customer_name: "",
          customer_phone: "",
          customer_email: "",
          delivery_type: "delivery",
          delivery_address: "",
          delivery_city: "Nairobi",
          order_notes: "",
          payment_method: "cash_on_delivery",
        })
        fetchOrders()
      }
    } finally {
      setCreating(false)
    }
  }

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0)
    const pendingCount = orders.filter((o) => o.status === "pending").length
    return { totalRevenue, pendingCount }
  }, [orders])

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Orders
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {pagination?.total.toLocaleString()} total &middot; Sales history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading || orders.length === 0}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <FileDown size={16} />
            {downloading ? "Generating..." : "Export PDF"}
          </button>
          <button 
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Create Order
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <input
          className="flex-1 min-w-[180px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700 placeholder:text-gray-300"
          placeholder="Search by ID or name..."
          type="text"
          value={q}
          onChange={(e) => updateParam({ q: e.target.value })}
        />
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
          value={status}
          onChange={(e) => updateParam({ status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
          value={paymentStatus}
          onChange={(e) => updateParam({ payment_status: e.target.value })}
        >
          <option value="">All Payments</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
          value={deliveryType}
          onChange={(e) => updateParam({ delivery_type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
          <option value="shipping">Shipping</option>
        </select>
        <button
          onClick={clearFilters}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="px-6 py-3 w-10">
                  <input
                    className="w-4 h-4 rounded border-gray-300 text-amber-700 focus:ring-amber-600"
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Items</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-4 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32 rounded" />
                          <Skeleton className="h-3 w-24 rounded opacity-50" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center"><Skeleton className="h-5 w-8 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-28 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto rounded" /></td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-amber-50/30 transition-colors group ${
                        selectedIds.has(order.id) ? "bg-amber-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleRow(order.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                          type="checkbox"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold shrink-0">
                            {order.customer_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{order.customer_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{order.customer_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {order.item_count}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800 text-sm">
                        {formatKES(order.total)}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <StatusBadge status={order.delivery_type} type="delivery" />
                        <StatusBadge status={order.status} type="order" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-gray-600">{formatDate(order.created_at)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(order.created_at)}</p>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">Try expanding your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Showing <span className="text-gray-700 font-medium">{orders.length}</span> of{" "}
              <span className="text-gray-700 font-medium">{pagination.total.toLocaleString()}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
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
                    onClick={() => goToPage(p as number)}
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
                onClick={() => goToPage(page + 1)}
                disabled={page >= pagination.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-700" />
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            {formatKES(stats.totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Sales summary (current page)</p>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={16} className="text-amber-700" />
            </div>
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Needs Attention</p>
          </div>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            {stats.pendingCount} Pending
          </p>
          <p className="text-xs text-amber-600 mt-1">Orders awaiting fulfillment</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingBag size={16} className="text-blue-700" />
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Processing</p>
          </div>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Healthy
          </p>
          <p className="text-xs text-gray-400 mt-1">System status: Online</p>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 shadow-xl px-6 py-4 rounded-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center">
              {selectedIds.size}
            </div>
            <span className="text-sm font-semibold text-gray-700">orders selected</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkConfirm}
              disabled={bulkLoading}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              Confirm Orders
            </button>
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={bulkLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              Cancel Orders
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-2xl p-6 max-w-md bg-white">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-lg font-bold text-gray-900">
                Cancel Orders?
              </DialogTitle>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to cancel{" "}
                <span className="font-semibold text-gray-800">{selectedIds.size} selected orders</span>?
              </p>
            </div>
          </DialogHeader>
          <div className="mt-4 space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Reason (optional)</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter a reason for cancelling these orders..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none resize-none transition-colors"
            />
          </div>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button
              onClick={() => {
                setShowCancelDialog(false)
                setCancelReason("")
              }}
              disabled={bulkLoading}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleBulkCancel}
              disabled={bulkLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {bulkLoading ? "Processing..." : "Cancel Orders"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Order dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-2xl p-6 max-w-md bg-white">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 mx-auto">
              <Plus size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-lg font-bold text-gray-900">
                Create New Order
              </DialogTitle>
              <p className="text-sm text-gray-500 leading-relaxed">
                Place an order on behalf of a customer via phone or in-person.
              </p>
            </div>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Customer Name *</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={createForm.customer_name}
                onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Phone Number *</label>
              <input
                type="tel"
                placeholder="712 345 678"
                value={createForm.customer_phone}
                onChange={(e) => setCreateForm({ ...createForm, customer_phone: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Email (optional)</label>
              <input
                type="email"
                placeholder="customer@email.com"
                value={createForm.customer_email}
                onChange={(e) => setCreateForm({ ...createForm, customer_email: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Delivery Type *</label>
              <select
                value={createForm.delivery_type}
                onChange={(e) => setCreateForm({ ...createForm, delivery_type: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors"
              >
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Delivery Address *</label>
              <textarea
                placeholder="Enter delivery address"
                rows={2}
                value={createForm.delivery_address}
                onChange={(e) => setCreateForm({ ...createForm, delivery_address: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">City / Region</label>
              <input
                type="text"
                placeholder="Nairobi"
                value={createForm.delivery_city}
                onChange={(e) => setCreateForm({ ...createForm, delivery_city: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Order Notes (optional)</label>
              <textarea
                placeholder="Special instructions..."
                rows={2}
                value={createForm.order_notes}
                onChange={(e) => setCreateForm({ ...createForm, order_notes: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Payment Method *</label>
              <select
                value={createForm.payment_method}
                onChange={(e) => setCreateForm({ ...createForm, payment_method: e.target.value })}
                className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors"
              >
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button
              onClick={() => setShowCreateDialog(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={creating || !createForm.customer_name.trim() || !createForm.customer_phone.trim() || !createForm.delivery_address.trim()}
              className="flex-1 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Order"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
