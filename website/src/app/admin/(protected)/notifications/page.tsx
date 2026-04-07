"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatRelativeTime } from "@/lib/admin/formatters"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Bell, CheckCheck, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface NotificationRow {
  id: string
  type: string
  title: string
  message: string
  order_id: string | null
  is_read: boolean
  created_at: string
}

interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

interface NotificationsResponse {
  data: {
    items: NotificationRow[]
    pagination: Pagination
    unread_count: number
  }
  error: string | null
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "new_order":
      return <span className="material-symbols-outlined text-[#22c55e]">shopping_cart</span>
    case "payment_completed":
      return <span className="material-symbols-outlined text-blue-500">payments</span>
    case "payment_failed":
      return <span className="material-symbols-outlined text-red-500">error</span>
    case "order_cancelled":
      return <span className="material-symbols-outlined text-slate-400">cancel</span>
    default:
      return <span className="material-symbols-outlined text-[#1a1a2e]">notifications</span>
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const params = searchParams.toString()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/notifications?${params}`)
      const json: NotificationsResponse = await res.json()
      if (json.data) {
        setNotifications(json.data.items)
        setPagination(json.data.pagination)
        setUnreadCount(json.data.unread_count)
      }
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}/read`, { method: "POST" })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const markAllRead = async () => {
    await fetch("/api/admin/notifications/read-all", { method: "POST" })
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const setFilter = (value: string) => {
    const ps = new URLSearchParams(location.search)
    if (value) {
      ps.set("is_read", value)
    } else {
      ps.delete("is_read")
    }
    ps.set("page", "1")
    router.push(`/admin/notifications?${ps.toString()}`)
  }

  const status = useSearchParams().get("is_read") || ""

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full px-4">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <p className="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.4em] animate-in slide-in-from-left duration-500">Updates</p>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Notifications
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
               {unreadCount} New Notifications
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Stay updated with recent activities</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="bg-[#1a1a2e] text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-3 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
          >
             <CheckCheck size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             <span className="relative z-10">Mark All as Read</span>
          </button>
        )}
      </div>

      {/* ── Architectural Filter Row ── */}
      <section className="bg-white p-2 rounded-[32px] border border-slate-50 shadow-[0_10px_40px_-10px_rgba(26,26,46,0.04)] flex items-center justify-between w-fit min-w-[320px]">
        {(["", "false", "true"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`flex-1 px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
              status === v
                ? "bg-[#1a1a2e] text-white shadow-lg"
                : "text-slate-400 hover:text-[#1a1a2e] hover:bg-slate-50"
            }`}
          >
            {v === "" ? "All" : v === "false" ? "Unread" : "Read"}
          </button>
        ))}
      </section>

      {/* ── Notification Catalog ── */}
      <section className="bg-white rounded-[60px] overflow-hidden shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] border border-slate-50/50">
        <div className="divide-y divide-slate-50">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-10 flex items-start gap-8 animate-pulse">
                  <Skeleton className="w-16 h-16 rounded-[28px] shrink-0" />
                  <div className="flex-1 space-y-4">
                     <Skeleton className="h-6 w-1/3 rounded-lg" />
                     <Skeleton className="h-4 w-2/3 rounded-lg opacity-40" />
                     <Skeleton className="h-3 w-20 rounded-lg opacity-20" />
                  </div>
                </div>
              ))
            : notifications.length === 0
              ? (
                <div className="py-40 text-center flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-slate-50/50 rounded-full flex items-center justify-center mb-8 text-5xl animate-in zoom-in duration-700">📢</div>
                  <h3 className="text-3xl font-black text-[#1a1a2e] mb-3 tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>No notifications</h3>
                  <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-60">You're all caught up! No notifications found here.</p>
                </div>
              )
              : notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-10 flex items-start gap-8 transition-all duration-500 group relative border-l-4 ${
                    n.is_read ? "bg-white border-transparent" : "bg-[#fcf8ff] border-[#22c55e]"
                  } hover:bg-[#fcf8ff]`}
                >
                  <div className={`w-16 h-16 rounded-[28px] shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner border ${n.is_read ? "bg-slate-50 border-slate-100" : "bg-white border-[#22c55e]/20 shadow-[#22c55e]/5"}`}>
                    {NotificationIcon({ type: n.type })}
                  </div>
                  
                  <div className="flex-1 min-w-0 transition-transform group-hover:translate-x-2 duration-500">
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-xl tracking-tight ${
                          n.is_read ? "text-slate-500 font-bold" : "text-[#1a1a2e] font-black"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2.5 h-2.5 bg-[#22c55e] rounded-full shrink-0 shadow-[0_0_10px_#22c55e]" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed opacity-80">{n.message}</p>
                    <div className="flex items-center gap-4 mt-4">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        Sent: {formatRelativeTime(n.created_at)}
                      </p>
                       {!n.is_read && (
                         <div className="flex items-center gap-1.5 overflow-hidden">
                           <span className="w-1 h-3 bg-[#22c55e]/20 rounded-full" />
                           <span className="text-[9px] font-black text-[#22c55e] uppercase tracking-widest">New</span>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-300 hover:text-[#22c55e] hover:bg-[#22c55e]/5 transition-all shadow-sm border border-slate-100"
                        title="Mark as Read"
                      >
                         <CheckCheck size={20} />
                      </button>
                    )}
                    {n.order_id && (
                      <Link
                        href={`/admin/orders/${n.order_id}`}
                        className="w-12 h-12 flex items-center justify-center bg-[#1a1a2e] rounded-2xl text-white hover:bg-slate-800 transition-all shadow-xl shadow-[#1a1a2e]/10"
                        title="View Order"
                      >
                         <Eye size={20} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Precision Pagination Control */}
        {pagination && pagination.total_pages > 1 && (
          <div className="p-10 bg-[#fcf8ff]/30 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-6">
             <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    const ps = new URLSearchParams(location.search)
                    ps.set("page", String(Math.max(1, pagination.page - 1)))
                    router.push(`/admin/notifications?${ps.toString()}`)
                  }}
                  disabled={pagination.page <= 1}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 duration-300"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="bg-white rounded-[28px] p-4 border border-slate-100 shadow-sm">
                   <span className="text-[11px] font-black text-[#1a1a2e] uppercase tracking-[0.2em]">
                      Page {pagination.page} <span className="text-slate-300 mx-2">/</span> {pagination.total_pages}
                   </span>
                </div>

                <button
                  onClick={() => {
                    const ps = new URLSearchParams(location.search)
                    ps.set("page", String(Math.min(pagination.total_pages, pagination.page + 1)))
                    router.push(`/admin/notifications?${ps.toString()}`)
                  }}
                  disabled={pagination.page >= pagination.total_pages}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 duration-300"
                >
                  <ChevronRight size={18} />
                </button>
             </div>
          </div>
        )}
      </section>

      {/* ── Analytical Lifecycle Footer ── */}
      <footer className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Notifications: Up to date
          </span>
        </div>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link href="#" className="hover:text-[#22c55e] transition-colors">Data Privacy</Link>
          <Link href="#" className="hover:text-[#1a1a2e] transition-colors">Help Center</Link>
          <span>© 2026 Ayola Foods Admin</span>
        </div>
      </footer>
    </div>
  )
}
