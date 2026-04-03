"use client"

import { usePathname } from "next/navigation"
import NotificationBell from "@/components/admin/NotificationBell"

interface AdminTopbarProps {
  user: { name: string; role: "admin" | "kitchen" }
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard"
  if (pathname.startsWith("/admin/orders")) return "Orders"
  if (pathname.startsWith("/admin/products")) return "Products"
  if (pathname.startsWith("/admin/categories")) return "Categories"
  if (pathname.startsWith("/admin/customers")) return "Customers"
  if (pathname.startsWith("/admin/payments")) return "Payments"
  if (pathname.startsWith("/admin/notifications")) return "Notifications"
  if (pathname.startsWith("/admin/settings")) return "Settings"
  return "Admin"
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm text-gray-700">{user.name}</span>
            <span className="text-xs text-gray-400 capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
