"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatRelativeTime } from "@/lib/admin/formatters"
import { Button } from "@/components/ui/button"

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
      return "🛒"
    case "payment_completed":
      return "💰"
    case "payment_failed":
      return "❌"
    case "order_cancelled":
      return "🚫"
    default:
      return "📢"
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-3">
        {(["", "false", "true"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              status === v
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {v === "" ? "All" : v === "false" ? "Unread" : "Read"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))
          : notifications.length === 0
            ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                No notifications
              </div>
            )
            : notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start gap-4 transition-colors ${
                  n.is_read ? "bg-white" : "bg-orange-50"
                }`}
              >
                <span className="text-xl mt-0.5 shrink-0">
                  {NotificationIcon({ type: n.type })}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        n.is_read ? "text-gray-600" : "text-gray-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(n.created_at)}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-orange-600 hover:text-orange-700 px-2 py-1"
                    >
                      Mark read
                    </button>
                  )}
                  {n.order_id && (
                    <a
                      href={`/admin/orders/${n.order_id}`}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                    >
                      View order
                    </a>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const ps = new URLSearchParams(location.search)
              ps.set("page", String(Math.max(1, pagination.page - 1)))
              router.push(`/admin/notifications?${ps.toString()}`)
            }}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 px-3">
            {pagination.page} / {pagination.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const ps = new URLSearchParams(location.search)
              ps.set("page", String(Math.min(pagination.total_pages, pagination.page + 1)))
              router.push(`/admin/notifications?${ps.toString()}`)
            }}
            disabled={pagination.page >= pagination.total_pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
