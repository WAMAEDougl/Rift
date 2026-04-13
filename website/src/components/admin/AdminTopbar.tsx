"use client"

import { usePathname } from "next/navigation"
import NotificationBell from "@/components/admin/NotificationBell"

interface AdminTopbarProps {
  user: { name: string; role: "admin" | "kitchen" }
}

function getPageTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/admin")                          return { title: "Dashboard",     subtitle: "Here's what's happening today." }
  if (pathname.startsWith("/admin/orders"))           return { title: "Orders",        subtitle: "Manage and track all customer orders." }
  if (pathname.startsWith("/admin/products"))         return { title: "Products",      subtitle: "Manage your product catalogue." }
  if (pathname.startsWith("/admin/categories"))       return { title: "Categories",    subtitle: "Organise your product categories." }
  if (pathname.startsWith("/admin/customers"))        return { title: "Customers",     subtitle: "View and manage your customer base." }
  if (pathname.startsWith("/admin/payments"))         return { title: "Payments",      subtitle: "Review payment logs and transactions." }
  if (pathname.startsWith("/admin/notifications"))    return { title: "Notifications", subtitle: "Stay on top of store activity." }
  if (pathname.startsWith("/admin/settings"))         return { title: "Settings",      subtitle: "Configure your store preferences." }
  return { title: "Admin", subtitle: "" }
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  const pathname = usePathname()
  const { title, subtitle } = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-amber-100 flex items-center justify-between px-8 py-4">
      <div>
        <h2 className="text-gray-900 font-bold text-2xl leading-none"
          style={{ fontFamily: "var(--font-playfair, serif)" }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
            {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-gray-800 text-xs font-semibold leading-none">{user.name}</p>
            <p className="text-gray-400 text-[10px] capitalize mt-0.5">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
