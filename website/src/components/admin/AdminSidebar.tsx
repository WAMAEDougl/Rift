"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LogOut } from "lucide-react"

interface AdminSidebarProps {
  role: "admin" | "kitchen"
  userName?: string
  userRole?: string
}

const allNavItems = [
  { label: "Dashboard", href: "/admin", icon: "dashboard", exact: true },
  { label: "Orders", href: "/admin/orders", icon: "shopping_cart", exact: false },
  { label: "Customers", href: "/admin/customers", icon: "groups", exact: false },
  { label: "Products", href: "/admin/products", icon: "inventory_2", exact: false },
  { label: "Categories", href: "/admin/categories", icon: "category", exact: false },
  { label: "Payments", href: "/admin/payments", icon: "payments", exact: false },
  { label: "Notifications", href: "/admin/notifications", icon: "notifications", exact: false },
  { label: "Settings", href: "/admin/settings", icon: "settings", exact: false },
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a1a2e] shadow-2xl shadow-black/40 flex flex-col py-8 z-50 animate-in slide-in-from-left duration-700">
      {/* Branding */}
      <div className="px-8 mb-12">
        <h1 className="text-xl font-extrabold text-white tracking-tight leading-none" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
          Ayola Foods
        </h1>
        <p className="text-[10px] text-slate-400 font-black tracking-[0.2em] uppercase opacity-50 mt-1.5">
          The Culinary Curator
        </p>
      </div>

      {/* Navigation Grid */}
      <nav className="flex-1 space-y-1.5 px-3">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-full relative group ${
                active
                  ? "bg-gradient-to-r from-white/10 to-transparent text-white shadow-xl shadow-black/20 translate-x-2"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <div className="absolute left-1 top-2 bottom-2 w-1.5 bg-[#22c55e] rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-in zoom-in" />
              )}
              <span className={`material-symbols-outlined text-[20px] transition-all duration-300 ${active ? "text-[#22c55e] scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              <span style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Profile Container */}
      <div className="px-4 mt-auto space-y-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-error hover:bg-error/5 rounded-2xl transition-all group"
        >
          <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>

        <div className="flex items-center gap-4 bg-white/5 rounded-3xl p-4 border border-white/5 backdrop-blur-xl relative overflow-hidden group hover:bg-white/10 transition-colors cursor-pointer">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#006e2f] to-[#22c55e] border-2 border-white/10 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-black/20 shrink-0 relative z-10">
            {initials}
          </div>
          <div className="overflow-hidden relative z-10">
            <p className="text-white text-xs font-black truncate tracking-tight">{displayName}</p>
            <p className="text-slate-400 text-[10px] font-black capitalize truncate tracking-widest opacity-60 uppercase">{displayRole}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
