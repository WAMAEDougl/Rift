"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatRelativeTime } from "@/lib/admin/formatters"
import { ChevronLeft, ChevronRight, Bell, CheckCheck, Eye, ShoppingCart, CreditCard, AlertCircle, XCircle } from "lucide-react"
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
      return <ShoppingCart size={18} className="text-amber-700" />
    case "payment_completed":
      return <CreditCard size={18} className="text-blue-500" />
    case "payment_failed":
      return <AlertCircle size={18} className="text-red-500" />
    case "order_cancelled":
      return <XCircle size={18} className="text-gray-400" />
    default:
      return <Bell size={18} className="text-gray-500" />
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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Notifications
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {unreadCount} unread &middot; Stay updated with recent activities
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-1.5 flex items-center w-fit gap-1">
        {(["", "false", "true"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              status === v
                ? "bg-amber-700 text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {v === "" ? "All" : v === "false" ? "Unread" : "Read"}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="divide-y divide-gray-50">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-3 w-2/3 rounded opacity-50" />
                    <Skeleton className="h-3 w-20 rounded opacity-30" />
                  </div>
                </div>
              ))
            : notifications.length === 0
              ? (
                <div className="py-24 text-center flex flex-col items-center justify-center">
                  <Bell size={36} className="text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up!</p>
                </div>
              )
              : notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-6 py-4 flex items-start gap-4 transition-colors group ${
                    n.is_read
                      ? "bg-white hover:bg-amber-50/20"
                      : "bg-amber-50/30 border-l-4 border-amber-600 hover:bg-amber-50/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${
                    n.is_read ? "bg-gray-50 border-gray-100" : "bg-white border-amber-100"
                  }`}>
                    <NotificationIcon type={n.type} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${n.is_read ? "text-gray-600 font-medium" : "text-gray-900 font-semibold"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 bg-amber-600 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.is_read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck size={15} />
                      </button>
                    )}
                    {n.order_id && (
                      <Link
                        href={`/admin/orders/${n.order_id}`}
                        className="w-8 h-8 flex items-center justify-center bg-amber-700 hover:bg-amber-800 rounded-lg text-white transition-colors"
                        title="View order"
                      >
                        <Eye size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                const ps = new URLSearchParams(location.search)
                ps.set("page", String(Math.max(1, pagination.page - 1)))
                router.push(`/admin/notifications?${ps.toString()}`)
              }}
              disabled={pagination.page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {pagination.page} / {pagination.total_pages}
            </span>
            <button
              onClick={() => {
                const ps = new URLSearchParams(location.search)
                ps.set("page", String(Math.min(pagination.total_pages, pagination.page + 1)))
                router.push(`/admin/notifications?${ps.toString()}`)
              }}
              disabled={pagination.page >= pagination.total_pages}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
