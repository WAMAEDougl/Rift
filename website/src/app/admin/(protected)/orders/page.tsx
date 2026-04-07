"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Filter,
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

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return []
    const { total_pages } = pagination
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, "...", total_pages]
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages]
    return [1, "...", page, "...", total_pages]
  }

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0)
    const pendingCount = orders.filter((o) => o.status === "pending").length
    return { totalRevenue, pendingCount }
  }, [orders])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 w-full px-4">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-2">
        <div className="space-y-1">
          <p className="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.4em]">Customer Orders</p>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Orders
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
              {pagination?.total.toLocaleString()} Total Orders
            </span>
            <div className="h-3 w-px bg-slate-200" />
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Sales History</span>
          </div>
        </div>
        <button className="bg-[#1a1a2e] text-white px-7 py-3.5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#1a1a2e]/20 flex items-center gap-4 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden">
           <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-700">add_circle</span>
           <span className="relative z-10">Create New Order</span>
        </button>
      </div>

      {/* ── Sophisticated Filter Rows ── */}
      <div className="bg-white p-1 pb-4 rounded-[48px] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.08)] border border-slate-50/50 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="p-8 space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Search Input Container */}
            <div className="md:col-span-5 relative group/input">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within/input:text-[#22c55e] text-xl">search</span>
              <input
                className="w-full pl-14 pr-6 py-4.5 bg-slate-50/50 border border-transparent rounded-[24px] text-sm text-[#1a1a2e] font-bold focus:bg-white focus:ring-4 focus:ring-[#22c55e]/10 transition-all placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest outline-none shadow-inner"
                placeholder="Search by ID or name..."
                type="text"
                value={q}
                onChange={(e) => updateParam({ q: e.target.value })}
              />
            </div>
            
            {/* Action Group Grid */}
            <div className="md:col-span-7 grid grid-cols-3 gap-4">
              <select
                className="py-4 px-6 bg-slate-50 border-none rounded-[20px] text-[10px] font-black uppercase tracking-widest text-[#1a1a2e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all cursor-pointer appearance-none outline-none shadow-sm"
                value={status}
                onChange={(e) => updateParam({ status: e.target.value })}
              >
                <option value="">Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                className="py-4 px-6 bg-slate-50 border-none rounded-[20px] text-[10px] font-black uppercase tracking-widest text-[#1a1a2e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all cursor-pointer appearance-none outline-none shadow-sm"
                value={paymentStatus}
                onChange={(e) => updateParam({ payment_status: e.target.value })}
              >
                <option value="">Payments</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
               <select
                className="py-4 px-6 bg-slate-50 border-none rounded-[20px] text-[10px] font-black uppercase tracking-widest text-[#1a1a2e] focus:ring-4 focus:ring-[#22c55e]/10 transition-all cursor-pointer appearance-none outline-none shadow-sm"
                value={deliveryType}
                onChange={(e) => updateParam({ delivery_type: e.target.value })}
              >
                <option value="">Order Type</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center bg-[#fcf8ff] p-4 rounded-[32px] border border-slate-100 gap-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#22c55e] transition-colors">Today's Orders</span>
              </div>
              <div className="w-px h-4 bg-slate-200 self-center" />
              <div className="flex items-center gap-2 group cursor-pointer opacity-40 hover:opacity-100 transition-opacity">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Orders</span>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="text-[#1a1a2e] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white px-6 py-2.5 rounded-full transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined text-lg leading-none">close</span>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Data Catalog Grid ── */}
      <div className="bg-white rounded-[60px] overflow-hidden shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] border border-slate-50/50">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100/50">
                <th className="p-10 w-12 text-center">
                  <div className="flex items-center justify-center">
                     <input
                      className="w-5 h-5 rounded-lg border-slate-300 text-[#22c55e] focus:ring-[#22c55e]/20 transition-all"
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </div>
                </th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Order Information</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Items</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total Price</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-10 text-center"><Skeleton className="h-5 w-5 mx-auto rounded-lg" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-24 rounded-lg" /></td>
                      <td className="p-8">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-3 w-40" />
                      </td>
                      <td className="p-8 text-center"><Skeleton className="h-6 w-10 mx-auto rounded-lg" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-24 rounded-lg" /></td>
                      <td className="p-8"><Skeleton className="h-8 w-32 rounded-full" /></td>
                      <td className="p-8 text-right"><Skeleton className="h-4 w-28 ml-auto" /></td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#fcf8ff] transition-all duration-300 group border-b border-slate-50 last:border-0 relative ${
                        selectedIds.has(order.id) ? "bg-[#22c55e]/5" : ""
                      }`}
                    >
                      <td className="p-10 text-center">
                        <div className="flex items-center justify-center">
                          <input
                            checked={selectedIds.has(order.id)}
                            onChange={() => toggleRow(order.id)}
                            className="w-5 h-5 rounded-lg border-slate-300 text-[#22c55e] focus:ring-[#22c55e]/20 cursor-pointer shadow-sm"
                            type="checkbox"
                          />
                        </div>
                      </td>
                      <td className="p-8">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-black text-[#006e2f] bg-[#22c55e]/5 px-4 py-2.5 rounded-2xl hover:bg-[#006e2f] hover:text-white transition-all text-sm shadow-sm inline-block group-hover:scale-105 active:scale-95"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#1a1a2e] text-[10px] font-black shadow-inner border border-slate-200">
                             {order.customer_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm text-[#1a1a2e] tracking-tight">{order.customer_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{order.customer_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                         <div className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 rounded-2xl font-black text-[#1a1a2e] text-xs">
                          {order.item_count}
                         </div>
                      </td>
                      <td className="p-8 font-black text-[#1a1a2e] text-lg tracking-tighter">{formatKES(order.total)}</td>
                      <td className="p-8 space-y-2">
                        <StatusBadge status={order.delivery_type} type="delivery" />
                        <StatusBadge status={order.status} type="order" />
                      </td>
                      <td className="p-8 text-right">
                        <p className="text-[11px] font-black text-[#1a1a2e] uppercase tracking-tighter">{formatDate(order.created_at)}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 opacity-60">{formatRelativeTime(order.created_at)}</p>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* ── Empty Catalog Feedback ── */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-32 h-32 bg-slate-50/50 rounded-full flex items-center justify-center mb-8 text-5xl animate-in zoom-in duration-700">📦</div>
            <h3 className="text-3xl font-black text-[#1a1a2e] mb-3 tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>No orders found</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-60">
              We couldn't find any orders matching your current filters. Try expanding your search.
            </p>
          </div>
        )}

        {/* ── Precision Pagination Control ── */}
        {pagination && pagination.total_pages > 1 && (
          <div className="p-10 flex flex-col md:flex-row items-center justify-between border-t border-slate-50 bg-[#fcf8ff]/30 gap-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing <span className="text-[#1a1a2e]">{orders.length}</span> / <span className="text-[#1a1a2e]">{pagination.total.toLocaleString()}</span> orders
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 transition-all duration-300"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-3 p-2 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-12 h-12 flex items-center justify-center text-slate-300 font-bold">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`w-12 h-12 rounded-2xl font-black text-[11px] flex items-center justify-center transition-all ${
                        p === page ? "bg-[#1a1a2e] text-white shadow-xl shadow-[#1a1a2e]/20 scale-110" : "hover:bg-slate-50 text-slate-400"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= pagination.total_pages}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 transition-all duration-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Analytical Footer Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[48px] shadow-[0_4px_40px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between min-h-[180px] hover:translate-y-[-4px] transition-transform group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Total Revenue</p>
              <div className="p-2 bg-green-50 rounded-lg text-[#006e2f] opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-4xl font-black text-[#1a1a2e] tracking-tighter leading-none" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>{formatKES(stats.totalRevenue)}</h3>
          </div>
          <div className="pt-4 border-t border-slate-50 mt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Sales Summary (Current Page)</span>
          </div>
        </div>

        <div className="bg-[#1a1a2e] p-10 rounded-[48px] shadow-2xl flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
          <ShoppingBag size={180} className="absolute -right-12 -bottom-12 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">Needs Attention</p>
             <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{stats.pendingCount} Pending</h3>
          </div>
          <div className="relative z-10 pt-4 border-t border-white/10 mt-4 flex justify-between items-center">
            <span className="text-[10px] font-black text-white opacity-60 uppercase tracking-widest">Orders awaiting fulfillment</span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-[0_4px_40px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between min-h-[180px] hover:translate-y-[-4px] transition-transform group">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Order Processing</p>
            <h3 className="text-4xl font-black text-[#1a1a2e] tracking-tighter leading-none">Healthy</h3>
          </div>
          <div className="pt-4 border-t border-slate-50 mt-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#22c55e] text-sm font-black">sync_check</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">System status: Online</span>
          </div>
        </div>
      </section>

      {/* ── Floating Curator Bar ── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e]/90 backdrop-blur-2xl px-10 py-6 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex items-center gap-10 border border-white/20 animate-in fade-in slide-in-from-bottom-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e] text-white font-black text-sm flex items-center justify-center shadow-[0_10px_30px_rgba(34,197,94,0.4)] rotate-3">
              {selectedIds.size}
            </div>
            <div className="text-left">
              <span className="text-white text-xs font-black uppercase tracking-widest block">Batch Actions</span>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">Manage multiple orders</span>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10 self-center"></div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleBulkConfirm}
              disabled={bulkLoading}
              className="bg-white text-[#1a1a2e] px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#22c55e] hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              Confirm Orders
            </button>
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={bulkLoading}
              className="bg-transparent border border-red-500/40 text-red-400 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel Orders
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-all hover:bg-white/10 rounded-full"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
      )}

      {/* ── Dialog Refinement ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-[40px] p-12 max-w-lg border-none shadow-[0_60px_120px_rgba(0,0,0,0.5)] bg-white animate-in zoom-in-95">
          <DialogHeader className="space-y-6">
            <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mx-auto shadow-inner">
              <span className="material-symbols-outlined text-5xl">warning</span>
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-4xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                Confirm Cancellation
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                Are you sure you want to cancel <span className="text-[#1a1a2e] font-black">{selectedIds.size} selected orders</span>?
              </p>
            </div>
          </DialogHeader>
          <div className="mt-10 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 ml-1">Reason for Cancellation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter a reason for cancelling these orders..."
              rows={4}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-[24px] px-6 py-5 text-sm font-bold text-[#1a1a2e] focus:bg-white focus:ring-4 focus:ring-red-500/5 focus:border-red-500/50 outline-none resize-none transition-all shadow-inner"
            />
          </div>
          <DialogFooter className="mt-10 flex-row gap-4">
            <button
              onClick={() => {
                setShowCancelDialog(false)
                setCancelReason("")
              }}
              disabled={bulkLoading}
              className="flex-1 px-4 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Go Back
            </button>
            <button
              onClick={handleBulkCancel}
              disabled={bulkLoading}
              className="flex-1 px-4 py-5 bg-red-600 hover:bg-red-700 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(220,38,38,0.3)] transition-all active:scale-95"
            >
              {bulkLoading ? "Processing..." : "Cancel Orders"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
