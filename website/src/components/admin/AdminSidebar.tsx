"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  CreditCard,
  Bell,
  LogOut,
  Settings,
} from "lucide-react"

interface AdminSidebarProps {
  role: "admin" | "kitchen"
}

const allNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, exact: false },
  { label: "Products", href: "/admin/products", icon: Package, exact: false },
  { label: "Categories", href: "/admin/categories", icon: Tag, exact: false },
  { label: "Customers", href: "/admin/customers", icon: Users, exact: false },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, exact: false },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, exact: false },
  { label: "Settings", href: "/admin/settings", icon: Settings, exact: false },
]

const kitchenNavItems = ["/admin", "/admin/orders"]

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems =
    role === "kitchen"
      ? allNavItems.filter((item) => kitchenNavItems.includes(item.href))
      : allNavItems

  function isActive(item: (typeof allNavItems)[number]) {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + "/")
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <div className="w-64 shrink-0 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo area */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
        <span className="text-lg font-bold text-white">Ayola Foods</span>
        <span className="text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
