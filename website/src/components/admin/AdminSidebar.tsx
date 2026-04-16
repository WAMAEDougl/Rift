"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, ShoppingCart, Users, Package, Tag,
  CreditCard, Bell, Settings, LogOut, Leaf, BookOpen,
} from "lucide-react"

interface AdminSidebarProps {
  role: "admin" | "kitchen"
  userName?: string
  userRole?: string
}

const allNavItems = [
  { label: "Dashboard",     href: "/admin",                icon: LayoutDashboard, exact: true },
  { label: "Orders",        href: "/admin/orders",         icon: ShoppingCart,    exact: false },
  { label: "Customers",     href: "/admin/customers",      icon: Users,           exact: false },
  { label: "Products",      href: "/admin/products",       icon: Package,         exact: false },
  { label: "Recipes",       href: "/admin/recipes",        icon: BookOpen,        exact: false },
  { label: "Categories",    href: "/admin/categories",     icon: Tag,             exact: false },
  { label: "Payments",      href: "/admin/payments",       icon: CreditCard,      exact: false },
  { label: "Notifications", href: "/admin/notifications",  icon: Bell,            exact: false },
  { label: "Settings",      href: "/admin/settings",       icon: Settings,        exact: false },
]

const kitchenNavItems = ["/admin", "/admin/orders"]

export default function AdminSidebar({ role, userName, userRole }: AdminSidebarProps) {
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

  const displayName = userName ?? "Admin"
  const displayRole = userRole ?? role
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
      style={{ background: "linear-gradient(180deg, #78350F 0%, #92400E 60%, #78350F 100%)" }}>

      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Ayola Foods
            </p>
            <p className="text-amber-300/60 text-[10px] uppercase tracking-widest mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-amber-100/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-3 w-0.5 h-5 bg-amber-400 rounded-full" />
              )}
              <Icon size={16} className={active ? "text-amber-300" : ""} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-amber-100/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-earth text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">{displayName}</p>
            <p className="text-amber-300/60 text-[10px] capitalize truncate">{displayRole}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
