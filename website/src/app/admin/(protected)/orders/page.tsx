"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const FILTER_INPUT_CLASS =
  "border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"

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

  const pageNumbers = pagination
    ? Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
    : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total orders</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search order #, customer..."
          value={q}
          onChange={(e) => updateParam({ q: e.target.value })}
          className={FILTER_INPUT_CLASS + " min-w-[200px]"}
        />

        <select
          value={status}
          onChange={(e) => updateParam({ status: e.target.value })}
          className={FILTER_INPUT_CLASS}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => updateParam({ payment_status: e.target.value })}
          className={FILTER_INPUT_CLASS}
        >
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={deliveryType}
          onChange={(e) => updateParam({ delivery_type: e.target.value })}
          className={FILTER_INPUT_CLASS}
        >
          <option value="">All delivery types</option>
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
          <option value="shipping">Shipping</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={(e) => updateParam({ from: e.target.value })}
          className={FILTER_INPUT_CLASS}
          title="From date"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => updateParam({ to: e.target.value })}
          className={FILTER_INPUT_CLASS}
          title="To date"
        />

        {(q || status || paymentStatus || deliveryType || from || to) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Order #</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Items</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Delivery</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Payment</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="px-4 py-3">
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-10" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 transition-colors ${selectedIds.has(order.id) ? "bg-orange-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleRow(order.id)}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-sm text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-gray-500 text-xs">{order.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.item_count}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatKES(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.delivery_type} type="delivery" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} type="order" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.payment_status} type="payment" />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        <span title={formatDate(order.created_at)}>
                          {formatRelativeTime(order.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-900 font-medium">No orders found</p>
            <p className="text-gray-500 text-sm mt-1">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
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
              onClick={() => goToPage(p)}
              className={p === page ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" : ""}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={!pagination || page >= pagination.total_pages}
            className="gap-1"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white rounded-xl shadow-xl px-5 py-3">
          <span className="text-sm font-medium">
            {selectedIds.size} order{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="w-px h-5 bg-gray-700" />
          <Button
            size="sm"
            onClick={handleBulkConfirm}
            disabled={bulkLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            Mark Confirmed
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            disabled={bulkLoading}
            className="border-red-400 text-red-400 hover:bg-red-900/20 text-xs"
          >
            Cancel Orders
          </Button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-gray-400 hover:text-white ml-1"
            aria-label="Clear selection"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Bulk cancel dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel {selectedIds.size} order{selectedIds.size !== 1 ? "s" : ""}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This will cancel all selected orders. This action cannot be undone.
          </p>
          <div className="mt-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false)
                setCancelReason("")
              }}
              disabled={bulkLoading}
            >
              Keep Orders
            </Button>
            <Button
              onClick={handleBulkCancel}
              disabled={bulkLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {bulkLoading ? "Cancelling..." : "Cancel Orders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
