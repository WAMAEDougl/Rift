"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, ShoppingBag, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  type: "new_order" | "payment_completed" | "payment_failed" | "order_cancelled"
  title: string
  message: string
  created_at: string
  read: boolean
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "new_order":
      return <ShoppingBag size={16} className="text-orange-500" />
    case "payment_completed":
      return <CheckCircle size={16} className="text-green-500" />
    case "payment_failed":
      return <XCircle size={16} className="text-red-500" />
    case "order_cancelled":
      return <AlertCircle size={16} className="text-yellow-500" />
  }
}

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/admin/notifications/unread-count")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.data?.count ?? 0)
      }
    } catch {
      // silently ignore
    }
  }

  async function fetchNotifications() {
    setLoadingNotifications(true)
    try {
      const res = await fetch("/api/admin/notifications?per_page=10")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data?.items ?? [])
      }
    } catch {
      // silently ignore
    } finally {
      setLoadingNotifications(false)
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/admin/notifications/read-all", { method: "POST" })
      fetchUnreadCount()
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            <button
              onClick={markAllRead}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !n.read ? "bg-orange-50/40" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <Link
              href="/admin/notifications"
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              onClick={() => setOpen(false)}
            >
              View all →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
