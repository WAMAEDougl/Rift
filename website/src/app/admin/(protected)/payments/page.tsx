"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Download, Search, SlidersHorizontal, Calculator } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatKES, formatRelativeTime } from "@/lib/admin/formatters"

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
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 text-blue-700 text-[9px] font-black uppercase tracking-widest border border-blue-100/50">
        <span className="material-symbols-outlined text-[14px]">smartphone</span> M-Pesa
      </span>
    )
  }
  if (method === "cash_on_delivery") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200/50">
        <span className="material-symbols-outlined text-[14px]">payments</span> Cash
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50/50 text-purple-700 text-[9px] font-black uppercase tracking-widest border border-purple-100/50 capitalize">
      <span className="material-symbols-outlined text-[14px]">account_balance</span> {method.replace(/_/g, " ")}
    </span>
  )
}

/* ── Payment Status Badge ── */
function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
    pending:    "bg-blue-50 text-blue-600 border-blue-100",
    processing: "bg-amber-50 text-amber-700 border-amber-100",
    failed:     "bg-red-50 text-red-600 border-red-100",
    cancelled:  "bg-red-50 text-red-600 border-red-100",
    refunded:   "bg-slate-50 text-slate-400 border-slate-200",
  }
  const cls = styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${cls}`}
    >
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <p className="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.4em] animate-in slide-in-from-left duration-500">Finance</p>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Payments
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
               {pagination?.total.toLocaleString() ?? "0"} Transactions
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Monitor and manage all customer payments</p>
          </div>
        </div>
        <button className="bg-[#1a1a2e] text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-3 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative">
           <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">download</span>
           <span className="relative z-10">Download Report</span>
        </button>
      </div>

      {/* ── Integrated Filter Bento Row ── */}
      <section className="bg-white p-2 rounded-[40px] border border-slate-50 shadow-[0_10px_40px_-5px_rgba(26,26,46,0.04)] flex flex-col xl:flex-row items-center divide-y xl:divide-y-0 xl:divide-x divide-slate-50 relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>

        {/* Search */}
        <div className="flex-[2] w-full flex items-center gap-4 px-8 py-6 relative z-10">
          <span className="material-symbols-outlined text-slate-300">search</span>
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#22c55e] mb-1">Search Payments</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage() }}
              placeholder="Order # or Receipt ID..."
              className="bg-transparent border-none p-0 text-sm font-bold text-[#1a1a2e] focus:ring-0 w-full placeholder:text-slate-200 outline-none leading-none"
            />
          </div>
        </div>

        {/* Method */}
        <div className="flex-1 w-full flex items-center gap-4 px-8 py-6 relative z-10">
          <span className="material-symbols-outlined text-slate-300">payments</span>
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment Method</span>
            <select
              value={method}
              onChange={(e) => { setMethod(e.target.value); resetPage() }}
              className="bg-transparent border-none p-0 text-sm font-black text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none capitalize leading-none w-full"
            >
              <option value="">All Methods</option>
              <option value="mpesa">M-Pesa</option>
              <option value="cash_on_delivery">Cash</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div className="flex-1 w-full flex items-center gap-4 px-8 py-6 relative z-10">
          <span className="material-symbols-outlined text-slate-300">verified</span>
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</span>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); resetPage() }}
              className="bg-transparent border-none p-0 text-sm font-black text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none capitalize leading-none w-full"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex-[2] w-full flex items-center gap-6 px-8 py-6 relative z-10">
           <span className="material-symbols-outlined text-slate-300">calendar_today</span>
           <div className="flex items-center gap-4 flex-1">
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Start Date</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); resetPage() }}
                  className="bg-transparent border-none p-0 text-[11px] font-black text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none uppercase"
                />
              </div>
              <div className="h-4 w-px bg-slate-100" />
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">End Date</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); resetPage() }}
                  className="bg-transparent border-none p-0 text-[11px] font-black text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none uppercase"
                />
              </div>
           </div>
           <button 
             onClick={clearFilters}
             className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-200 hover:text-red-500 transition-all group/clear"
           >
             <span className="material-symbols-outlined text-[20px] group-active/clear:rotate-180 transition-transform duration-500">restart_alt</span>
           </button>
        </div>
      </section>

      {/* ── Transaction Catalog ── */}
      <section className="bg-white rounded-[60px] overflow-hidden shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] border border-slate-50/50">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100/50">
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Order #</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Amount</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Method</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction ID</th>
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-10"><Skeleton className="h-6 w-24 rounded-lg" /></td>
                      <td className="p-8">
                        <div className="space-y-2">
                           <Skeleton className="h-5 w-40 rounded-lg" />
                           <Skeleton className="h-3 w-28 rounded-lg opacity-40" />
                        </div>
                      </td>
                      <td className="p-8"><Skeleton className="h-6 w-20 ml-auto rounded-lg" /></td>
                      <td className="p-8"><Skeleton className="h-8 w-24 mx-auto rounded-full" /></td>
                      <td className="p-8"><Skeleton className="h-8 w-24 mx-auto rounded-full" /></td>
                      <td className="p-8"><Skeleton className="h-4 w-32 rounded-lg opacity-30" /></td>
                      <td className="p-10 text-right"><Skeleton className="h-4 w-20 ml-auto rounded-lg opacity-30" /></td>
                    </tr>
                  ))
                : payments.map((p, i) => (
                    <tr
                      key={p.order_id ?? i}
                      className="hover:bg-[#fcf8ff] transition-all duration-300 group border-b border-slate-50 last:border-0"
                    >
                      <td className="p-10">
                        <Link
                          href={`/admin/orders/${p.id}`}
                          className="text-[#22c55e] font-black hover:text-[#1a1a2e] transition-colors font-mono text-sm tracking-tighter"
                        >
                          {p.order_number}
                        </Link>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col transition-transform group-hover:translate-x-2 duration-500">
                          <span className="font-extrabold text-[#1a1a2e] text-base tracking-tight">{p.customer_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">{p.customer_phone}</span>
                        </div>
                      </td>
                      <td className="p-8 text-right font-black text-[#1a1a2e] text-lg tracking-tighter">
                        {formatKES(p.total)}
                      </td>
                      <td className="p-8 text-center">
                        <MethodBadge method={p.payment_method} />
                      </td>
                      <td className="p-8 text-center transition-transform group-hover:scale-110 duration-500">
                        <PaymentStatusBadge status={p.payment_status} />
                      </td>
                      <td className="p-8">
                        <span className="font-mono text-[10px] font-bold text-slate-300 uppercase tracking-tighter select-all">
                          {p.mpesa_receipt_number ?? "EMPTY"}
                        </span>
                      </td>
                      <td className="p-10 text-right">
                        <div className="flex flex-col items-end">
                           <span className="text-[11px] font-black text-[#1a1a2e] uppercase tracking-tighter">
                              {formatRelativeTime(p.created_at)}
                           </span>
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-60 mt-1">
                              Verified
                           </span>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty Catalog State */}
        {!loading && payments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-32 h-32 bg-slate-50/50 rounded-full flex items-center justify-center mb-8 text-5xl animate-in zoom-in duration-700">💳</div>
            <h3 className="text-3xl font-black text-[#1a1a2e] mb-3 tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>No results found</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-60">
              We couldn't find any payments matching your selected filters.
            </p>
          </div>
        )}

        {/* Precision Pagination Control */}
        {pagination && pagination.total_pages > 1 && (
          <div className="p-10 bg-[#fcf8ff]/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing <span className="text-[#1a1a2e]">{showingFrom}-{showingTo}</span> / <span className="text-[#1a1a2e]">{pagination.total.toLocaleString()}</span> transactions
            </p>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 duration-300"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center bg-white rounded-[28px] p-2 border border-slate-100 shadow-sm gap-3">
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-12 h-12 flex items-center justify-center text-slate-200 font-bold">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-[11px] transition-all ${
                        p === page
                          ? "bg-[#1a1a2e] text-white shadow-xl shadow-[#1a1a2e]/20 scale-110"
                          : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                 className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 duration-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Analytical Ledger Footer ── */}
      <footer className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Payments are securely processed and verified
          </span>
        </div>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link href="#" className="hover:text-[#22c55e] transition-colors">Payment Terms</Link>
          <Link href="#" className="hover:text-[#1a1a2e] transition-colors">Financial Help</Link>
          <span>© 2026 Ayola Foods Admin</span>
        </div>
      </footer>
    </div>
  )
}
